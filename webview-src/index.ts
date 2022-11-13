import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'

interface ProgressPayload {
  id: number
  progress: number
  total: number
}

type ProgressHandler = (progress: number, total: number) => void
const handlers: Map<number, ProgressHandler> = new Map()
let listening = false

function listenToDownloadEventIfNeeded(): Promise<void> {
  if (listening) {
    return Promise.resolve()
  }
  return appWindow
    .listen<ProgressPayload>('download://progress', ({ payload }) => {
      const handler = handlers.get(payload.id)
      if (handler !== void 0) {
        handler(payload.progress, payload.total)
      }
    })
    .then(() => {
      listening = true
    })
}

export default async function download(
  url: string,
  filePath: string,
  progressHandler?: ProgressHandler,
  headers?: Map<string, string>
): Promise<void> {
  const ids = new Uint32Array(1)
  window.crypto.getRandomValues(ids)
  const id = ids[0]

  if (progressHandler) {
    handlers.set(id, progressHandler)
  }

  await listenToDownloadEventIfNeeded()

  await invoke('plugin:download|download', {
    id,
    url,
    filePath,
    headers: headers ?? {}
  })
}
