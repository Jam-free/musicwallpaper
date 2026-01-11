/**
 * 图片处理工具：检测和处理非正常比例的专辑封面
 */

/**
 * 检测图片是否有黑边（通过采样分析边缘像素，优化性能）
 * @param {HTMLImageElement} img - 图片元素
 * @param {number} threshold - 黑边阈值（0-255，值越小越严格）
 * @returns {Object} { hasBlackBorders: boolean, cropInfo: { x, y, width, height } }
 */
export const detectBlackBorders = (img, threshold = 30) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 为了性能，如果图片太大，先缩放到合理尺寸
    const maxDimension = 1000
    let scale = 1
    if (img.width > maxDimension || img.height > maxDimension) {
      scale = maxDimension / Math.max(img.width, img.height)
    }
    
    canvas.width = Math.floor(img.width * scale)
    canvas.height = Math.floor(img.height * scale)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // 检测边缘区域（取边缘15%的区域，采样检测以提高性能）
    const edgePercent = 0.15
    const edgeWidth = Math.floor(canvas.width * edgePercent)
    const edgeHeight = Math.floor(canvas.height * edgePercent)
    const sampleStep = 5 // 每5个像素采样一次，提高性能

    // 检测顶部黑边（采样）
    let topBlack = 0
    let topSamples = 0
    for (let y = 0; y < edgeHeight; y += sampleStep) {
      for (let x = 0; x < canvas.width; x += sampleStep) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3
        topSamples++
        if (brightness < threshold) {
          topBlack++
        }
      }
    }
    const topBlackRatio = topSamples > 0 ? topBlack / topSamples : 0

    // 检测底部黑边（采样）
    let bottomBlack = 0
    let bottomSamples = 0
    for (let y = canvas.height - edgeHeight; y < canvas.height; y += sampleStep) {
      for (let x = 0; x < canvas.width; x += sampleStep) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3
        bottomSamples++
        if (brightness < threshold) {
          bottomBlack++
        }
      }
    }
    const bottomBlackRatio = bottomSamples > 0 ? bottomBlack / bottomSamples : 0

    // 检测左侧黑边（采样）
    let leftBlack = 0
    let leftSamples = 0
    for (let x = 0; x < edgeWidth; x += sampleStep) {
      for (let y = 0; y < canvas.height; y += sampleStep) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3
        leftSamples++
        if (brightness < threshold) {
          leftBlack++
        }
      }
    }
    const leftBlackRatio = leftSamples > 0 ? leftBlack / leftSamples : 0

    // 检测右侧黑边（采样）
    let rightBlack = 0
    let rightSamples = 0
    for (let x = canvas.width - edgeWidth; x < canvas.width; x += sampleStep) {
      for (let y = 0; y < canvas.height; y += sampleStep) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3
        rightSamples++
        if (brightness < threshold) {
          rightBlack++
        }
      }
    }
    const rightBlackRatio = rightSamples > 0 ? rightBlack / rightSamples : 0

    // 如果边缘区域超过60%是黑色，认为有黑边（提高阈值，避免误判）
    const blackBorderThreshold = 0.6
    const hasBlackBorders = 
      topBlackRatio > blackBorderThreshold ||
      bottomBlackRatio > blackBorderThreshold ||
      leftBlackRatio > blackBorderThreshold ||
      rightBlackRatio > blackBorderThreshold

    // 计算裁剪区域（去除黑边）
    // 使用比例计算，然后映射回原始尺寸
    let cropX = 0
    let cropY = 0
    let cropWidth = img.width
    let cropHeight = img.height

    if (hasBlackBorders) {
      // 找到实际内容区域的边界（在缩放后的canvas上）
      // 从边缘向内扫描，找到第一个非黑色像素
      const scanStep = 2 // 扫描步长
      
      // 顶部
      if (topBlackRatio > blackBorderThreshold) {
        for (let y = 0; y < canvas.height; y += scanStep) {
          let hasContent = false
          for (let x = 0; x < canvas.width; x += scanStep) {
            const idx = (y * canvas.width + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]
            const brightness = (r + g + b) / 3
            if (brightness >= threshold) {
              hasContent = true
              break
            }
          }
          if (hasContent) {
            cropY = Math.max(0, Math.floor((y - 5) / scale))
            break
          }
        }
      }

      // 底部
      if (bottomBlackRatio > blackBorderThreshold) {
        for (let y = canvas.height - 1; y >= 0; y -= scanStep) {
          let hasContent = false
          for (let x = 0; x < canvas.width; x += scanStep) {
            const idx = (y * canvas.width + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]
            const brightness = (r + g + b) / 3
            if (brightness >= threshold) {
              hasContent = true
              break
            }
          }
          if (hasContent) {
            cropHeight = Math.min(img.height, Math.floor((y + 6) / scale) - cropY)
            break
          }
        }
      }

      // 左侧
      if (leftBlackRatio > blackBorderThreshold) {
        for (let x = 0; x < canvas.width; x += scanStep) {
          let hasContent = false
          for (let y = 0; y < canvas.height; y += scanStep) {
            const idx = (y * canvas.width + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]
            const brightness = (r + g + b) / 3
            if (brightness >= threshold) {
              hasContent = true
              break
            }
          }
          if (hasContent) {
            cropX = Math.max(0, Math.floor((x - 5) / scale))
            break
          }
        }
      }

      // 右侧
      if (rightBlackRatio > blackBorderThreshold) {
        for (let x = canvas.width - 1; x >= 0; x -= scanStep) {
          let hasContent = false
          for (let y = 0; y < canvas.height; y += scanStep) {
            const idx = (y * canvas.width + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]
            const brightness = (r + g + b) / 3
            if (brightness >= threshold) {
              hasContent = true
              break
            }
          }
          if (hasContent) {
            cropWidth = Math.min(img.width, Math.floor((x + 6) / scale) - cropX)
            break
          }
        }
      }
    }

    resolve({
      hasBlackBorders,
      cropInfo: {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      },
      blackRatios: {
        top: topBlackRatio,
        bottom: bottomBlackRatio,
        left: leftBlackRatio,
        right: rightBlackRatio
      }
    })
  })
}

