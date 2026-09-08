import type {
  SubmissionListSort,
  SubmissionQuery,
} from '../../../services/enrollment-review/submissions-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { formatLabel } from '../lib/formatters'

type FilterOption = {
  value: string
  label: string
}

type QueueToolbarProps = {
  query: SubmissionQuery
  groups: FilterOption[]
  reasons: FilterOption[]
  onQueryChange: (query: SubmissionQuery) => void
}

export function QueueToolbar({
  query,
  groups,
  reasons,
  onQueryChange,
}: QueueToolbarProps) {
  const sortOptions = [
    { value: 'priority_desc', label: 'Priority: highest first' },
    { value: 'submitted_desc', label: 'Submitted: newest first' },
    { value: 'submitted_asc', label: 'Submitted: oldest first' },
    { value: 'applicant_asc', label: 'Applicant: A-Z' },
  ] as const

  const update = (key: keyof SubmissionQuery, value: string) => {
    onQueryChange({ ...query, [key]: value })
  }

  const handleSelectValue = (key: 'group' | 'reason' | 'sort', value: string | null) => {
    update(key, value ?? '')
  }

  const selectedGroupLabel = query.group
    ? groups.find((group) => group.value === query.group)?.label ?? query.group
    : 'All groups'

  const selectedReasonLabel = query.reason
    ? reasons.find((reason) => reason.value === query.reason)?.label
      ? formatLabel(reasons.find((reason) => reason.value === query.reason)!.label)
      : query.reason
    : 'All reasons'

  const selectedSortLabel =
    sortOptions.find((option) => option.value === query.sort)?.label ?? 'Priority: highest first'

  return (
    <div className="grid grid-cols-2 gap-2 border border-[#d8ded6] bg-white/65 p-3 sm:gap-3 sm:p-4 lg:grid-cols-[1.5fr_repeat(3,minmax(150px,1fr))]" role="search" aria-label="Filter submissions">
      <label className="col-span-2 grid gap-1 text-[9px] font-bold uppercase tracking-[.9px] text-[#617064] sm:gap-1.5 sm:text-[11px] sm:tracking-[1px] lg:col-span-1">
        <span>Search applicant</span>
        <input
          type="search"
          value={query.query}
          onChange={(event) => update('query', event.target.value)}
          placeholder="Name or email"
          className="min-h-9 w-full rounded-sm border border-[#cbd5cc] bg-white px-2.5 text-xs font-normal normal-case text-[#18231e] outline-none placeholder:text-[#9aa69d] focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2 sm:min-h-[42px] sm:px-3 sm:text-sm"
        />
      </label>

      <label className="grid gap-1 text-[9px] font-bold uppercase tracking-[.9px] text-[#617064] sm:gap-1.5 sm:text-[11px] sm:tracking-[1px]">
        <span>Employer group</span>
        <Select
          value={query.group || undefined}
          onValueChange={(value) => handleSelectValue('group', value)}
        >
          <SelectTrigger className="w-full">
            <span className="truncate">{selectedGroupLabel}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.value} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="grid gap-1 text-[9px] font-bold uppercase tracking-[.9px] text-[#617064] sm:gap-1.5 sm:text-[11px] sm:tracking-[1px]">
        <span>Review reason</span>
        <Select
          value={query.reason || undefined}
          onValueChange={(value) => handleSelectValue('reason', value)}
        >
          <SelectTrigger className="w-full">
            <span className="truncate">{selectedReasonLabel}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All reasons</SelectItem>
            {reasons.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {formatLabel(reason.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="grid gap-1 text-[9px] font-bold uppercase tracking-[.9px] text-[#617064] sm:gap-1.5 sm:text-[11px] sm:tracking-[1px]">
        <span>Sort by</span>
        <Select
          value={query.sort}
          onValueChange={(value) => handleSelectValue('sort', value ?? 'priority_desc')}
        >
          <SelectTrigger className="w-full">
            <span className="truncate">{selectedSortLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  )
}
