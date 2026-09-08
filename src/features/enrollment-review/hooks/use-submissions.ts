import { useQuery } from '@tanstack/react-query'
import { getSubmissions } from '../../../services/enrollment-review/submissions-api'
import type { SubmissionQuery } from '../../../services/enrollment-review/submissions-types'

export const submissionsQueryKey = (
  query: SubmissionQuery,
) => ['submissions', query] as const

export function useSubmissions(query: SubmissionQuery) {
  return useQuery({
    queryKey: submissionsQueryKey(query),
    queryFn: ({ signal }) => getSubmissions(query, signal),
  })
}