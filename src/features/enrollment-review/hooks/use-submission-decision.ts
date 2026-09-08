import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  recordSubmissionDecision,
  SubmissionsApiError,
} from '../../../services/enrollment-review/submissions-api'
import type {
  DecisionRequest,
  SubmissionDetail,
} from '../../../services/enrollment-review/submissions-types'
import { submissionDetailQueryKey } from './use-submission-detail'

type DecisionVariables = {
  submissionId: string
  decision: DecisionRequest
}

export function useSubmissionDecision() {
  const queryClient = useQueryClient()

  return useMutation<SubmissionDetail, SubmissionsApiError, DecisionVariables>({
    mutationFn: ({ submissionId, decision }) =>
      recordSubmissionDecision(submissionId, decision),
    onSuccess: (submission) => {
      queryClient.setQueryData(
        submissionDetailQueryKey(submission.id),
        submission,
      )
      void queryClient.invalidateQueries({ queryKey: ['submissions'] })
    },
    onError: (error) => {
      if (error.submission) {
        queryClient.setQueryData(
          submissionDetailQueryKey(error.submission.id),
          error.submission,
        )
        void queryClient.invalidateQueries({ queryKey: ['submissions'] })
      }
    },
  })
}