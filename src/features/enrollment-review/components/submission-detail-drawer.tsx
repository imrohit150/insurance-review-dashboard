import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../../components/ui/drawer'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useSubmissionDetail } from '../hooks/use-submission-detail'
import { useSubmissionDecision } from '../hooks/use-submission-decision'
import {
  formatCoverage,
  formatDateTime,
  formatLabel,
} from '../lib/formatters'
import type {
  DecisionRequest,
  ReviewSignal,
} from '../../../services/enrollment-review/submissions-types'

type SubmissionDetailDrawerProps = {
  submissionId: string
  onClose: () => void
  onDecisionSuccess: (status: string) => void
  onDecisionConflict: (status: string) => void
  onAlreadyDecided: () => void
}

function valueOrFallback(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Not provided'
  return String(value)
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-[#e6ebe5] py-3 last:border-b-0">
      <dt className="mb-1 text-[10px] font-bold uppercase tracking-[.8px] text-[#78857b]">{label}</dt>
      <dd className="m-0 wrap-break-word text-sm text-[#304338]">{value}</dd>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#d8ded6] px-5 py-5 first:border-t-0" aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-heading`}>
      <h3 id={`${title.toLowerCase().replaceAll(' ', '-')}-heading`} className="mb-3 font-serif text-xl font-normal text-[#26382b]">{title}</h3>
      {children}
    </section>
  )
}

