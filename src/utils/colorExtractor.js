/**
 * Extract dominant colors from an image
 * Uses intelligent sampling to capture the main color theme
 */
export function extractColors(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Use smaller size for faster processing
      const maxSize = 150
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        const width = canvas.width
        const height = canvas.height

        // Sample pixels throughout the image with grid approach
        const sampledPixels = []
        const step = Math.max(1, Math.floor(width / 30)) // Sample about 30x30 grid

        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * 4
            const r = pixels[idx]
            const g = pixels[idx + 1]
            const b = pixels[idx + 2]
            const a = pixels[idx + 3]

            if (a < 128) continue // Skip transparent pixels

            // Convert to HSL for better color grouping
            const [h, s, l] = rgbToHsl(r, g, b)

            // Skip very dark or very light colors (focus on mid-tones)
            if (l < 10 || l > 95) continue
            // Skip very desaturated colors (near grayscale)
            if (s < 5) continue

            sampledPixels.push({ r, g, b, h, s, l, count: 1 })
          }
        }

        if (sampledPixels.length === 0) {
          resolve({ primary: 'rgb(20, 20, 30)', secondary: 'rgb(10, 10, 20)' })
          return
        }

        // Group similar colors using HSL clustering
        const colorGroups = []
        const hueThreshold = 15 // Degrees
        const satThreshold = 15 // Percentage
        const lightThreshold = 15 // Percentage

        for (const pixel of sampledPixels) {
          let grouped = false

          for (const group of colorGroups) {
            const hueDiff = Math.abs(pixel.h - group.h)
            const hueDistance = Math.min(hueDiff, 360 - hueDiff) // Handle hue wraparound
            const satDiff = Math.abs(pixel.s - group.s)
            const lightDiff = Math.abs(pixel.l - group.l)

            if (hueDistance < hueThreshold && satDiff < satThreshold && lightDiff < lightThreshold) {
              // Add to existing group
              group.r = (group.r * group.count + pixel.r) / (group.count + 1)
              group.g = (group.g * group.count + pixel.g) / (group.count + 1)
              group.b = (group.b * group.count + pixel.b) / (group.count + 1)
              group.h = (group.h * group.count + pixel.h) / (group.count + 1)
              group.s = (group.s * group.count + pixel.s) / (group.count + 1)
              group.l = (group.l * group.count + pixel.l) / (group.count + 1)
              group.count += pixel.count
              grouped = true
              break
            }
          }

          if (!grouped) {
            colorGroups.push({ ...pixel })
          }
        }

        // Sort by count (most dominant first)
        colorGroups.sort((a, b) => b.count - a.count)

        // Get top 2-3 most dominant colors
        const topGroups = colorGroups.slice(0, 3)

        if (topGroups.length === 0) {
          resolve({ primary: 'rgb(20, 20, 30)', secondary: 'rgb(10, 10, 20)' })
          return
        }

        // Primary color - most dominant, slightly enhanced
        const primary = topGroups[0]
        // Enhance saturation and slightly adjust brightness
        const primaryEnhanced = hslToRgb(primary.h, Math.min(100, primary.s * 1.1), primary.l)
        const primaryRgb = `rgb(${Math.round(primaryEnhanced[0])}, ${Math.round(primaryEnhanced[1])}, ${Math.round(primaryEnhanced[2])})`

        // Secondary color - either second dominant or darker variant of primary
        let secondaryRgb
        if (topGroups.length > 1 && topGroups[1].count > topGroups[0].count * 0.3) {
          const secondary = topGroups[1]
          const secondaryEnhanced = hslToRgb(secondary.h, Math.min(100, secondary.s * 1.1), Math.max(0, secondary.l * 0.7))
          secondaryRgb = `rgb(${Math.round(secondaryEnhanced[0])}, ${Math.round(secondaryEnhanced[1])}, ${Math.round(secondaryEnhanced[2])})`
        } else {
          // Create darker variant of primary
          const secondaryEnhanced = hslToRgb(primary.h, Math.min(100, primary.s * 0.9), Math.max(0, primary.l * 0.5))
          secondaryRgb = `rgb(${Math.round(secondaryEnhanced[0])}, ${Math.round(secondaryEnhanced[1])}, ${Math.round(secondaryEnhanced[2])})`
        }

        resolve({
          primary: primaryRgb,
          secondary: secondaryRgb
        })
      } catch (error) {
        console.error('Error extracting colors:', error)
        resolve({ primary: 'rgb(20, 20, 30)', secondary: 'rgb(10, 10, 20)' })
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = imageUrl
  })
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return [r * 255, g * 255, b * 255]
}

/**
 * Convert RGB to HSL for color manipulation
 */
export function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return [h * 360, s * 100, l * 100]
}

/**
 * Generate gradient colors from extracted colors
 * Creates a smooth gradient that matches the album's color theme
 */
export function generateGradientColors(primary, secondary) {
  // Extract RGB values
  const primaryMatch = primary.match(/\d+/g).map(Number)
  const secondaryMatch = secondary.match(/\d+/g).map(Number)

  // Convert to HSL for better color manipulation
  const [h, s, l] = rgbToHsl(primaryMatch[0], primaryMatch[1], primaryMatch[2])

  // Create a more sophisticated gradient using HSL
  // Start color (top): Lighter, more vibrant - creates glow effect
  const startHsl = hslToRgb(h, Math.min(100, s * 1.15), Math.min(95, l * 1.2))
  const startColor = `rgb(${Math.round(startHsl[0])}, ${Math.round(startHsl[1])}, ${Math.round(startHsl[2])})`

  // Mid color: The primary theme color
  const midColor = primary

  // End color (bottom): Much darker, with slight saturation boost for depth
  const [h2, s2, l2] = rgbToHsl(secondaryMatch[0], secondaryMatch[1], secondaryMatch[2])
  const endHsl = hslToRgb(h2, Math.min(100, s2 * 1.05), Math.max(5, l2 * 0.4))
  const endColor = `rgb(${Math.round(endHsl[0])}, ${Math.round(endHsl[1])}, ${Math.round(endHsl[2])})`

  return { startColor, midColor, endColor }
}

