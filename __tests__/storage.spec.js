import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as storage from '../wx-memory-trainer/utils/storage.js'

describe('storage utilities', () => {
  let backingStore

  beforeEach(() => {
    backingStore = {}
    global.wx = {
      getStorageSync(key) {
        return Object.prototype.hasOwnProperty.call(backingStore, key) ? backingStore[key] : ''
      },
      setStorageSync(key, value) {
        backingStore[key] = value
      }
    }
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    delete global.wx
  })

  it('normalizes settings updates and merges with defaults', () => {
    storage.setSettings({
      digitspan: { showMs: 100, gapMs: -20, startLen: 1 },
      nback: { stepMs: 400, seqLen: 5, mode: '听觉', audioTokens: 12 },
      simon: { startLen: 0 },
      spatial: { grid: 8, startLen: 1 },
      global: { cloudEnabled: 'truthy', cloudEnvId: 12345 }
    })

    const settings = storage.getSettings()

    expect(settings.digitspan).toEqual({ showMs: 200, gapMs: 0, startLen: 3 })
    expect(settings.nback).toMatchObject({ stepMs: 500, seqLen: 10, audioTokens: 8, mode: '听觉' })
    expect(settings.simon.startLen).toBe(1)
    expect(settings.spatial.grid).toBe(6)
    expect(settings.global.cloudEnabled).toBe(true)
    expect(settings.global.cloudEnvId).toBe('12345')
  })

  it('caps digit span history to twenty entries keeping newest first', () => {
    for (let i = 0; i < 25; i += 1) {
      vi.setSystemTime(new Date(2024, 0, 1, 12, i, 0))
      storage.addDigitspanHistory({ ts: Date.now(), length: i, mode: '正向', success: true })
    }

    const history = storage.getDigitspanHistory()

    expect(history).toHaveLength(20)
    expect(history[0].length).toBe(24)
    expect(history[history.length - 1].length).toBe(5)
  })

  it('updates streaks when training on consecutive days', () => {
    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'))
    let streak = storage.updateStreakOnTraining()
    expect(streak).toMatchObject({ current: 1, best: 1 })

    vi.setSystemTime(new Date('2024-06-02T12:00:00Z'))
    streak = storage.updateStreakOnTraining()
    expect(streak).toMatchObject({ current: 2, best: 2 })

    vi.setSystemTime(new Date('2024-06-04T12:00:00Z'))
    streak = storage.updateStreakOnTraining()
    expect(streak).toMatchObject({ current: 1, best: 2 })
  })

  it('avoids duplicating achievements and keeps original timestamp', () => {
    storage.addAchievement('first_win')
    const first = storage.getAchievements()[0]

    vi.setSystemTime(new Date('2024-07-01T12:00:00Z'))
    storage.addAchievement('first_win')

    const achievements = storage.getAchievements()

    expect(achievements).toHaveLength(1)
    expect(achievements[0].code).toBe('first_win')
    expect(achievements[0].ts).toBe(first.ts)
  })
})
