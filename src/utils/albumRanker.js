/**
 * 智能专辑封面排序算法
 * 通过多维度评分系统，自动选择最合适的专辑封面
 */

// 主流艺术家关键词库（可扩展）
const MAINSTREAM_ARTISTS = [
  // 国际主流
  'taylor swift', 'the weeknd', 'ariana grande', 'drake',
  'ed sheeran', 'beyoncé', 'beyonce', 'justin bieber', 'billie eilish',
  'post malone', 'dua lipa', 'the beatles', 'coldplay',
  'adele', 'bruno mars', 'rihanna', 'kanye west', 'eminem',
  'lady gaga', 'katy perry', 'selena gomez', 'shawn mendes',
  'harry styles', 'olivia rodrigo', 'doja cat', 'sza',
  'travis scott', 'kendrick lamar', 'j. cole',
  'frank ocean', 'lana del rey', 'arctic monkeys', 'radiohead',
  'nirvana', 'pink floyd', 'led zeppelin', 'queen',
  'michael jackson', 'prince', 'david bowie', 'madonna',
  'jay-z', 'nas', 'tupac', 'notorious b.i.g.',
  // 华语主流
  '周杰伦', 'jay chou', '蔡徐坤', 'cai xukun', 'kun',
  '邓紫棋', 'g.e.m.', 'gem', '林俊杰', 'jj lin',
  '王力宏', 'leehom', '陈奕迅', 'eason chan',
  '张学友', 'jacky cheung', '刘德华', 'andy lau',
  '五月天', 'mayday', '薛之谦', 'joker xue',
  '方大同', 'khalil fong', 'fong',
  // 国际主流（补充）
  'imagine dragons', 'dan reynolds'
]

// 知名专辑库（用于识别热门专辑，如SOS）
const POPULAR_ALBUMS = [
  'sos', 'ctrl', 'ctrl deluxe', 'good kid', 'to pimp a butterfly',
  'folklore', 'evermore', 'midnights', '1989', 'reputation',
  'after hours', 'dawn fm', 'positions', 'thank u next',
  'future nostalgia', 'fine line', 'harry\'s house', 'sour',
  'planet her', 'hot pink', 'the album', 'born this way',
  '21', '25', '30', 'divide', 'equals', 'x',
  'justice', 'changes', 'purpose', 'believe', // Justin Bieber专辑
  'evolve', 'night visions', 'origins', 'smoke + mirrors', // Imagine Dragons专辑
  '范特西', '叶惠美', '七里香', '依然范特西', 'jay', '八度空间' // 周杰伦专辑
]

// 特定歌曲的硬编码匹配规则（歌曲名 -> 艺术家名）
const SONG_ARTIST_MAP = {
  'thunder': 'imagine dragons',
  'thunder imagine dragons': 'imagine dragons',
  '可爱女人': '周杰伦',
  '可爱女人 周杰伦': '周杰伦',
  '断了的弦': '周杰伦',
  '以父之名': '周杰伦',
  '回到过去': '周杰伦',
  '简单爱': '周杰伦',
  'peaches': 'justin bieber',
  'peaches justin bieber': 'justin bieber',
  'snooze': 'sza',
  'dead man': '蔡徐坤',
  '才二十三': '方大同',
  'dangerous': 'michael jackson'
}

