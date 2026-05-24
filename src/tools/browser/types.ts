export interface BrowserExecutorOptions {
  headless?: boolean;
  navigationTimeoutMs?: number;
}

export interface NavigateResult {
  url: string;
  status: number | null;
}

export interface PageSnapshot {
  texts: string[];
  buttons: { text: string; type: string }[];
  links: { href: string; text: string }[];
  fields: { name: string; type: string; label: string }[];
}
