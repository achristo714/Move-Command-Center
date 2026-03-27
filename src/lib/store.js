// Hybrid store: Supabase when configured, localStorage fallback
import { supabase, isSupabaseConfigured } from './supabase'
import { DEFAULT_ROOMS, DEFAULT_ESSENTIALS } from './constants'

const STORAGE_KEY = 'move-command-center'

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return null
}

function saveLocal(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch (e) { /* ignore */ }
}

function createId() { return crypto.randomUUID() }
function now() { return new Date().toISOString() }

const emptyState = {
  rooms: [],
  boxes: [],
  essentials: [],
  room_estimates: {},
  room_tasks: [],
  activity_log: [],
  landlord_questions: [],
  move_checklist: [],
  furniture: [],
  next_box_number: 1,
  initialized: false,
}

let state = { ...emptyState }
let listeners = new Set()

function notify() {
  saveLocal(state)
  listeners.forEach(fn => fn(state))
}

// ── Supabase helpers ──

async function sb(fn) {
  if (!isSupabaseConfigured()) return null
  try { return await fn() } catch (e) { console.error('Supabase error:', e); return null }
}

async function seedDefaults() {
  if (!isSupabaseConfigured()) return
  // Check if rooms exist
  const { data: existing } = await supabase.from('rooms').select('id').limit(1)
  if (existing && existing.length > 0) return

  // Seed default rooms
  const rooms = DEFAULT_ROOMS.map((name, i) => ({
    name, sort_order: i, household_id: 'default',
  }))
  await supabase.from('rooms').insert(rooms)

  // Seed default essentials
  const essentials = DEFAULT_ESSENTIALS.map((item, i) => ({
    item_name: item, is_packed: false, sort_order: i, household_id: 'default',
  }))
  await supabase.from('essentials').insert(essentials)
}

async function loadFromSupabase() {
  if (!isSupabaseConfigured()) return false
  try {
    await seedDefaults()

    const [roomsRes, boxesRes, essRes, tasksRes, actRes, estRes, lqRes, clRes, furnRes] = await Promise.all([
      supabase.from('rooms').select('*').order('sort_order'),
      supabase.from('boxes').select('*').order('box_number', { ascending: false }),
      supabase.from('essentials').select('*').order('sort_order'),
      supabase.from('room_tasks').select('*').order('sort_order'),
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('room_estimates').select('*'),
      supabase.from('landlord_questions').select('*').order('sort_order'),
      supabase.from('move_checklist').select('*').order('sort_order'),
      supabase.from('furniture').select('*').order('created_at'),
    ])

    const rooms = roomsRes.data || []
    const boxes = boxesRes.data || []
    const essentials = essRes.data || []
    const room_tasks = tasksRes.data || []
    const activity_log = actRes.data || []
    const estimates = estRes.data || []
    const landlord_questions = lqRes.data || []
    const move_checklist = clRes.data || []
    const furniture = furnRes.data || []

    const room_estimates = {}
    estimates.forEach(e => { room_estimates[e.room_id] = e.estimated_boxes })

    const maxBoxNum = boxes.reduce((max, b) => Math.max(max, b.box_number || 0), 0)

    state = {
      rooms,
      boxes,
      essentials,
      room_estimates,
      room_tasks,
      activity_log,
      landlord_questions,
      move_checklist,
      furniture,
      next_box_number: maxBoxNum + 1,
      initialized: true,
    }
    notify()
    return true
  } catch (e) {
    console.error('Failed to load from Supabase:', e)
    return false
  }
}

function loadFromLocal() {
  const saved = loadLocal()
  if (saved) {
    state = { ...saved, initialized: true }
  } else {
    state = {
      rooms: DEFAULT_ROOMS.map((name, i) => ({ id: createId(), name, sort_order: i })),
      boxes: [],
      essentials: DEFAULT_ESSENTIALS.map((item, i) => ({
        id: createId(), item_name: item, is_packed: false, linked_box_id: null, sort_order: i,
      })),
      room_estimates: {},
      room_tasks: [],
      activity_log: [],
      next_box_number: 1,
      initialized: true,
    }
  }
  notify()
}

// ── Initialize ──

async function init() {
  const loaded = await loadFromSupabase()
  if (!loaded) loadFromLocal()

  // Set up realtime subscriptions
  if (isSupabaseConfigured()) {
    supabase.channel('changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boxes' }, () => loadFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => loadFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'essentials' }, () => loadFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_tasks' }, () => loadFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'landlord_questions' }, () => loadFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'move_checklist' }, () => loadFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'furniture' }, () => loadFromSupabase())
      .subscribe()
  }
}

