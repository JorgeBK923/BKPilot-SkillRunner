import { chromium, errors, type Browser, type Page } from 'playwright';

import { SkillRunnerError } from '../../core/index.js';
import type { BrowserExecutorOptions, NavigateResult, PageSnapshot } from './types.js';

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

  async snapshot(): Promise<PageSnapshot> {
    if (this.page === null) {
      throw new SkillRunnerError('BROWSER_ACTION_FAILED', undefined, {
        reason: 'page not initialized',
      });
    }

    try {
      return await this.page.evaluate<PageSnapshot>(`(() => {
        const normalizeText = (value) => value.replace(/\\s+/g, ' ').trim();

        const isVisible = (element) => {
          const style = window.getComputedStyle(element);

          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            element.getClientRects().length > 0
          );
        };

        const getElementText = (element) => normalizeText(element.textContent ?? '');

        const textSet = new Set();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let currentNode = walker.nextNode();

        while (currentNode !== null) {
          const parentElement = currentNode.parentElement;
          const text = normalizeText(currentNode.textContent ?? '');

          if (parentElement !== null && text.length > 0 && isVisible(parentElement)) {
            textSet.add(text);
          }

          currentNode = walker.nextNode();
        }

        const buttons = Array.from(
          document.querySelectorAll('button, input[type="submit"], input[type="button"]'),
        )
          .filter(isVisible)
          .map((button) => ({
            text:
              button instanceof HTMLInputElement
                ? normalizeText(button.value || (button.getAttribute('aria-label') ?? ''))
                : getElementText(button),
            type: button.type,
          }));

        const links = Array.from(document.querySelectorAll('a[href]'))
          .filter(isVisible)
          .map((link) => ({
            href: link.href,
            text: getElementText(link),
          }));

        const getFieldLabel = (field) => {
          const explicitLabel = Array.from(field.labels ?? [])
            .map((label) => getElementText(label))
            .find((label) => label.length > 0);

          return explicitLabel ?? normalizeText(field.getAttribute('aria-label') ?? '');
        };

        const fields = Array.from(
          document.querySelectorAll(
            'form input:not([type="submit"]):not([type="button"]):not([type="reset"]), form select, form textarea',
          ),
        )
          .filter(isVisible)
          .map((field) => ({
            name: field.name,
            type:
              field instanceof HTMLSelectElement
                ? 'select'
                : field instanceof HTMLTextAreaElement
                  ? 'textarea'
                  : field.type,
            label: getFieldLabel(field),
          }));

        return {
          texts: Array.from(textSet),
          buttons,
          links,
          fields,
        };
      })()`);
    } catch (cause) {
      throw new SkillRunnerError('BROWSER_ACTION_FAILED', undefined, { cause });
    }
  }

  async evaluate<T>(fn: string | ((...a: unknown[]) => T)): Promise<T> {
    if (this.page === null) {
      throw new SkillRunnerError('BROWSER_ACTION_FAILED', undefined, {
        reason: 'page not initialized',
      });
    }

    try {
      if (typeof fn === 'string') {
        return await this.page.evaluate<T>(fn);
      }

      return await this.page.evaluate(fn as () => T);
    } catch (cause) {
      throw new SkillRunnerError('BROWSER_ACTION_FAILED', undefined, { cause });
    }
  }

  async screenshot(): Promise<Buffer> {
    if (this.page === null) {
      throw new SkillRunnerError('BROWSER_ACTION_FAILED', undefined, {
        reason: 'page not initialized',
      });
    }

    try {
      return await this.page.screenshot({ fullPage: true, type: 'png' });
    } catch (cause) {
      throw new SkillRunnerError('BROWSER_ACTION_FAILED', undefined, { cause });
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
