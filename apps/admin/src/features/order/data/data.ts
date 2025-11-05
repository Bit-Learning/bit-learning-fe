export const orderStatuses = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
] as const

export const orderStatusColors = new Map<string, string>([
  ['PENDING', 'text-yellow-600 border-yellow-300 bg-yellow-50'],
  ['COMPLETED', 'text-green-600 border-green-300 bg-green-50'],
  ['FAILED', 'text-red-600 border-red-300 bg-red-50'],
])
