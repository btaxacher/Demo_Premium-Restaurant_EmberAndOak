/**
 * Gemini Web UI Image Generator
 *
 * Automates image generation via gemini.google.com using Playwright.
 * Uses the user's Google AI Pro account for unlimited high-quality images.
 *
 * Flow: Type prompt -> Send -> Wait for image -> Extract via canvas -> base64
 */
import type { Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { shortWait } from './browser.js'

export interface GenerateImageOptions {
  /** The image prompt */
  readonly prompt: string
  /** Save to file path (optional, also returns base64) */
  readonly savePath?: string
}

export interface GeneratedImage {
  /** base64-encoded image data */
  readonly base64: string
  /** Data URI ready for HTML embedding */
  readonly dataUri: string
  /** File path if saved to disk */
  readonly filePath?: string
}

/**
 * Generate an image via Gemini Web UI.
 * Requires an active CDP-connected page on gemini.google.com.
 */
export async function generateImageViaGemini(
  page: Page,
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const { prompt, savePath } = options

  console.log(`  Prompt: ${prompt.slice(0, 100)}...`)

  // Navigate to fresh conversation
  await page.goto('https://gemini.google.com/app', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await shortWait(3000, 5000)

  // Type prompt into textbox
  const textbox = page.locator('[role="textbox"]')
  await textbox.click()
  await shortWait(300, 600)
  await textbox.fill(prompt)
  await shortWait(500, 1000)

  // Click send button
  const sendBtn = page.locator('button[aria-label="Nachricht senden"]')
  await sendBtn.click()
  console.log('  Prompt sent, waiting for image...')

  // Wait for generated image to appear (blob: URL images)
  const imageLocator = page.locator('img[src^="blob:"]')

  let found = false
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const count = await imageLocator.count()

    if (count > 0) {
      found = true
      console.log(`  Image appeared after ${(i + 1) * 3}s`)
      break
    }
  }

  if (!found) {
    await page.screenshot({ path: 'assets/images/nanobanana-error.png' })
    throw new Error('No image generated after 120s. Check assets/images/nanobanana-error.png')
  }

  // Wait longer for image to fully render
  await shortWait(4000, 6000)

  // Extract image via canvas (works around blob: URL restrictions)
  // Retry extraction up to 3 times with increasing delays
  let base64Data: string | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    base64Data = await page.evaluate(() => {
    const allImages = document.querySelectorAll('img')
    const candidates: HTMLImageElement[] = []

    for (const img of allImages) {
      if (img.naturalWidth >= 200 && img.naturalHeight >= 200) {
        candidates.push(img as HTMLImageElement)
      }
    }

    if (candidates.length === 0) return null

    candidates.sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight))

    for (const img of candidates) {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const data = canvas.toDataURL('image/png')
          if (data.length > 1000) return data
        }
      } catch {
        continue
      }
    }
    return null
  })

    if (base64Data) {
      console.log(`  Extraction succeeded on attempt ${attempt + 1}`)
      break
    }
    console.log(`  Extraction attempt ${attempt + 1} failed, waiting...`)
    await shortWait(3000, 5000)
  }

  if (!base64Data) {
    throw new Error('Could not extract image data from page after 3 attempts')
  }

  const base64 = base64Data.replace(/^data:image\/png;base64,/, '')
  const dataUri = base64Data

  let filePath: string | undefined
  if (savePath) {
    const dir = path.dirname(savePath)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(savePath, Buffer.from(base64, 'base64'))
    filePath = savePath
    console.log(`  Saved: ${savePath}`)
  }

  console.log(`  Image extracted (${Math.round(base64.length / 1024)}KB)`)
  return { base64, dataUri, filePath }
}

/**
 * Generate multiple images in sequence.
 * Each generation opens a fresh Gemini conversation.
 */
export async function generateImagesViaGemini(
  page: Page,
  prompts: readonly GenerateImageOptions[]
): Promise<readonly GeneratedImage[]> {
  const results: GeneratedImage[] = []

  for (let i = 0; i < prompts.length; i++) {
    console.log(`\n[${i + 1}/${prompts.length}] Generating image...`)
    const result = await generateImageViaGemini(page, prompts[i])
    results.push(result)

    if (i < prompts.length - 1) {
      console.log('  Waiting 3s before next generation...')
      await shortWait(2000, 4000)
    }
  }

  return results
}
