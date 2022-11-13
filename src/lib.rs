use futures_util::StreamExt;
use serde::{ser::Serializer, Serialize};
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Runtime, Window,
};
use tokio::{fs::File, io::AsyncWriteExt};

use std::collections::HashMap;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Request(#[from] reqwest::Error),
    #[error("{0}")]
    Other(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Clone, Serialize)]
struct ProgressPayload {
    id: u32,
    progress: u64,
    total: u64,
}
#[command]
async fn download<R: Runtime>(
    window: Window<R>,
    id: u32,
    url: &str,
    file_path: &str,
    headers: HashMap<String, String>,
) -> Result<u32, Error> {
    let client = reqwest::Client::new();
    let mut req = client.get(url);
    for (key, value) in headers {
        req = req.header(&key, value);
    }
    let res = req.send().await?;
    let total = res
        .content_length()
        .ok_or_else(|| Error::Other(format!("Failed to get content length from '{}'", url)))?;

    let mut file = File::create(file_path).await?;
    let mut stream = res.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        file.write_all(&chunk).await?;
        let _ = window.emit(
            "download://progress",
            ProgressPayload {
                id,
                progress: chunk.len() as u64,
                total,
            },
        );
    }

    Ok(id)
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("download")
        .invoke_handler(tauri::generate_handler![download])
        .build()
}