// 中英文歌名映射表（用于匹配 iTunes API 返回的英文标题）
// 格式：中文歌名 -> [英文歌名1, 英文歌名2, ...]
const SONG_NAME_TRANSLATION_MAP = {
  // 周杰伦歌曲 - 第一张专辑《Jay》
  '可爱女人': ['lovely woman', 'ke ai nu ren', 'cute woman'],
  '完美主义': ['perfectionism', 'wan mei zhu yi'],
  '星晴': ['star mood', 'xing qing', 'star clear'],
  '娘子': ['wife', 'niang zi'],
  '斗牛': ['bullfight', 'dou niu'],
  '黑色幽默': ['black humor', 'hei se you mo'],
  '伊斯坦堡': ['istanbul', 'yi si tan bao'],
  '印地安老斑鸠': ['indian old spotted dove', 'yin di an lao ban jiu'],
  '龙卷风': ['tornado', 'long juan feng'],
  '反方向的钟': ['clock that goes backwards', 'fan fang xiang de zhong'],
  
  // 周杰伦歌曲 - 其他经典
  '断了的弦': ['broken string', 'duan le de xian'],
  '以父之名': ['in the name of the father', 'yi fu zhi ming', 'father'],
  '回到过去': ['back to the past', 'hui dao guo qu'],
  '简单爱': ['simple love', 'jian dan ai'],
  '双截棍': ['nunchucks', 'shuang jie gun', 'nunchaku'],
  '安静': ['quiet', 'an jing'],
  '开不了口': ['can\'t open my mouth', 'kai bu liao kou'],
  '爱在西元前': ['love before bc', 'ai zai xi yuan qian'],
  '爸我回来了': ['dad i\'m back', 'ba wo hui lai le'],
  '上海一九四三': ['shanghai 1943', 'shang hai yi jiu si san'],
  '对不起': ['sorry', 'dui bu qi'],
  '威廉古堡': ['william castle', 'wei lian gu bao'],
  '双刀': ['twin blades', 'shuang dao'],
  '三年二班': ['class 3-2', 'san nian er ban'],
  '东风破': ['east wind breaks', 'dong feng po'],
  '你听得到': ['you can hear', 'ni ting de dao'],
  '同一种调调': ['same tune', 'tong yi zhong diao diao'],
  '她的睫毛': ['her eyelashes', 'ta de jie mao'],
  '爱情悬崖': ['love cliff', 'ai qing xuan ya'],
  '梯田': ['terraced fields', 'ti tian'],
  '双截棍': ['nunchucks', 'shuang jie gun'],
  
  // 方大同歌曲
  '才二十三': ['only twenty three', 'cai er shi san']
}

/**
 * 获取特定歌曲的推荐艺术家（用于增强搜索）
 * @param {string} songName - 歌曲名
 * @returns {string|null} 推荐的艺术家名，如果没有则返回 null
 */
export const getRecommendedArtist = (songName) => {
  const normalized = songName.trim().toLowerCase()
  return SONG_ARTIST_MAP[normalized] || SONG_ARTIST_MAP[songName.trim()] || null
}

/**
 * 获取歌曲的英文翻译名（用于匹配 iTunes API 返回的英文标题）
 * @param {string} songName - 中文歌曲名
 * @returns {Array<string>} 英文翻译名数组，如果没有则返回空数组
 */
export const getSongTranslations = (songName) => {
  const normalized = songName.trim().toLowerCase()
  return SONG_NAME_TRANSLATION_MAP[normalized] || 
         SONG_NAME_TRANSLATION_MAP[songName.trim()] || 
         []
}

/**
 * 判断是否为主流艺术家（增强匹配）
 * @param {string} artistName - 艺术家名称
 * @returns {boolean}
 */
const isMainstreamArtist = (artistName) => {
  if (!artistName) return false
  const nameLower = artistName.toLowerCase().trim()
  
  // 特殊处理：Justin Bieber 可能有多种写法
  if (nameLower.includes('justin') && nameLower.includes('bieber')) {
    return true
  }
  if (nameLower === 'justin bieber' || nameLower === 'bieber') {
    return true
  }
  
  return MAINSTREAM_ARTISTS.some(artist => {
    const artistLower = artist.toLowerCase()
    // 精确匹配或包含匹配
    return nameLower === artistLower || 
           nameLower.includes(artistLower) || 
           artistLower.includes(nameLower)
  })
}

/**
 * 计算封面质量分数
 * @param {Object} track - iTunes API 返回的 track 对象
 * @returns {number} 0-30 分
 */
const getArtworkQualityScore = (track) => {
  const artworkUrl = track.artworkUrl100
  if (!artworkUrl) return 0
  
  // 检查是否可以替换为高清（100x100 -> 1000x1000）
  if (artworkUrl.includes('100x100')) {
    return 30 // 可以替换为高清
  } else if (artworkUrl.includes('60x60')) {
    return 15 // 中等质量
  } else {
    return 5 // 低质量
  }
}

/**
 * 判断是否为知名专辑
 * @param {string} albumName - 专辑名称
 * @returns {boolean}
 */
