export const STATUS_OPTIONS = [
  { value: 'packed', label: 'Packed', color: 'bg-packed', textColor: 'text-packed' },
  { value: 'loaded', label: 'Loaded', color: 'bg-loaded', textColor: 'text-loaded' },
  { value: 'in_storage', label: 'In Storage', color: 'bg-in-storage', textColor: 'text-in-storage' },
  { value: 'delivered', label: 'Delivered', color: 'bg-delivered', textColor: 'text-delivered' },
  { value: 'unpacked', label: 'Unpacked', color: 'bg-unpacked', textColor: 'text-unpacked' },
]

export const STATUS_FLOW = {
  packed: ['loaded'],
  loaded: ['delivered', 'in_storage'],
  in_storage: ['delivered'],
  delivered: ['unpacked'],
  unpacked: [],
}

export const DEFAULT_ROOMS = [
  'Living Room',
  'Kitchen',
  'Primary Bedroom',
  "Miles's Room",
  "Lydia's Room",
  'Office',
  'Upstairs Bath',
  'Powder Room',
  'Basement Full Bath',
  'Garage',
  'Basement',
  'Storage Locker',
  'Donate / Discard',
]

export const DEFAULT_ESSENTIALS = [
  'Toiletries (toothbrushes, soap, toilet paper)',
  'Medications',
  'Phone chargers and power strip',
  'Diapers, wipes, bottles, formula',
  'Change of clothes for everyone',
  'Bedsheets, pillows, blankets',
  'Snacks, paper plates, cups, utensils',
  'Trash bags, paper towels, cleaning spray',
  'Basic toolkit (screwdriver, box cutter, tape)',
  'Important documents / valuables bag',
  'Kid comfort items (stuffed animals, pacifiers)',
]

export const MILESTONES = [
  { count: 1, message: "Box #1 is in the books. Only... well, a lot more to go." },
  { count: 10, message: "Double digits! You're on a roll." },
  { count: 25, message: "25 boxes packed! You're crushing it." },
  { count: 50, message: "50 boxes! That's a serious move." },
  { count: 100, message: "Triple digits! You must have a LOT of stuff." },
]

export const getStatusColor = (status) => {
  const map = {
    packed: '#3b82f6',
    loaded: '#f97316',
    in_storage: '#8b5cf6',
    delivered: '#f59e0b',
    unpacked: '#22c55e',
  }
  return map[status] || '#94a3b8'
}

export const getStatusLabel = (status) => {
  const found = STATUS_OPTIONS.find(s => s.value === status)
  return found ? found.label : status
}

export const getNextStatuses = (currentStatus) => {
  return STATUS_FLOW[currentStatus] || []
}
