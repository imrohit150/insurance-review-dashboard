import type { SubmissionQueueItem } from '../../../services/enrollment-review/submissions-types'
import { formatCoverage, formatDateTime, formatLabel } from '../lib/formatters'

type SubmissionQueueProps = {
  items: SubmissionQueueItem[]
  selectedId: string | null
  onSelect: (submission: SubmissionQueueItem) => void
  onRowRef: (submissionId: string, element: HTMLTableRowElement | null) => void
}

export function SubmissionQueue({
  items,
  selectedId,
  onSelect,
  onRowRef,
}: SubmissionQueueProps) {
  return (
    <div className="h-full overflow-auto border border-[#d8ded6] bg-white">
      <table className="w-full min-w-240 border-collapse text-left text-xs leading-[1.3] font-sans sm:text-[13px] sm:leading-[1.35]">
        <caption className="sr-only">Submissions requiring review</caption>
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="border-b border-[#cfd8d0] bg-[#f7f8f4] px-2 py-2 text-[9px] font-bold uppercase tracking-[.6px] text-[#708074] sm:px-3.5 sm:py-3 sm:text-[10px] sm:tracking-[.8px]" scope="col">Applicant</th>
            <th className="border-b border-[#cfd8d0] bg-[#f7f8f4] px-2 py-2 text-[9px] font-bold uppercase tracking-[.6px] text-[#708074] sm:px-3.5 sm:py-3 sm:text-[10px] sm:tracking-[.8px]" scope="col">Employer group</th>
            <th className="border-b border-[#cfd8d0] bg-[#f7f8f4] px-2 py-2 text-[9px] font-bold uppercase tracking-[.6px] text-[#708074] sm:px-3.5 sm:py-3 sm:text-[10px] sm:tracking-[.8px]" scope="col">Product</th>
            <th className="border-b border-[#cfd8d0] bg-[#f7f8f4] px-2 py-2 text-[9px] font-bold uppercase tracking-[.6px] text-[#708074] sm:px-3.5 sm:py-3 sm:text-[10px] sm:tracking-[.8px]" scope="col">Coverage</th>
            <th className="border-b border-[#cfd8d0] bg-[#f7f8f4] px-2 py-2 text-[9px] font-bold uppercase tracking-[.6px] text-[#708074] sm:px-3.5 sm:py-3 sm:text-[10px] sm:tracking-[.8px]" scope="col">Submitted</th>
            <th className="border-b border-[#cfd8d0] bg-[#f7f8f4] px-2 py-2 text-[9px] font-bold uppercase tracking-[.6px] text-[#708074] sm:px-3.5 sm:py-3 sm:text-[10px] sm:tracking-[.8px]" scope="col">Review reason</th>
            <th className="border-b border-[#cfd8d0] bg-[#f7f8f4] px-2 py-2 text-[9px] font-bold uppercase tracking-[.6px] text-[#708074] sm:px-3.5 sm:py-3 sm:text-[10px] sm:tracking-[.8px]" scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((submission) => {
            const applicantName = submission.applicant?.name || 'Unnamed applicant'
            const isSelected = submission.id === selectedId

            return (
              <tr
                key={submission.id}
                ref={(element) => onRowRef(submission.id, element)}
                className={`transition-colors hover:bg-[#f3f7f1] focus:bg-[#f3f7f1] focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-[-3px] cursor-pointer ${isSelected ? 'bg-[#edf5eb]' : ''}`}
                tabIndex={0}
                onClick={() => onSelect(submission)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(submission)
                  }
                }}
                aria-selected={isSelected}
              >
                <td className="max-w-55 border-b border-[#e6ebe5] px-2 py-2.5 align-top text-[#405047] sm:px-3.5 sm:py-4.25" data-label="Applicant">
                  <div className="grid gap-1 text-left text-[#1d3927]">
                    <strong className="text-xs font-bold sm:text-sm">{applicantName}</strong>
                    <span className="text-[10px] text-[#78857b] sm:text-[11px]">{submission.applicant?.email || 'Email not provided'}</span>
                  </div>
                </td>
                <td className="max-w-55 border-b border-[#e6ebe5] px-2 py-2.5 align-top text-[#405047] sm:px-3.5 sm:py-4.25" data-label="Employer group">
                  {submission.group?.name || 'Group not assigned'}
                </td>
                <td className="max-w-55 border-b border-[#e6ebe5] px-2 py-2.5 align-top text-[#405047] sm:px-3.5 sm:py-4.25" data-label="Product">{submission.product || 'Not provided'}</td>
                <td className="max-w-55 border-b border-[#e6ebe5] px-2 py-2.5 align-top text-[#405047] sm:px-3.5 sm:py-4.25" data-label="Coverage">{formatCoverage(submission.coverageAmountCents)}</td>
                <td className="max-w-55 border-b border-[#e6ebe5] px-2 py-2.5 align-top text-[#405047] sm:px-3.5 sm:py-4.25" data-label="Submitted">{formatDateTime(submission.submittedAt)}</td>
                <td className="max-w-55 border-b border-[#e6ebe5] px-2 py-2.5 align-top text-[#405047] sm:px-3.5 sm:py-4.25" data-label="Review reason">
                  <span className="text-xs text-[#475b4c]">{formatLabel(submission.reviewReason)}</span>
                </td>
                <td className="max-w-55 border-b border-[#e6ebe5] px-2 py-2.5 align-top text-[#405047] sm:px-3.5 sm:py-4.25" data-label="Status">
                  <span className={`block whitespace-nowrap text-[11px] font-bold ${submission.priority === 'URGENT' || submission.priority === 'HIGH' ? 'text-[#a24e32]' : submission.priority === 'MEDIUM' ? 'text-[#8c691f]' : 'text-[#355b40]'}`}>
                    <span aria-hidden="true" className="text-[9px]">●</span> {formatLabel(submission.priority)} priority
                  </span>
                  <span className="mt-1 block text-[11px] text-[#879289]">{formatLabel(submission.status)}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
