import { chromium, errors, type Browser, type Page } from 'playwright';

import { SkillRunnerError } from '../../core/index.js';
import type { BrowserExecutorOptions, NavigateResult } from './types.js';

const DEFAULT_NAVIGATION_TIMEOUT_MS = 30_000;

export class PlaywrightExecutor {
  private browser: Browser | null = null;

  private page: Page | null = null;

  private readonly navigationTimeoutMs: number;

  constructor(options: BrowserExecutorOptions = {}) {
    this.navigationTimeoutMs = options.navigationTimeoutMs ?? DEFAULT_NAVIGATION_TIMEOUT_MS;
  }

  async launch(): Promise<void> {
    await this.close();

    try {
      this.browser = await chromium.launch({ headless: true });
      this.page = await this.browser.newPage();
    } catch (cause) {
      await this.close();
      this.browser = null;
      this.page = null;
      throw new SkillRunnerError('BROWSER_LAUNCH_FAILED', undefined, { cause });
    }
  }

  async navigate(targetUrl: string): Promise<NavigateResult> {
    if (this.page === null) {
      throw new SkillRunnerError('BROWSER_LAUNCH_FAILED', undefined, { targetUrl });
    }

    try {
      const response = await this.page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: this.navigationTimeoutMs,
      });

      return {
        url: this.page.url(),
        status: response?.status() ?? null,
      };
    } catch (cause) {
      const code =
        cause instanceof errors.TimeoutError ? 'BROWSER_TIMEOUT' : 'BROWSER_NAVIGATION_FAILED';
      throw new SkillRunnerError(code, undefined, { targetUrl, cause });
    }
  }

  async close(): Promise<void> {
    const page = this.page;
    const browser = this.browser;

    this.page = null;
    this.browser = null;

    try {
      await page?.close();
    } catch {
      // close is best-effort cleanup and must stay idempotent.
    }

    try {
      await browser?.close();
    } catch {
      // close is best-effort cleanup and must stay idempotent.
    }
  }
}
