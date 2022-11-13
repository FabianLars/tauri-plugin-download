<script lang="ts">
  import download from 'tauri-plugin-download-api'
  import { save as saveDialog } from '@tauri-apps/api/dialog'

  let response = ''
  let totalProgress = 0
  let total = 0

  function updateResponse(returnValue) {
    response +=
      `[${new Date().toLocaleTimeString()}] ` +
      (typeof returnValue === 'string'
        ? returnValue
        : JSON.stringify(returnValue)) +
      '<br>'
    console.log(returnValue)
  }

  async function _execute() {
    // wait for current one to finish
    if (totalProgress !== total) {
      return
    }
    const path = await saveDialog()
    if (typeof path === 'string') {
      download('https://speed.hetzner.de/100MB.bin', path, (progress, t) => {
        console.log(progress, t)
        totalProgress += progress
        total = t
        updateResponse(`Progress: ${totalProgress}, total: ${total}`)
        if (totalProgress === total) {
          totalProgress = total = 0
        }
      })
        .then(updateResponse)
        .catch((e) => {
          updateResponse(e)
          totalProgress = total = 0
        })
    }
  }
</script>

<div>
  <button on:click={_execute}>Execute</button>
  <div>{@html response}</div>
</div>
