import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, it } from 'vitest'
import {
  getSubmissionDetail,
  getSubmissions,
  recordSubmissionDecision,
  submissionsApi,
} from './submissions-api'
import type { SubmissionQuery } from './submissions-types'

const query: SubmissionQuery = {
  query: 'Alex',
  group: 'grp_northstar',
  reason: 'COVERAGE_MISMATCH',
  sort: 'priority_desc',
}

const mock = new AxiosMockAdapter(submissionsApi)

afterEach(() => mock.reset())

describe('submissions API', () => {
  it('returns list data and sends query parameters', async () => {
    mock.onGet('/submissions').reply((config) => {
      expect(config.params).toEqual(query)
      return [200, { items: [], total: 0 }]
    })

    await expect(getSubmissions(query)).resolves.toEqual({ items: [], total: 0 })
  })

  it('encodes detail IDs and returns detail data', async () => {
    mock.onGet('/submissions/sub%2F1042').reply(200, { id: 'sub/1042' })

    await expect(getSubmissionDetail('sub/1042')).resolves.toEqual({ id: 'sub/1042' })
  })

  it('normalizes structured service errors', async () => {
    mock.onPost('/submissions/sub_1052/decision').reply(503, {
      error: {
        code: 'TEMPORARILY_UNAVAILABLE',
        message: 'Please retry.',
      },
    })

    await expect(
      recordSubmissionDecision('sub_1052', { decision: 'APPROVE' }),
    ).rejects.toMatchObject({
      status: 503,
      code: 'TEMPORARILY_UNAVAILABLE',
      message: 'Please retry.',
    })
  })

  it('preserves conflict submissions and validation details', async () => {
    mock.onPost('/submissions/sub_1056/decision').reply(409, {
      error: { code: 'REVIEW_CONFLICT', message: 'Already reviewed.' },
      submission: { id: 'sub_1056', status: 'APPROVED' },
    })

    await expect(
      recordSubmissionDecision('sub_1056', { decision: 'RETURN', note: 'Fix it' }),
    ).rejects.toMatchObject({
      code: 'REVIEW_CONFLICT',
      submission: { id: 'sub_1056', status: 'APPROVED' },
    })

    mock.onPost('/submissions/sub_1042/decision').reply(422, {
      error: {
        code: 'NOTE_REQUIRED',
        message: 'A note is required.',
        details: { field: 'note' },
      },
    })

    await expect(
      recordSubmissionDecision('sub_1042', { decision: 'RETURN' }),
    ).rejects.toMatchObject({
      code: 'NOTE_REQUIRED',
      details: { field: 'note' },
    })
  })

  it('recognizes canceled requests', async () => {
    const controller = new AbortController()
    controller.abort()
    mock.onGet('/submissions').reply(() => {
      throw new Error('should not be called')
    })

    await expect(getSubmissions(query, controller.signal)).rejects.toSatisfy(
      (error) => axios.isCancel(error),
    )
  })
})
