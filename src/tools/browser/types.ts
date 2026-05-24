export interface BrowserExecutorOptions {
  headless?: boolean;
  navigationTimeoutMs?: number;
}

export interface NavigateResult {
  url: string;
  status: number | null;
}
