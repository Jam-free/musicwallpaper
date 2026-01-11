import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchInput from './components/SearchInput'
import WallpaperGenerator from './components/WallpaperGenerator'
import AlbumCoverSelector from './components/AlbumCoverSelector'
import { getBestAlbumCover, rankAlbumCovers, getRecommendedArtist, getSongTranslations } from './utils/albumRanker'
import './App.css'

function App() {
  const [songData, setSongData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [coverCandidates, setCoverCandidates] = useState(null)

  const handleSearch = async (songName) => {
    if (!songName.trim()) return

    setIsLoading(true)
    setShowInput(false)
    setCoverCandidates(null)

    try {
      // 优化搜索策略：尝试多种搜索方式和地区，提高命中率
      const searchTerms = new Set()
      const normalizedSongName = songName.trim().toLowerCase()
      
      // 1. 原始搜索词
      searchTerms.add(songName.trim())
      
      // 2. 如果搜索的是中文，也添加英文翻译进行搜索
      const isChineseSearch = /[\u4e00-\u9fa5]/.test(songName)
      if (isChineseSearch) {
        const translations = getSongTranslations(songName)
        translations.forEach(translation => {
          searchTerms.add(translation)
          // 也尝试搜索 "艺术家 + 英文翻译"
          const matchedArtist = getRecommendedArtist(songName)
          if (matchedArtist) {
            searchTerms.add(`${matchedArtist} ${translation}`)
            searchTerms.add(`${translation} ${matchedArtist}`)
          }
        })
      }
      
      // 3. 检查是否有硬编码的艺术家匹配规则
      const matchedArtist = getRecommendedArtist(songName)
      
      if (matchedArtist) {
        // 如果找到匹配规则，直接搜索 "艺术家名 + 歌曲名"
        searchTerms.add(`${matchedArtist} ${songName.trim()}`)
        searchTerms.add(`${songName.trim()} ${matchedArtist}`)
      }
      
      // 4. 只搜索第一个词（对于"Peaches"这种单字歌曲）
      const firstWord = songName.trim().split(/\s+/)[0]
      if (firstWord && firstWord !== songName.trim()) {
        searchTerms.add(firstWord)
      }
      
      // 4. 增加地区支持，特别是香港区 (hk) 对华语歌曲支持极好
      const countries = ['us', 'hk', 'tw'] // 增加台湾区
      const searchAttributes = ['songTerm', 'allArtistTerm', 'allTrackTerm', ''] // 包含默认搜索
      
      const searchPromises = []
      searchTerms.forEach(term => {
        countries.forEach(country => {
          searchAttributes.forEach(attr => {
            const attrParam = attr ? `&attribute=${attr}` : ''
            // 增加 limit 到 200，确保能搜到更多结果
            searchPromises.push(
              fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=200&country=${country}${attrParam}`)
                .then(res => res.json())
                .catch(() => ({ results: [] }))
            )
          })
        })
      })
      
      const results = await Promise.all(searchPromises)
      let allResults = results.flatMap(data => data.results || [])

      // 预过滤：如果结果太多，优先保留主流艺术家的结果
      // 使用更激进的过滤：只要评分超过80就认为是主流
      const mainstreamResults = allResults.filter(track => {
        const ranked = rankAlbumCovers([track], songName)
        return ranked.length > 0 && ranked[0].score > 80
      })
      
      if (mainstreamResults.length > 0) {
        // 如果找到了主流艺术家，优先展示这些，并去重
        const mainstreamMap = new Map()
        mainstreamResults.forEach(track => {
          if (!mainstreamMap.has(track.trackId)) {
            mainstreamMap.set(track.trackId, track)
          }
        })
        const otherResults = allResults.filter(track => !mainstreamMap.has(track.trackId))
        allResults = [...Array.from(mainstreamMap.values()), ...otherResults]
      }
      
      // 去重（基于 trackId）
      const uniqueResults = Array.from(
        new Map(allResults.map(track => [track.trackId, track])).values()
      )

      if (uniqueResults.length > 0) {
        // 使用智能排序算法
        const ranked = rankAlbumCovers(uniqueResults, songName)
        
        // 开发模式：打印搜索结果和排序信息
        if (process.env.NODE_ENV === 'development') {
          console.log(`\n🔍 搜索 "${songName}" 的结果：`)
          console.log(`   总结果数: ${uniqueResults.length}`)
          console.log(`   排序后 Top 10:`)
          ranked.slice(0, 10).forEach((track, index) => {
            const matchInfo = track.trackName === songName ? '✅ 完全匹配' : 
                            track.trackName.includes(songName) ? '⚠️ 部分匹配' : '❌ 不匹配'
            console.log(`   ${index + 1}. ${track.trackName} - ${track.artistName} (${matchInfo}, 评分: ${track.score})`)
          })
        }
        
        // 显示前5个候选封面让用户选择
        const topCandidates = ranked.slice(0, 5).filter(t => t.artworkUrl100)
        
        if (topCandidates.length > 1) {
          // 多个候选，显示选择器
          setCoverCandidates(topCandidates)
        } else if (topCandidates.length === 1) {
          // 只有一个结果，直接使用
          const track = topCandidates[0]
          setSongData({
            songName: track.trackName,
            artistName: track.artistName,
            albumCover: track.artworkUrl100?.replace('100x100', '1000x1000') || track.artworkUrl100,
            collectionName: track.collectionName
          })
        } else {
          // 没有有效结果
          const fallbackTrack = uniqueResults.find(t => t.artworkUrl100) || uniqueResults[0]
          if (fallbackTrack) {
            setSongData({
              songName: fallbackTrack.trackName,
              artistName: fallbackTrack.artistName,
              albumCover: fallbackTrack.artworkUrl100?.replace('100x100', '1000x1000') || fallbackTrack.artworkUrl100,
              collectionName: fallbackTrack.collectionName
            })
          } else {
            alert('未找到结果，请尝试其他歌曲。')
            setShowInput(true)
          }
        }
      } else {
        alert('未找到结果，请尝试其他歌曲。')
        setShowInput(true)
      }
    } catch (error) {
      console.error('Error fetching song:', error)
      alert('获取歌曲失败，请重试。')
      setShowInput(true)
    } finally {
      setIsLoading(false)
    }
  }

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

