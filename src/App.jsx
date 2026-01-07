import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchInput from './components/SearchInput'
import WallpaperGenerator from './components/WallpaperGenerator'
import './App.css'

function App() {
  const [songData, setSongData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showInput, setShowInput] = useState(true)

  const handleSearch = async (songName) => {
    if (!songName.trim()) return

    setIsLoading(true)
    setShowInput(false)

    try {
      // 获取更多结果以便筛选
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&media=music&limit=20`
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        // 优先选择：1. 有高清封面的 2. 较新的专辑 3. 主流艺术家
        const sortedResults = data.results
          .filter(track => track.artworkUrl100) // 必须有封面
          .sort((a, b) => {
            // 优先选择有高清封面的（artworkUrl100 存在且可替换为 1000x1000）
            const aHasHD = a.artworkUrl100 && a.artworkUrl100.includes('100x100')
            const bHasHD = b.artworkUrl100 && b.artworkUrl100.includes('100x100')
            if (aHasHD && !bHasHD) return -1
            if (!aHasHD && bHasHD) return 1
            
            // 优先选择较新的（releaseDate 较新）
            if (a.releaseDate && b.releaseDate) {
              return new Date(b.releaseDate) - new Date(a.releaseDate)
            }
            
            return 0
          })
        
        const track = sortedResults[0] || data.results[0]
        setSongData({
          songName: track.trackName,
          artistName: track.artistName,
          albumCover: track.artworkUrl100?.replace('100x100', '1000x1000') || track.artworkUrl100,
          collectionName: track.collectionName
        })
      } else {
        alert('No results found. Please try another song.')
        setShowInput(true)
      }
    } catch (error) {
      console.error('Error fetching song:', error)
      alert('Failed to fetch song. Please try again.')
      setShowInput(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSongData(null)
    setShowInput(true)
  }

  return (
    <div className="app">
      {/* Left side decorations */}
      {showInput && !songData && (
        <>
          <div className="decoration-left">
            <div className="deco-circle"></div>
            <div className="deco-circle"></div>
            <div className="deco-circle"></div>
          </div>
          <div className="deco-lines"></div>
          <div className="deco-tag">✦ Wallpaper Generator</div>
          <div className="deco-tag">✦ Music Art</div>
          <div className="deco-tag">✦ Creative</div>

          {/* Additional decorative dots */}
          <div className="deco-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>

          {/* Music note icons */}
          <div className="deco-music">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {showInput && !songData && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="input-container"
          >
            <motion.div
              className="hero-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="hero-title">Music Wallpaper</h1>
              <p className="hero-subtitle">Create beautiful wallpapers from your favorite album art</p>
            </motion.div>
            <SearchInput onSearch={handleSearch} isLoading={isLoading} />
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-container"
          >
            <motion.div
              className="loading-indicator"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}

        {songData && !isLoading && (
          <motion.div
            key="wallpaper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <WallpaperGenerator songData={songData} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

