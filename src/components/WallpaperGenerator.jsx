import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import './WallpaperGenerator.css'

function WallpaperGenerator({ songData, onReset }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const wallpaperRef = useRef(null)

  useEffect(() => {
    if (songData?.albumCover) {
      const img = new Image()
      img.onload = () => setImageLoaded(true)
      img.src = songData.albumCover
    }
  }, [songData])

  if (!songData) return null

  // 渲染背景内容的辅助组件
  const WallpaperContent = ({ isBlurred = false }) => (
    <div className={isBlurred ? "blur-layer-content" : "wallpaper-base"}>
      <div className="album-section">
        <img src={songData.albumCover} className="album-image-normal" alt="" />
      </div>
      <div className="album-section">
        <img src={songData.albumCover} className="album-image-mirror" alt="" />
      </div>
    </div>
  )

  const handleDownload = () => {
    if (!wallpaperRef.current || !songData.albumCover) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const width = 240
    const height = 533
    canvas.width = width
    canvas.height = height

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // 1. 绘制基础背景
      const drawBase = (targetCtx) => {
        // 上半部分
        targetCtx.drawImage(img, 0, 0, width, height / 2)
        // 下半部分镜像
        targetCtx.save()
        targetCtx.translate(0, height)
        targetCtx.scale(1, -1)
        targetCtx.drawImage(img, 0, 0, width, height / 2)
        targetCtx.restore()
      }

      drawBase(ctx)

      // 2. 绘制三层模糊
      const applyBlurLayer = (blurPx, brightness, saturate, contrast, maskStops) => {
        const layerCanvas = document.createElement('canvas')
        layerCanvas.width = width
        layerCanvas.height = height
        const layerCtx = layerCanvas.getContext('2d')

        drawBase(layerCtx)

        // 应用滤镜
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = width
        tempCanvas.height = height
        const tempCtx = tempCanvas.getContext('2d')
        tempCtx.filter = `blur(${blurPx}px) brightness(${brightness}) saturate(${saturate}) contrast(${contrast})`
        tempCtx.drawImage(layerCanvas, 0, 0)

        // 应用遮罩
        const maskCanvas = document.createElement('canvas')
        maskCanvas.width = width
        maskCanvas.height = height
        const maskCtx = maskCanvas.getContext('2d')
        const grad = maskCtx.createLinearGradient(0, height, 0, 0)
        maskStops.forEach(s => grad.addColorStop(1 - s.pos, s.color))
        maskCtx.fillStyle = grad
        maskCtx.fillRect(0, 0, width, height)

        ctx.save()
        ctx.drawImage(tempCanvas, 0, 0)
        ctx.globalCompositeOperation = 'destination-in'
        ctx.drawImage(maskCanvas, 0, 0)
        ctx.restore()
      }

      applyBlurLayer(150, 1.05, 1.15, 0.9, [{pos: 0, color: 'black'}, {pos: 0.52, color: 'black'}, {pos: 0.58, color: 'transparent'}])
      applyBlurLayer(80, 1.15, 1.25, 0.92, [{pos: 0, color: 'black'}, {pos: 0.52, color: 'black'}, {pos: 0.60, color: 'transparent'}])
      applyBlurLayer(30, 1.25, 1.35, 0.95, [{pos: 0, color: 'black'}, {pos: 0.52, color: 'black'}, {pos: 0.65, color: 'transparent'}])

      // 下载
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${songData.songName}_wallpaper.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.src = songData.albumCover
  }

  return (
    <div className="wallpaper-container">
      <motion.div
        className="wallpaper-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div ref={wallpaperRef} className="wallpaper">
          {imageLoaded && <WallpaperContent />}
          
          <div className="wallpaper-blur-overlay">
            <div className="blur-layer blur-layer-1">
              <WallpaperContent isBlurred />
            </div>
            <div className="blur-layer blur-layer-2">
              <WallpaperContent isBlurred />
            </div>
            <div className="blur-layer blur-layer-3">
              <WallpaperContent isBlurred />
            </div>
          </div>
        </div>

        <div className="wallpaper-controls">
          <button className="control-button secondary" onClick={onReset}>重新搜索</button>
          <button className="control-button primary" onClick={handleDownload} disabled={!imageLoaded}>下载壁纸</button>
        </div>
      </motion.div>
    </div>
  )
}

export default WallpaperGenerator