function Signal({ signal }: { signal: ReviewSignal }) {
  const severityClass = signal.severity === 'CRITICAL' || signal.severity === 'HIGH'
    ? 'border-[#d99b83] bg-[#fff5f0] text-[#8c422f]'
    : 'border-[#d8c58b] bg-[#fffbed] text-[#705b1e]'

  return (
    <li className={`rounded-sm border p-3 ${severityClass}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.8px]">
        <span>{formatLabel(signal.severity)} severity</span>
        <span className="text-current/60">{signal.code}</span>
      </div>
      <p className="mb-2 wrap-break-word text-sm leading-5">{signal.message}</p>
      <p className="m-0 wrap-break-word text-xs text-current/70">Field: {valueOrFallback(signal.field)}</p>
    </li>
  )
}

export function SubmissionDetailDrawer({ submissionId, onClose, onDecisionSuccess, onDecisionConflict, onAlreadyDecided }: SubmissionDetailDrawerProps) {
  const detail = useSubmissionDetail(submissionId)
  const decision = useSubmissionDecision()
  const [returnNote, setReturnNote] = useState('')
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [lastDecision, setLastDecision] = useState<DecisionRequest | null>(null)

  useEffect(() => {
    setReturnNote('')
    setShowReturnForm(false)
    setLastDecision(null)
    decision.reset()
  }, [submissionId])

  const isFinal = detail.data?.status === 'APPROVED' || detail.data?.status === 'RETURNED'
  const noteTooLong = returnNote.length > 500
  const canSubmitReturn = returnNote.trim().length > 0 && !noteTooLong
  const decisionError = decision.error

  const submitDecision = (request: DecisionRequest) => {
    setLastDecision(request)
    decision.mutate(
      { submissionId, decision: request },
      {
        onSuccess: (submission) => onDecisionSuccess(submission.status),
        onError: (error) => {
          if (error.code === 'REVIEW_CONFLICT') {
            onDecisionConflict(error.submission?.status ?? 'decided')
          } else if (error.code === 'ALREADY_DECIDED') {
            onAlreadyDecided()
          }
        },
      },
    )
  }

  const approve = () => {
    submitDecision({ decision: 'APPROVE' })
  }

  const returnForCorrection = () => {
    if (!canSubmitReturn) return
    submitDecision({ decision: 'RETURN', note: returnNote.trim() })
  }

  return (
    <Drawer open={true} onOpenChange={(open) => { if (!open) onClose() }} swipeDirection="right">
      <DrawerContent aria-describedby="submission-detail-description">
        <DrawerHeader className="border-b border-[#d8ded6] bg-[#fffdf8]">
          <DrawerTitle>Submission details</DrawerTitle>
          <DrawerDescription id="submission-detail-description">
            Review the enrollment information before recording a decision.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {detail.isLoading && (
            <div className="grid min-h-65 place-content-center justify-items-center gap-3 px-5 text-center text-sm text-[#6d7b70]" role="status" aria-live="polite">
              <span className="h-5.5 w-5.5 animate-spin rounded-full border-2 border-[#cbd8cc] border-t-[#42614a]" aria-hidden="true" />
              Loading submission details...
            </div>
          )}

          {detail.isError && (
            <div className="grid min-h-65 place-content-center justify-items-center gap-3 px-5 text-center" role="alert">
              <strong className="font-serif text-lg font-semibold text-[#26382b]">Details could not be loaded</strong>
              <span className="text-sm text-[#8c4b3d]">{detail.error instanceof Error ? detail.error.message : 'Please try again.'}</span>
              <button type="button" onClick={() => void detail.refetch()} className="min-h-10 rounded-sm border border-[#a6b7a9] bg-white px-4 text-xs font-bold text-[#355b40] focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2">Try again</button>
            </div>
          )}

          {detail.data && (
            <>
              <DetailSection title="Review summary">
                <dl>
                  <DetailField label="Submission ID" value={detail.data.id} />
                  <DetailField label="Applicant" value={valueOrFallback(detail.data.applicant?.name)} />
                  <DetailField label="Email" value={valueOrFallback(detail.data.applicant?.email)} />
                  <DetailField label="Employer group" value={valueOrFallback(detail.data.group?.name)} />
                  <DetailField label="Product" value={valueOrFallback(detail.data.product)} />
                  <DetailField label="Requested coverage" value={formatCoverage(detail.data.coverageAmountCents)} />
                  <DetailField label="Submitted" value={formatDateTime(detail.data.submittedAt)} />
                  <DetailField label="Effective date" value={formatDateTime(detail.data.effectiveDate)} />
                  <DetailField label="Reason" value={formatLabel(detail.data.reviewReason)} />
                  <DetailField label="Status" value={formatLabel(detail.data.status)} />
                </dl>
              </DetailSection>

              <DetailSection title="Review signals">
                {detail.data.reviewSignals?.length ? (
                  <ul className="m-0 grid list-none gap-3 p-0">
                    {detail.data.reviewSignals.map((signal, index) => <Signal key={`${signal.code}-${index}`} signal={signal} />)}
                  </ul>
                ) : (
                  <p className="m-0 text-sm text-[#6d7b70]">No review signals provided.</p>
                )}
              </DetailSection>

              <DetailSection title="Employee">
                <dl>
                  <DetailField label="Employee ID" value={valueOrFallback(detail.data.employee?.employeeId)} />
                  <DetailField label="Date of birth" value={formatDateTime(detail.data.employee?.dateOfBirth)} />
                  <DetailField label="Phone" value={valueOrFallback(detail.data.employee?.phone)} />
                  <DetailField label="Address" value={detail.data.employee?.address ? [detail.data.employee.address.line1, detail.data.employee.address.line2, [detail.data.employee.address.city, detail.data.employee.address.state, detail.data.employee.address.postalCode].filter(Boolean).join(', ')].filter(Boolean).join(', ') || 'Not provided' : 'Not provided'} />
                </dl>
              </DetailSection>

              <DetailSection title="Employment">
                <dl>
                  <DetailField label="Status" value={formatLabel(detail.data.employment?.employmentStatus)} />
                  <DetailField label="Hire date" value={formatDateTime(detail.data.employment?.hireDate)} />
                  <DetailField label="Termination date" value={formatDateTime(detail.data.employment?.terminationDate)} />
                  <DetailField label="Annual salary" value={formatCoverage(detail.data.employment?.annualSalaryCents)} />
                  <DetailField label="Occupation" value={valueOrFallback(detail.data.employment?.occupation)} />
                  <DetailField label="Hours per week" value={valueOrFallback(detail.data.employment?.hoursPerWeek)} />
                </dl>
              </DetailSection>

              <DetailSection title="Election">
                <dl>
                  <DetailField label="Plan" value={valueOrFallback(detail.data.election?.planName)} />
                  <DetailField label="Requested coverage" value={formatCoverage(detail.data.election?.requestedCoverageCents)} />
                  <DetailField label="Beneficiaries" value={valueOrFallback(detail.data.election?.beneficiaryCount)} />
                  <DetailField label="Tobacco use" value={detail.data.election?.tobaccoUse === null || detail.data.election?.tobaccoUse === undefined ? 'Not provided' : detail.data.election.tobaccoUse ? 'Yes' : 'No'} />
                </dl>
              </DetailSection>

              <DetailSection title="Existing coverage">
                {detail.data.existingCoverage ? (
                  <dl>
                    <DetailField label="Coverage amount" value={formatCoverage(detail.data.existingCoverage.coverageAmountCents)} />
                    <DetailField label="Effective date" value={formatDateTime(detail.data.existingCoverage.effectiveDate)} />
                    <DetailField label="Policy number" value={valueOrFallback(detail.data.existingCoverage.policyNumber)} />
                  </dl>
                ) : (
                  <p className="m-0 text-sm text-[#6d7b70]">No existing coverage.</p>
                )}
              </DetailSection>
            </>
          )}
        </div>

        <DrawerFooter className="border-t border-[#d8ded6] bg-[#fffdf8]">
          {decisionError && (
            <div className="rounded-sm border border-[#d99b83] bg-[#fff5f0] p-3 text-sm text-[#8c422f]" role="alert">
              <strong className="block font-semibold">
                {decisionError.code === 'REVIEW_CONFLICT' ? 'This submission was decided by another reviewer.' : 'Decision could not be saved.'}
              </strong>
              <span className="mt-1 block">{decisionError.message}</span>
              {decisionError.code === 'TEMPORARILY_UNAVAILABLE' && <span className="mt-1 block text-xs">Your note and action are preserved. Try again.</span>}
              {decisionError.code === 'TEMPORARILY_UNAVAILABLE' && lastDecision && (
                <button
                  type="button"
                  onClick={() => submitDecision(lastDecision)}
                  disabled={decision.isPending}
                  className="mt-3 min-h-10 rounded-sm border border-[#8c422f] bg-white px-4 text-xs font-bold text-[#8c422f] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2"
                >
                  {decision.isPending ? 'Retrying...' : 'Retry decision'}
                </button>
              )}
            </div>
          )}

          {decision.isSuccess && (
            <div className="rounded-sm border border-[#b7cfb8] bg-[#f1f8f0] p-3 text-sm text-[#355b40]" role="status" aria-live="polite">
              Decision saved as <strong>{formatLabel(decision.data.status)}</strong>.
            </div>
          )}

          {!isFinal && detail.data && !decision.isSuccess && (
            <>
              {showReturnForm && (
                <div className="grid gap-2">
                  <label htmlFor="return-note" className="text-[10px] font-bold uppercase tracking-[.8px] text-[#617064]">Correction note</label>
                  <textarea
                    id="return-note"
                    value={returnNote}
                    onChange={(event) => setReturnNote(event.target.value)}
                    disabled={decision.isPending}
                    maxLength={500}
                    rows={4}
                    aria-describedby="return-note-help"
                    className="w-full resize-y rounded-sm border border-[#cbd5cc] bg-white p-3 text-sm text-[#18231e] outline-none focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2 disabled:bg-[#f2f4f0]"
                    placeholder="Explain what needs to be corrected"
                  />
                  <div id="return-note-help" className={`flex justify-between text-xs ${noteTooLong ? 'text-[#8c422f]' : 'text-[#78857b]'}`}>
                    <span>{returnNote.trim().length === 0 ? 'A note is required.' : noteTooLong ? 'Note must be 500 characters or fewer.' : 'Add clear guidance for the submitter.'}</span>
                    <span>{returnNote.length}/500</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={returnForCorrection} disabled={!canSubmitReturn || decision.isPending} className="min-h-10 flex-1 rounded-sm border border-[#355b40] bg-[#355b40] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2">
                      {decision.isPending ? 'Saving...' : 'Return submission'}
                    </button>
                    <button type="button" onClick={() => setShowReturnForm(false)} disabled={decision.isPending} className="min-h-10 rounded-sm border border-[#a6b7a9] bg-white px-4 text-xs font-bold text-[#355b40] disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2">Cancel</button>
                  </div>
                </div>
              )}
              {!showReturnForm && (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={approve} disabled={decision.isPending} className="min-h-10 rounded-sm border border-[#355b40] bg-[#355b40] px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2">
                    {decision.isPending ? 'Saving...' : 'Approve'}
                  </button>
                  <button type="button" onClick={() => setShowReturnForm(true)} disabled={decision.isPending} className="min-h-10 rounded-sm border border-[#a24e32] bg-white px-3 text-xs font-bold text-[#8c422f] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2">Return for correction</button>
                </div>
              )}
            </>
          )}

          {isFinal && !decision.isSuccess && (
            <div className="text-sm text-[#6d7b70]">This submission is no longer actionable.</div>
          )}

          <DrawerClose onClick={onClose} className="min-h-10 rounded-sm border border-[#a6b7a9] bg-white px-4 text-xs font-bold text-[#355b40] focus-visible:outline-3 focus-visible:outline-[#b5d6b9] focus-visible:outline-offset-2">Close details</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