const isPopularAlbum = (albumName) => {
  if (!albumName) return false
  const albumLower = albumName.toLowerCase().trim()
  return POPULAR_ALBUMS.some(album => 
    albumLower.includes(album.toLowerCase()) || 
    album.toLowerCase().includes(albumLower)
  )
}

/**
 * 检查歌曲名是否精确匹配搜索词（优化版 - 支持中英文交叉匹配）
 * @param {string} trackName - 歌曲名（可能是英文，来自 iTunes API）
 * @param {string} searchTerm - 搜索词（可能是中文，用户输入）
 * @returns {boolean}
 */
const isExactTrackMatch = (trackName, searchTerm) => {
  if (!trackName || !searchTerm) return false
  
  // 去除标点符号和空格，只保留中文字符和英文字母数字
  const normalize = (str) => {
    return str.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()
  }
  
  const trackNormalized = normalize(trackName)
  const searchNormalized = normalize(searchTerm)
  
  // 1. 完全匹配（最高优先级）
  if (trackNormalized === searchNormalized) {
    return true
  }
  
  // 2. 中英文交叉匹配：如果用户搜索中文，也要匹配英文标题
  const isChineseSearch = /[\u4e00-\u9fa5]/.test(searchTerm)
  const isEnglishTrack = !/[\u4e00-\u9fa5]/.test(trackName)
  
  if (isChineseSearch && isEnglishTrack) {
    // 用户搜索中文，但 iTunes 返回的是英文标题
    // 检查是否有翻译映射
    const translations = getSongTranslations(searchTerm)
    if (translations.length > 0) {
      // 检查英文标题是否匹配任何翻译
      for (const translation of translations) {
        const translationNormalized = normalize(translation)
        if (trackNormalized === translationNormalized || 
            trackNormalized.includes(translationNormalized) ||
            translationNormalized.includes(trackNormalized)) {
          return true // 找到匹配的翻译
        }
      }
    }
  }
  
  // 3. 对于中文，使用更严格的匹配：必须是连续子串匹配
  if (isChineseSearch) {
    // 中文匹配：搜索词必须作为连续子串出现在歌曲名中
    if (trackNormalized.includes(searchNormalized)) {
      // 进一步检查：如果搜索词长度 >= 3，要求匹配度不能太低
      if (searchNormalized.length >= 3) {
        const lengthDiff = trackNormalized.length - searchNormalized.length
        if (lengthDiff > searchNormalized.length * 0.5) {
          // 检查是否是版本信息
          const versionKeywords = ['remix', 'live', 'version', 'edit', 'mix', '版', 'remaster']
          const hasVersionInfo = versionKeywords.some(keyword => 
            trackNormalized.includes(keyword) || trackName.toLowerCase().includes(keyword)
          )
          if (!hasVersionInfo) {
            return false
          }
        }
      }
      return true
    }
    return false
  } else {
    // 英文匹配：使用包含匹配
    return trackNormalized.includes(searchNormalized) || 
           searchNormalized.includes(trackNormalized)
  }
}

/**
 * 计算艺术家匹配度分数（增强版 - 原唱优先）
 * @param {Object} track - iTunes API 返回的 track 对象
 * @param {string} searchTerm - 用户搜索的关键词
 * @returns {number} 0-50 分（大幅提高权重，原唱优先）
 */
const getArtistMatchScore = (track, searchTerm) => {
  let score = 0
  const artistName = track.artistName?.toLowerCase() || ''
  const trackName = track.trackName?.toLowerCase() || ''
  const collectionName = track.collectionName?.toLowerCase() || ''
  const searchLower = searchTerm.toLowerCase().trim()
  
  // 1. 主流艺术家识别（基础分，20分）
  const isMainstream = isMainstreamArtist(track.artistName)
  if (isMainstream) {
    score += 20
  }
  
  // 2. 原唱识别：主流艺术家 + 歌曲名精确匹配 = 原唱（额外+20分，关键！）
  const isExactMatch = isExactTrackMatch(trackName, searchTerm)
  if (isMainstream && isExactMatch) {
    score += 20 // 大幅提高原唱权重
  }
  
  // 3. 如果搜索词包含艺术家名，加分（5分）
  if (artistName && searchLower.includes(artistName)) {
    score += 5
  }
  
  // 4. 知名专辑识别（额外+5分）- 如SOS这种热门专辑
  if (isPopularAlbum(track.collectionName)) {
    score += 5
  }
  
  return Math.min(score, 50) // 最高50分（大幅提高权重）
}

