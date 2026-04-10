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

// Load localStorage immediately — this IS the data, shown right away
const cached = loadLocal()
// If we have cached data, show it IMMEDIATELY (initialized: true)
// If no cache, show spinner until Supabase responds
let state = cached ? { ...cached, initialized: true, lastError: null } : { ...emptyState }
// Recompute next_box_number from cached boxes to prevent stale numbering
if (state.boxes && state.boxes.length > 0) {
  const maxNum = state.boxes.reduce((max, b) => Math.max(max, b.box_number || 0), 0)
  state.next_box_number = maxNum + 1
}
let listeners = new Set()
let seeded = false
// Track boxes that haven't synced to Supabase yet — persisted to localStorage
const PENDING_KEY = 'move-pending-box-ids'
let pendingBoxIds = new Set(JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'))
function savePending() {
  localStorage.setItem(PENDING_KEY, JSON.stringify([...pendingBoxIds]))
}

function notify() {
  saveLocal(state)
  listeners.forEach(fn => fn(state))
}

// ── Supabase helpers ──

async function seedDefaults() {
  if (!isSupabaseConfigured()) return
  const { data: existing } = await supabase.from('rooms').select('id').limit(1)
  if (existing && existing.length > 0) return

  const rooms = DEFAULT_ROOMS.map((name, i) => ({
    name, sort_order: i, household_id: 'default',
  }))
  await supabase.from('rooms').insert(rooms)

  const essentials = DEFAULT_ESSENTIALS.map((item, i) => ({
    item_name: item, is_packed: false, sort_order: i, household_id: 'default',
  }))
  await supabase.from('essentials').insert(essentials)
}

// Fire-and-forget write to Supabase — local state is always the truth
async function sbWrite(fn) {
  if (!isSupabaseConfigured()) return null
  try {
    return await fn()
  } catch (e) {
    console.error('Supabase write error:', e)
    return null
  }
}

async function loadFromSupabase() {
  if (!isSupabaseConfigured()) return false
  try {
    // Load critical data sequentially to avoid overwhelming the DB
    const boxesRes = await supabase.from('boxes').select('*').order('box_number', { ascending: false })
    const roomsRes = await supabase.from('rooms').select('*').order('sort_order')

    // Check for errors — if boxes query failed, use cache and show error
    if (boxesRes.error) {
      console.error('Supabase boxes query failed:', boxesRes.error)
      state = { ...state, initialized: true, lastError: `DB timeout — using cached data. (${boxesRes.error.message})` }
      notify()
      return true
    }

    const rooms = roomsRes.data || state.rooms
    const boxes = boxesRes.data || []

    // SAFETY: keep ALL local boxes that aren't in Supabase
    const remoteBoxIds = new Set(boxes.map(b => b.id))
    const unsyncedBoxes = state.boxes.filter(b => !remoteBoxIds.has(b.id))
    for (const b of unsyncedBoxes) {
      pendingBoxIds.add(b.id)
    }
    if (unsyncedBoxes.length > 0) savePending()
    const mergedBoxes = [...boxes, ...unsyncedBoxes]

    const maxBoxNum = mergedBoxes.reduce((max, b) => Math.max(max, b.box_number || 0), 0)

    state = {
      ...state,
      rooms,
      boxes: mergedBoxes,
      next_box_number: maxBoxNum + 1,
      initialized: true,
      lastError: null,
    }
    notify()

    // Load non-critical data in background (won't block UI)
    loadSecondaryData()

    return true
  } catch (e) {
    console.error('Failed to load from Supabase:', e)
    state = { ...state, initialized: true, lastError: `Load failed: ${e.message}` }
    notify()
    return false
  }
}

// Load non-critical tables one at a time with delays to avoid statement timeout
async function loadSecondaryData() {
  const delay = () => new Promise(r => setTimeout(r, 300))
  const load = async (query) => {
    try { const res = await query; return res.data } catch { return null }
  }
  try {
    const essentials = await load(supabase.from('essentials').select('*').order('sort_order'))
    if (essentials) { state = { ...state, essentials }; notify() }
    await delay()

    const estimates = await load(supabase.from('room_estimates').select('*'))
    if (estimates) {
      const room_estimates = {}
      estimates.forEach(e => { room_estimates[e.room_id] = e.estimated_boxes })
      state = { ...state, room_estimates }; notify()
    }
    await delay()

    const room_tasks = await load(supabase.from('room_tasks').select('*').order('sort_order'))
    if (room_tasks) { state = { ...state, room_tasks }; notify() }
    await delay()

    const activity_log = await load(supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50))
    if (activity_log) { state = { ...state, activity_log }; notify() }
    await delay()

    const landlord_questions = await load(supabase.from('landlord_questions').select('*').order('sort_order'))
    if (landlord_questions) { state = { ...state, landlord_questions }; notify() }
    await delay()

    const move_checklist = await load(supabase.from('move_checklist').select('*').order('sort_order'))
    if (move_checklist) { state = { ...state, move_checklist }; notify() }
    await delay()

    const furniture = await load(supabase.from('furniture').select('*').order('created_at'))
    if (furniture) { state = { ...state, furniture }; notify() }
  } catch (e) {
    console.error('Secondary data load failed (non-critical):', e)
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
// Local state is the source of truth during the session.
// Supabase is used for persistence on startup load and fire-and-forget writes.
// NO realtime subscriptions — they caused data wipes when Supabase returned 0 boxes.

async function init() {
  if (cached) {
    // We already showed cached data (initialized: true).
    // Now try Supabase in the background to merge any new data.
    loadFromSupabase().then(() => {
      // Seed defaults if needed (background, non-blocking)
      if (!seeded && isSupabaseConfigured()) {
        seedDefaults().then(() => { seeded = true }).catch(() => {})
      }
      // Retry syncing any pending boxes
      if (pendingBoxIds.size > 0 && isSupabaseConfigured()) {
        retryPendingBoxes()
      }
    })
  } else {
    // No cache — must wait for Supabase or fall back to local defaults
    const loaded = await loadFromSupabase()
    if (!loaded) loadFromLocal()
    if (!seeded && isSupabaseConfigured()) {
      seedDefaults().then(() => { seeded = true }).catch(() => {})
    }
    if (pendingBoxIds.size > 0 && isSupabaseConfigured()) {
      retryPendingBoxes()
    }
  }
}

async function retryPendingBoxes() {
  // Wait 5 seconds before retrying — give DB time to breathe after initial load
  await new Promise(r => setTimeout(r, 5000))
  const pendingIds = [...pendingBoxIds]
  if (pendingIds.length === 0) return
  for (const id of pendingIds) {
    const box = state.boxes.find(b => b.id === id)
    if (!box) { pendingBoxIds.delete(id); savePending(); continue }
    try {
      const insert = {
        id: box.id, label: box.label || '', status: box.status || 'packed',
        is_fragile: box.is_fragile || false, is_priority: box.is_priority || false,
        is_temporary_storage: box.is_temporary_storage || false,
        handling_notes: box.handling_notes || '', ai_summary: box.ai_summary || '',
        manual_contents: box.manual_contents || '', box_size: box.box_size || null,
        household_id: box.household_id || 'default', box_number: box.box_number,
      }
      if (box.destination_room_id) insert.destination_room_id = box.destination_room_id
      // Use upsert to handle both insert and "already exists" cases in one query
      const { error } = await supabase.from('boxes').upsert(insert, { onConflict: 'id' })
      if (!error) {
        pendingBoxIds.delete(id)
        savePending()
      } else {
        console.error('Retry sync failed for box', id, ':', error.message)
      }
    } catch (e) {
      console.error('Retry sync error for box', id, ':', e)
    }
    // Small delay between retries to not hammer the DB
    await new Promise(r => setTimeout(r, 500))
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
    sbWrite(() => supabase.from('rooms').insert({ id: room.id, name, sort_order: room.sort_order, household_id: 'default' }))
    return room
  },

  removeRoom(id) {
    state = { ...state, rooms: state.rooms.filter(r => r.id !== id) }
    notify()
    sbWrite(() => supabase.from('rooms').delete().eq('id', id))
  },

  renameRoom(id, newName) {
    state = { ...state, rooms: state.rooms.map(r => r.id === id ? { ...r, name: newName } : r) }
    notify()
    sbWrite(() => supabase.from('rooms').update({ name: newName }).eq('id', id))
  },

  // Boxes
  getBoxes() {
    return [...state.boxes].sort((a, b) => b.box_number - a.box_number)
  },

  getBox(id) {
    return state.boxes.find(b => b.id === id)
  },

  addBox(data) {
    const customNum = data.box_number_override
    const boxNum = customNum || state.next_box_number
    const box = {
      id: createId(),
      box_number: boxNum,
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
      next_box_number: Math.max(state.next_box_number, boxNum) + (customNum ? 0 : 1),
    }
    notify()

    pendingBoxIds.add(box.id)
    savePending()

    sbWrite(async () => {
      const insert = {
        id: box.id,
        label: box.label,
        status: box.status,
        is_fragile: box.is_fragile,
        is_priority: box.is_priority,
        is_temporary_storage: box.is_temporary_storage,
        handling_notes: box.handling_notes,
        ai_summary: box.ai_summary,
        manual_contents: box.manual_contents,
        box_size: box.box_size,
        household_id: box.household_id,
      }
      // Only include room FK if it exists in Supabase rooms
      if (box.destination_room_id) {
        const { data: roomCheck } = await supabase.from('rooms').select('id').eq('id', box.destination_room_id).limit(1)
        if (roomCheck && roomCheck.length > 0) insert.destination_room_id = box.destination_room_id
      }
      // Skip photo_urls if they're large base64 (can exceed payload limit)
      if (box.photo_urls && box.photo_urls.length > 0) {
        const totalSize = JSON.stringify(box.photo_urls).length
        if (totalSize < 500000) insert.photo_urls = box.photo_urls
      }
      if (customNum) insert.box_number = boxNum

      const { data: inserted, error } = await supabase.from('boxes').insert(insert).select().single()
      if (error) {
        console.error('BOX INSERT FAILED:', error.message, error.code, error.details)
        // Expose error on the store so UI can show it
        state = { ...state, lastError: `Sync failed: ${error.message}` }
        notify()
        return  // Box stays in pendingBoxIds — won't be wiped on reload
      }
      pendingBoxIds.delete(box.id)
      savePending()
      state = { ...state, lastError: null }
      if (inserted) {
        state = {
          ...state,
          boxes: state.boxes.map(b =>
            b.id === inserted.id ? { ...b, box_number: inserted.box_number } : b
          ),
          next_box_number: Math.max(state.next_box_number, inserted.box_number + 1),
        }
        notify()
        await supabase.from('activity_log').insert({
          box_id: inserted.id, action: 'created',
          details: { box_number: inserted.box_number }, household_id: 'default',
        }).catch(() => {})
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

    sbWrite(async () => {
      // Only send columns from original DB schema
      const dbFields = ['label', 'destination_room_id', 'status', 'is_fragile', 'is_priority',
        'is_temporary_storage', 'handling_notes', 'ai_summary', 'manual_contents', 'box_size', 'photo_urls', 'box_number']
      const dbUpdates = { updated_at: now() }
      for (const key of dbFields) {
        if (key in updates) dbUpdates[key] = updates[key]
      }
      const { error } = await supabase.from('boxes').update(dbUpdates).eq('id', id)
      if (error) console.error('Failed to update box:', error)
      if (updates.status) {
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
    sbWrite(() => supabase.from('boxes').delete().eq('id', id))
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
    sbWrite(async () => {
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
    sbWrite(() => supabase.from('essentials').update({ is_packed: newVal }).eq('id', id))
  },

  addEssential(item_name) {
    const item = { id: createId(), item_name, is_packed: false, linked_box_id: null, sort_order: state.essentials.length, household_id: 'default' }
    state = { ...state, essentials: [...state.essentials, item] }
    notify()
    sbWrite(() => supabase.from('essentials').insert({ id: item.id, item_name, is_packed: false, sort_order: item.sort_order, household_id: 'default' }))
    return item
  },

  removeEssential(id) {
    state = { ...state, essentials: state.essentials.filter(e => e.id !== id) }
    notify()
    sbWrite(() => supabase.from('essentials').delete().eq('id', id))
  },

  // Room estimates
  getRoomEstimate(roomId) {
    return state.room_estimates[roomId] || 0
  },

  setRoomEstimate(roomId, count) {
    state = { ...state, room_estimates: { ...state.room_estimates, [roomId]: count } }
    notify()
    sbWrite(async () => {
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
    sbWrite(() => supabase.from('room_tasks').insert({ id: task.id, room_id: roomId, task_text: text, is_done: false, phase, sort_order: task.sort_order, household_id: 'default' }))
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
    sbWrite(() => supabase.from('room_tasks').update({ is_done: newVal }).eq('id', id))
  },

  removeRoomTask(id) {
    state = { ...state, room_tasks: state.room_tasks.filter(t => t.id !== id) }
    notify()
    sbWrite(() => supabase.from('room_tasks').delete().eq('id', id))
  },

  // Landlord questions
  getLandlordQuestions() {
    return [...(state.landlord_questions || [])].sort((a, b) => a.sort_order - b.sort_order)
  },

  addLandlordQuestion(text, category = 'general') {
    const item = { id: createId(), text, category, is_answered: false, answer: '', sort_order: (state.landlord_questions || []).length, created_at: now(), household_id: 'default' }
    state = { ...state, landlord_questions: [...(state.landlord_questions || []), item] }
    notify()
    sbWrite(() => supabase.from('landlord_questions').insert({ id: item.id, text, category, is_answered: false, answer: '', sort_order: item.sort_order, household_id: 'default' }))
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
    sbWrite(() => supabase.from('landlord_questions').update(updates).eq('id', id))
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
    sbWrite(() => supabase.from('landlord_questions').update({ is_answered: newVal }).eq('id', id))
  },

  removeLandlordQuestion(id) {
    state = { ...state, landlord_questions: (state.landlord_questions || []).filter(q => q.id !== id) }
    notify()
    sbWrite(() => supabase.from('landlord_questions').delete().eq('id', id))
  },

  // Move checklist
  getMoveChecklist() {
    return [...(state.move_checklist || [])].sort((a, b) => a.sort_order - b.sort_order)
  },

  addChecklistItem(text, category = 'general') {
    const item = { id: createId(), text, category, is_done: false, sort_order: (state.move_checklist || []).length, created_at: now(), household_id: 'default' }
    state = { ...state, move_checklist: [...(state.move_checklist || []), item] }
    notify()
    sbWrite(() => supabase.from('move_checklist').insert({ id: item.id, text, category, is_done: false, sort_order: item.sort_order, household_id: 'default' }))
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
    sbWrite(() => supabase.from('move_checklist').update({ is_done: newVal }).eq('id', id))
  },

  updateChecklistItem(id, updates) {
    state = {
      ...state,
      move_checklist: (state.move_checklist || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }
    notify()
    sbWrite(() => supabase.from('move_checklist').update(updates).eq('id', id))
  },

  removeChecklistItem(id) {
    state = { ...state, move_checklist: (state.move_checklist || []).filter(item => item.id !== id) }
    notify()
    sbWrite(() => supabase.from('move_checklist').delete().eq('id', id))
  },

  // Furniture
  getFurniture() {
    return [...(state.furniture || [])].sort((a, b) => a.created_at < b.created_at ? -1 : 1)
  },

  addFurniture(name, room_id, size = 'medium', needs_disassembly = false, notes = '') {
    const item = { id: createId(), name, room_id, size, needs_disassembly, notes, created_at: now(), household_id: 'default' }
    state = { ...state, furniture: [...(state.furniture || []), item] }
    notify()
    sbWrite(() => supabase.from('furniture').insert({ id: item.id, name, room_id, size, needs_disassembly, notes, household_id: 'default' }))
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
    sbWrite(() => supabase.from('furniture').update(updates).eq('id', id))
  },

  removeFurniture(id) {
    state = { ...state, furniture: (state.furniture || []).filter(f => f.id !== id) }
    notify()
    sbWrite(() => supabase.from('furniture').delete().eq('id', id))
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
      sbWrite(async () => {
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
