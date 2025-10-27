const storage = require('./storage.js')

function enabled(){
  const s = storage.getSettings()
  return !!s.global.cloudEnabled && !!s.global.cloudEnvId
}

function init(){
  if(!enabled()) return false
  try{
    if(wx && wx.cloud){
      wx.cloud.init({ env: storage.getSettings().global.cloudEnvId })
      return true
    }
  }catch(e){
    return false
  }
  return false
}

async function saveScore(game, payload){
  if(!enabled()) return { ok:false, reason:'cloud_disabled' }
  try{
    if(!wx.cloud) return { ok:false, reason:'no_wx_cloud' }
    // 占位：需要你在云开发中创建集合 scores，并设置权限
    // await wx.cloud.database().collection('scores').add({ data:{ game, payload, ts: Date.now() } })
    return { ok:true }
  }catch(err){ return { ok:false, reason:String(err&&err.message||err) } }
}

async function getLeaderboard(game){
  if(!enabled()) return { ok:false, reason:'cloud_disabled', list:[] }
  try{
    if(!wx.cloud) return { ok:false, reason:'no_wx_cloud', list:[] }
    // 占位：从云数据库拉取排行榜，需配合云端规则
    // const res = await wx.cloud.database().collection('scores').where({ game }).orderBy('payload.score','desc').limit(20).get()
    // const list = (res.data||[])
    const list = []
    return { ok:true, list }
  }catch(err){ return { ok:false, reason:String(err&&err.message||err), list:[] } }
}

module.exports = { enabled, init, saveScore, getLeaderboard }
