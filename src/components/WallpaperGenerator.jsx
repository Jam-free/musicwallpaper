import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { extractColors, generateGradientColors } from '../utils/colorExtractor'
import './WallpaperGenerator.css'

function WallpaperGenerator({ songData, onReset }) {
  const wallpaperRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [colors, setColors] = useState(null)
  const [isLoadingColors, setIsLoadingColors] = useState(true)
  const [mirrorHeight, setMirrorHeight] = useState(0)

  useEffect(() => {
    if (songData?.albumCover) {
      setIsLoadingColors(true)
      extractColors(songData.albumCover)
        .then((extractedColors) => {
          setColors(extractedColors)
          setIsLoadingColors(false)
        })
        .catch(() => {
          setColors({ primary: 'rgb(20, 20, 30)', secondary: 'rgb(10, 10, 20)' })
          setIsLoadingColors(false)
        })
    }
  }, [songData])

  useEffect(() => {
    if (wallpaperRef.current && imageLoaded) {
      const wallpaper = wallpaperRef.current
      const wallpaperWidth = wallpaper.offsetWidth
      const wallpaperHeight = wallpaper.offsetHeight
      const coverSize = wallpaperWidth // Square cover
      const remainingHeight = wallpaperHeight - coverSize
      setMirrorHeight(remainingHeight)
    }
  }, [imageLoaded, songData])

  const handleDownload = () => {
    if (!wallpaperRef.current || !songData.albumCover) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Full size for download - mobile screen aspect ratio
    const width = 360
    const height = 800 // 9:20 ratio for modern phone screens

    canvas.width = width
    canvas.height = height

    // Load and draw images
    const bgImg = new Image()
    bgImg.crossOrigin = 'anonymous'

    bgImg.onload = () => {
      // Step 1: Draw complete square album cover at top (1:1 aspect ratio, no crop)
      const coverSize = width // Square cover takes full width
      const coverY = 0 // Position at top
      
      // Draw square cover - maintain aspect ratio, complete display
      ctx.drawImage(bgImg, 0, coverY, coverSize, coverSize)

      // Step 2: Calculate remaining space below cover
      const remainingHeight = height - coverSize
      const mirrorStartY = coverSize

      // Step 3: Create mirrored extension from cover bottom edge
      // The mirror should be the same cover, vertically flipped, aligned at cover bottom
      ctx.save()
      // Translate to cover bottom edge, then flip vertically
      ctx.translate(0, coverSize)
      ctx.scale(1, -1)
      // Draw the same cover, but now flipped
      ctx.drawImage(bgImg, 0, 0, coverSize, coverSize)
      ctx.restore()

      // Step 4: Create strongly blurred version of the mirrored cover
      const blurCanvas = document.createElement('canvas')
      const blurCtx = blurCanvas.getContext('2d')
      blurCanvas.width = width
      blurCanvas.height = remainingHeight

      // Draw the mirrored cover to blur canvas (same source, same flip)
      blurCtx.translate(0, remainingHeight)
      blurCtx.scale(1, -1)
      blurCtx.drawImage(bgImg, 0, 0, coverSize, coverSize)
      blurCtx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform

      // Apply strong blur + reduced contrast + reduced saturation
      blurCtx.filter = 'blur(60px) brightness(0.65) saturate(0.6) contrast(0.75)'
      const tempBlurCanvas = document.createElement('canvas')
      const tempBlurCtx = tempBlurCanvas.getContext('2d')
      tempBlurCanvas.width = width
      tempBlurCanvas.height = remainingHeight
      tempBlurCtx.drawImage(blurCanvas, 0, 0)
      blurCtx.clearRect(0, 0, width, remainingHeight)
      blurCtx.drawImage(tempBlurCanvas, 0, 0)

      // Step 5: Apply vertical gradient mask for smooth transition from cover bottom edge
      const maskCanvas = document.createElement('canvas')
      const maskCtx = maskCanvas.getContext('2d')
      maskCanvas.width = width
      maskCanvas.height = remainingHeight

      const maskGradient = maskCtx.createLinearGradient(0, 0, 0, remainingHeight)
      maskGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
      maskGradient.addColorStop(0.05, 'rgba(0, 0, 0, 0.05)')
      maskGradient.addColorStop(0.15, 'rgba(0, 0, 0, 0.15)')
      maskGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.35)')
      maskGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)')
      maskGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)')
      maskGradient.addColorStop(0.9, 'rgba(0, 0, 0, 0.95)')
      maskGradient.addColorStop(1, 'rgba(0, 0, 0, 1)')

      maskCtx.fillStyle = maskGradient
      maskCtx.fillRect(0, 0, width, remainingHeight)

      // Apply mask to blur canvas
      blurCtx.globalCompositeOperation = 'destination-in'
      blurCtx.drawImage(maskCanvas, 0, 0)

      // Step 6: Draw blurred overlay on bottom section (replaces the clear mirror)
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(blurCanvas, 0, mirrorStartY)
      ctx.restore()

      // Add rounded corners to final canvas
      ctx.save()
      ctx.globalCompositeOperation = 'destination-in'
      const radius = 36
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(width - radius, 0)
      ctx.quadraticCurveTo(width, 0, width, radius)
      ctx.lineTo(width, height - radius)
      ctx.quadraticCurveTo(width, height, width - radius, height)
      ctx.lineTo(radius, height)
      ctx.quadraticCurveTo(0, height, 0, height - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${songData.songName.replace(/[^a-z0-9]/gi, '_')}_wallpaper.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }

    bgImg.onerror = () => {
      alert('Failed to load image for download')
    }

    bgImg.src = songData.albumCover
  }

  if (!songData) return null

  return (
    <div className="wallpaper-container">
      <motion.div
        className="wallpaper-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div ref={wallpaperRef} className="wallpaper">
          {/* Mirror symmetric wallpaper */}
          {songData.albumCover && (
            <motion.div
              className="wallpaper-mirror-bg"
              style={{
                backgroundImage: `url(${songData.albumCover})`,
                opacity: imageLoaded ? 1 : 0
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Original square album cover - complete display */}
              <div
                className="album-cover-original"
                style={{
                  opacity: imageLoaded ? 1 : 0
                }}
              >
                <img
                  src={songData.albumCover}
                  alt={songData.collectionName}
                  className="album-cover-square"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>

              {/* Mirrored extension from cover bottom edge - vertical flip of the same cover */}
              {mirrorHeight > 0 && (
                <>
                  {/* Base mirror layer - same cover, vertically flipped, aligned at cover bottom */}
                  <div
                    className="album-cover-mirror"
                    style={{
                      backgroundImage: `url(${songData.albumCover})`,
                      top: '100%',
                      height: `${mirrorHeight}px`,
                      opacity: imageLoaded ? 1 : 0
                    }}
                  />

                  {/* Strong Gaussian blur overlay - same cover source, blurred and color-adjusted */}
                  <div
                    className="album-cover-blur-overlay"
                    style={{
                      backgroundImage: `url(${songData.albumCover})`,
                      top: '100%',
                      height: `${mirrorHeight}px`,
                      opacity: imageLoaded ? 1 : 0
                    }}
                  />
                </>
              )}

              {/* Smooth center line blend at cover bottom junction */}
              {mirrorHeight > 0 && (
                <div
                  className="center-line-blend"
                  style={{
                    top: '100%',
                    height: `${Math.min(mirrorHeight * 0.2, 60)}px`
                  }}
                />
              )}

              {/* Load trigger image */}
              <img
                src={songData.albumCover}
                alt={songData.collectionName}
                style={{ display: 'none' }}
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          )}

          {/* Subtle texture overlay */}
          <div className="texture-overlay" />
        </div>

        {/* Controls - centered below wallpaper */}
        <motion.div
          className="wallpaper-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            className="control-button secondary"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            New Search
          </motion.button>
          <motion.button
            className="control-button primary"
            onClick={handleDownload}
            disabled={!imageLoaded}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Download
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WallpaperGenerator

