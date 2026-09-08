type QueueErrorProps = {
  message: string
  onRetry: () => void
}

export function QueueLoading() {
  return (
    <div className="grid min-h-65 place-content-center justify-items-center gap-2.5 border border-[#d8ded6] border-t-0 bg-white/70 text-center text-sm text-[#6d7b70]" role="status" aria-live="polite">
      <span className="h-5.5 w-5.5 animate-spin rounded-full border-2 border-[#cbd8cc] border-t-[#42614a]" aria-hidden="true" />
      <strong className="font-serif text-lg font-semibold text-[#26382b]">Loading review queue</strong>
      <span>Fetching the latest submissions.</span>
    </div>
  )
}

export function QueueError({ message, onRetry }: QueueErrorProps) {
  return (
    <div className="grid min-h-65 place-content-center justify-items-center gap-2.5 border border-[#d8ded6] border-t-0 bg-white/70 text-center text-sm text-[#8c4b3d]" role="alert">
      <strong className="font-serif text-lg font-semibold text-[#26382b]">We couldn&apos;t load the queue</strong>
      <span>{message}</span>
      <button type="button" className="min-h-10 rounded-sm border border-[#a6b7a9] bg-white px-4 text-xs font-bold text-[#355b40] focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

export function QueueEmpty({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="grid min-h-65 place-content-center justify-items-center gap-2.5 border border-[#d8ded6] border-t-0 bg-white/70 text-center text-sm text-[#6d7b70]">
      <strong className="font-serif text-lg font-semibold text-[#26382b]">{hasFilters ? 'No submissions match these filters' : 'The review queue is empty'}</strong>
      <span>
        {hasFilters
          ? 'Try clearing a filter or searching for a different applicant.'
          : 'There are no submissions waiting for review right now.'}
      </span>
    </div>
  )
}
