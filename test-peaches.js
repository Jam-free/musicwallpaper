/**
 * 测试脚本：分析 "Peaches" 的搜索结果
 * 运行：node test-peaches.js
 */

// 使用 fetch（Node.js 18+ 内置，或需要 node-fetch）
const fetch = (typeof require !== 'undefined' && require('node-fetch')) || global.fetch

async function testPeaches() {
  const searchTerm = 'Peaches'
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=50&attribute=songTerm`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    console.log(`\n🔍 搜索 "Peaches" 返回了 ${data.resultCount} 个结果\n`)
    
    // 找出所有包含 "Peaches" 的结果
    const peachesResults = data.results.filter(track => 
      track.trackName?.toLowerCase().includes('peaches')
    )
    
    console.log(`📊 找到 ${peachesResults.length} 个 "Peaches" 相关结果：\n`)
    
    // 找出Justin Bieber的版本
    const justinBieberResults = peachesResults.filter(track => 
      track.artistName?.toLowerCase().includes('justin bieber') ||
      track.artistName?.toLowerCase().includes('bieber')
    )
    
    console.log(`🎤 Justin Bieber 版本: ${justinBieberResults.length} 个\n`)
    
    justinBieberResults.forEach((track, index) => {
      console.log(`${index + 1}. ${track.trackName}`)
      console.log(`   艺术家: ${track.artistName}`)
      console.log(`   专辑: ${track.collectionName}`)
      console.log(`   类型: ${track.collectionType || track.wrapperType}`)
      console.log(`   发行: ${track.releaseDate}`)
      console.log(`   封面URL: ${track.artworkUrl100?.replace('100x100', '1000x1000') || track.artworkUrl100}`)
      console.log(`   ---`)
    })
    
    // 显示前10个结果（按iTunes默认排序）
    console.log(`\n📋 iTunes API 返回的前10个结果（默认排序）:\n`)
    peachesResults.slice(0, 10).forEach((track, index) => {
      const isJustin = track.artistName?.toLowerCase().includes('justin bieber') || 
                       track.artistName?.toLowerCase().includes('bieber')
      console.log(`${index + 1}. ${track.trackName} - ${track.artistName} ${isJustin ? '⭐ JUSTIN' : ''}`)
      console.log(`   专辑: ${track.collectionName}`)
      console.log(`   封面: ${track.artworkUrl100?.replace('100x100', '1000x1000') || track.artworkUrl100}`)
    })
    
  } catch (error) {
    console.error('错误:', error)
  }
}

testPeaches()

