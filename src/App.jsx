import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchInput from './components/SearchInput'
import WallpaperGenerator from './components/WallpaperGenerator'
import AlbumCoverSelector from './components/AlbumCoverSelector'
import { rankAlbumCovers, getRecommendedArtist, getSongTranslations, quickScoreTrack } from './utils/albumRanker'
import './App.css'

// 搜索结果缓存（避免重复请求相同关键词）
const searchCache = new Map()
const CACHE_EXPIRY = 5 * 60 * 1000 // 5分钟缓存过期

function App() {
  const [songData, setSongData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [coverCandidates, setCoverCandidates] = useState(null)

  // 优化：使用 useCallback 避免不必要的函数重建
  const handleSearch = useCallback(async (songName) => {
    // 输入验证和安全限制
    const trimmedName = songName.trim()
    if (!trimmedName) return
    
    // 安全限制：最大搜索词长度 100 字符
    if (trimmedName.length > 100) {
      alert('搜索词过长，请缩短后重试。')
      return
    }

    setIsLoading(true)
    setShowInput(false)
    setCoverCandidates(null)

    try {
      // 检查缓存
      const cacheKey = trimmedName.toLowerCase()
      const cached = searchCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        processSearchResults(cached.results, trimmedName)
        setIsLoading(false)
        return
      }

      // ============ 优化后的搜索策略 ============
      // 核心优化：从 72+ 个请求减少到最多 6 个请求
      const isChineseSearch = /[\u4e00-\u9fa5]/.test(trimmedName)
      const matchedArtist = getRecommendedArtist(trimmedName)
      
      // 构建智能搜索词（最多 2 个）
      const searchTerms = [trimmedName]
      if (matchedArtist) {
        searchTerms.push(`${matchedArtist} ${trimmedName}`)
      }
      
      // 选择最优地区（中文用 hk，其他用 us）
      const primaryCountry = isChineseSearch ? 'hk' : 'us'
      const secondaryCountry = isChineseSearch ? 'us' : 'hk'
      
      // 限制并发请求数量：最多 4 个请求
      const searchPromises = []
      
      // 主要搜索（2个请求）
      searchTerms.forEach(term => {
        searchPromises.push(
          fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=50&country=${primaryCountry}`)
            .then(res => res.ok ? res.json() : { results: [] })
            .catch(() => ({ results: [] }))
        )
      })
      
      // 备用搜索（2个请求，仅使用原始搜索词）
      searchPromises.push(
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(trimmedName)}&media=music&entity=song&limit=50&country=${secondaryCountry}`)
          .then(res => res.ok ? res.json() : { results: [] })
          .catch(() => ({ results: [] }))
      )
      
      // 如果是中文搜索，额外添加英文翻译搜索
      if (isChineseSearch) {
        const translations = getSongTranslations(trimmedName)
        if (translations.length > 0) {
          const englishTerm = matchedArtist 
            ? `${matchedArtist} ${translations[0]}` 
            : translations[0]
          searchPromises.push(
            fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(englishTerm)}&media=music&entity=song&limit=30&country=us`)
              .then(res => res.ok ? res.json() : { results: [] })
              .catch(() => ({ results: [] }))
          )
        }
      }

      // 并行执行所有请求
      const results = await Promise.all(searchPromises)
      
      // 合并并去重结果
      const allResults = []
      const seenIds = new Set()
      
      results.forEach(data => {
        if (data?.results) {
          data.results.forEach(track => {
            if (track.trackId && !seenIds.has(track.trackId)) {
              seenIds.add(track.trackId)
              allResults.push(track)
            }
          })
        }
      })

      // 开发模式日志（简化）
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 搜索完成: ${searchPromises.length} 请求, ${allResults.length} 结果`)
      }

      // 缓存结果
      searchCache.set(cacheKey, { results: allResults, timestamp: Date.now() })
      
      // 处理结果
      processSearchResults(allResults, trimmedName)
      
    } catch (error) {
      console.error('搜索失败:', error)
      alert('获取歌曲失败，请重试。')
      setShowInput(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 优化：抽取结果处理逻辑，提高可读性和可维护性
  const processSearchResults = useCallback((allResults, songName) => {
    if (allResults.length === 0) {
      alert('未找到结果，请尝试其他歌曲。')
      setShowInput(true)
      return
    }

    // ============ 优化后的预过滤算法 ============
    // 使用快速评分函数替代完整排序，从 O(n²) 降为 O(n)
    const scoredResults = allResults
      .filter(track => track.artworkUrl100) // 必须有封面
      .map(track => ({
        track,
        quickScore: quickScoreTrack(track, songName)
      }))
    
    // 快速筛选高质量结果（评分 > 50）
    const highQualityResults = scoredResults
      .filter(item => item.quickScore > 50)
      .map(item => item.track)
    
    // 如果没有高质量结果，使用所有有封面的结果
    const candidatePool = highQualityResults.length > 0 
      ? highQualityResults 
      : scoredResults.map(item => item.track)

    // 使用完整排序算法对候选池排序（数量已大幅减少）
    const ranked = rankAlbumCovers(candidatePool, songName)
    const topCandidates = ranked.slice(0, 5)
    
    if (topCandidates.length > 1) {
      setCoverCandidates(topCandidates)
    } else if (topCandidates.length === 1) {
      handleCoverSelect(topCandidates[0])
    } else if (allResults.length > 0) {
      // 回退：使用第一个有封面的结果
      const fallback = allResults.find(t => t.artworkUrl100) || allResults[0]
      handleCoverSelect(fallback)
    } else {
      alert('未找到结果，请尝试其他歌曲。')
      setShowInput(true)
    }
  }, [])

  const handleCoverSelect = (track) => {
    setSongData({
      songName: track.trackName,
      artistName: track.artistName,
      albumCover: track.artworkUrl100?.replace('100x100', '1000x1000') || track.artworkUrl100,
      collectionName: track.collectionName
    })
    setCoverCandidates(null)
  }

  const handleCancelSelection = () => {
    setCoverCandidates(null)
    setShowInput(true)
  }

  const handleReset = () => {
    setSongData(null)
    setShowInput(true)
  }

  return (
    <div className="app">
      {/* Geometric shapes background */}
      <div className="geometric-bg">
        <div className="geo-shape geo-1"></div>
        <div className="geo-shape geo-2"></div>
        <div className="geo-shape geo-3"></div>
        <div className="geo-shape geo-4"></div>
        <div className="geo-shape geo-5"></div>
        <div className="geo-shape geo-6"></div>
        <div className="geo-grid"></div>
        <div className="geo-dots"></div>
      </div>

      {/* Content positioned on the left side */}
      <AnimatePresence mode="wait">
        {showInput && !songData && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="content-area"
          >
            <motion.div
              className="hero-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="hero-title">
                <span className="title-line">Music</span>
                <span className="title-line title-accent">Wallpaper</span>
              </h1>
              <p className="hero-subtitle">将你最喜欢的专辑封面转换为精美的壁纸</p>
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

      {/* 封面选择器 */}
      {coverCandidates && (
        <AlbumCoverSelector
          candidates={coverCandidates}
          onSelect={handleCoverSelect}
          onCancel={handleCancelSelection}
        />
      )}
    </div>
  )
}

export default App

