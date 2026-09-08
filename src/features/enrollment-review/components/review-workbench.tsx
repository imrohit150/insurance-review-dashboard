import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSubmissions } from '../hooks/use-submissions'
import type {
  SubmissionListResponse,
  SubmissionQuery,
  SubmissionQueueItem,
} from '../../../services/enrollment-review/submissions-types'
import { QueueEmpty, QueueError, QueueLoading } from './queue-states'
import { QueueToolbar } from './queue-toolbar'
import { SubmissionQueue } from './submission-queue'
import { SubmissionDetailDrawer } from './submission-detail-drawer'
import { formatLabel } from '../lib/formatters'
import { submissionsQueryKey } from '../hooks/use-submissions'
import { useDebouncedValue } from '../hooks/use-debounced-value'

const initialQuery: SubmissionQuery = {
  query: '',
  group: '',
  reason: '',
  sort: 'priority_desc',
}

export function ReviewWorkbench() {
  const [query, setQuery] = useState<SubmissionQuery>(initialQuery)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})
  const queryClient = useQueryClient()
  const debouncedSearch = useDebouncedValue(query.query)
  const apiQuery: SubmissionQuery = {
    ...query,
    query: debouncedSearch,
  }
  const submissions = useSubmissions(apiQuery)
  const unfilteredSubmissions = queryClient.getQueryData<SubmissionListResponse>(
    submissionsQueryKey(initialQuery),
  )
  const filterSource = unfilteredSubmissions?.items ?? submissions.data?.items ?? []

  const groups = Array.from(
    new Map(
      filterSource
        .filter((item) => item.group)
        .map((item) => [
          item.group?.id || item.group?.name || '',
          { value: item.group?.id || item.group?.name || '', label: item.group?.name || 'Unnamed group' },
        ]),
    ).values(),
  )
  const reasons = Array.from(
    new Set(
      filterSource
        .map((item) => item.reviewReason)
        .filter((reason): reason is string => Boolean(reason)),
    ),
  ).map((reason) => ({ value: reason, label: reason }))

  const hasFilters = Boolean(query.query || query.group || query.reason)
  const selectSubmission = (submission: SubmissionQueueItem) => {
    setSelectedId(submission.id)
  }

  const closeDetails = () => {
    const row = selectedId ? rowRefs.current[selectedId] : null
    setSelectedId(null)
    window.requestAnimationFrame(() => row?.focus())
  }

  useEffect(() => {
    if (!toastMessage) return
    const timeoutId = window.setTimeout(() => setToastMessage(null), 4500)
    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  const handleDecisionSuccess = (status: string) => {
    closeDetails()
    setToastMessage(`Submission ${formatLabel(status).toLowerCase()} successfully.`)
  }

  const handleDecisionConflict = (status: string) => {
    closeDetails()
    setToastMessage(`This submission was already ${formatLabel(status).toLowerCase()} by another reviewer.`)
  }

  const handleAlreadyDecided = () => {
    closeDetails()
    setToastMessage('This submission was already decided and is no longer available for review.')
  }

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#f4f5ef] bg-[radial-gradient(circle_at_90%_0%,#d9e5da_0,transparent_30%)] px-[clamp(12px,5vw,76px)] py-4 sm:py-10.5">
      <header className="mx-auto mb-2 flex w-full max-w-7xl shrink-0 items-center justify-between gap-4 sm:mb-10">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-[#668070] sm:mb-2 sm:text-[11px] sm:tracking-[1.7px]">Operations / Enrollment</p>
          <h1 className="mb-1 font-serif text-[1.5rem] font-semibold leading-[.98] text-[#18231e] sm:mb-3 sm:text-5xl">Review workbench</h1>
          <p className="mb-0 max-w-65 font-sans text-xs leading-5 text-[#637066] sm:max-w-none sm:text-[15px] sm:leading-6">Resolve the submissions that need a closer look.</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#b6c5b8] font-sans text-xs font-bold text-[#42614a] sm:h-13 sm:w-13 sm:text-[13px]" aria-hidden="true">ER</div>
      </header>

      <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col" aria-labelledby="queue-heading">
        <div className="mb-3 flex shrink-0 items-end justify-between gap-4 sm:mb-6 sm:gap-6">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-[#668070] sm:mb-2 sm:text-[11px] sm:tracking-[1.7px]">Live queue</p>
            <h2 id="queue-heading" className="font-serif text-1xl font-normal text-[#18231e] sm:text-3xl">Submissions to review</h2>
          </div>
          <div className="font-sans text-xs font-bold uppercase text-[#42614a]" aria-live="polite">
            {submissions.isLoading ? 'Loading' : `${submissions.data?.total ?? 0} open`}
          </div>
        </div>

        <QueueToolbar
          query={query}
          groups={groups}
          reasons={reasons}
          onQueryChange={setQuery}
        />

        <div className="min-h-6 shrink-0 px-0.5 py-1.5 text-[11px] text-[#6a796e] sm:min-h-7.25 sm:py-2 sm:text-xs" role="status" aria-live="polite">
          {submissions.isFetching && !submissions.isLoading
            ? 'Refreshing queue...'
            : submissions.data
              ? `${submissions.data.total} submissions loaded`
              : ''}
        </div>

        {submissions.isLoading && <div className="min-h-55 flex-1 sm:min-h-0"><QueueLoading /></div>}
        {submissions.isError && (
          <div className="min-h-55 flex-1 sm:min-h-0"><QueueError
              message={submissions.error instanceof Error ? submissions.error.message : 'Please try again.'}
              onRetry={() => void submissions.refetch()}
            /></div>
        )}
        {submissions.isSuccess && submissions.data.items.length === 0 && (
          <div className="min-h-55 flex-1 sm:min-h-0"><QueueEmpty hasFilters={hasFilters} /></div>
        )}
        {submissions.isSuccess && submissions.data.items.length > 0 && (
          <div className="min-h-55 flex-1 sm:min-h-0">
            <SubmissionQueue
              items={submissions.data.items}
              selectedId={selectedId}
              onSelect={selectSubmission}
              onRowRef={(submissionId, element) => {
                rowRefs.current[submissionId] = element
              }}
            />
          </div>
        )}
      </section>
      {selectedId && (
        <SubmissionDetailDrawer
          submissionId={selectedId}
          onClose={closeDetails}
          onDecisionSuccess={handleDecisionSuccess}
          onDecisionConflict={handleDecisionConflict}
          onAlreadyDecided={handleAlreadyDecided}
        />
      )}
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 max-w-[min(380px,calc(100vw-3rem))] rounded-sm border border-[#b7cfb8] bg-[#f1f8f0] px-4 py-3 text-base font-medium text-[#355b40] shadow-lg" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </main>
  )
}
