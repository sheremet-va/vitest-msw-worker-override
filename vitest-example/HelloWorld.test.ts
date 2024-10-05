import { expect, test, vi } from 'vitest'
import { page } from '@vitest/browser/context'
import HelloWorld from './HelloWorld.js'
import { setupWorker } from 'msw/browser'
import { http } from 'msw'
import { mocked } from './test.js'

// this line initiates Vitest MSW instance
// if this is removed, the "setupWorker" in the test is much faster
vi.mock('./test.js', () => {
  return {
    mocked: true,
  }
})

test('renders name', async () => {
  const parent = HelloWorld({ name: 'Vitest' })
  document.body.appendChild(parent)

  const element = page.getByText('Hello Vitest!')
  await expect.element(element).toBeInTheDocument()

  // this takes additional 1s if there is a "vi.mock"
  // this is much faster if Vitest didn't initiate its own MSW instance
  const worker = setupWorker(
    http.get('/api/hello', () => {
      return new Response(JSON.stringify({ name: 'Vitest' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    })
  )
  await worker.start({
    quiet: true,
  })

  expect(mocked).toBe(true)
})
