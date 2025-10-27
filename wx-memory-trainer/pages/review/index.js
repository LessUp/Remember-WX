const storage = require('../../utils/storage.js')

Page({
  data:{
    hasReview:false,
    review:null,
    mistakes:[]
  },
  onShow(){
    const r = storage.getLastReview()
    if(!r){ this.setData({ hasReview:false, review:null, mistakes:[] }); return }
    let mistakes=[]
    if(r.game==='nback' && r.payload && Array.isArray(r.payload.mistakes)){
      mistakes = r.payload.mistakes.map(m=>({ t:m.t, type:m.type, target:!!m.target, answered: m.answered }))
    }
    const gameLabelMap={ digitspan:'数字序列', nback:'N-Back', simon:'Simon', spatial:'空间序列' }
    this.setData({ hasReview:true, review:{...r, gameLabel: gameLabelMap[r.game]||r.game}, mistakes })
  },
  onShareAppMessage(){ return { title:'我的训练复盘', path:'/pages/review/index' } }
})
