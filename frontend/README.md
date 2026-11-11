# NexusAI — AI Intelligence & Trust Platform

A SaaS enterprise analytics and trust platform for evaluating autonomous AI agents and transcribing executive meeting intelligence.

---

## Technology Stack
- **Framework & Bundler:** React 18 + Vite 5
- **UI & Grid System:** Bootstrap 5 & React-Bootstrap
- **Icons:** Lucide React & Bootstrap Icons
- **Routing:** React Router DOM v6
- **Data Visualization:** Recharts
- **HTTP Client & Services:** Axios (with simulated verification latency & fallback)
- **Styling:** Custom Enterprise CSS Design System (Zero Tailwind CSS)

---

## Workspaces & Architecture

### Workspace 1: Agent Intelligence & Benchmarking
- **AgentBench (`/agent-bench`):** Standardized evaluation suite matrix. Model selection (Nexus-Agent v2.1, GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3 70B, Mistral Large 2), parameter tuning (temperature, concurrency, sample size), and live terminal stream.
- **Benchmark Results (`/benchmark-results`):** Multi-dimensional capability radar chart, accuracy vs. latency trade-off analysis, filterable empirical leaderboard, and test run drilldown audit modal.
- **Agent Trace (`/agent-trace`):** Deep observability into step-by-step agent execution (Intent parsing, RAG vector retrieval, chain-of-thought planning, tool invocation, hallucination verification, and output synthesis).

### Workspace 2: Meeting Intelligence & Trust
- **Meeting Intelligence (`/meeting-intelligence`):** Audio & transcript ingestion, multi-speaker diarization (Whisper v3 + PyAnnote 3.1), sentiment tracking, and calendar platform integration.
- **Briefing Results (`/briefing-results`):** Interactive audio playback scrubber with synced timestamps, executive synthesis TL;DR, ratified decisions log, interactive action items tracker with bi-directional Jira/Slack sync simulation, and discussion topic breakdown.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
npm run preview
```
