export function formatCoverage(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return 'Not provided'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Not provided'

  const milliseconds = Date.parse(value)
  if (!Number.isFinite(milliseconds)) return 'Invalid date'

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (dateOnly) {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`))
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(milliseconds))
}

export function formatLabel(value: string | null | undefined): string {
  if (!value) return 'Unspecified'

  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