/**
 * 检测图片比例是否正常（应该是接近1:1的正方形）
 * @param {HTMLImageElement} img - 图片元素
 * @param {number} tolerance - 容差（0-1，0.1表示允许10%的偏差）
 * @returns {Object} { isSquare: boolean, aspectRatio: number, needsCrop: boolean }
 */
export const detectAspectRatio = (img, tolerance = 0.1) => {
  const aspectRatio = img.width / img.height
  const isSquare = Math.abs(aspectRatio - 1) <= tolerance
  const needsCrop = !isSquare

  return {
    isSquare,
    aspectRatio,
    needsCrop,
    cropInfo: needsCrop ? {
      // 居中裁剪成正方形
      x: aspectRatio > 1 ? (img.width - img.height) / 2 : 0,
      y: aspectRatio < 1 ? (img.height - img.width) / 2 : 0,
      width: Math.min(img.width, img.height),
      height: Math.min(img.width, img.height)
    } : null
  }
}

/**
 * 处理图片：自动裁剪黑边和调整为正方形
 * @param {string} imageUrl - 图片URL
 * @returns {Promise<string>} 处理后的图片DataURL
 */
export const processAlbumCover = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = async () => {
      try {
        // 1. 检测黑边
        const blackBorderResult = await detectBlackBorders(img, 30)
        
        // 2. 检测比例
        const aspectRatioResult = detectAspectRatio(img, 0.1)
        
        // 3. 确定最终裁剪区域
        let finalCropX = 0
        let finalCropY = 0
        let finalCropWidth = img.width
        let finalCropHeight = img.height

        // 如果有黑边，使用黑边检测的裁剪区域
        if (blackBorderResult.hasBlackBorders) {
          finalCropX = blackBorderResult.cropInfo.x
          finalCropY = blackBorderResult.cropInfo.y
          finalCropWidth = blackBorderResult.cropInfo.width
          finalCropHeight = blackBorderResult.cropInfo.height
        }

        // 如果比例不正常，进一步裁剪成正方形
        if (aspectRatioResult.needsCrop) {
          const cropSize = Math.min(finalCropWidth, finalCropHeight)
          const centerX = finalCropX + finalCropWidth / 2
          const centerY = finalCropY + finalCropHeight / 2
          
          finalCropX = centerX - cropSize / 2
          finalCropY = centerY - cropSize / 2
          finalCropWidth = cropSize
          finalCropHeight = cropSize
        }

        // 4. 执行裁剪和缩放
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 目标尺寸（正方形，使用较大的尺寸）
        const targetSize = Math.max(finalCropWidth, finalCropHeight)
        canvas.width = targetSize
        canvas.height = targetSize

        // 绘制裁剪后的图片
        ctx.drawImage(
          img,
          finalCropX, finalCropY, finalCropWidth, finalCropHeight,
          0, 0, targetSize, targetSize
        )

        // 转换为DataURL
        const processedDataUrl = canvas.toDataURL('image/png', 0.95)
        resolve(processedDataUrl)

        // 开发模式日志
        if (process.env.NODE_ENV === 'development') {
          console.log('🖼️ 图片处理结果:', {
            原始尺寸: `${img.width}x${img.height}`,
            原始比例: (img.width / img.height).toFixed(2),
            检测到黑边: blackBorderResult.hasBlackBorders,
            黑边比例: blackBorderResult.blackRatios,
            需要裁剪: aspectRatioResult.needsCrop,
            裁剪区域: {
              x: finalCropX,
              y: finalCropY,
              width: finalCropWidth,
              height: finalCropHeight
            },
            处理后尺寸: `${targetSize}x${targetSize}`
          })
        }
      } catch (error) {
        console.error('图片处理失败:', error)
        // 如果处理失败，返回原图
        resolve(imageUrl)
      }
    }

    img.onerror = () => {
      console.error('图片加载失败:', imageUrl)
      reject(new Error('图片加载失败'))
    }

    img.src = imageUrl
  })
}

