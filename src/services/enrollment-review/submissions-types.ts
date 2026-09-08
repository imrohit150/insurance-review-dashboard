export type SubmissionPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

export type SubmissionStatus =
  | 'NEEDS_REVIEW'
  | 'AWAITING_DOCUMENTS'
  | 'APPROVED'
  | 'RETURNED'
  | (string & {})

export type ReviewSignalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type DecisionType = 'APPROVE' | 'RETURN'

export type SubmissionListSort =
  | 'priority_desc'
  | 'submitted_desc'
  | 'submitted_asc'
  | 'applicant_asc'

export type Applicant = {
  name: string | null
  email: string | null
}

export type EmployerGroup = {
  id: string | null
  name: string | null
} | null

export type Address = {
  line1: string | null
  line2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
} | null

export type Employee = {
  employeeId: string | null
  dateOfBirth: string | null
  phone: string | null
  address: Address
}

export type Employment = {
  employmentStatus: string | null
  hireDate: string | null
  terminationDate?: string | null
  annualSalaryCents: number | null
  occupation: string | null
  hoursPerWeek: number | null
}

export type Election = {
  planName: string | null
  requestedCoverageCents: number | null
  beneficiaryCount: number | null
  tobaccoUse: boolean | null
}

export type ExistingCoverage = {
  coverageAmountCents: number | null
  effectiveDate: string | null
  policyNumber: string | null
} | null

export type ReviewSignal = {
  code: string
  severity: ReviewSignalSeverity | (string & {})
  field: string | null
  message: string
}

export type SubmissionQueueItem = {
  id: string
  applicant: Applicant | null
  group: EmployerGroup
  product: string | null
  coverageAmountCents: number | null
  submittedAt: string | null
  effectiveDate: string | null
  reviewReason: string | null
  priority: SubmissionPriority | (string & {})
  status: SubmissionStatus
}

export type SubmissionDecision = {
  type: DecisionType
  note: string | null
  reviewedBy: string | null
}

export type SubmissionDetail = SubmissionQueueItem & {
  employee: Employee | null
  employment: Employment | null
  election: Election | null
  existingCoverage: ExistingCoverage
  reviewSignals: ReviewSignal[] | null
  decision?: SubmissionDecision | null
  decidedAt?: string | null
}

export type SubmissionListResponse = {
  items: SubmissionQueueItem[]
  total: number
}

export type DecisionRequest = {
  decision: DecisionType
  note?: string
}

export type ApiErrorDetails = {
  field?: string
  maximum?: number
  [key: string]: unknown
}

export type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: ApiErrorDetails
  }
  submission?: SubmissionDetail
}

export type SubmissionQuery = {
  query: string
  group: string
  reason: string
  sort: SubmissionListSort
}