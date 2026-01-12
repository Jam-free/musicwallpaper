import React, { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import './AlbumCoverSelector.css'

// 懒加载图片组件
const LazyImage = memo(({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  
  return (
    <div className="lazy-image-container">
      {!loaded && !error && (
        <div className="image-placeholder">
          <div className="placeholder-spinner" />
        </div>
      )}
      <img 
        src={src}
        alt={alt}
        className={`${className} ${loaded ? 'loaded' : 'loading'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
})

LazyImage.displayName = 'LazyImage'

function AlbumCoverSelector({ candidates, onSelect, onCancel }) {
  if (!candidates || candidates.length === 0) return null

  return (
    <motion.div
      className="cover-selector-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="cover-selector-container"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="selector-title">选择专辑封面</h2>
        <p className="selector-subtitle">找到多个版本，请选择你想要的封面</p>
        
        <div className="cover-grid">
          {candidates.map((track, index) => {
            // 使用 300x300 预览图（更快加载），选择后再加载高清
            const coverUrl = track.artworkUrl100?.replace('100x100', '300x300') || track.artworkUrl100
            
            return (
              <motion.div
                key={track.trackId || index}
                className="cover-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(track)}
              >
                <div className="cover-image-wrapper">
                  <LazyImage 
                    src={coverUrl} 
                    alt={track.collectionName}
                    className="cover-image"
                  />
                  {index === 0 && (
                    <div className="cover-badge">推荐</div>
                  )}
                </div>
                <div className="cover-info">
                  <div className="cover-track-name">{track.trackName}</div>
                  <div className="cover-artist-name">{track.artistName}</div>
                  <div className="cover-album-name">{track.collectionName}</div>
                  {track.releaseDate && (
                    <div className="cover-release-date">
                      {new Date(track.releaseDate).getFullYear()}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
        
        <button className="selector-cancel-btn" onClick={onCancel}>
          取消
        </button>
      </motion.div>
    </motion.div>
  )
}

export default memo(AlbumCoverSelector)

