import type {
  SubmissionListSort,
  SubmissionQuery,
} from '../../../services/enrollment-review/submissions-types'
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
  const update = (key: keyof SubmissionQuery, value: string) => {
    onQueryChange({ ...query, [key]: value })
  }

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
        <select
          value={query.group}
          onChange={(event) => update('group', event.target.value)}
          className="min-h-9 w-full rounded-sm border border-[#cbd5cc] bg-white px-2.5 text-xs font-normal normal-case text-[#18231e] outline-none focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2 sm:min-h-[42px] sm:px-3 sm:text-sm"
        >
          <option value="">All groups</option>
          {groups.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-[9px] font-bold uppercase tracking-[.9px] text-[#617064] sm:gap-1.5 sm:text-[11px] sm:tracking-[1px]">
        <span>Review reason</span>
        <select
          value={query.reason}
          onChange={(event) => update('reason', event.target.value)}
          className="min-h-9 w-full rounded-sm border border-[#cbd5cc] bg-white px-2.5 text-xs font-normal normal-case text-[#18231e] outline-none focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2 sm:min-h-[42px] sm:px-3 sm:text-sm"
        >
          <option value="">All reasons</option>
          {reasons.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {formatLabel(reason.label)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-[9px] font-bold uppercase tracking-[.9px] text-[#617064] sm:gap-1.5 sm:text-[11px] sm:tracking-[1px]">
        <span>Sort by</span>
        <select
          value={query.sort}
          onChange={(event) =>
            update('sort', event.target.value as SubmissionListSort)
          }
          className="min-h-9 w-full rounded-sm border border-[#cbd5cc] bg-white px-2.5 text-xs font-normal normal-case text-[#18231e] outline-none focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2 sm:min-h-[42px] sm:px-3 sm:text-sm"
        >
          <option value="priority_desc">Priority: highest first</option>
          <option value="submitted_desc">Submitted: newest first</option>
          <option value="submitted_asc">Submitted: oldest first</option>
          <option value="applicant_asc">Applicant: A-Z</option>
        </select>
      </label>
    </div>
  )
}
