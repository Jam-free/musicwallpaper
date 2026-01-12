import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { processAlbumCover } from '../utils/imageProcessor'
import './WallpaperGenerator.css'

// 图片预加载缓存
const imageCache = new Map()

function WallpaperGenerator({ songData, onReset }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [processedCoverUrl, setProcessedCoverUrl] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const wallpaperRef = useRef(null)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    if (!songData?.albumCover) return
    
    // 取消之前的加载任务
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    const coverUrl = songData.albumCover
    
    // 检查缓存
    if (imageCache.has(coverUrl)) {
      setProcessedCoverUrl(imageCache.get(coverUrl))
      setImageLoaded(true)
      setLoadingProgress(100)
      return
    }
    
    setImageLoaded(false)
    setLoadingProgress(10)
    
    // 处理图片：自动裁剪黑边和调整为正方形
    processAlbumCover(coverUrl)
      .then(processedUrl => {
        if (abortControllerRef.current?.signal.aborted) return
        
        setLoadingProgress(50)
        setProcessedCoverUrl(processedUrl)
        
        // 预加载处理后的图片
        const img = new Image()
        img.onload = () => {
          if (abortControllerRef.current?.signal.aborted) return
          imageCache.set(coverUrl, processedUrl) // 缓存
          setImageLoaded(true)
          setLoadingProgress(100)
        }
        img.onerror = () => {
          console.error('图片加载失败')
          setLoadingProgress(100)
        }
        img.src = processedUrl
      })
      .catch(error => {
        if (abortControllerRef.current?.signal.aborted) return
        console.error('图片处理失败，使用原图:', error)
        setProcessedCoverUrl(coverUrl)
        
        const img = new Image()
        img.onload = () => {
          setImageLoaded(true)
          setLoadingProgress(100)
        }
        img.src = coverUrl
      })
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [songData])

  if (!songData) return null

  // 使用处理后的图片URL（如果没有处理则使用原图）
  const coverUrl = processedCoverUrl || songData?.albumCover

  // 渲染背景内容的辅助组件
  const WallpaperContent = ({ isBlurred = false }) => (
    <div className={isBlurred ? "blur-layer-content" : "wallpaper-base"}>
      <div className="album-section">
        <img src={coverUrl} className="album-image-normal" alt="" />
      </div>
      <div className="album-section">
        <img src={coverUrl} className="album-image-mirror" alt="" />
      </div>
    </div>
  )

  const handleDownload = () => {
    if (!wallpaperRef.current || !coverUrl) return

    // 使用实际手机壁纸尺寸（iPhone 标准尺寸，9:16 比例）
    // 常见尺寸：390x844 (iPhone 12/13/14), 430x932 (iPhone 14 Pro Max)
    const width = 390  // 标准宽度
    const height = 844 // 9:16 比例的高度
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // 计算图片绘制区域（模拟 CSS object-fit: cover 的行为）
      // 确保图片居中裁剪，填充整个区域
      const drawImageCover = (targetCtx, targetX, targetY, targetWidth, targetHeight, isMirror = false) => {
        const imgAspect = img.width / img.height
        const targetAspect = targetWidth / targetHeight
        
        let drawWidth, drawHeight, drawX, drawY
        
        if (imgAspect > targetAspect) {
          // 图片更宽，以高度为准
          drawHeight = targetHeight
          drawWidth = drawHeight * imgAspect
          drawX = targetX + (targetWidth - drawWidth) / 2
          drawY = targetY
        } else {
          // 图片更高，以宽度为准
          drawWidth = targetWidth
          drawHeight = drawWidth / imgAspect
          drawX = targetX
          drawY = targetY + (targetHeight - drawHeight) / 2
        }
        
        if (isMirror) {
          // 镜像绘制：先绘制到临时canvas，然后镜像
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = targetWidth
          tempCanvas.height = targetHeight
          const tempCtx = tempCanvas.getContext('2d')
          tempCtx.drawImage(img, drawX - targetX, drawY - targetY, drawWidth, drawHeight)
          
          // 镜像
          targetCtx.save()
          targetCtx.translate(targetX, targetY + targetHeight)
          targetCtx.scale(1, -1)
          targetCtx.drawImage(tempCanvas, 0, 0)
          targetCtx.restore()
        } else {
          targetCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        }
      }

      // 1. 绘制基础背景
      const drawBase = (targetCtx) => {
        const halfHeight = height / 2
        // 上半部分（正常）
        drawImageCover(targetCtx, 0, 0, width, halfHeight, false)
        // 下半部分（镜像）
        drawImageCover(targetCtx, 0, halfHeight, width, halfHeight, true)
      }

      drawBase(ctx)

      // 2. 绘制三层模糊层（叠加模式）
      const applyBlurLayer = (blurPx, brightness, saturate, contrast, maskStops) => {
        // 创建临时画布用于处理当前模糊层
        const layerCanvas = document.createElement('canvas')
        // 为解决边缘模糊变淡，绘图区域也需要按比例扩大
        const marginX = width * 0.1
        const marginY = height * 0.1
        const drawWidth = width + marginX * 2
        const drawHeight = height + marginY * 2
        
        layerCanvas.width = drawWidth
        layerCanvas.height = drawHeight
        const layerCtx = layerCanvas.getContext('2d')

        // 在扩大后的画布上绘制
        const halfDrawHeight = drawHeight / 2
        const drawImageCoverExtended = (tCtx, tX, tY, tW, tH, isMirror = false) => {
          const imgAspect = img.width / img.height
          const tAspect = tW / tH
          let dW, dH, dX, dY
          if (imgAspect > tAspect) { dH = tH; dW = dH * imgAspect; dX = tX + (tW - dW) / 2; dY = tY; }
          else { dW = tW; dH = dW / imgAspect; dX = tX; dY = tY + (tH - dH) / 2; }
          
          if (isMirror) {
            const tC = document.createElement('canvas'); tC.width = tW; tC.height = tH;
            const tCtx2 = tC.getContext('2d'); tCtx2.drawImage(img, dX - tX, dY - tY, dW, dH);
            tCtx.save(); tCtx.translate(tX, tY + tH); tCtx.scale(1, -1); tCtx.drawImage(tC, 0, 0); tCtx.restore();
          } else { tCtx.drawImage(img, dX, dY, dW, dH); }
        }

        drawImageCoverExtended(layerCtx, 0, 0, drawWidth, halfDrawHeight, false)
        drawImageCoverExtended(layerCtx, 0, halfDrawHeight, drawWidth, halfDrawHeight, true)

        // 应用滤镜处理
        const filterCanvas = document.createElement('canvas')
        filterCanvas.width = drawWidth
        filterCanvas.height = drawHeight
        const filterCtx = filterCanvas.getContext('2d')
        filterCtx.filter = `blur(${blurPx}px) brightness(${brightness}) saturate(${saturate}) contrast(${contrast})`
        filterCtx.drawImage(layerCanvas, 0, 0)

        // 创建遮罩画布（遮罩也需要匹配扩大的尺寸）
        const maskCanvas = document.createElement('canvas')
        maskCanvas.width = drawWidth
        maskCanvas.height = drawHeight
        const maskCtx = maskCanvas.getContext('2d')
        const grad = maskCtx.createLinearGradient(0, drawHeight, 0, 0)
        maskStops.forEach(s => grad.addColorStop(s.pos, s.color))
        maskCtx.fillStyle = grad
        maskCtx.fillRect(0, 0, drawWidth, drawHeight)

        // 合成
        const maskedCanvas = document.createElement('canvas')
        maskedCanvas.width = drawWidth
        maskedCanvas.height = drawHeight
        const maskedCtx = maskedCanvas.getContext('2d')
        maskedCtx.drawImage(filterCanvas, 0, 0)
        maskedCtx.globalCompositeOperation = 'destination-in'
        maskedCtx.drawImage(maskCanvas, 0, 0)

        // 最后将处理好的模糊层叠加到主画布上（居中对齐）
        ctx.save()
        ctx.drawImage(maskedCanvas, -marginX, -marginY, drawWidth, drawHeight)
        ctx.restore()
      }

      // 严格同步 CSS 的百分比和参数
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
    img.src = coverUrl
  }

  return (
    <div className="wallpaper-container">
      <motion.div
        className="wallpaper-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div ref={wallpaperRef} className="wallpaper">
          {/* 加载进度指示器 */}
          {!imageLoaded && (
            <div className="wallpaper-loading">
              <div className="loading-spinner" />
              <div className="loading-text">
                {loadingProgress < 50 ? '处理图片中...' : '加载中...'}
              </div>
            </div>
          )}
          
          {imageLoaded && <WallpaperContent />}
          
          {imageLoaded && (
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
          )}
        </div>

        <div className="wallpaper-controls">
          <button className="control-button secondary" onClick={onReset}>重新搜索</button>
          <button className="control-button primary" onClick={handleDownload} disabled={!imageLoaded}>
            {imageLoaded ? '下载壁纸' : '加载中...'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default WallpaperGenerator
