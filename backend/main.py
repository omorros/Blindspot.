"""
FastAPI Application — The HTTP server that connects frontend to backend.

KEY CONCEPTS:

1. FASTAPI: A modern Python web framework. It's like Express.js for Python,
   but with automatic API docs, type validation, and async support built-in.

2. CORS (Cross-Origin Resource Sharing):
   The frontend runs on localhost:3000, the backend on localhost:8000.
   Browsers block requests between different "origins" (port = different origin).
   CORS middleware tells the browser "it's OK, allow requests from :3000".

3. SSE (Server-Sent Events):
   Normal HTTP: client asks, server responds once, connection closes.
   SSE: client asks, server keeps the connection open and PUSHES data over time.
   Perfect for our use case — we stream agent updates as they happen.
   The browser uses EventSource API to receive these.

4. ENDPOINTS:
   GET  /health     → "am I alive?" check
   POST /analyze    → start analysis, returns SSE stream of events
"""
import asyncio
import json
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from backend.coordinator import run_analysis
from backend.models import AnalyzeRequest

# ── Setup Logging ───────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Create FastAPI App ──────────────────────────────────────────
app = FastAPI(
    title="Blindspot",
    description="Multi-agent market gap finder powered by Bright Data + Claude",
    version="1.0.0",
)

# ── CORS Middleware ─────────────────────────────────────────────
# Without this, the browser would block our frontend from talking to our backend.
# In production you'd restrict origins, but for a hackathon demo, allow everything.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow any origin (frontend URL)
    allow_credentials=True,
    allow_methods=["*"],        # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],        # Allow all headers
)


# ── Health Check ────────────────────────────────────────────────
@app.get("/health")
async def health():
    """
    Simple health check endpoint.
    Used to verify the server is running before starting analysis.
    Returns 200 OK with a JSON body.
    """
    return {"status": "ok", "service": "blindspot"}


# ── Main Analysis Endpoint ──────────────────────────────────────
@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """
    Start a market gap analysis. Returns a Server-Sent Events stream.

    HOW SSE WORKS HERE:
    1. Frontend sends POST with {"query": "pet tech in the UK"}
    2. We return an EventSourceResponse (not a normal JSON response)
    3. The connection stays open
    4. As agents work, we push events through the connection:
       data: {"type": "activity", "data": {"agent": "scout", "message": "Searching..."}}
       data: {"type": "gap", "data": {"id": 1, "title": "Insurance comparison", ...}}
       data: {"type": "done", "data": {}}
    5. Frontend receives each event instantly and updates the UI
    6. On "done", the frontend closes the connection

    The `event_generator` below is an async generator that yields events.
    EventSourceResponse handles the SSE protocol (formatting, keep-alive, etc.)
    """
    logger.info(f"Analysis request: {request.query}")

    async def event_generator():
        """
        Wraps run_analysis() and formats events for SSE protocol.

        Each yielded dict becomes an SSE event:
        - "event": the event name (frontend can filter by this)
        - "data": the JSON payload
        """
        try:
            async for event_json in run_analysis(request.query):
                # Parse the event to extract type for SSE event name
                event = json.loads(event_json)
                event_type = event.get("type", "message")

                yield {
                    "event": event_type,
                    "data": event_json,
                }

                # Small delay between events so the activity feed
                # doesn't dump everything at once — feels more alive
                # (Improvement 7: stagger events)
                await asyncio.sleep(0.15)

        except Exception as e:
            logger.error(f"Analysis stream error: {e}")
            yield {
                "event": "error",
                "data": json.dumps({
                    "type": "error",
                    "data": {"message": str(e)[:500]},
                }),
            }

    return EventSourceResponse(event_generator())


# ── Run with: uvicorn backend.main:app --reload --port 8000 ────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
