import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth'
import { couponHandlers } from './handlers/coupons'

export const worker = setupWorker(
  ...authHandlers,
  ...couponHandlers
);