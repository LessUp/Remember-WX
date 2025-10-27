const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloud.js')

Page({
  data:{
    modeOptions:['正向','反向'],
    modeIndex:0,
    modeLabel:'正向',

    length:3,
    best:0,
    phase:'idle', // idle|countdown|show|paused|input|result
    sequence:[],
    idx:0,
    displayDigit:'',
    inputValue:'',
    resultText:'',

    showMs:800,
    gapMs:300,
    countdown:3
  },
  onLoad(){
    const s = storage.getSettings()
    const startLen = s.digitspan.startLen
    const showMs = s.digitspan.showMs
    const gapMs = s.digitspan.gapMs
    this.setData({
      length:startLen,
      showMs, gapMs,
      best: storage.getBestDigitspan(),
      modeIndex:0,
      modeLabel:'正向'
    })
    this.timers=[]
  },
  onShow(){
    const s = storage.getSettings()
    const bestNow = this.data.modeIndex===0 ? storage.getBestDigitspan() : storage.getBestDigitspanRev()
    if(this.data.phase==='idle'){
      this.setData({ showMs:s.digitspan.showMs, gapMs:s.digitspan.gapMs, length:s.digitspan.startLen, best:bestNow })
    }else{
      this.setData({ best:bestNow })
    }
  },
  onUnload(){ this.clearTimers() },
  clearTimers(){ if(this.timers){ this.timers.forEach(t=>clearTimeout(t)); this.timers=[] } },

  onModeChange(e){
    const idx = Number(e.detail.value)
    const label = this.data.modeOptions[idx]
    const best = idx===0 ? storage.getBestDigitspan() : storage.getBestDigitspanRev()
    this.setData({modeIndex:idx, modeLabel:label, best})
  },

  start(){
    if(this.data.phase!=='idle') return
    // 3秒倒计时
    this.setData({phase:'countdown', countdown:3, displayDigit:'', inputValue:'', idx:0})
    const tick = ()=>{
      if(this.data.countdown<=1){
        this.beginShow()
      }else{
        this.setData({countdown:this.data.countdown-1})
        const t=setTimeout(tick,1000); this.timers.push(t)
      }
    }
    const t=setTimeout(tick,1000); this.timers.push(t)
  },

  beginShow(){
    this.clearTimers()
    // 若已有序列（来自重看/重开），可直接使用；否则生成新序列
    let seq = this.data.sequence
    if(!seq || !seq.length){
      seq=[]
      for(let i=0;i<this.data.length;i++){ seq.push(Math.floor(Math.random()*10)) }
    }
    this.setData({sequence:seq, idx:0, displayDigit:'', phase:'show'})
    this.showNext()
  },

  showNext(){
    if(this.data.phase!=='show') return
    const {idx, sequence, showMs, gapMs} = this.data
    if(idx>=sequence.length){ this.setData({phase:'input', displayDigit:''}); return }
    this.setData({displayDigit:''})
    const tGap = setTimeout(()=>{
      this.setData({displayDigit:String(this.data.sequence[this.data.idx])})
      const tShow = setTimeout(()=>{
        this.setData({idx:this.data.idx+1, displayDigit:''})
        this.showNext()
      }, showMs)
      this.timers.push(tShow)
    }, gapMs)
    this.timers.push(tGap)
  },

  togglePause(){
    if(this.data.phase==='show'){
      this.clearTimers();
      this.setData({ phase:'paused', displayDigit:'' })
    } else if(this.data.phase==='paused'){
      this.setData({ phase:'show' })
      this.showNext()
    }
  },

  replay(){
    if(this.data.phase==='input' || this.data.phase==='result'){
      this.clearTimers()
      this.setData({ phase:'show', idx:0, displayDigit:'' })
      this.showNext()
    }
  },

  restartRound(){
    this.clearTimers()
    this.setData({ sequence:[], idx:0, displayDigit:'', inputValue:'', resultText:'', phase:'idle' })
    this.start()
  },

  onInput(e){ this.setData({inputValue:e.detail.value}) },

  submit(){
    if(this.data.phase!=='input') return
    const ans = (this.data.inputValue||'').trim()
    const target = this.data.modeIndex===0 ? this.data.sequence.join('') : this.data.sequence.slice().reverse().join('')

    let length=this.data.length
    let best=this.data.best
    let resultText=''

    const correct = ans===target
    if(correct){
      resultText='正确'
      try{ wx.vibrateShort({type:'light'}) }catch(e){}
      if(length>best){
        best=length
        if(this.data.modeIndex===0) storage.setBestDigitspan(best)
        else storage.setBestDigitspanRev(best)
      }
      length+=1
    }else{
      resultText='错误，正确为 '+target
      try{ wx.vibrateLong() }catch(e){}
      // 不低于设定起始长度
      const s = storage.getSettings()
      length=Math.max(s.digitspan.startLen, length-1)
    }

    // 记录历史
    storage.addDigitspanHistory({ ts: Date.now(), mode: this.data.modeLabel, length: this.data.length, success: correct })
    // 成就与连续训练
    storage.updateStreakOnTraining();
    storage.addAchievement('first_train');
    const curBest = this.data.modeIndex===0 ? storage.getBestDigitspan() : storage.getBestDigitspanRev()
    if(curBest>=10) storage.addAchievement('digit10')

    // 复盘数据
    const expectedArr = (this.data.modeIndex===0 ? this.data.sequence.map(String) : this.data.sequence.slice().reverse().map(String))
    const gotArr = (ans||'').split('')
    const mistakes=[]
    for(let i=0;i<expectedArr.length;i++){
      const e = expectedArr[i]
      const g = gotArr[i]||''
      if(e!==g){ mistakes.push({ index:i, expected:e, got:g }) }
    }
    storage.setLastReview({
      game:'digitspan',
      payload:{ mode:this.data.modeLabel, length:this.data.length, correct, target, answer:ans, mistakes }
    })

    // 云占位保存
    cloud.saveScore('digitspan', { mode:this.data.modeLabel, length:this.data.length, success:correct })

    this.setData({resultText,best,length,phase:'result'})
  },

  next(){
    this.clearTimers()
    this.setData({inputValue:'',sequence:[],idx:0,displayDigit:'',resultText:'',phase:'idle'})
  },

  onShareAppMessage(){ return { title:'记忆力训练 - 数字序列', path:'/pages/digitspan/index' } }
})
