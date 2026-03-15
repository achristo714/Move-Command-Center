// Based on U-Haul box sizes
export const BOX_SIZES = [
  { value: 'small', label: 'Small', dimensions: '16" x 12" x 12"', cuft: '1.5 cu ft', desc: 'Books, cans, tools' },
  { value: 'medium', label: 'Medium', dimensions: '18" x 18" x 16"', cuft: '3 cu ft', desc: 'Kitchen, toys, shoes' },
  { value: 'large', label: 'Large', dimensions: '18" x 18" x 24"', cuft: '4.5 cu ft', desc: 'Bedding, pillows, clothes' },
  { value: 'extra_large', label: 'Extra Large', dimensions: '24" x 18" x 24"', cuft: '6 cu ft', desc: 'Comforters, lampshades' },
  { value: 'wardrobe', label: 'Wardrobe', dimensions: '24" x 24" x 34"', cuft: '~11 cu ft', desc: 'Hanging clothes' },
]

export const getBoxSize = (value) => BOX_SIZES.find(s => s.value === value)

export function generateBoxCode(boxNumber, roomName) {
  // Generate a short sharpie-friendly code like "KIT-07" or "MIL-12"
  const prefix = roomName
    ? roomName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
    : 'BOX'
  const num = String(boxNumber).padStart(2, '0')
  return `${prefix}-${num}`
}
