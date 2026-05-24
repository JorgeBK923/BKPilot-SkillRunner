import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { PlaywrightExecutor } from '../../src/tools/browser/playwright-executor.js';
import { SkillRunnerError } from '../../src/core/index.js';

describe('PlaywrightExecutor (Integration)', () => {
  const fixturePath = path.resolve(process.cwd(), 'tests/fixtures/pages/usabilidade.html');
  const fixtureUrl = pathToFileURL(fixturePath).href;

  let executor: PlaywrightExecutor;

  beforeAll(async () => {
    executor = new PlaywrightExecutor();
    await executor.launch();
  }, 60000);

  afterAll(async () => {
    if (executor) {
      await executor.close();
    }
  });

  describe('CAP-2: Lifecycle and Navigation', () => {
    it('should launch and navigate to a valid URL', async () => {
      const result = await executor.navigate('https://example.com');
      expect(result.status).toBe(200);
      expect(result.url).toContain('example.com');
    }, 60000);

    it('should fail navigation if launch was not called', async () => {
      const unlaunchedExecutor = new PlaywrightExecutor();
      await expect(unlaunchedExecutor.navigate('https://example.com')).rejects.toThrowError(
        expect.objectContaining({
          code: 'BROWSER_LAUNCH_FAILED',
        }),
      );
    }, 60000);
  });

  describe('CAP-3: DOM Snapshot', () => {
    it('should extract fields, buttons, links and texts from the fixture', async () => {
      await executor.navigate(fixtureUrl);
      const snapshot = await executor.snapshot();

      expect(snapshot.fields).toHaveLength(3);
      expect(snapshot.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: 'Nome completo' }),
          expect.objectContaining({ label: 'Email corporativo' }),
          expect.objectContaining({ label: 'Perfil de acesso' }),
        ]),
      );

      expect(snapshot.buttons).toHaveLength(2);
      expect(snapshot.buttons).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'submit' }),
          expect.objectContaining({ type: 'button' }),
        ]),
      );

      expect(snapshot.links).toHaveLength(2);
      expect(snapshot.texts.length).toBeGreaterThan(0);
    }, 60000);
  });

  describe('CAP-4: Screenshots and Evaluation', () => {
    it('should capture a PNG screenshot', async () => {
      await executor.navigate(fixtureUrl);
      const screenshot = await executor.screenshot();

      expect(screenshot).toBeInstanceOf(Buffer);
      expect(screenshot.length).toBeGreaterThan(0);
      // Check PNG magic bytes: 89 50 4E 47
      expect(screenshot[0]).toBe(0x89);
      expect(screenshot[1]).toBe(0x50);
      expect(screenshot[2]).toBe(0x4e);
      expect(screenshot[3]).toBe(0x47);
    }, 60000);

    it('should evaluate JavaScript in the page context', async () => {
      await executor.navigate(fixtureUrl);
      const title = await executor.evaluate('document.title');
      expect(title).toBe('Fixture de Usabilidade');
    }, 60000);
  });

  describe('Error Cases (End of tests)', () => {
    it('should fail navigation for an invalid domain', async () => {
      await expect(executor.navigate('http://dominio-invalido-zzz-99999.tld')).rejects.toThrowError(
        expect.objectContaining({
          code: 'BROWSER_NAVIGATION_FAILED',
        }),
      );
    }, 60000);
  });

  describe('Cleanup and Idempotency', () => {
    it('should not throw when close is called multiple times', async () => {
      const tempExecutor = new PlaywrightExecutor();
      await tempExecutor.launch();

      await expect(tempExecutor.close()).resolves.not.toThrow();
      await expect(tempExecutor.close()).resolves.not.toThrow();
    }, 60000);
  });
});
