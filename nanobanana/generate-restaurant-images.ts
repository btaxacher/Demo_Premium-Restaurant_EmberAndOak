/**
 * Ember & Oak — Restaurant Image Generator
 *
 * Generates premium restaurant imagery via Gemini for the demo website.
 * Usage: npx tsx nanobanana/generate-restaurant-images.ts
 *
 * IMPORTANT: Close Chrome completely before running!
 */
import * as fs from 'fs'
import { createGeminiBrowser } from './browser.js'
import { generateImagesViaGemini, type GenerateImageOptions } from './generate-image.js'

const IMAGE_PROMPTS: readonly GenerateImageOptions[] = [
  {
    prompt: 'Generate a photorealistic image: Cinematic wide shot of a luxury restaurant interior at night. Dark wood paneling, warm amber ember glow from a central open hearth, oak beam ceiling, intimate candlelit tables, moody atmospheric lighting with deep shadows. No people. Aspect ratio 16:9, professional architectural photography.',
    savePath: 'assets/images/hero-bg.png',
  },
  {
    prompt: 'Generate a photorealistic image: Dramatic close-up of red wine being poured into a crystal glass. Dark background with warm golden side lighting. Wine catching the light with deep ruby reflections. Fine dining atmosphere, shallow depth of field. Professional food photography, moody and elegant.',
    savePath: 'assets/images/philosophy.png',
  },
  {
    prompt: 'Generate a photorealistic image: Artful craft cocktail in a coupe glass on a dark marble bar counter. Wisps of smoke from hickory chips beside it. Warm amber and gold lighting, dark moody background. Garnished with an orange peel. Professional cocktail photography.',
    savePath: 'assets/images/gallery-cocktail.png',
  },
  {
    prompt: 'Generate a photorealistic image: Intimate fine dining table setting for two. Dark tablecloth, gold-rimmed plates, crystal glassware, lit candles in brass holders. Warm ember glow in the background from a distant fireplace. Moody, romantic, dark atmosphere. Professional interior photography.',
    savePath: 'assets/images/gallery-dining.png',
  },
  {
    prompt: 'Generate a photorealistic image: Premium tomahawk ribeye steak on a dark oak cutting board, perfectly seared with char marks. Glowing embers visible in the background. Dramatic side lighting with deep shadows. Garnished with fresh herbs and flaked sea salt. Professional food photography, dark moody style.',
    savePath: 'assets/images/gallery-steak.png',
  },
  {
    prompt: 'Generate a photorealistic image: Empty luxury restaurant private dining room at night. Long oak table with candles, leather chairs, exposed brick wall, warm amber lighting. Atmospheric and intimate, dark elegant mood. No people. Professional interior photography.',
    savePath: 'assets/images/reservation-bg.png',
  },
]

async function main(): Promise<void> {
  console.log('=== Ember & Oak — Image Generation ===\n')

  // Skip already generated images
  const pending = IMAGE_PROMPTS.filter(p => {
    if (p.savePath && fs.existsSync(p.savePath)) {
      console.log(`  ⏭ Skipping (exists): ${p.savePath}`)
      return false
    }
    return true
  })

  if (pending.length === 0) {
    console.log('\nAll images already generated!')
    return
  }

  console.log(`\nGenerating ${pending.length} remaining images via Gemini...\n`)

  const gemini = await createGeminiBrowser()

  try {
    const results = await generateImagesViaGemini(gemini.page, pending)
    console.log(`\n=== Done! ${results.length} images generated ===`)
    for (const r of results) {
      if (r.filePath) console.log(`  ✓ ${r.filePath}`)
    }
  } finally {
    await gemini.close()
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
