import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { Runner } from '../../src/runtime/runner.js';
import { FileSystemSkillLoader } from '../../src/runtime/skill-loader.js';
import { PlaywrightExecutor } from '../../src/tools/browser/playwright-executor.js';
import { MockLLMClient } from '../../src/llm/mock-llm-client.js';
import { LocalArtifactManager } from '../../src/runtime/artifact-manager.js';

describe('Runner E2E (usabilidade)', () => {
  let tmpDir: string;
  let browser: PlaywrightExecutor;
  let runner: Runner;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'runner-e2e-'));
    browser = new PlaywrightExecutor();
    
    // Resolve skills path relative to project root (which vitest uses as cwd)
    const loader = new FileSystemSkillLoader('skills');
    const llm = new MockLLMClient();
    const artifacts = new LocalArtifactManager(tmpDir);

    runner = new Runner({ loader, browser, llm, artifacts });
  });

  afterAll(async () => {
    // Ensure browser is closed to avoid zombie processes
    await browser.close();
    // Cleanup the temporary directory containing artifacts
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should run usabilidade skill end-to-end', async () => {
    // Determine the URL of the local fixture
    const fixturePath = path.resolve('tests/fixtures/pages/usabilidade.html');
    const targetUrl = pathToFileURL(fixturePath).href;

    const input = {
      execution_id: 'e2e-test',
      skill_id: 'usabilidade',
      inputs: { target_url: targetUrl },
    };

    const result = await runner.run(input);

    // Verify main execution result
    expect(result.status).toBe('completed');
    expect(result.metrics).toBeDefined();
    expect(result.metrics?.llm_calls).toBeGreaterThanOrEqual(1);

    // Verify artifacts exist in the execution directory
    const executionDir = path.join(tmpDir, 'e2e-test');
    const files = await fs.readdir(executionDir);

    expect(files).toContain('result.json');
    expect(files).toContain('execution-log.json');
    expect(files).toContain('report.md');
    expect(files).toContain('screenshot.png');

    for (const file of ['result.json', 'execution-log.json', 'report.md', 'screenshot.png']) {
      const stats = await fs.stat(path.join(executionDir, file));
      expect(stats.size).toBeGreaterThan(0);
    }

    // Verify report.md mentions at least 3 Nielsen heuristics
    // The mock LLM output includes "Heuristica de Nielsen" / "Heuristicas de Nielsen"
    const reportContent = await fs.readFile(path.join(executionDir, 'report.md'), 'utf8');
    const heuristicsMatches = reportContent.match(/Heuristica?s? de Nielsen/gi) || [];
    expect(heuristicsMatches.length).toBeGreaterThanOrEqual(3);

    // Verify execution-log.json has at least 5 events
    const logContent = await fs.readFile(path.join(executionDir, 'execution-log.json'), 'utf8');
    const logData = JSON.parse(logContent);
    expect(logData.events).toBeDefined();
    expect(logData.events.length).toBeGreaterThanOrEqual(5);
  }, 60000); // Generous timeout for real browser execution
});
