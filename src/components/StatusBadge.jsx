import { getStatusColor, getStatusLabel } from '../lib/constants'

export default function StatusBadge({ status, size = 'sm' }) {
  const color = getStatusColor(status)
  const label = getStatusLabel(status)
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}
