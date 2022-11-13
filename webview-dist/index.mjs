import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

const handlers = new Map();
let listening = false;
function listenToDownloadEventIfNeeded() {
    if (listening) {
        return Promise.resolve();
    }
    return appWindow
        .listen('download://progress', ({ payload }) => {
        const handler = handlers.get(payload.id);
        if (handler !== void 0) {
            handler(payload.progress, payload.total);
        }
    })
        .then(() => {
        listening = true;
    });
}
async function download(url, filePath, progressHandler, headers) {
    const ids = new Uint32Array(1);
    window.crypto.getRandomValues(ids);
    const id = ids[0];
    if (progressHandler) {
        handlers.set(id, progressHandler);
    }
    await listenToDownloadEventIfNeeded();
    await invoke('plugin:download|download', {
        id,
        url,
        filePath,
        headers: headers !== null && headers !== void 0 ? headers : {}
    });
}

export { download as default };
