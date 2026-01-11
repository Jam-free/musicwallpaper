/**
 * 测试脚本：分析 "Snooze" 的搜索结果
 * 运行：node test-snooze.js
 */

const fetch = require('node-fetch')

async function testSnooze() {
  const searchTerm = 'Snooze'
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=50&attribute=songTerm`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    console.log(`\n🔍 搜索 "${searchTerm}" 返回了 ${data.resultCount} 个结果\n`)
    
    // 找出所有包含 "Snooze" 的结果
    const snoozeResults = data.results.filter(track => 
      track.trackName?.toLowerCase().includes('snooze')
    )
    
    console.log(`📊 找到 ${snoozeResults.length} 个 "Snooze" 相关结果：\n`)
    
    snoozeResults.forEach((track, index) => {
      const isSZA = track.artistName?.toLowerCase().includes('sza')
      const isSOS = track.collectionName?.toLowerCase().includes('sos')
      
      console.log(`${index + 1}. ${track.trackName}`)
      console.log(`   艺术家: ${track.artistName} ${isSZA ? '⭐ SZA' : ''}`)
      console.log(`   专辑: ${track.collectionName} ${isSOS ? '⭐ SOS' : ''}`)
      console.log(`   类型: ${track.collectionType || track.wrapperType}`)
      console.log(`   发行: ${track.releaseDate}`)
      console.log(`   封面: ${track.artworkUrl100 ? '✅' : '❌'}`)
      console.log(`   ---`)
    })
    
    // 找出SZA的版本
    const szaVersion = snoozeResults.find(track => 
      track.artistName?.toLowerCase().includes('sza')
    )
    
    if (szaVersion) {
      console.log(`\n✅ 找到 SZA 版本:`)
      console.log(`   歌曲: ${szaVersion.trackName}`)
      console.log(`   专辑: ${szaVersion.collectionName}`)
      console.log(`   发行: ${szaVersion.releaseDate}`)
    } else {
      console.log(`\n❌ 未找到 SZA 版本`)
    }
    
  } catch (error) {
    console.error('错误:', error)
  }
}

testSnooze()