init()

// ── Store ──

export const store = {
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  getState() { return state },

  // Rooms
  getRooms() {
    return [...state.rooms].sort((a, b) => a.sort_order - b.sort_order)
  },

  addRoom(name) {
    const room = { id: createId(), name, sort_order: state.rooms.length, household_id: 'default' }
    state = { ...state, rooms: [...state.rooms, room] }
    notify()
    sb(() => supabase.from('rooms').insert({ name, sort_order: room.sort_order, household_id: 'default' }))
      .then(() => loadFromSupabase())
    return room
  },

  removeRoom(id) {
    state = { ...state, rooms: state.rooms.filter(r => r.id !== id) }
    notify()
    sb(() => supabase.from('rooms').delete().eq('id', id))
  },

  renameRoom(id, newName) {
    state = { ...state, rooms: state.rooms.map(r => r.id === id ? { ...r, name: newName } : r) }
    notify()
    sb(() => supabase.from('rooms').update({ name: newName }).eq('id', id))
  },

  // Boxes
  getBoxes() {
    return [...state.boxes].sort((a, b) => b.box_number - a.box_number)
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
      is_temporary_storage: data.is_temporary_storage || false,
      handling_notes: data.handling_notes || '',
      ai_summary: data.ai_summary || '',
      manual_contents: data.manual_contents || '',
      box_size: data.box_size || null,
      photo_urls: data.photo_urls || [],
      created_by: null,
      household_id: 'default',
      created_at: now(),
      updated_at: now(),
    }
    state = {
      ...state,
      boxes: [...state.boxes, box],
      next_box_number: state.next_box_number + 1,
    }
    notify()

    sb(async () => {
      const insert = { ...box }
      delete insert.id // let DB auto-generate
      delete insert.box_number // serial, let DB handle
      const { data: inserted } = await supabase.from('boxes').insert(insert).select().single()
      if (inserted) {
        // Log activity with real ID
        await supabase.from('activity_log').insert({
          box_id: inserted.id, action: 'created',
          details: { box_number: inserted.box_number }, household_id: 'default',
        })
        await loadFromSupabase()
      }
    })

    logActivity(box.id, 'created', { box_number: box.box_number })
    return box
  },

  updateBox(id, updates) {
    state = {
      ...state,
      boxes: state.boxes.map(b =>
        b.id === id ? { ...b, ...updates, updated_at: now() } : b
      ),
    }
    if (updates.status) logActivity(id, 'status_changed', { status: updates.status })
    notify()

    sb(async () => {
      await supabase.from('boxes').update({ ...updates, updated_at: now() }).eq('id', id)
      if (updates.status) {
        const box = state.boxes.find(b => b.id === id)
        await supabase.from('activity_log').insert({
          box_id: id, action: 'status_changed',
          details: { status: updates.status }, household_id: 'default',
        })
      }
    })
  },

  deleteBox(id) {
    state = { ...state, boxes: state.boxes.filter(b => b.id !== id) }
    notify()
    sb(() => supabase.from('boxes').delete().eq('id', id))
  },

  advanceStatus(id) {
    const box = state.boxes.find(b => b.id === id)
    if (!box) return
    const flow = { packed: 'loaded', loaded: 'delivered', in_storage: 'delivered', delivered: 'unpacked' }
    const next = flow[box.status]
    if (next) this.updateBox(id, { status: next })
  },

  bulkUpdateStatus(ids, status) {
    state = {
      ...state,
      boxes: state.boxes.map(b =>
        ids.includes(b.id) ? { ...b, status, updated_at: now() } : b
      ),
    }
    notify()
    sb(async () => {
      for (const id of ids) {
        await supabase.from('boxes').update({ status, updated_at: now() }).eq('id', id)
      }
    })
  },

  // Search
  searchBoxes(query) {
    if (!query) return this.getBoxes()
    const q = query.toLowerCase()
    return state.boxes.filter(b => {
      const room = state.rooms.find(r => r.id === b.destination_room_id)
      const searchable = [b.ai_summary, b.manual_contents, b.label, b.handling_notes, `box ${b.box_number}`, `#${b.box_number}`, room?.name]
        .join(' ').toLowerCase()
      return searchable.includes(q)
    })
  },

  // Essentials
  getEssentials() {
    return [...state.essentials].sort((a, b) => a.sort_order - b.sort_order)
  },

  toggleEssential(id) {
    const item = state.essentials.find(e => e.id === id)
    if (!item) return
    const newVal = !item.is_packed
    state = {
      ...state,
      essentials: state.essentials.map(e =>
        e.id === id ? { ...e, is_packed: newVal } : e
      ),
    }
    notify()
    sb(() => supabase.from('essentials').update({ is_packed: newVal }).eq('id', id))
  },

  addEssential(item_name) {
    const item = { id: createId(), item_name, is_packed: false, linked_box_id: null, sort_order: state.essentials.length, household_id: 'default' }
    state = { ...state, essentials: [...state.essentials, item] }
    notify()
    sb(() => supabase.from('essentials').insert({ item_name, is_packed: false, sort_order: item.sort_order, household_id: 'default' }))
      .then(() => loadFromSupabase())
    return item
  },

  removeEssential(id) {
    state = { ...state, essentials: state.essentials.filter(e => e.id !== id) }
    notify()
    sb(() => supabase.from('essentials').delete().eq('id', id))
  },

  // Room estimates
  getRoomEstimate(roomId) {
    return state.room_estimates[roomId] || 0
  },

  setRoomEstimate(roomId, count) {
    state = { ...state, room_estimates: { ...state.room_estimates, [roomId]: count } }
    notify()
    sb(async () => {
      const { data: existing } = await supabase.from('room_estimates').select('id').eq('room_id', roomId).limit(1)
      if (existing && existing.length > 0) {
        await supabase.from('room_estimates').update({ estimated_boxes: count, updated_at: now() }).eq('room_id', roomId)
      } else {
        await supabase.from('room_estimates').insert({ room_id: roomId, estimated_boxes: count, household_id: 'default' })
      }
    })
  },

  // Room tasks
  getRoomTasks(roomId) {
    return state.room_tasks.filter(t => t.room_id === roomId).sort((a, b) => a.sort_order - b.sort_order)
  },

  addRoomTask(roomId, text, phase = 'before_move') {
    const task = { id: createId(), room_id: roomId, task_text: text, is_done: false, phase, sort_order: state.room_tasks.filter(t => t.room_id === roomId).length, household_id: 'default' }
    state = { ...state, room_tasks: [...state.room_tasks, task] }
    notify()
    sb(() => supabase.from('room_tasks').insert({ room_id: roomId, task_text: text, is_done: false, phase, sort_order: task.sort_order, household_id: 'default' }))
      .then(() => loadFromSupabase())
    return task
  },

  toggleRoomTask(id) {
    const task = state.room_tasks.find(t => t.id === id)
    if (!task) return
    const newVal = !task.is_done
    state = {
      ...state,
      room_tasks: state.room_tasks.map(t => t.id === id ? { ...t, is_done: newVal } : t),
    }
    notify()
    sb(() => supabase.from('room_tasks').update({ is_done: newVal }).eq('id', id))
  },

  removeRoomTask(id) {
    state = { ...state, room_tasks: state.room_tasks.filter(t => t.id !== id) }
    notify()
    sb(() => supabase.from('room_tasks').delete().eq('id', id))
  },

  // Landlord questions
  getLandlordQuestions() {
    return [...(state.landlord_questions || [])].sort((a, b) => a.sort_order - b.sort_order)
  },

  addLandlordQuestion(text, category = 'general') {
    const item = { id: createId(), text, category, is_answered: false, answer: '', sort_order: (state.landlord_questions || []).length, created_at: now(), household_id: 'default' }
    state = { ...state, landlord_questions: [...(state.landlord_questions || []), item] }
    notify()
    sb(() => supabase.from('landlord_questions').insert({ text, category, is_answered: false, answer: '', sort_order: item.sort_order, household_id: 'default' }))
      .then(() => loadFromSupabase())
    return item
  },

  updateLandlordQuestion(id, updates) {
    state = {
      ...state,
      landlord_questions: (state.landlord_questions || []).map(q =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }
    notify()
    sb(() => supabase.from('landlord_questions').update(updates).eq('id', id))
  },

  toggleLandlordQuestion(id) {
    const item = (state.landlord_questions || []).find(q => q.id === id)
    if (!item) return
    const newVal = !item.is_answered
    state = {
      ...state,
      landlord_questions: state.landlord_questions.map(q =>
        q.id === id ? { ...q, is_answered: newVal } : q
      ),
    }
    notify()
    sb(() => supabase.from('landlord_questions').update({ is_answered: newVal }).eq('id', id))
  },

  removeLandlordQuestion(id) {
    state = { ...state, landlord_questions: (state.landlord_questions || []).filter(q => q.id !== id) }
    notify()
    sb(() => supabase.from('landlord_questions').delete().eq('id', id))
  },

  // Move checklist
  getMoveChecklist() {
    return [...(state.move_checklist || [])].sort((a, b) => a.sort_order - b.sort_order)
  },

  addChecklistItem(text, category = 'general') {
    const item = { id: createId(), text, category, is_done: false, sort_order: (state.move_checklist || []).length, created_at: now(), household_id: 'default' }
    state = { ...state, move_checklist: [...(state.move_checklist || []), item] }
    notify()
    sb(() => supabase.from('move_checklist').insert({ text, category, is_done: false, sort_order: item.sort_order, household_id: 'default' }))
      .then(() => loadFromSupabase())
    return item
  },

  toggleChecklistItem(id) {
    const item = (state.move_checklist || []).find(i => i.id === id)
    if (!item) return
    const newVal = !item.is_done
    state = {
      ...state,
      move_checklist: (state.move_checklist || []).map(item =>
        item.id === id ? { ...item, is_done: newVal } : item
      ),
    }
    notify()
    sb(() => supabase.from('move_checklist').update({ is_done: newVal }).eq('id', id))
  },

  updateChecklistItem(id, updates) {
    state = {
      ...state,
      move_checklist: (state.move_checklist || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }
    notify()
    sb(() => supabase.from('move_checklist').update(updates).eq('id', id))
  },

  removeChecklistItem(id) {
    state = { ...state, move_checklist: (state.move_checklist || []).filter(item => item.id !== id) }
    notify()
    sb(() => supabase.from('move_checklist').delete().eq('id', id))
  },

  // Furniture
  getFurniture() {
    return [...(state.furniture || [])].sort((a, b) => a.created_at < b.created_at ? -1 : 1)
  },

  addFurniture(name, room_id, size = 'medium', needs_disassembly = false, notes = '') {
    const item = { id: createId(), name, room_id, size, needs_disassembly, notes, created_at: now(), household_id: 'default' }
    state = { ...state, furniture: [...(state.furniture || []), item] }
    notify()
    sb(() => supabase.from('furniture').insert({ name, room_id, size, needs_disassembly, notes, household_id: 'default' }))
      .then(() => loadFromSupabase())
    return item
  },

  updateFurniture(id, updates) {
    state = {
      ...state,
      furniture: (state.furniture || []).map(f =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }
    notify()
    sb(() => supabase.from('furniture').update(updates).eq('id', id))
  },

  removeFurniture(id) {
    state = { ...state, furniture: (state.furniture || []).filter(f => f.id !== id) }
    notify()
    sb(() => supabase.from('furniture').delete().eq('id', id))
  },

  // Activity log
  getActivityLog(limit = 20) {
    return [...state.activity_log].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit)
  },

  // Stats
  getStats() {
    const boxes = state.boxes
    const total = boxes.length
    const byStatus = {}
    const byRoom = {}
    for (const b of boxes) {
      byStatus[b.status] = (byStatus[b.status] || 0) + 1
      if (b.destination_room_id) byRoom[b.destination_room_id] = (byRoom[b.destination_room_id] || 0) + 1
    }
    const today = new Date().toDateString()
    const packedToday = boxes.filter(b => new Date(b.created_at).toDateString() === today).length
    const fragileCount = boxes.filter(b => b.is_fragile).length
    const priorityUnpacked = boxes.filter(b => b.is_priority && b.status !== 'unpacked').length
    return { total, byStatus, byRoom, packedToday, fragileCount, priorityUnpacked, unpacked: byStatus.unpacked || 0, toUnpack: total - (byStatus.unpacked || 0) }
  },

  // Reset
  reset() {
    state = { ...emptyState, initialized: true }
    notify()
    if (isSupabaseConfigured()) {
      sb(async () => {
        await supabase.from('activity_log').delete().neq('id', '')
        await supabase.from('room_tasks').delete().neq('id', '')
        await supabase.from('room_estimates').delete().neq('id', '')
        await supabase.from('essentials').delete().neq('id', '')
        await supabase.from('boxes').delete().neq('id', '')
        await supabase.from('rooms').delete().neq('id', '')
        await seedDefaults()
        await loadFromSupabase()
      })
    } else {
      loadFromLocal()
    }
  },
}

function logActivity(boxId, action, details) {
  const entry = { id: createId(), box_id: boxId, user_id: 'Andy', action, details, created_at: now() }
  state = { ...state, activity_log: [...state.activity_log, entry] }
}

export default store
