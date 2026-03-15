import { useSyncExternalStore, useCallback } from 'react'
import store from '../lib/store'

export function useStore() {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  )
  return { state, store }
}

export function useBoxes() {
  const { store: s } = useStore()
  return {
    boxes: s.getBoxes(),
    getBox: s.getBox.bind(s),
    addBox: s.addBox.bind(s),
    updateBox: s.updateBox.bind(s),
    deleteBox: s.deleteBox.bind(s),
    advanceStatus: s.advanceStatus.bind(s),
    bulkUpdateStatus: s.bulkUpdateStatus.bind(s),
    searchBoxes: s.searchBoxes.bind(s),
  }
}

export function useRooms() {
  const { store: s } = useStore()
  return {
    rooms: s.getRooms(),
    addRoom: s.addRoom.bind(s),
    removeRoom: s.removeRoom.bind(s),
    renameRoom: s.renameRoom.bind(s),
  }
}

export function useEssentials() {
  const { store: s } = useStore()
  return {
    essentials: s.getEssentials(),
    toggleEssential: s.toggleEssential.bind(s),
    addEssential: s.addEssential.bind(s),
    removeEssential: s.removeEssential.bind(s),
  }
}

export function useStats() {
  const { store: s } = useStore()
  return s.getStats()
}

export function useRoomTasks(roomId) {
  const { store: s } = useStore()
  return {
    tasks: s.getRoomTasks(roomId),
    addTask: (text, phase) => s.addRoomTask(roomId, text, phase),
    toggleTask: s.toggleRoomTask.bind(s),
    removeTask: s.removeRoomTask.bind(s),
  }
}

export function useActivityLog() {
  const { store: s } = useStore()
  return s.getActivityLog()
}
