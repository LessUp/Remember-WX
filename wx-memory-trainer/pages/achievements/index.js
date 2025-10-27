const storage = require('../../utils/storage.js')

const ALL_BADGES = [
  { code:'first_train', emoji:'🎉', title:'初次训练', desc:'完成任一训练' },
  { code:'streak_3', emoji:'🔥', title:'连续3天', desc:'连续训练3天' },
  { code:'streak_7', emoji:'⚡', title:'连续7天', desc:'连续训练7天' },
  { code:'digit10', emoji:'🔢', title:'数字序列10', desc:'数字序列最佳长度≥10' },
  { code:'nback80', emoji:'🎯', title:'N-Back 80%', desc:'N-Back 准确率≥80%' },
  { code:'simon10', emoji:'🟩', title:'Simon 10', desc:'Simon 最佳长度≥10' },
  { code:'spatial10', emoji:'🗺️', title:'空间序列10', desc:'空间序列最佳长度≥10' }
]

Page({
  data:{
    streak:{ current:0, best:0, lastDate:'' },
    badges:[]
  },
  onShow(){
    const st = storage.getStreak()
    const owned = storage.getAchievements().map(x=>x.code)
    const badges = ALL_BADGES.map(b=>({ ...b, owned: owned.includes(b.code) }))
    this.setData({ streak: st, badges })
  },
  onShareAppMessage(){ return { title:'我的成就与连续训练', path:'/pages/achievements/index' } }
})
