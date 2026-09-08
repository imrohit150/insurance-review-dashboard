import { describe, expect, it } from 'vitest'
import { formatCoverage, formatDateTime, formatLabel } from './formatters'

describe('formatters', () => {
  it('formats cents as USD while preserving zero and missing values', () => {
    expect(formatCoverage(25_000_000)).toBe('$250,000')
    expect(formatCoverage(0)).toBe('$0')
    expect(formatCoverage(null)).toBe('Not provided')
  })

  it('handles valid, date-only, missing, and invalid dates', () => {
    expect(formatDateTime('2027-01-01')).toBe('Jan 1, 2027')
    expect(formatDateTime(null)).toBe('Not provided')
    expect(formatDateTime('not-a-date')).toBe('Invalid date')
  })

  it('humanizes API labels', () => {
    expect(formatLabel('COVERAGE_MISMATCH')).toBe('Coverage Mismatch')
    expect(formatLabel(null)).toBe('Unspecified')
  })
})
