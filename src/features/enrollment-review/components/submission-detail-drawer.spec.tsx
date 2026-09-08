import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubmissionDetailDrawer } from './submission-detail-drawer'
import type { SubmissionDetail } from '../../../services/enrollment-review/submissions-types'

const mocks = vi.hoisted(() => ({
  detail: undefined as unknown,
  decision: undefined as unknown,
}))

type DecisionError = {
  code: string
  message: string
}

type DecisionMock = {
  isPending: boolean
  isSuccess: boolean
  data: undefined
  error: DecisionError | null
  reset: ReturnType<typeof vi.fn>
  mutate: ReturnType<typeof vi.fn>
}

vi.mock('../../../components/ui/drawer', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerClose: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DrawerFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
  DrawerHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

vi.mock('../hooks/use-submission-detail', () => ({
  useSubmissionDetail: () => mocks.detail,
}))

vi.mock('../hooks/use-submission-decision', () => ({
  useSubmissionDecision: () => mocks.decision,
}))

const submission: SubmissionDetail = {
  id: 'sub_test',
  applicant: { name: 'Test Applicant', email: 'test@example.com' },
  group: { id: 'grp_test', name: 'Test Group' },
  product: 'Test Product',
  coverageAmountCents: 1_000_000,
  submittedAt: '2026-11-01T08:30:00Z',
  effectiveDate: '2027-01-01',
  reviewReason: 'MISSING_INFORMATION',
  priority: 'HIGH',
  status: 'NEEDS_REVIEW',
  employee: {
    employeeId: 'EMP-1',
    dateOfBirth: '1990-01-01',
    phone: '555-0100',
    address: null,
  },
  employment: {
    employmentStatus: 'ACTIVE',
    hireDate: '2020-01-01',
    annualSalaryCents: 5_000_000,
    occupation: 'Tester',
    hoursPerWeek: 40,
  },
  election: {
    planName: 'Test Plan',
    requestedCoverageCents: 1_000_000,
    beneficiaryCount: 1,
    tobaccoUse: false,
  },
  existingCoverage: null,
  reviewSignals: [],
}

function renderDrawer() {
  return render(
    <SubmissionDetailDrawer
      submissionId={submission.id}
      onClose={vi.fn()}
      onDecisionSuccess={vi.fn()}
      onDecisionConflict={vi.fn()}
      onAlreadyDecided={vi.fn()}
    />,
  )
}

function createDecisionMock() {
  const decision: DecisionMock = {
    isPending: false,
    isSuccess: false,
    data: undefined,
    error: null,
    reset: vi.fn(),
    mutate: vi.fn(),
  }
  mocks.decision = decision
  return decision
}

describe('SubmissionDetailDrawer decisions', () => {
  beforeEach(() => {
    mocks.detail = {
      data: submission,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
  })

  it('submits approval without a note', () => {
    const decision = createDecisionMock()
    renderDrawer()

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    expect(decision.mutate).toHaveBeenCalledWith(
      { submissionId: 'sub_test', decision: { decision: 'APPROVE' } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('requires a note and submits a valid Return decision', () => {
    const decision = createDecisionMock()
    renderDrawer()

    fireEvent.click(screen.getByRole('button', { name: 'Return for correction' }))
    const submit = screen.getByRole('button', { name: 'Return submission' })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Correction note'), {
      target: { value: 'Please provide the missing information.' },
    })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)

    expect(decision.mutate).toHaveBeenCalledWith(
      {
        submissionId: 'sub_test',
        decision: {
          decision: 'RETURN',
          note: 'Please provide the missing information.',
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('shows an explicit retry after a temporary failure', () => {
    const decision = createDecisionMock()
    const view = renderDrawer()
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    const options = decision.mutate.mock.calls[0][1]
    options.onError({
      code: 'TEMPORARILY_UNAVAILABLE',
      message: 'Please retry.',
    })
    decision.error = {
      code: 'TEMPORARILY_UNAVAILABLE',
      message: 'Please retry.',
    }
    view.rerender(
      <SubmissionDetailDrawer
        submissionId={submission.id}
        onClose={vi.fn()}
        onDecisionSuccess={vi.fn()}
        onDecisionConflict={vi.fn()}
        onAlreadyDecided={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Retry decision' })).toBeInTheDocument()
  })

  it('uses the conflict callback without using success behavior', () => {
    const decision = createDecisionMock()
    const onConflict = vi.fn()
    render(
      <SubmissionDetailDrawer
        submissionId={submission.id}
        onClose={vi.fn()}
        onDecisionSuccess={vi.fn()}
        onDecisionConflict={onConflict}
        onAlreadyDecided={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    decision.mutate.mock.calls[0][1].onError({
      code: 'REVIEW_CONFLICT',
      submission: { status: 'APPROVED' },
    })

    expect(onConflict).toHaveBeenCalledWith('APPROVED')
  })

  it('uses the already-decided callback for stale records', () => {
    const decision = createDecisionMock()
    const onAlreadyDecided = vi.fn()
    render(
      <SubmissionDetailDrawer
        submissionId={submission.id}
        onClose={vi.fn()}
        onDecisionSuccess={vi.fn()}
        onDecisionConflict={vi.fn()}
        onAlreadyDecided={onAlreadyDecided}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    decision.mutate.mock.calls[0][1].onError({ code: 'ALREADY_DECIDED' })

    expect(onAlreadyDecided).toHaveBeenCalledOnce()
  })
})
