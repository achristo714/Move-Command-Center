// Local state store - works without Supabase, syncs with it when configured
import { DEFAULT_ROOMS, DEFAULT_ESSENTIALS } from './constants'

const STORAGE_KEY = 'move-command-center'

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to load state:', e)
  }
  return null
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

function createId() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

const defaultState = {
  rooms: DEFAULT_ROOMS.map((name, i) => ({
    id: createId(),
    name,
    sort_order: i,
  })),
  boxes: [],
  essentials: DEFAULT_ESSENTIALS.map((item, i) => ({
    id: createId(),
    item_name: item,
    is_packed: false,
    linked_box_id: null,
    sort_order: i,
  })),
  room_estimates: {},
  room_tasks: [],
  activity_log: [],
  next_box_number: 1,
}

let state = loadState() || { ...defaultState }
let listeners = new Set()

function notify() {
  saveState(state)
  listeners.forEach(fn => fn(state))
}

export const store = {
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  getState() {
    return state
  },

  // Rooms
  getRooms() {
    return state.rooms.sort((a, b) => a.sort_order - b.sort_order)
  },

  addRoom(name) {
    const room = { id: createId(), name, sort_order: state.rooms.length }
    state = { ...state, rooms: [...state.rooms, room] }
    notify()
    return room
  },

  removeRoom(id) {
    state = { ...state, rooms: state.rooms.filter(r => r.id !== id) }
    notify()
  },

  // Boxes
  getBoxes() {
    return state.boxes.sort((a, b) => b.box_number - a.box_number)
  },

  getBox(id) {
    return state.boxes.find(b => b.id === id)
  },

  addBox(data) {
    const box = {
      id: createId(),
      box_number: state.next_box_number,
      label: data.label || '',
      destination_room_id: data.destination_room_id || null,
      status: 'packed',
      is_fragile: data.is_fragile || false,
      is_priority: data.is_priority || false,
      handling_notes: data.handling_notes || '',
      ai_summary: data.ai_summary || '',
      manual_contents: data.manual_contents || '',
      photo_urls: data.photo_urls || [],
      created_by: data.created_by || 'Andy',
      created_at: now(),
      updated_at: now(),
    }
    state = {
      ...state,
      boxes: [...state.boxes, box],
      next_box_number: state.next_box_number + 1,
    }
    logActivity(box.id, 'created', { box_number: box.box_number })
    notify()
    return box
  },

  updateBox(id, updates) {
    state = {
      ...state,
      boxes: state.boxes.map(b =>
        b.id === id ? { ...b, ...updates, updated_at: now() } : b
      ),
    }
    if (updates.status) {
      logActivity(id, 'status_changed', { status: updates.status })
    }
    notify()
  },

  deleteBox(id) {
    state = { ...state, boxes: state.boxes.filter(b => b.id !== id) }
    notify()
  },

  advanceStatus(id) {
    const box = state.boxes.find(b => b.id === id)
    if (!box) return
    const flow = {
      packed: 'loaded',
      loaded: 'delivered',
      in_storage: 'delivered',
      delivered: 'unpacked',
    }
    const next = flow[box.status]
    if (next) {
      this.updateBox(id, { status: next })
    }
  },

  bulkUpdateStatus(ids, status) {
    state = {
      ...state,
      boxes: state.boxes.map(b =>
        ids.includes(b.id) ? { ...b, status, updated_at: now() } : b
      ),
    }
    notify()
  },

  // Search
  searchBoxes(query) {
    if (!query) return this.getBoxes()
    const q = query.toLowerCase()
    return state.boxes.filter(b => {
      const searchable = [
        b.ai_summary,
        b.manual_contents,
        b.label,
        b.handling_notes,
        `box ${b.box_number}`,
        `#${b.box_number}`,
      ].join(' ').toLowerCase()
      return searchable.includes(q)
    })
  },

  // Essentials
  getEssentials() {
    return state.essentials.sort((a, b) => a.sort_order - b.sort_order)
  },

  toggleEssential(id) {
    state = {
      ...state,
      essentials: state.essentials.map(e =>
        e.id === id ? { ...e, is_packed: !e.is_packed } : e
      ),
    }
    notify()
  },

  addEssential(item_name) {
    const item = {
      id: createId(),
      item_name,
      is_packed: false,
      linked_box_id: null,
      sort_order: state.essentials.length,
    }
    state = { ...state, essentials: [...state.essentials, item] }
    notify()
    return item
  },

  removeEssential(id) {
    state = { ...state, essentials: state.essentials.filter(e => e.id !== id) }
    notify()
  },

  // Room estimates
  getRoomEstimate(roomId) {
    return state.room_estimates[roomId] || 0
  },

  setRoomEstimate(roomId, count) {
    state = {
      ...state,
      room_estimates: { ...state.room_estimates, [roomId]: count },
    }
    notify()
  },

  // Room tasks
  getRoomTasks(roomId) {
    return state.room_tasks
      .filter(t => t.room_id === roomId)
      .sort((a, b) => a.sort_order - b.sort_order)
  },

  addRoomTask(roomId, text, phase = 'before_move') {
    const task = {
      id: createId(),
      room_id: roomId,
      task_text: text,
      is_done: false,
      phase,
      sort_order: state.room_tasks.filter(t => t.room_id === roomId).length,
    }
    state = { ...state, room_tasks: [...state.room_tasks, task] }
    notify()
    return task
  },

  toggleRoomTask(id) {
    state = {
      ...state,
      room_tasks: state.room_tasks.map(t =>
        t.id === id ? { ...t, is_done: !t.is_done } : t
      ),
    }
    notify()
  },

  removeRoomTask(id) {
    state = { ...state, room_tasks: state.room_tasks.filter(t => t.id !== id) }
    notify()
  },

  // Activity log
  getActivityLog(limit = 20) {
    return state.activity_log
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
  },

  // Stats
  getStats() {
    const boxes = state.boxes
    const total = boxes.length
    const byStatus = {}
    const byRoom = {}

    for (const b of boxes) {
      byStatus[b.status] = (byStatus[b.status] || 0) + 1
      if (b.destination_room_id) {
        byRoom[b.destination_room_id] = (byRoom[b.destination_room_id] || 0) + 1
      }
    }

    const today = new Date().toDateString()
    const packedToday = boxes.filter(
      b => new Date(b.created_at).toDateString() === today
    ).length

    const fragileCount = boxes.filter(b => b.is_fragile).length
    const priorityUnpacked = boxes.filter(
      b => b.is_priority && b.status !== 'unpacked'
    ).length

    return {
      total,
      byStatus,
      byRoom,
      packedToday,
      fragileCount,
      priorityUnpacked,
      unpacked: byStatus.unpacked || 0,
      toUnpack: total - (byStatus.unpacked || 0),
    }
  },

  // Reset (for testing)
  reset() {
    state = { ...defaultState }
    state.rooms = DEFAULT_ROOMS.map((name, i) => ({
      id: createId(),
      name,
      sort_order: i,
    }))
    state.essentials = DEFAULT_ESSENTIALS.map((item, i) => ({
      id: createId(),
      item_name: item,
      is_packed: false,
      linked_box_id: null,
      sort_order: i,
    }))
    notify()
  },
}

function logActivity(boxId, action, details) {
  const entry = {
    id: createId(),
    box_id: boxId,
    user_id: 'Andy',
    action,
    details,
    created_at: now(),
  }
  state = {
    ...state,
    activity_log: [...state.activity_log, entry],
  }
}

export default store
