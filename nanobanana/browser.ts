/**
 * Nanobanana Browser — Chrome CDP connection for Gemini Web UI
 *
 * Launches Chrome with a persistent Nanobanana profile (pre-logged-in)
 * and connects Playwright via Chrome DevTools Protocol.
 *
 * First run: Log in manually at gemini.google.com (session persists).
 * Subsequent runs: Automatically authenticated.
 *
 * IMPORTANT: Chrome must be fully closed before running.
 */
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import { spawn, type ChildProcess } from 'node:child_process'

/** Persistent profile dir — session cookies survive between runs */
const PROFILE_DIR = 'C:/Users/basti/.nanobanana-profile'

/** Chrome executable */
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

/** Remote debugging port */
const DEBUG_PORT = 9222

export interface GeminiBrowser {
  readonly browser: Browser
  readonly context: BrowserContext
  readonly page: Page
  readonly chromeProcess: ChildProcess
  close(): Promise<void>
}

/**
 * Launch Chrome and connect via CDP.
 * Returns a ready-to-use page on gemini.google.com.
 */
export async function createGeminiBrowser(): Promise<GeminiBrowser> {
  console.log('  Launching Chrome with Nanobanana profile...')

  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${PROFILE_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ], {
    detached: false,
    stdio: 'ignore',
  })

  await waitForDebugPort(DEBUG_PORT, 15000)

  const browser = await chromium.connectOverCDP(`http://localhost:${DEBUG_PORT}`)
  const context = browser.contexts()[0]
  const page = context.pages()[0] ?? await context.newPage()

  console.log('  Connected to Chrome via CDP')

  return {
    browser,
    context,
    page,
    chromeProcess,
    async close() {
      await browser.close()
      chromeProcess.kill()
    },
  }
}

async function waitForDebugPort(port: number, timeoutMs: number): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`http://localhost:${port}/json/version`)
      if (response.ok) return
    } catch {
      // Not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error(`Chrome debugging port ${port} not available after ${timeoutMs}ms. Is Chrome fully closed?`)
}

export function randomDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

export async function shortWait(minMs = 1000, maxMs = 3000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, randomDelay(minMs, maxMs)))
}