/**
 * 计算专辑类型优先级分数
 * @param {Object} track - iTunes API 返回的 track 对象
 * @returns {number} 0-20 分
 */
const getCollectionTypeScore = (track) => {
  const collectionType = track.collectionType?.toLowerCase() || ''
  const wrapperType = track.wrapperType?.toLowerCase() || ''
  
  // 优先选择录音室专辑
  if (collectionType === 'album' || wrapperType === 'collection') {
    return 20
  } else if (collectionType === 'single' || wrapperType === 'track') {
    return 10
  } else if (collectionType === 'compilation') {
    return 5
  } else {
    return 3
  }
}

/**
 * 计算发行时间智能平衡分数（优化版 - 原唱保护）
 * @param {Object} track - iTunes API 返回的 track 对象
 * @param {boolean} isOriginal - 是否是原唱（主流艺术家+精确匹配）
 * @returns {number} 0-15 分
 */
const getReleaseDateScore = (track, isOriginal = false) => {
  if (!track.releaseDate) return 0
  
  try {
    const releaseDate = new Date(track.releaseDate)
    const now = new Date()
    const yearsAgo = (now - releaseDate) / (1000 * 60 * 60 * 24 * 365)
    
    // 如果是原唱，给予保底高分，不因时间扣分
    if (isOriginal) {
      return 15 // 原唱直接满分，不因时间扣分
    }
    
    // 经典歌曲（>10年）：优先选择最早的版本（原版）
    if (yearsAgo > 10) {
      // 越早越好，但不要超过15分
      return 15 - Math.min(yearsAgo / 20, 5) // 最早的原版得分最高
    } else {
      // 新歌（<10年）：优先选择最新版本
      return 15 - Math.min(yearsAgo / 2, 10) // 越新越好
    }
  } catch (error) {
    return 0
  }
}

/**
 * 计算收藏数与评分分数
 * @param {Object} track - iTunes API 返回的 track 对象
 * @returns {number} 0-10 分
 */
const getPopularityScore = (track) => {
  let score = 0
  
  // 如果有价格信息，可能表示是主流专辑
  if (track.collectionPrice && track.collectionPrice > 0) {
    score += 5
  }
  if (track.trackPrice && track.trackPrice > 0) {
    score += 3
  }
  
  // 如果有收藏数或评分（iTunes API 通常不提供，但保留接口）
  if (track.collectionExplicitness === 'notExplicit') {
    score += 2 // 非明确内容通常更主流
  }
  
  return Math.min(score, 10)
}

/**
 * 智能排序专辑封面
 * @param {Array} results - iTunes API 返回的结果数组
 * @param {string} searchTerm - 用户搜索的关键词
 * @returns {Array} 排序后的结果数组（包含 score 字段）
 */
