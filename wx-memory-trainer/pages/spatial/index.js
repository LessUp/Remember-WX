const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloud.js')

function makeArr(n){ const a=[]; for(let i=0;i<n;i++) a.push(i); return a }

Page({
  data:{
    grid:4,
    gridArr:[],
    length:3,
    best:0,
    sequence:[],
    inputIdx:0,
    showCursor:0,
    flashIndex:-1,
    phase:'idle', // idle|countdown|show|paused|input|result
    resultText:'',
    showMs:800,
    gapMs:300,
    countdown:3
  },
  applySettings(){
    const s = storage.getSettings()
    const grid = s.spatial.grid
    this.setData({
      grid,
      gridArr: makeArr(grid*grid),
      length: s.spatial.startLen,
      showMs: s.spatial.showMs,
      gapMs: s.spatial.gapMs,
      best: storage.getBestSpatial()
    })
  },
  onLoad(){ this.applySettings(); this.timers=[] },
  onShow(){ if(this.data.phase==='idle'){ this.applySettings() } else { this.setData({ best:storage.getBestSpatial() }) } },
  onUnload(){ this.clearTimers() },
  clearTimers(){ if(this.timers){ this.timers.forEach(t=>clearTimeout(t)); this.timers=[] } },

  start(){
    if(this.data.phase!=='idle') return
    this.setData({phase:'countdown', countdown:3, resultText:'', sequence:[], inputIdx:0, showCursor:0, flashIndex:-1})
    const tick=()=>{
      if(this.data.countdown<=1){ this.beginShow() }
      else { this.setData({countdown:this.data.countdown-1}); const t=setTimeout(tick,1000); this.timers.push(t) }
    }
    const t=setTimeout(tick,1000); this.timers.push(t)
  },

  beginShow(){
    this.clearTimers()
    const total=this.data.grid*this.data.grid
    const seq=[]; for(let i=0;i<this.data.length;i++){ seq.push(Math.floor(Math.random()*total)) }
    this.setData({ sequence:seq, inputIdx:0, showCursor:0, phase:'show', flashIndex:-1 })
    this.showNext()
  },

  showNext(){
    if(this.data.phase!=='show') return
    const { showCursor, sequence, showMs, gapMs } = this.data
    if(showCursor>=sequence.length){ this.setData({ phase:'input', flashIndex:-1 }); return }
    this.setData({ flashIndex: sequence[showCursor] })
    const tShow=setTimeout(()=>{
      this.setData({ flashIndex:-1 })
      const tGap=setTimeout(()=>{
        this.setData({ showCursor: this.data.showCursor+1 })
        this.showNext()
      }, gapMs)
      this.timers.push(tGap)
    }, showMs)
    this.timers.push(tShow)
  },

  togglePause(){
    if(this.data.phase==='show'){
      this.clearTimers(); this.setData({ phase:'paused', flashIndex:-1 })
    }else if(this.data.phase==='paused'){
      this.setData({ phase:'show' }); this.showNext()
    }
  },

  replay(){
    if(this.data.phase==='input' || this.data.phase==='result'){
      this.clearTimers(); this.setData({ phase:'show', showCursor:0, flashIndex:-1 }); this.showNext()
    }
  },

  tapCell(e){
    if(this.data.phase!=='input') return
    const idx=Number(e.currentTarget.dataset.idx)
    const expected=this.data.sequence[this.data.inputIdx]
    if(idx===expected){
      try{ wx.vibrateShort({type:'light'}) }catch(err){}
      const next=this.data.inputIdx+1
      if(next>=this.data.sequence.length){ this.finish(true) }
      else { this.setData({ inputIdx: next }) }
    }else{
      try{ wx.vibrateLong() }catch(err){}
      this.finish(false, { wrongIndex:this.data.inputIdx, expected, got:idx })
    }
  },

  finish(success, extra){
    let best=this.data.best
    if(success){ if(this.data.length>best){ best=this.data.length; storage.setBestSpatial(best) } }
    const resultText = success? '正确' : '错误'
    storage.addSpatialHistory({ ts:Date.now(), grid:this.data.grid, length:this.data.length, success })

    // 成就与连续训练
    const st = storage.updateStreakOnTraining()
    storage.addAchievement('first_train')
    if((storage.getBestSpatial()||0) >= 10) storage.addAchievement('spatial10')
    if(st.current>=3) storage.addAchievement('streak_3')
    if(st.current>=7) storage.addAchievement('streak_7')

    // 复盘
    storage.setLastReview({
      game:'spatial',
      payload:{ grid:this.data.grid, length:this.data.length, success, sequence:this.data.sequence.slice(), wrongIndex: extra&&extra.wrongIndex, expected: extra&&extra.expected, got: extra&&extra.got }
    })

    // 云占位保存（score 用长度，失败记 0）
    cloud.saveScore('spatial', { grid:this.data.grid, length:this.data.length, success, score: success? this.data.length : 0 })
    this.setData({ phase:'result', resultText, best })
  },

  next(){
    const s=storage.getSettings()
    const base=s.spatial.startLen
    const length = this.data.resultText==='正确' ? this.data.length+1 : Math.max(base, this.data.length-1)
    this.setData({ length, phase:'idle', sequence:[], inputIdx:0, showCursor:0, flashIndex:-1, resultText:'' })
  },

  onShareAppMessage(){ return { title:'记忆力训练 - 空间序列', path:'/pages/spatial/index' } }
})
