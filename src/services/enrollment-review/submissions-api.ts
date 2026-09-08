import axios from 'axios'
import type {
  ApiErrorBody,
  DecisionRequest,
  SubmissionDetail,
  SubmissionListResponse,
  SubmissionQuery,
} from './submissions-types'

export const submissionsApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export class SubmissionsApiError extends Error {
  readonly status: number | undefined
  readonly code: string
  readonly details: ApiErrorBody['error']['details']
  readonly submission: SubmissionDetail | undefined

  constructor(
    message: string,
    options: {
      status?: number
      code?: string
      details?: ApiErrorBody['error']['details']
      submission?: SubmissionDetail
    } = {},
  ) {
    super(message)
    this.name = 'SubmissionsApiError'
    this.status = options.status
    this.code = options.code ?? 'UNKNOWN_ERROR'
    this.details = options.details
    this.submission = options.submission
  }
}

function toApiError(error: unknown): SubmissionsApiError {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return new SubmissionsApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred.',
    )
  }

  const response = error.response
  const body = response?.data
  return new SubmissionsApiError(
    body?.error?.message ?? error.message ?? 'The request failed.',
    {
      status: response?.status,
      code: body?.error?.code,
      details: body?.error?.details,
      submission: body?.submission,
    },
  )
}

async function request<T>(requestPromise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await requestPromise
    return response.data
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error
    }
    throw toApiError(error)
  }
}

export function getSubmissions(
  query: SubmissionQuery,
  signal?: AbortSignal,
): Promise<SubmissionListResponse> {
  return request(
    submissionsApi.get<SubmissionListResponse>('/submissions', {
      params: query,
      signal,
    }),
  )
}

export function getSubmissionDetail(
  submissionId: string,
  signal?: AbortSignal,
): Promise<SubmissionDetail> {
  return request(
    submissionsApi.get<SubmissionDetail>(
      `/submissions/${encodeURIComponent(submissionId)}`,
      { signal },
    ),
  )
}

export function recordSubmissionDecision(
  submissionId: string,
  decision: DecisionRequest,
  signal?: AbortSignal,
): Promise<SubmissionDetail> {
  return request(
    submissionsApi.post<SubmissionDetail>(
      `/submissions/${encodeURIComponent(submissionId)}/decision`,
      decision,
      { signal },
    ),
  )
}