export const rankAlbumCovers = (results, searchTerm) => {
  if (!results || results.length === 0) return []
  
  // 过滤掉没有封面的结果
  const validResults = results.filter(track => track.artworkUrl100)
  
  if (validResults.length === 0) return []
  
  // 检查是否有推荐的艺术家（硬编码匹配）
  const recommendedArtist = getRecommendedArtist(searchTerm)
  
  // 为每个结果计算总分
  const scoredResults = validResults.map(track => {
    const isMainstream = isMainstreamArtist(track.artistName)
    const isExactMatch = isExactTrackMatch(track.trackName, searchTerm)
    const isOriginal = isMainstream && isExactMatch // 原唱识别
    
    // 歌名完全匹配奖励（最高优先级，特别是中文）
    let exactNameBonus = 0
    const normalizeForExact = (str) => str.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase()
    const trackNormalized = normalizeForExact(track.trackName || '')
    const searchNormalized = normalizeForExact(searchTerm)
    
    // 1. 完全匹配（中文或英文）
    if (trackNormalized === searchNormalized) {
      exactNameBonus = 150 // 歌名完全匹配，给予巨大奖励！
    } else {
      // 2. 中英文交叉匹配：如果用户搜索中文，但 iTunes 返回英文标题
      const isChineseSearch = /[\u4e00-\u9fa5]/.test(searchTerm)
      const isEnglishTrack = !/[\u4e00-\u9fa5]/.test(track.trackName || '')
      
      if (isChineseSearch && isEnglishTrack) {
        const translations = getSongTranslations(searchTerm)
        for (const translation of translations) {
          const translationNormalized = normalizeForExact(translation)
          if (trackNormalized === translationNormalized || 
              trackNormalized.includes(translationNormalized)) {
            exactNameBonus = 120 // 中英文交叉匹配，给予高分奖励！
            break
          }
        }
      }
    }
    
    // 如果搜索词有推荐的艺术家，且当前结果匹配该艺术家，给予巨大奖励
    let recommendedArtistBonus = 0
    if (recommendedArtist) {
      const trackArtistLower = track.artistName?.toLowerCase() || ''
      const recommendedLower = recommendedArtist.toLowerCase()
      if (trackArtistLower.includes(recommendedLower) || recommendedLower.includes(trackArtistLower)) {
        recommendedArtistBonus = 100 // 巨大奖励！确保推荐艺术家排第一
      }
    }
    
    const artistScore = getArtistMatchScore(track, searchTerm)
    
    // 原唱识别：主流艺术家 + 精确匹配 = 原唱，给予大幅额外奖励
    let originalBonus = 0
    if (isOriginal) {
      originalBonus = 50 // 原唱额外奖励50分！（大幅提高）
    }
    
    // 原唱保护：原唱在专辑类型和发行时间上也要有优势
    let collectionTypeScore = getCollectionTypeScore(track)
    if (isOriginal && collectionTypeScore < 20) {
      collectionTypeScore = 20 // 原唱即使不是Album也给予Album级别的分数
    }
    
    const score = 
      exactNameBonus +                       // 150分（歌名完全匹配，最高优先级）
      getArtworkQualityScore(track) +        // 30分
      artistScore +                          // 50分
      collectionTypeScore +                  // 20分（原唱保护）
      getReleaseDateScore(track, isOriginal) + // 15分（原唱保护）
      getPopularityScore(track) +           // 10分
      originalBonus +                        // 50分（原唱奖励）
      recommendedArtistBonus                 // 100分（推荐艺术家奖励）
    
    return {
      ...track,
      score,
      // 添加调试信息（开发时可见）
      _debug: {
        artworkQuality: getArtworkQualityScore(track),
        artistMatch: artistScore,
        collectionType: getCollectionTypeScore(track),
        releaseDate: getReleaseDateScore(track),
        popularity: getPopularityScore(track),
        originalBonus: originalBonus,
        isMainstream: isMainstream,
        isExactMatch: isExactMatch
      }
    }
  })
  
  // 按分数降序排列
  const sorted = scoredResults.sort((a, b) => {
    // 如果分数相同，优先选择：
    // 1. 主流艺术家的版本
    // 2. 知名专辑
    // 3. 较新的版本
    if (b.score === a.score) {
      const aIsMainstream = isMainstreamArtist(a.artistName)
      const bIsMainstream = isMainstreamArtist(b.artistName)
      if (aIsMainstream && !bIsMainstream) return -1
      if (!aIsMainstream && bIsMainstream) return 1
      
      const aIsPopular = isPopularAlbum(a.collectionName)
      const bIsPopular = isPopularAlbum(b.collectionName)
      if (aIsPopular && !bIsPopular) return -1
      if (!aIsPopular && bIsPopular) return 1
      
      if (a.releaseDate && b.releaseDate) {
        return new Date(b.releaseDate) - new Date(a.releaseDate)
      }
    }
    return b.score - a.score
  })
  
  return sorted
}

/**
 * 获取最佳封面（得分最高的）
 * @param {Array} results - iTunes API 返回的结果数组
 * @param {string} searchTerm - 用户搜索的关键词
 * @returns {Object|null} 最佳封面的 track 对象
 */
export const getBestAlbumCover = (results, searchTerm) => {
  const ranked = rankAlbumCovers(results, searchTerm)
  return ranked.length > 0 ? ranked[0] : null
}

