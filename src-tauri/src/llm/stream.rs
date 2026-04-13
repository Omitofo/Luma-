//! Stream utilities module.
//! The actual streaming logic lives in client.rs (stream_completion).
//! This module exists for future extension such as cancellation tokens,
//! back-pressure handling, or alternative transport layers.