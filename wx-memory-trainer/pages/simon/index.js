const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloud.js')

Page({
  data:{
    length:1,
    best:0,
    sequence:[],
    inputIdx:0,
    showCursor:0,
    flashIndex:-1,
    phase:'idle', // idle|countdown|show|paused|input|result
    resultText:'',
    showMs:700,
    gapMs:300,
    countdown:3
  },
  onLoad(){
    const s = storage.getSettings()
    this.setData({
      length:s.simon.startLen,
      showMs:s.simon.showMs,
      gapMs:s.simon.gapMs,
      best:storage.getBestSimon()
    })
    this.timers=[]
  },
  onShow(){
    const s = storage.getSettings()
    if(this.data.phase==='idle'){
      this.setData({ showMs:s.simon.showMs, gapMs:s.simon.gapMs, length:s.simon.startLen, best:storage.getBestSimon() })
    } else {
      this.setData({ best:storage.getBestSimon() })
    }
  },
  onUnload(){ this.clearTimers() },
  clearTimers(){ if(this.timers){ this.timers.forEach(t=>clearTimeout(t)); this.timers=[] } },

  start(){
    if(this.data.phase!=='idle') return
    this.setData({phase:'countdown', countdown:3, resultText:'', sequence:[], inputIdx:0, showCursor:0, flashIndex:-1})
    const tick = ()=>{
      if(this.data.countdown<=1){ this.beginShow() }
      else { this.setData({countdown:this.data.countdown-1}); const t=setTimeout(tick,1000); this.timers.push(t) }
    }
    const t=setTimeout(tick,1000); this.timers.push(t)
  },

  beginShow(){
    this.clearTimers()
    const seq=[]; for(let i=0;i<this.data.length;i++){ seq.push(Math.floor(Math.random()*4)) }
    this.setData({ sequence:seq, inputIdx:0, showCursor:0, phase:'show', flashIndex:-1 })
    this.showNext()
  },

  showNext(){
    if(this.data.phase!=='show') return
    const { showCursor, sequence, showMs, gapMs } = this.data
    if(showCursor>=sequence.length){ this.setData({ phase:'input', flashIndex:-1 }); return }
    this.setData({ flashIndex: sequence[showCursor] })
    const tShow = setTimeout(()=>{
      this.setData({ flashIndex:-1 })
      const tGap = setTimeout(()=>{
        this.setData({ showCursor: this.data.showCursor+1 })
        this.showNext()
      }, gapMs)
      this.timers.push(tGap)
    }, showMs)
    this.timers.push(tShow)
  },

  togglePause(){
    if(this.data.phase==='show'){
      this.clearTimers()
      this.setData({ phase:'paused', flashIndex:-1 })
    } else if(this.data.phase==='paused'){
      this.setData({ phase:'show' })
      this.showNext()
    }
  },

  replay(){
    if(this.data.phase==='input' || this.data.phase==='result'){
      this.clearTimers()
      this.setData({ phase:'show', showCursor:0, flashIndex:-1 })
      this.showNext()
    }
  },

  restartRound(){
    this.clearTimers()
    this.setData({ phase:'idle', resultText:'', sequence:[], inputIdx:0, showCursor:0, flashIndex:-1 })
    this.start()
  },

  tapCell(e){
    if(this.data.phase!=='input') return
    const idx = Number(e.currentTarget.dataset.idx)
    const expected = this.data.sequence[this.data.inputIdx]
    if(idx===expected){
      try{ wx.vibrateShort({type:'light'}) }catch(err){}
      const next = this.data.inputIdx+1
      if(next>=this.data.sequence.length){ this.finish(true) }
      else { this.setData({ inputIdx: next }) }
    }else{
      try{ wx.vibrateLong() }catch(err){}
      this.finish(false, { wrongIndex:this.data.inputIdx, expected, got:idx })
    }
  },

  finish(success, extra){
    let best=this.data.best
    if(success){ if(this.data.length>best){ best=this.data.length; storage.setBestSimon(best) } }
    const resultText = success? '正确' : '错误'
    storage.addSimonHistory({ ts:Date.now(), length:this.data.length, success })

    // 成就与连续训练
    storage.updateStreakOnTraining()
    storage.addAchievement('first_train')
    if(storage.getBestSimon()>=10) storage.addAchievement('simon10')

    // 复盘
    storage.setLastReview({
      game:'simon',
      payload:{ length:this.data.length, success, sequence:this.data.sequence.slice(), wrongIndex: extra&&extra.wrongIndex, expected: extra&&extra.expected, got: extra&&extra.got }
    })

    // 云占位保存（score 用长度，失败记 0）
    cloud.saveScore('simon', { length:this.data.length, success, score: success? this.data.length : 0 })
    this.setData({ phase:'result', resultText, best })
  },

  next(){
    const length = this.data.resultText==='正确' ? this.data.length+1 : Math.max(1, this.data.length-1)
    this.setData({ length, phase:'idle', sequence:[], inputIdx:0, showCursor:0, flashIndex:-1, resultText:'' })
  },

  onShareAppMessage(){
    return { title:'记忆力训练 - Simon', path:'/pages/simon/index' }
  }
})
