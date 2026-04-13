/// Stream utilities — re-exported for convenience.
/// The actual streaming logic lives in client.rs (stream_completion).
/// This module exists for future extension, e.g. cancellation tokens,
/// back-pressure, or alternative transport (WebSocket).

pub use super::client::stream_completion;