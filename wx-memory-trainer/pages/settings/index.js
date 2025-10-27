const storage = require('../../utils/storage.js')

Page({
  data:{
    // DigitSpan
    showMs:800,
    gapMs:300,
    startLen:3,
    // N-Back
    stepMs:1500,
    seqLen:20,
    nbackModeOptions:['视觉','听觉','双模态'],
    nbackModeIndex:0,
    nbackMode:'视觉',
    audioTokens:4,
    // Simon
    simonShowMs:700,
    simonGapMs:300,
    simonStartLen:1,
    // Spatial
    spatialGrid:4,
    spatialShowMs:800,
    spatialGapMs:300,
    spatialStartLen:3,
    // Cloud
    cloudEnabled:false,
    cloudEnvId:''
  },
  loadSettings(){
    const s = storage.getSettings()
    const idx = this.data.nbackModeOptions.indexOf(s.nback.mode)
    this.setData({
      showMs:s.digitspan.showMs,
      gapMs:s.digitspan.gapMs,
      startLen:s.digitspan.startLen,
      stepMs:s.nback.stepMs,
      seqLen:s.nback.seqLen,
      nbackModeIndex: idx>=0?idx:0,
      nbackMode: s.nback.mode,
      audioTokens:s.nback.audioTokens,
      simonShowMs:s.simon.showMs,
      simonGapMs:s.simon.gapMs,
      simonStartLen:s.simon.startLen,
      spatialGrid:s.spatial.grid,
      spatialShowMs:s.spatial.showMs,
      spatialGapMs:s.spatial.gapMs,
      spatialStartLen:s.spatial.startLen,
      cloudEnabled:s.global.cloudEnabled,
      cloudEnvId:s.global.cloudEnvId
    })
  },
  onShow(){ this.loadSettings() },
  // handlers - DigitSpan
  onChangeShowMs(e){ this.setData({showMs:Number(e.detail.value||0)}) },
  onChangeGapMs(e){ this.setData({gapMs:Number(e.detail.value||0)}) },
  onChangeStartLen(e){ this.setData({startLen:Number(e.detail.value||0)}) },
  // handlers - NBack
  onChangeStepMs(e){ this.setData({stepMs:Number(e.detail.value||0)}) },
  onChangeSeqLen(e){ this.setData({seqLen:Number(e.detail.value||0)}) },
  onChangeNbackMode(e){ const i=Number(e.detail.value); this.setData({ nbackModeIndex:i, nbackMode:this.data.nbackModeOptions[i] }) },
  onChangeAudioTokens(e){ this.setData({audioTokens:Number(e.detail.value||0)}) },
  // handlers - Simon
  onChangeSimonShowMs(e){ this.setData({simonShowMs:Number(e.detail.value||0)}) },
  onChangeSimonGapMs(e){ this.setData({simonGapMs:Number(e.detail.value||0)}) },
  onChangeSimonStartLen(e){ this.setData({simonStartLen:Number(e.detail.value||0)}) },
  // handlers - Spatial
  onChangeSpatialGrid(e){ this.setData({spatialGrid:Number(e.detail.value||0)}) },
  onChangeSpatialShowMs(e){ this.setData({spatialShowMs:Number(e.detail.value||0)}) },
  onChangeSpatialGapMs(e){ this.setData({spatialGapMs:Number(e.detail.value||0)}) },
  onChangeSpatialStartLen(e){ this.setData({spatialStartLen:Number(e.detail.value||0)}) },
  // Cloud
  onToggleCloud(e){ this.setData({ cloudEnabled: !!e.detail.value }) },
  onChangeCloudEnv(e){ this.setData({ cloudEnvId: String(e.detail.value||'') }) },

  save(){
    storage.setSettings({
      digitspan:{ showMs:this.data.showMs, gapMs:this.data.gapMs, startLen:this.data.startLen },
      nback:{ stepMs:this.data.stepMs, seqLen:this.data.seqLen, mode:this.data.nbackMode, audioTokens:this.data.audioTokens },
      simon:{ showMs:this.data.simonShowMs, gapMs:this.data.simonGapMs, startLen:this.data.simonStartLen },
      spatial:{ grid:this.data.spatialGrid, showMs:this.data.spatialShowMs, gapMs:this.data.spatialGapMs, startLen:this.data.spatialStartLen },
      global:{ cloudEnabled:this.data.cloudEnabled, cloudEnvId:this.data.cloudEnvId }
    })
    wx.showToast({title:'已保存', icon:'success'})
  },
  resetDefaults(){
    storage.resetSettingsDefaults()
    this.loadSettings()
    wx.showToast({title:'已恢复默认', icon:'success'})
  },
  // Presets
  applyPresetBeginner(){
    const s={
      digitspan:{ showMs:1000, gapMs:400, startLen:3 },
      nback:{ stepMs:2000, seqLen:18, mode:'视觉', audioTokens:4 },
      simon:{ showMs:800, gapMs:400, startLen:1 },
      spatial:{ grid:3, showMs:900, gapMs:400, startLen:3 }
    }
    storage.setSettings(s)
    this.loadSettings()
    wx.showToast({title:'已应用初级', icon:'success'})
  },
  applyPresetStandard(){
    const s={
      digitspan:{ showMs:800, gapMs:300, startLen:3 },
      nback:{ stepMs:1500, seqLen:20, mode:'视觉', audioTokens:4 },
      simon:{ showMs:700, gapMs:300, startLen:2 },
      spatial:{ grid:4, showMs:800, gapMs:300, startLen:3 }
    }
    storage.setSettings(s)
    this.loadSettings()
    wx.showToast({title:'已应用标准', icon:'success'})
  },
  applyPresetAdvanced(){
    const s={
      digitspan:{ showMs:600, gapMs:200, startLen:4 },
      nback:{ stepMs:1000, seqLen:24, mode:'双模态', audioTokens:6 },
      simon:{ showMs:500, gapMs:200, startLen:3 },
      spatial:{ grid:5, showMs:600, gapMs:200, startLen:4 }
    }
    storage.setSettings(s)
    this.loadSettings()
    wx.showToast({title:'已应用进阶', icon:'success'})
  },

  // Clear actions
  clearScores(){ storage.clearScores(); wx.showToast({title:'已清除成绩', icon:'success'}) },
  clearHistories(){ storage.clearHistories(); wx.showToast({title:'已清除历史', icon:'success'}) },
  clearAll(){ storage.clearAll(); this.loadSettings(); wx.showToast({title:'已清除全部', icon:'success'}) },

  onShareAppMessage(){ return { title:'记忆力训练 - 设置', path:'/pages/settings/index' } }
})
