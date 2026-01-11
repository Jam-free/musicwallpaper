import React from 'react'
import { motion } from 'framer-motion'
import './AlbumCoverSelector.css'

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
            const coverUrl = track.artworkUrl100?.replace('100x100', '1000x1000') || track.artworkUrl100
            
            return (
              <motion.div
                key={index}
                className="cover-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(track)}
              >
                <div className="cover-image-wrapper">
                  <img 
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

export default AlbumCoverSelector

