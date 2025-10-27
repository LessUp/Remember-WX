const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloud.js')

const GAME_KEYS = ['digitspan','nback','simon','spatial']
const GAME_LABELS = ['数字序列','N-Back','Simon','空间序列']

function localBestText(key){
  if(key==='digitspan') return `正向最佳：${storage.getBestDigitspan()}，反向最佳：${storage.getBestDigitspanRev()}`
  if(key==='nback') return `最佳准确率：${storage.getBestNBack()}%`
  if(key==='simon') return `最佳长度：${storage.getBestSimon()}`
  if(key==='spatial') return `最佳长度：${storage.getBestSpatial()}`
  return ''
}

Page({
  data:{
    gameOptions: GAME_LABELS,
    gameIndex: 0,
    gameLabel: GAME_LABELS[0],
    list: [],
    cloudEnabled: false,
    localBestText: ''
  },
  onShow(){
    const key = GAME_KEYS[this.data.gameIndex]
    const enabled = cloud.enabled()
    this.setData({ cloudEnabled: enabled, localBestText: localBestText(key) })
    this.refresh()
  },
  onGameChange(e){
    const i = Number(e.detail.value)
    this.setData({ gameIndex: i, gameLabel: GAME_LABELS[i], localBestText: localBestText(GAME_KEYS[i]) })
    this.refresh()
  },
  async refresh(){
    const key = GAME_KEYS[this.data.gameIndex]
    if(!cloud.enabled()){
      this.setData({ cloudEnabled:false, list:[] })
      return
    }
    const res = await cloud.getLeaderboard(key)
    if(res.ok){ this.setData({ list: res.list||[], cloudEnabled:true }) }
    else { this.setData({ list: [], cloudEnabled:false }) }
  },
  onShareAppMessage(){ return { title:'记忆力训练 - 排行榜', path:'/pages/leaderboard/index' } }
})
