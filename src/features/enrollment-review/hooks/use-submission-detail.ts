import { useQuery } from '@tanstack/react-query'
import { getSubmissionDetail } from '../../../services/enrollment-review/submissions-api'

export const submissionDetailQueryKey = (submissionId: string) =>
  ['submission', submissionId] as const

export function useSubmissionDetail(submissionId: string | null) {
  return useQuery({
    queryKey: submissionDetailQueryKey(submissionId ?? ''),
    queryFn: ({ signal }) => getSubmissionDetail(submissionId!, signal),
    enabled: submissionId !== null,
  })
}
