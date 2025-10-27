const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloud.js')

function tokenLabel(i){
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return letters[i % letters.length]
}

Page({
  data:{
    // config
    nOptions:[1,2,3],
    nIndex:1,
    n:2,
    modeOptions:['视觉','听觉','双模态'],
    modeIndex:0,
    mode:'视觉',
    audioTokens:4,
    stepMs:1500,
    seqLen:20,

    // runtime
    grid:[0,1,2,3,4,5,6,7,8],
    phase:'idle', // idle|countdown|playing|paused|result|replay
    positions:[],
    audioSeq:[],
    t:0,
    currentPos:-1,
    audioLabel:'',

    awaitingV:false,
    awaitingA:false,

    correctV:0,
    totalV:0,
    accV:0,
    correctA:0,
    totalA:0,
    accA:0,

    best:0,
    accuracy:0,
    countdown:3,
    mistakes:[] // {t,type:'位置'|'声音', target:boolean, answered:true|false|null}
  },
  onLoad(){
    const s = storage.getSettings()
    const idx = this.data.modeOptions.indexOf(s.nback.mode)
    this.setData({
      best:storage.getBestNBack(),
      stepMs:s.nback.stepMs,
      seqLen:s.nback.seqLen,
      mode:s.nback.mode,
      modeIndex: idx>=0?idx:0,
      audioTokens:s.nback.audioTokens
    })
    this.timers=[]
  },
  onShow(){
    const s = storage.getSettings()
    const idx = this.data.modeOptions.indexOf(s.nback.mode)
    if(this.data.phase==='idle'){
      this.setData({
        stepMs:s.nback.stepMs,
        seqLen:s.nback.seqLen,
        mode:s.nback.mode,
        modeIndex: idx>=0?idx:0,
        audioTokens:s.nback.audioTokens,
        best:storage.getBestNBack()
      })
    }else{
      this.setData({ best:storage.getBestNBack() })
    }
  },
  onUnload(){ this.clearTimers() },
  clearTimers(){ if(this.timers){ this.timers.forEach(x=>clearTimeout(x)); this.timers=[] } },

  onNChange(e){
    const idx=Number(e.detail.value)
    const n=this.data.nOptions[idx]
    this.setData({nIndex:idx,n})
  },
  onModeChange(e){
    const idx=Number(e.detail.value)
    const mode=this.data.modeOptions[idx]
    this.setData({modeIndex:idx, mode})
  },

  start(){
    if(this.data.phase!=='idle') return
    this.setData({phase:'countdown', countdown:3})
    const tick = ()=>{
      if(this.data.countdown<=1){ this.beginRound() }
      else { this.setData({countdown:this.data.countdown-1}); const t=setTimeout(tick,1000); this.timers.push(t) }
    }
    const t=setTimeout(tick,1000); this.timers.push(t)
  },
  beginRound(){
    this.clearTimers()
    const positions=[]
    const audioSeq=[]
    for(let i=0;i<this.data.seqLen;i++){
      if(this.data.mode!=='听觉') positions.push(Math.floor(Math.random()*9))
      if(this.data.mode!=='视觉') audioSeq.push(Math.floor(Math.random()*this.data.audioTokens))
    }
    this.setData({
      positions,
      audioSeq,
      t:0,
      phase:'playing',
      currentPos:-1,
      audioLabel:'',
      awaitingV:false,
      awaitingA:false,
      correctV:0,totalV:0,accV:0,
      correctA:0,totalA:0,accA:0,
      accuracy:0,
      mistakes:[]
    })
    this.step()
  },
  step(){
    if(this.data.phase!=='playing') return
    if(this.data.t>=this.data.seqLen){ this.finish(); return }

    const updates={}
    if(this.data.mode!=='听觉') updates.currentPos = this.data.positions[this.data.t]
    if(this.data.mode!=='视觉') updates.audioLabel = tokenLabel(this.data.audioSeq[this.data.t])
    updates.awaitingV = (this.data.mode!=='听觉') && (this.data.t>=this.data.n)
    updates.awaitingA = (this.data.mode!=='视觉') && (this.data.t>=this.data.n)
    this.setData(updates)

    const timer=setTimeout(()=>{
      if(this.data.phase!=='playing') return
      // 未作答则视为错过，计入总数，并记录错题
      const inc = {}
      if(this.data.awaitingV){
        const target = this.data.positions[this.data.t]===this.data.positions[this.data.t-this.data.n]
        inc.totalV = this.data.totalV + 1; inc.awaitingV=false
        this.data.mistakes.push({ t:this.data.t, type:'位置', target, answered:null })
      }
      if(this.data.awaitingA){
        const targetA = this.data.audioSeq[this.data.t]===this.data.audioSeq[this.data.t-this.data.n]
        inc.totalA = this.data.totalA + 1; inc.awaitingA=false
        this.data.mistakes.push({ t:this.data.t, type:'声音', target:targetA, answered:null })
      }
      this.setData(Object.keys(inc).length?inc:{})
      this.setData({t:this.data.t+1})
      this.step()
    }, this.data.stepMs)
    this.timers.push(timer)
  },
  togglePause(){
    if(this.data.phase==='playing'){
      this.clearTimers(); this.setData({ phase:'paused' })
    }else if(this.data.phase==='paused'){
      this.setData({ phase:'playing' }); this.step()
    }
  },
  replay(){
    const prevPhase=this.data.phase
    if(prevPhase!=='result' && prevPhase!=='playing' && prevPhase!=='paused') return
    if(!(this.data.positions.length || this.data.audioSeq.length)) return
    this.clearTimers()
    this.setData({ phase:'replay', currentPos:-1, audioLabel:'' })
    let i=0
    const play=()=>{
      if(this.data.phase!=='replay') return
      if(i>=this.data.seqLen){
        const t=setTimeout(()=>{ this.setData({ currentPos:-1, audioLabel:'', phase: prevPhase==='result'? 'result' : 'playing' }) }, 300)
        this.timers.push(t)
        if(prevPhase==='playing'){ this.step() }
        return
      }
      if(this.data.mode!=='听觉' && this.data.positions.length) this.setData({ currentPos: this.data.positions[i] })
      if(this.data.mode!=='视觉' && this.data.audioSeq.length) this.setData({ audioLabel: tokenLabel(this.data.audioSeq[i]) })
      const t=setTimeout(()=>{ i+=1; play() }, this.data.stepMs)
      this.timers.push(t)
    }
    play()
  },
  restartRound(){
    this.clearTimers()
    this.setData({ positions:[], audioSeq:[], t:0, currentPos:-1, audioLabel:'', awaitingV:false, awaitingA:false, correctV:0, totalV:0, correctA:0, totalA:0, accV:0, accA:0, accuracy:0, phase:'idle', mistakes:[] })
    this.start()
  },

  // Answers
  answerVis(isMatch){
    if(this.data.phase!=='playing') return
    if(this.data.mode==='听觉') return
    if(this.data.t<this.data.n) return
    if(!this.data.awaitingV) return
    const target=this.data.positions[this.data.t]===this.data.positions[this.data.t-this.data.n]
    let correctV=this.data.correctV
    let totalV=this.data.totalV
    if(isMatch===target){ correctV+=1; try{wx.vibrateShort({type:'light'})}catch(e){} } else { try{wx.vibrateLong()}catch(e){} this.data.mistakes.push({ t:this.data.t, type:'位置', target, answered:isMatch }) }
    totalV+=1
    this.setData({correctV,totalV,awaitingV:false})
  },
  answerVisMatch(){ this.answerVis(true) },
  answerVisNonMatch(){ this.answerVis(false) },

  answerAud(isMatch){
    if(this.data.phase!=='playing') return
    if(this.data.mode==='视觉') return
    if(this.data.t<this.data.n) return
    if(!this.data.awaitingA) return
    const target=this.data.audioSeq[this.data.t]===this.data.audioSeq[this.data.t-this.data.n]
    let correctA=this.data.correctA
    let totalA=this.data.totalA
    if(isMatch===target){ correctA+=1; try{wx.vibrateShort({type:'light'})}catch(e){} } else { try{wx.vibrateLong()}catch(e){} this.data.mistakes.push({ t:this.data.t, type:'声音', target, answered:isMatch }) }
    totalA+=1
    this.setData({correctA,totalA,awaitingA:false})
  },
  answerAudMatch(){ this.answerAud(true) },
  answerAudNonMatch(){ this.answerAud(false) },

  endRound(){ if(this.data.phase==='playing' || this.data.phase==='paused'){ this.finish() } },
  finish(){
    this.clearTimers()
    const accV = this.data.totalV>0 ? Math.round(this.data.correctV/this.data.totalV*100) : 0
    const accA = this.data.totalA>0 ? Math.round(this.data.correctA/this.data.totalA*100) : 0
    let accuracy = 0
    if(this.data.mode==='视觉') accuracy = accV
    else if(this.data.mode==='听觉') accuracy = accA
    else accuracy = Math.round(((accV||0)+(accA||0))/2)

    let best=this.data.best; if(accuracy>best){ best=accuracy; storage.setBestNBack(best) }

    this.setData({
      phase:'result',
      currentPos:-1,
      audioLabel:'',
      accV,accA,accuracy,best
    })

    storage.addNbackHistory({ ts:Date.now(), n:this.data.n, mode:this.data.mode, seqLen:this.data.seqLen, stepMs:this.data.stepMs, correctV:this.data.correctV, totalV:this.data.totalV, correctA:this.data.correctA, totalA:this.data.totalA, acc:accuracy, correct:this.data.correctV+this.data.correctA, total:this.data.totalV+this.data.totalA })

    // 成就与连续训练
    const st = storage.updateStreakOnTraining();
    storage.addAchievement('first_train');
    if(accuracy>=80) storage.addAchievement('nback80')
    if(st.current>=3) storage.addAchievement('streak_3')
    if(st.current>=7) storage.addAchievement('streak_7')

    // 复盘
    storage.setLastReview({
      game:'nback',
      payload:{
        n:this.data.n,
        mode:this.data.mode,
        accV, correctV:this.data.correctV, totalV:this.data.totalV,
        accA, correctA:this.data.correctA, totalA:this.data.totalA,
        acc:accuracy,
        mistakes:this.data.mistakes
      }
    })

    // 云占位保存
    cloud.saveScore('nback', { n:this.data.n, mode:this.data.mode, seqLen:this.data.seqLen, stepMs:this.data.stepMs, correctV:this.data.correctV, totalV:this.data.totalV, correctA:this.data.correctA, totalA:this.data.totalA, acc:accuracy })
  },

  onShareAppMessage(){ return { title:'记忆力训练 - N-Back', path:'/pages/nback/index' } }
})
