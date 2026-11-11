/**
 * NexusAI Enterprise Platform - Demo & Benchmark Mock Data
 * Notice: All benchmark metrics and meeting traces are simulated realistic demo datasets
 * for evaluating UI, observability pipelines, and UX flows prior to live backend streaming.
 */

export const PLATFORM_STATS = {
  activeWorkspaceCount: 2,
  overallTrustScore: 98.4,
  trustScoreDelta: '+1.2%',
  totalAgentEvaluations: 1482,
  evaluationsDelta: '+14.5%',
  hallucinationPreventionRate: 99.1,
  hallucinationRateDelta: '+0.4%',
  avgAgentLatencyMs: 342,
  latencyDelta: '-18ms',
  processedMeetings: 124,
  meetingsDelta: '+18%',
  actionItemsIdentified: 842,
  actionItemsCompleted: 614,
  decisionConsensusRate: 96.8,
  activeGuardrails: 18,
  systemStatus: 'Optimal (All nodes healthy)',
  lastHealthCheck: '2 minutes ago'
};

export const AVAILABLE_MODELS = [
  { id: 'nexus-agent-v2.1', name: 'Nexus-Agent v2.1 (Fine-tuned)', provider: 'NexusAI Enterprise', type: 'Agentic Specialist', trustScore: 98.6, status: 'Recommended', color: '#2563eb' },
  { id: 'gpt-4o-enterprise', name: 'GPT-4o Enterprise', provider: 'OpenAI', type: 'General Frontier', trustScore: 97.4, status: 'Active', color: '#10a37f' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'Reasoning Specialist', trustScore: 98.1, status: 'Active', color: '#d97706' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', type: 'Long-Context Multimodal', trustScore: 97.8, status: 'Active', color: '#8b5cf6' },
  { id: 'llama-3-70b-instruct', name: 'Llama 3 70B Instruct', provider: 'Meta (Open Source)', type: 'Self-Hosted Sovereign', trustScore: 93.9, status: 'Active', color: '#0284c7' },
  { id: 'mistral-large-2', name: 'Mistral Large 2', provider: 'Mistral AI', type: 'High Efficiency', trustScore: 94.2, status: 'Active', color: '#f97316' }
];

export const BENCHMARK_SUITES = [
  {
    id: 'suite-tool-use',
    name: 'Tool Calling & Multi-API Orchestration',
    category: 'Agentic Tooling',
    testCasesCount: 250,
    description: 'Evaluates zero-shot tool selection, argument hallucination rate, nested payload accuracy, and error recovery in distributed microservices.',
    lastRunDate: '2026-11-08',
    passRate: 97.2,
    avgLatency: '320ms',
    riskLevel: 'Low'
  },
  {
    id: 'suite-reasoning',
    name: 'Multi-hop Financial & Strategic Reasoning',
    category: 'Cognitive Reasoning',
    testCasesCount: 180,
    description: 'Complex multi-step financial arithmetic, regulatory cross-referencing, causal chain integrity, and constraint-guided planning.',
    lastRunDate: '2026-11-07',
    passRate: 95.8,
    avgLatency: '540ms',
    riskLevel: 'Low'
  },
  {
    id: 'suite-hallucination',
    name: 'Context Grounding & Hallucination Defense',
    category: 'Faithfulness & Trust',
    testCasesCount: 300,
    description: 'Measures model tendency to invent facts when context is missing, adversarial traps, and adherence to negative constraints.',
    lastRunDate: '2026-11-08',
    passRate: 98.9,
    avgLatency: '290ms',
    riskLevel: 'Verified'
  },
  {
    id: 'suite-safety',
    name: 'Red-Teaming, Prompt Injection & Guardrails',
    category: 'Trust & Safety',
    testCasesCount: 420,
    description: 'Direct & indirect prompt injection attacks, PII exfiltration traps, enterprise boundary enforcement, and unsafe execution prevention.',
    lastRunDate: '2026-11-06',
    passRate: 99.4,
    avgLatency: '180ms',
    riskLevel: 'Verified'
  },
  {
    id: 'suite-long-context',
    name: 'Long-Context RAG Retrieval (128k Tokens)',
    category: 'Context Window',
    testCasesCount: 120,
    description: 'Needle-in-a-haystack document extraction, multi-document synthesis, and contradiction detection across 128k token corpora.',
    lastRunDate: '2026-11-05',
    passRate: 96.1,
    avgLatency: '820ms',
    riskLevel: 'Medium'
  },
  {
    id: 'suite-sql-resilience',
    name: 'SQL Generation & DB Boundary Resilience',
    category: 'Data Engineering',
    testCasesCount: 160,
    description: 'Schema parsing accuracy, prevention of destructive SQL queries (DROP, TRUNCATE), index optimization adherence, and parameterized queries.',
    lastRunDate: '2026-11-04',
    passRate: 98.2,
    avgLatency: '360ms',
    riskLevel: 'Verified'
  }
];

export const BENCHMARK_RESULTS = [
  {
    id: 'RUN-2026-904',
    modelId: 'nexus-agent-v2.1',
    modelName: 'Nexus-Agent v2.1',
    suiteId: 'suite-tool-use',
    suiteName: 'Tool Calling & Multi-API Orchestration',
    status: 'Verified',
    trustScore: 98.8,
    accuracy: 98.4,
    faithfulness: 99.2,
    latencyP95: 312,
    costPer1k: 0.0042,
    safetyPassRate: 100.0,
    sampleSize: 250,
    runTimestamp: '2026-11-08 19:42 UTC',
    testedBy: 'Automated CI/CD Pipeline #4829',
    summary: 'Exemplary tool argument fidelity with zero schema hallucination. Rapid recovery on injected API 500 fallback.'
  },
  {
    id: 'RUN-2026-903',
    modelId: 'claude-3-5-sonnet',
    modelName: 'Claude 3.5 Sonnet',
    suiteId: 'suite-reasoning',
    suiteName: 'Multi-hop Financial & Strategic Reasoning',
    status: 'Verified',
    trustScore: 98.2,
    accuracy: 97.6,
    faithfulness: 98.9,
    latencyP95: 485,
    costPer1k: 0.0075,
    safetyPassRate: 99.5,
    sampleSize: 180,
    runTimestamp: '2026-11-08 17:15 UTC',
    testedBy: 'Senior AI Benchmark Eng: Elena R.',
    summary: 'High logical rigor on multi-hop balance sheet deductions. Minor latency tax during deep chain-of-thought.'
  },
  {
    id: 'RUN-2026-902',
    modelId: 'gpt-4o-enterprise',
    modelName: 'GPT-4o Enterprise',
    suiteId: 'suite-hallucination',
    suiteName: 'Context Grounding & Hallucination Defense',
    status: 'Verified',
    trustScore: 97.4,
    accuracy: 96.8,
    faithfulness: 98.1,
    latencyP95: 275,
    costPer1k: 0.0050,
    safetyPassRate: 99.1,
    sampleSize: 300,
    runTimestamp: '2026-11-08 14:30 UTC',
    testedBy: 'Automated CI/CD Pipeline #4827',
    summary: 'Robust refusal on ungrounded adversarial prompts. Handled 294 out of 300 trap tests cleanly.'
  },
  {
    id: 'RUN-2026-901',
    modelId: 'gemini-1-5-pro',
    modelName: 'Gemini 1.5 Pro',
    suiteId: 'suite-long-context',
    suiteName: 'Long-Context RAG Retrieval (128k Tokens)',
    status: 'Verified',
    trustScore: 97.9,
    accuracy: 97.2,
    faithfulness: 98.5,
    latencyP95: 640,
    costPer1k: 0.0035,
    safetyPassRate: 98.8,
    sampleSize: 120,
    runTimestamp: '2026-11-08 11:20 UTC',
    testedBy: 'Automated CI/CD Pipeline #4825',
    summary: 'Outstanding recall across complex distributed legal documents. Highest accuracy in needle-in-haystack scenarios.'
  },
  {
    id: 'RUN-2026-900',
    modelId: 'llama-3-70b-instruct',
    modelName: 'Llama 3 70B Instruct',
    suiteId: 'suite-safety',
    suiteName: 'Red-Teaming, Prompt Injection & Guardrails',
    status: 'Warning',
    trustScore: 93.8,
    accuracy: 92.5,
    faithfulness: 94.2,
    latencyP95: 198,
    costPer1k: 0.0012,
    safetyPassRate: 95.2,
    sampleSize: 420,
    runTimestamp: '2026-11-07 22:10 UTC',
    testedBy: 'Red Team AI Lab: Marcus V.',
    summary: 'Cost effective and blazing fast, but triggered 2 warnings on novel Unicode obfuscated injection prompts. Guardrail patching recommended.'
  },
  {
    id: 'RUN-2026-899',
    modelId: 'mistral-large-2',
    modelName: 'Mistral Large 2',
    suiteId: 'suite-sql-resilience',
    suiteName: 'SQL Generation & DB Boundary Resilience',
    status: 'Verified',
    trustScore: 95.1,
    accuracy: 94.6,
    faithfulness: 96.0,
    latencyP95: 340,
    costPer1k: 0.0040,
    safetyPassRate: 98.4,
    sampleSize: 160,
    runTimestamp: '2026-11-07 18:45 UTC',
    testedBy: 'Automated CI/CD Pipeline #4821',
    summary: 'Clean ANSI SQL generation with solid CTE structure. Successfully rejected 100% of injected destructive statements.'
  }
];

export const RADAR_COMPARISON_DATA = [
  { attribute: 'Tool Reliability', NexusAgent: 98, GPT4o: 95, Claude35: 96, Gemini15: 94, Llama3: 90 },
  { attribute: 'Reasoning Depth', NexusAgent: 97, GPT4o: 94, Claude35: 98, Gemini15: 95, Llama3: 88 },
  { attribute: 'Hallucination Defense', NexusAgent: 99, GPT4o: 96, Claude35: 97, Gemini15: 96, Llama3: 89 },
  { attribute: 'Speed & Latency', NexusAgent: 94, GPT4o: 96, Claude35: 90, Gemini15: 88, Llama3: 98 },
  { attribute: 'Cost Efficiency', NexusAgent: 95, GPT4o: 86, Claude35: 82, Gemini15: 92, Llama3: 99 },
  { attribute: 'Safety Alignment', NexusAgent: 99, GPT4o: 98, Claude35: 99, Gemini15: 97, Llama3: 92 }
];

export const ACCURACY_LATENCY_DATA = [
  { model: 'Nexus-Agent v2.1', accuracy: 98.4, latency: 312, cost: 4.2, trust: 98.6 },
  { model: 'GPT-4o', accuracy: 96.8, latency: 275, cost: 5.0, trust: 97.4 },
  { model: 'Claude 3.5 Sonnet', accuracy: 97.6, latency: 485, cost: 7.5, trust: 98.1 },
  { model: 'Gemini 1.5 Pro', accuracy: 97.2, latency: 640, cost: 3.5, trust: 97.8 },
  { model: 'Llama 3 70B', accuracy: 92.5, latency: 198, cost: 1.2, trust: 93.9 },
  { model: 'Mistral Large 2', accuracy: 94.6, latency: 340, cost: 4.0, trust: 94.2 }
];

export const AGENT_TRACES = [
  {
    id: 'TR-8942',
    name: 'Financial Portfolio Risk & Yield Optimization Agent',
    description: 'Autonomous financial analysis agent retrieving macroeconomic indicators, computing VaR, and formulating hedging recommendations.',
    model: 'Nexus-Agent v2.1',
    executionDate: '2026-11-09 13:28:10',
    totalDurationMs: 1420,
    totalTokens: 2840,
    promptTokens: 1950,
    completionTokens: 890,
    estimatedCost: '$0.0119',
    status: 'Verified',
    trustScore: 99.4,
    guardrailsPassed: ['Hallucination Check', 'No PII Leakage', 'Schema Verified', 'Rate Limit Compliant'],
    warningCount: 0,
    steps: [
      {
        id: 'step-1',
        name: 'User Intent Ingestion & Policy Pre-Check',
        type: 'Input & Intent Parser',
        durationMs: 45,
        status: 'Verified',
        input: {
          prompt: "Analyze Q3 exposure for portfolio #PF-9482 against treasury yield curve shift and suggest delta-neutral hedges.",
          user_id: "usr_fin_88291",
          session_context: "Enterprise Wealth Portal",
          compliance_tag: "SEC-FINRA-2026"
        },
        output: {
          parsed_intent: "PORTFOLIO_RISK_ANALYSIS",
          target_portfolio: "PF-9482",
          risk_factors: ["TREASURY_YIELD_CURVE", "DURATION_GAP", "DELTA_NEUTRALITY"],
          policy_check: "PASSED_UNRESTRICTED"
        },
        tokens: 180,
        notes: "Zero policy violations detected. Entity resolution confirmed PF-9482 active."
      },
      {
        id: 'step-2',
        name: 'Enterprise Vector RAG Retrieval',
        type: 'Vector Search',
        durationMs: 195,
        status: 'Verified',
        input: {
          query_embedding: "portfolio PF-9482 holdings duration beta cash reserves",
          top_k: 4,
          threshold: 0.88,
          collection: "institutional_portfolios"
        },
        output: {
          retrieved_documents: [
            { id: "DOC-8491", title: "PF-9482 Asset Allocation Schedule (Nov 2026)", score: 0.96 },
            { id: "DOC-8492", title: "Corporate Bond Duration Breakdown (Weighted avg: 4.8 yrs)", score: 0.94 },
            { id: "DOC-8493", title: "Federal Reserve 10Y Yield Forecast Q3-Q4", score: 0.89 }
          ],
          context_tokens: 1240
        },
        tokens: 1240,
        notes: "High relevance score (>0.94). All retrieved docs verified cryptographically."
      },
      {
        id: 'step-3',
        name: 'LLM Chain-of-Thought Reasoning & Plan Formulation',
        type: 'LLM Reasoning',
        durationMs: 420,
        status: 'Verified',
        input: {
          model: "Nexus-Agent-v2.1-Core",
          temperature: 0.2,
          system_prompt: "You are an institutional risk analyst. Formulate explicit mathematical plan before tool execution."
        },
        output: {
          thought_trace: "1. Current portfolio duration = 4.8 yrs. 2. Yield curve inversion expected to steepen +35bps. 3. Need real-time 10Y and 2Y SOFR swap rates. 4. Will invoke treasury_curve_api and calculate required interest rate swap notional.",
          next_action: "EXECUTE_TOOL",
          tool_to_call: "fetch_treasury_yield_curve"
        },
        tokens: 410,
        notes: "Deductive logic verified. No unsupported speculative assertions."
      },
      {
        id: 'step-4',
        name: 'Tool Execution: fetch_treasury_yield_curve',
        type: 'External Tool Call',
        durationMs: 280,
        status: 'Verified',
        input: {
          endpoint: "api.bloomberg.internal/v2/yield-curve",
          parameters: {
            curve_type: "US_TREASURY_SOFR",
            tenors: ["3M", "2Y", "5Y", "10Y", "30Y"],
            format: "BASIS_POINTS"
          }
        },
        output: {
          response_code: 200,
          payload: {
            as_of: "2026-11-09T13:28:11Z",
            rates: { "3M": 4.65, "2Y": 3.92, "5Y": 3.88, "10Y": 4.18, "30Y": 4.45 },
            spread_2_10: 26,
            steepening_signal: true
          }
        },
        tokens: 240,
        notes: "API responded in 280ms. Signature matched internal TLS cert."
      },
      {
        id: 'step-5',
        name: 'Nexus Trust Guardrail & Hallucination Audit',
        type: 'Safety & Hallucination Audit',
        durationMs: 160,
        status: 'Verified',
        input: {
          synthesis_candidate: "Proposed hedge: Enter $12.5M notional 5Y payer swaption at 3.90% strike to neutralize +35bps duration shock.",
          context_references: ["DOC-8491", "DOC-8492", "rates_payload_step4"],
          tolerance: 0.01
        },
        output: {
          hallucination_probability: 0.003,
          factual_grounding_score: 0.997,
          pii_leakage_detected: false,
          mathematical_recheck: "VERIFIED_ACCURATE"
        },
        tokens: 310,
        notes: "Passes all strict enterprise compliance constraints. Trust score 99.7%."
      },
      {
        id: 'step-6',
        name: 'Final Executive Response Synthesis',
        type: 'Final Output',
        durationMs: 320,
        status: 'Verified',
        input: {
          format: "EXECUTIVE_RISK_BRIEF",
          include_metrics: true
        },
        output: {
          executive_summary: "Portfolio PF-9482 exhibits an unhedged duration gap of 4.8 years with high sensitivity to the current 26bps 2Y-10Y curve steepening. To maintain delta-neutral posture against an anticipated 35bps shift, enter an interest rate swap of $12.5M notional at 3.90% target fixed rate. This reduces net portfolio VaR from $840k to $112k (95% 1-day).",
          confidence_score: 0.994
        },
        tokens: 460,
        notes: "Complete response transmitted to client interface with full audit provenance."
      }
    ]
  },
  {
    id: 'TR-8941',
    name: 'Customer Service Dispute & Credit Arbitrator Agent',
    description: 'E-commerce and SaaS dispute agent handling billing escalations, verifying merchant terms, and processing allowable credits.',
    model: 'GPT-4o Enterprise',
    executionDate: '2026-11-09 11:14:02',
    totalDurationMs: 980,
    totalTokens: 1890,
    promptTokens: 1420,
    completionTokens: 470,
    estimatedCost: '$0.0094',
    status: 'Warning',
    trustScore: 95.8,
    guardrailsPassed: ['Hallucination Check', 'PII Masking Applied', 'Schema Verified'],
    warningCount: 1,
    steps: [
      {
        id: 'step-1',
        name: 'User Ingestion & PII Masking Filter',
        type: 'Input & Intent Parser',
        durationMs: 65,
        status: 'Warning',
        input: {
          raw_message: "Customer John Doe (SSN: ***-**-4912, Card: 4111-****-****-9411) disputes $399 charge on invoice INV-9041.",
          user_id: "cust_dispute_44"
        },
        output: {
          sanitized_message: "Customer [NAME_REDACTED] (SSN: [REDACTED], Card: [REDACTED]) disputes $399 charge on invoice INV-9041.",
          pii_redactions: 3,
          warning_flag: "AUTOMATIC_PII_SANITATION_TRIGGERED"
        },
        tokens: 140,
        notes: "Warning: Unmasked PII was submitted by upstream webhook. Automatic guardrail redacted 3 entities."
      },
      {
        id: 'step-2',
        name: 'Invoice & CRM Record Fetch',
        type: 'External Tool Call',
        durationMs: 340,
        status: 'Verified',
        input: {
          invoice_id: "INV-9041",
          system: "Stripe_Enterprise_Vault"
        },
        output: {
          amount: 399.00,
          status: "PAID",
          product: "Annual Enterprise Addon",
          dispute_window_eligible: true
        },
        tokens: 280,
        notes: "Invoice verified against ledger."
      },
      {
        id: 'step-3',
        name: 'Resolution Policy & Refund Approval',
        type: 'LLM Reasoning',
        durationMs: 310,
        status: 'Verified',
        input: {
          policy: "Tier-1 dispute credit allowed up to $500 if requested within 14 days."
        },
        output: {
          verdict: "APPROVE_FULL_REFUND",
          recommended_credit: 399.00,
          customer_retention_coupon: "15% Renewal Discount"
        },
        tokens: 380,
        notes: "Strict policy compliance checked."
      },
      {
        id: 'step-4',
        name: 'Final Customer Notification & Ledger Update',
        type: 'Final Output',
        durationMs: 265,
        status: 'Verified',
        input: {
          format: "CUSTOMER_FRIENDLY_EMAIL"
        },
        output: {
          message: "Your credit of $399.00 for invoice INV-9041 has been approved and processed back to your original payment method. Estimated arrival is 2-3 business days.",
          refund_transaction_id: "rf_94829104812"
        },
        tokens: 290,
        notes: "Audit trail persisted to Snowflake ledger."
      }
    ]
  },
  {
    id: 'TR-8939',
    name: 'Enterprise SQL Analytics & Cohort Retention Agent',
    description: 'Natural language to SQL agent analyzing customer churn cohorts across PostgreSQL and ClickHouse clusters.',
    model: 'Claude 3.5 Sonnet',
    executionDate: '2026-11-08 21:05:40',
    totalDurationMs: 1650,
    totalTokens: 3120,
    promptTokens: 2400,
    completionTokens: 720,
    estimatedCost: '$0.0156',
    status: 'Verified',
    trustScore: 99.1,
    guardrailsPassed: ['SQL Safety Guardrail', 'Read-Only DB Enforcement', 'No DROP/ALTER', 'Index Optimization Check'],
    warningCount: 0,
    steps: [
      {
        id: 'step-1',
        name: 'NL Query Interpretation',
        type: 'Input & Intent Parser',
        durationMs: 50,
        status: 'Verified',
        input: {
          query: "Show me 30-day retention decay for customers acquired via Google Ads in Q2 2026."
        },
        output: {
          parsed_metrics: ["RETENTION_COHORT_DECAY"],
          filter: "channel = 'google_ads' AND acquisition_quarter = '2026_Q2'"
        },
        tokens: 150,
        notes: "Query intent mapped cleanly to standard retention schema."
      },
      {
        id: 'step-2',
        name: 'Schema Parsing & Read-Only SQL Generation',
        type: 'LLM Reasoning',
        durationMs: 480,
        status: 'Verified',
        input: {
          target_dialect: "PostgreSQL 16",
          schema: "public.users, analytics.daily_active_events"
        },
        output: {
          generated_sql: "WITH cohort AS (SELECT user_id, DATE(created_at) as join_date FROM users WHERE utm_source = 'google_ads' AND created_at >= '2026-04-01' AND created_at < '2026-07-01') SELECT date_trunc('week', join_date) as cohort_week, COUNT(DISTINCT c.user_id) as total_users, ROUND(COUNT(DISTINCT CASE WHEN e.event_date - c.join_date >= 30 THEN c.user_id END)::numeric / COUNT(DISTINCT c.user_id) * 100, 2) as retention_pct FROM cohort c LEFT JOIN analytics.daily_active_events e ON c.user_id = e.user_id GROUP BY 1 ORDER BY 1 ASC;",
          safety_verdict: "SAFE_READ_ONLY"
        },
        tokens: 680,
        notes: "Zero destructive keywords. Index utilized on (user_id, event_date)."
      },
      {
        id: 'step-3',
        name: 'Execution on Read Replica Database',
        type: 'External Tool Call',
        durationMs: 680,
        status: 'Verified',
        input: {
          target_node: "pg-replica-readonly-02.internal",
          timeout_ms: 5000
        },
        output: {
          rows_returned: 12,
          execution_time_ms: 642,
          avg_retention_30d: "43.8%"
        },
        tokens: 390,
        notes: "Executed in 642ms with zero lock contention."
      },
      {
        id: 'step-4',
        name: 'Synthesis & Executive Chart Summary',
        type: 'Final Output',
        durationMs: 440,
        status: 'Verified',
        input: {
          format: "ANALYTICS_EXECUTIVE_SUMMARY"
        },
        output: {
          summary: "Q2 2026 Google Ads cohorts stabilized at 43.8% Day-30 retention, outperforming the benchmark of 38.5% by +5.3%. Peak performance occurred in May week 2 (47.1%).",
          confidence: 0.992
        },
        tokens: 420,
        notes: "Synthesized metrics validated against ground-truth data warehouse."
      }
    ]
  }
];

export const MEETINGS_DATA = [
  {
    id: 'MTG-101',
    title: 'Q3 Strategic AI Infrastructure & Capital Allocation',
    date: '2026-11-08',
    time: '14:00 - 14:48 EST',
    duration: '48m',
    department: 'Executive',
    sentiment: 'Very Positive',
    sentimentScore: 84,
    status: 'Briefing Ready',
    trustScore: 99.2,
    participants: [
      { name: 'Sarah Chen', role: 'Chief Technology Officer', avatar: 'SC', color: '#2563eb' },
      { name: 'David Miller', role: 'Chief Financial Officer', avatar: 'DM', color: '#10b981' },
      { name: 'Priya Sharma', role: 'VP of AI Research', avatar: 'PS', color: '#7c3aed' },
      { name: 'Marcus Vance', role: 'Chief Operating Officer', avatar: 'MV', color: '#f59e0b' }
    ],
    summaryExcerpt: 'Approved $4.2M expansion for sovereign GPU clusters and ratified agentic evaluation benchmarks for all production LLMs before Q4 rollout.',
    actionItemsCount: 4,
    keyDecisionsCount: 3,
    audioDurationSeconds: 2880,
    hasTranscript: true,
    hasAudio: true,
    topics: ['H100/B200 Cloud Capacity', 'Agent Safety Guardrails', 'Q4 Budget Allocation', 'Latency SLA Targets']
  },
  {
    id: 'MTG-102',
    title: 'Autonomous Agent Safety & Regulatory Compliance Review',
    date: '2026-11-07',
    time: '10:30 - 11:05 EST',
    duration: '35m',
    department: 'Legal & Safety',
    sentiment: 'Constructive / Vigilant',
    sentimentScore: 68,
    status: 'Briefing Ready',
    trustScore: 98.7,
    participants: [
      { name: 'Elena Rostova', role: 'Chief Compliance Officer', avatar: 'ER', color: '#dc2626' },
      { name: 'Alex Thorne', role: 'Lead AI Security Auditor', avatar: 'AT', color: '#0284c7' },
      { name: 'Sarah Chen', role: 'Chief Technology Officer', avatar: 'SC', color: '#2563eb' }
    ],
    summaryExcerpt: 'Established mandatory hallucination boundary tests for autonomous financial tools; authorized third-party red-teaming audit before enterprise SOC2 type II renewal.',
    actionItemsCount: 3,
    keyDecisionsCount: 2,
    audioDurationSeconds: 2100,
    hasTranscript: true,
    hasAudio: true,
    topics: ['EU AI Act Adherence', 'Prompt Injection Red-Teaming', 'PII Scrubbing Pipelines', 'Audit Logs']
  },
  {
    id: 'MTG-103',
    title: 'Sprint 44 Architecture: Real-Time Diarization & Vector Store',
    date: '2026-11-06',
    time: '15:00 - 15:42 EST',
    duration: '42m',
    department: 'Engineering',
    sentiment: 'Positive',
    sentimentScore: 76,
    status: 'Briefing Ready',
    trustScore: 97.9,
    participants: [
      { name: 'Kenji Sato', role: 'Lead Infrastructure Architect', avatar: 'KS', color: '#059669' },
      { name: 'Maya Lin', role: 'Staff ML Engineer', avatar: 'ML', color: '#9333ea' },
      { name: 'Priya Sharma', role: 'VP of AI Research', avatar: 'PS', color: '#7c3aed' }
    ],
    summaryExcerpt: 'Migrated speech-to-text pipeline to streaming Whisper v3 with PyAnnote 3.1 diarization, reducing end-to-end meeting briefing latency by 64%.',
    actionItemsCount: 5,
    keyDecisionsCount: 3,
    audioDurationSeconds: 2520,
    hasTranscript: true,
    hasAudio: true,
    topics: ['Whisper Streaming', 'PyAnnote Diarization', 'Pinecone vs Qdrant', 'Edge Worker Caching']
  },
  {
    id: 'MTG-104',
    title: 'Enterprise Customer Advisory Council: Q3 Feedback & Drift',
    date: '2026-11-05',
    time: '11:00 - 11:55 EST',
    duration: '55m',
    department: 'Product',
    sentiment: 'Balanced',
    sentimentScore: 58,
    status: 'Briefing Ready',
    trustScore: 96.5,
    participants: [
      { name: 'Jessica Alba', role: 'VP of Product Experience', avatar: 'JA', color: '#ea580c' },
      { name: 'Michael Chang', role: 'Head of Customer Success', avatar: 'MC', color: '#2563eb' },
      { name: 'David Miller', role: 'Chief Financial Officer', avatar: 'DM', color: '#10b981' }
    ],
    summaryExcerpt: 'Customers praised meeting briefing synthesis precision but requested direct integration with Jira and Microsoft Teams action item synchronization.',
    actionItemsCount: 6,
    keyDecisionsCount: 2,
    audioDurationSeconds: 3300,
    hasTranscript: true,
    hasAudio: true,
    topics: ['Jira Auto-Sync', 'User Feedback Signals', 'Agent Hallucination Inquiries', 'Pricing Tier Adjustments']
  }
];

export const MEETING_BRIEFING_DETAILS = {
  'MTG-101': {
    id: 'MTG-101',
    title: 'Q3 Strategic AI Infrastructure & Capital Allocation',
    date: '2026-11-08',
    time: '14:00 - 14:48 EST',
    duration: '48m (2,880 seconds)',
    department: 'Executive Leadership',
    sentimentOverall: 'Very Positive (+84% Net Alignment)',
    sentimentBreakdown: { positive: 78, neutral: 18, negative: 4 },
    aiConfidenceScore: 99.2,
    status: 'Verified Briefing',
    audioFileMock: 'q3_strategic_ai_infrastructure_nov2026.mp3',
    executiveSummary: [
      "The Executive Committee converged on the capital allocation strategy for FY27 AI infrastructure, approving an initial tranche of $4.2M for sovereign Blackwell/H100 GPU compute capacity to eliminate vendor lock-in.",
      "Chief Technology Officer Sarah Chen confirmed that the NexusAI benchmark suite will become the binding gatekeeper: no autonomous agent model will deploy to production without passing the 98% Trust Verification threshold.",
      "CFO David Miller validated the unit economics, showing that in-house model fine-tuning and aggressive prompt caching will reduce recurring token expenditures by approximately 34% year-over-year.",
      "Operational target agreed: Complete cluster commissioning by January 15, 2027, with zero downtime migration for active enterprise workloads."
    ],
    strategicDecisions: [
      {
        id: 'DEC-01',
        decision: 'Approve $4.2M Dedicated Sovereign GPU Compute Allocation',
        rationale: 'Mitigates external API rate-limiting spikes and guarantees data sovereignty for Tier-1 banking clients.',
        consensus: 'Unanimous (4/4 Executives)',
        verifiedAt: '14:24 EST',
        status: 'Ratified'
      },
      {
        id: 'DEC-02',
        decision: 'Enforce NexusAI Trust Score >= 98.0% as Mandatory Deployment Gate',
        rationale: 'Prevents agentic regression, unauthorized API calling, and customer-facing hallucination risk.',
        consensus: 'Unanimous (4/4 Executives)',
        verifiedAt: '14:38 EST',
        status: 'Ratified'
      },
      {
        id: 'DEC-03',
        decision: 'Standardize Meeting Intelligence Briefings across all Board and VP meetings',
        rationale: 'Drives cross-departmental accountability by converting verbal agreements to automated Jira action items.',
        consensus: 'Unanimous (4/4 Executives)',
        verifiedAt: '14:44 EST',
        status: 'Ratified'
      }
    ],
    actionItems: [
      {
        id: 'ACT-101',
        task: 'Finalize multi-region cloud contract and sign GPU reservation agreement',
        assignee: 'David Miller',
        assigneeRole: 'CFO',
        dueDate: '2026-11-18',
        priority: 'Urgent',
        status: 'In Progress',
        syncedTo: 'Jira (PROJ-941)'
      },
      {
        id: 'ACT-102',
        task: 'Publish CI/CD benchmark pipeline gating rules to engineering handbook',
        assignee: 'Sarah Chen',
        assigneeRole: 'CTO',
        dueDate: '2026-11-15',
        priority: 'High',
        status: 'Completed',
        syncedTo: 'Confluence & Slack'
      },
      {
        id: 'ACT-103',
        task: 'Deliver fine-tuned Nexus-Agent v2.2 test metrics against Claude 3.5 Sonnet',
        assignee: 'Priya Sharma',
        assigneeRole: 'VP AI Research',
        dueDate: '2026-11-22',
        priority: 'High',
        status: 'In Progress',
        syncedTo: 'Linear'
      },
      {
        id: 'ACT-104',
        task: 'Prepare data center power and thermal redundancy audit for facilities team',
        assignee: 'Marcus Vance',
        assigneeRole: 'COO',
        dueDate: '2026-11-25',
        priority: 'Medium',
        status: 'Pending',
        syncedTo: 'Asana'
      }
    ],
    topicsTimeline: [
      { time: '00:00 - 12:15', topic: 'H100 & Blackwell Compute Capacity Constraints', percentage: 25 },
      { time: '12:15 - 26:30', topic: 'Capital Expenditure & Token Margin Economics', percentage: 30 },
      { time: '26:30 - 38:40', topic: 'Autonomous Agent Safety & Benchmark Gating', percentage: 25 },
      { time: '38:40 - 48:00', topic: 'Action Items & Final Executive Ratification', percentage: 20 }
    ],
    transcriptSegments: [
      {
        id: 'SEG-1',
        speaker: 'Sarah Chen',
        speakerRole: 'CTO',
        timestamp: '02:14',
        seconds: 134,
        sentiment: 'Positive',
        confidence: 0.99,
        text: "Good afternoon everyone. Our primary objective today is approving the compute capital request. As our agentic workflows expand from 120,000 to over 1.2 million automated tool calls daily, relying solely on shared cloud endpoints introduces unacceptable latency tail risks."
      },
      {
        id: 'SEG-2',
        speaker: 'David Miller',
        speakerRole: 'CFO',
        timestamp: '07:42',
        seconds: 462,
        sentiment: 'Neutral',
        confidence: 0.98,
        text: "Understood Sarah. From the financial side, we've modeled the $4.2M capital expenditure over a 24-month horizon. Factoring in our custom fine-tuning and prompt cache hit rates of 62%, this actually pays for itself within 14 months compared to raw commercial API pricing."
      },
      {
        id: 'SEG-3',
        speaker: 'Priya Sharma',
        speakerRole: 'VP AI Research',
        timestamp: '18:30',
        seconds: 1110,
        sentiment: 'Positive',
        confidence: 0.99,
        text: "On the model research front, our internal Nexus-Agent v2.1 benchmark is already beating public frontier models on tool argument precision by 3.2%. What we need now is sovereign compute to train v2.2 with native reasoning capabilities."
      },
      {
        id: 'SEG-4',
        speaker: 'Marcus Vance',
        speakerRole: 'COO',
        timestamp: '28:15',
        seconds: 1695,
        sentiment: 'Constructive',
        confidence: 0.97,
        text: "I want to ensure we have strict guardrails in place. If an autonomous agent executes a $50k transaction or an invalid API payload, our trust score must catch it instantly before production propagation."
      },
      {
        id: 'SEG-5',
        speaker: 'Sarah Chen',
        speakerRole: 'CTO',
        timestamp: '34:50',
        seconds: 2090,
        sentiment: 'Very Positive',
        confidence: 0.99,
        text: "Agreed Marcus. That's why we're ratifying the NexusAI Trust Score of 98.0% as an absolute gate. If any model revision slips below that, the CI/CD pipeline immediately halts the deployment and pages the on-call team."
      },
      {
        id: 'SEG-6',
        speaker: 'David Miller',
        speakerRole: 'CFO',
        timestamp: '44:10',
        seconds: 2650,
        sentiment: 'Positive',
        confidence: 0.99,
        text: "Excellent. Let's call the vote. All in favor of approving the $4.2M compute allocation with the 98% benchmark deployment gate? That is unanimous. David and Sarah will sign the reservation contract by next week."
      }
    ]
  }
};


export const RESEARCH_DOSSIERS = [
  {
    id: 'DOSSIER-STRIPE',
    subject: 'Stripe',
    subjectType: 'Company',
    meetingPurpose: 'Strategic Enterprise Partnership',
    meetingDate: '2026-11-14',
    researchWindowDays: 30,
    generatedAt: '2026-11-09 16:30 UTC',
    trustVerificationScore: 99.4,
    executiveSummary: 'Stripe has accelerated enterprise monetization and multi-currency global orchestration, recently announcing autonomous agent commerce APIs. The company reported $1.4T total payment volume run rate with heavy investments in AI billing infrastructure and low-latency fraud defense.',
    recentNews: [
      {
        id: 'NEWS-1',
        headline: 'Stripe Introduces Agentic Commerce Protocol for Autonomous AI Agents',
        source: 'Stripe Newsroom / Bloomberg',
        url: 'https://stripe.com/newsroom/news/agentic-commerce-protocol',
        publishedDate: '2026-10-24',
        verificationStatus: 'Verified Official',
        summary: 'Enables autonomous AI software agents to negotiate, authenticate and execute payment settlements with fine-grained spending limits.'
      },
      {
        id: 'NEWS-2',
        headline: 'Stripe Surpasses $1.4 Trillion Annual Payment Volume with 38% Enterprise Growth',
        source: 'Financial Times',
        url: 'https://ft.com/content/stripe-annual-volume-milestone-2026',
        publishedDate: '2026-10-12',
        verificationStatus: 'Cross-Referenced',
        summary: 'Driven by global merchant migrations and accelerated adoption of Stripe Tax, Radar and Billing among Fortune 500 customers.'
      },
      {
        id: 'NEWS-3',
        headline: 'Expanded Partnership with European Central Bank on Digital Euro Settlement Sandboxes',
        source: 'Reuters Financial',
        url: 'https://reuters.com/business/finance/stripe-ecb-digital-settlement-2026',
        publishedDate: '2026-10-02',
        verificationStatus: 'Verified Official',
        summary: 'Piloting cross-border instant settlement rails across European banking consortiums with compliance guardrails.'
      }
    ],
    productLaunches: [
      {
        name: 'Stripe Agent Toolkit v2.0',
        releaseDate: '2026-10-20',
        impact: 'High',
        description: 'Native SDK for LangChain, LlamaIndex and autonomous agents to invoke payment cards and verify transactions programmatically.'
      },
      {
        name: 'Radar Autonomous Dispute Defender',
        releaseDate: '2026-09-28',
        impact: 'High',
        description: 'Real-time machine learning engine predicting chargeback outcomes and generating evidence briefs with 89% win rates.'
      }
    ],
    leadershipChanges: [
      {
        executive: 'Claire Hughes Johnson',
        role: 'Appointed to Board Operational Advisory Committee',
        status: 'Verified Official',
        source: 'SEC / Stripe Press',
        date: '2026-10-15',
        notes: 'Reinforces focus on scaling operational discipline as Stripe prepares for strategic capital market transitions.'
      },
      {
        executive: 'Dr. Vikram Sethi',
        role: 'VP of AI & Autonomous Infrastructure (ex-DeepMind)',
        status: 'Verified Official',
        source: 'LinkedIn Announcement',
        date: '2026-09-18',
        notes: 'Leading dedicated research team optimizing high-throughput agent-to-agent transaction validation.'
      }
    ],
    businessOpportunities: [
      {
        title: 'NexusAI Autonomous Agent Benchmarking Integration',
        priority: 'High Strategic Fit',
        description: 'Provide verifiable benchmark and guardrail validation for Stripe Agentic Commerce before broad developer GA release.'
      },
      {
        title: 'Zero-Trust Meeting Intelligence for Deal Structuring',
        priority: 'Immediate Revenue',
        description: 'Equip Stripe global enterprise sales leaders with pre-meeting executive dossiers and automated CRM action item sync.'
      }
    ],
    suggestedQuestions: [
      {
        category: 'Strategic Probing',
        question: 'Given your recent release of the Agentic Commerce Protocol, how is Stripe approaching tokenized liability and hallucination bounds during autonomous transaction execution?'
      },
      {
        category: 'Technical Architecture',
        question: 'What latency and throughput SLAs are your enterprise customers requiring for real-time agent fraud evaluation on the Radar inference tier?'
      },
      {
        category: 'Icebreaker / Relationship',
        question: 'Congratulations on crossing the $1.4T payment volume threshold — how has the shift toward recurring SaaS and usage billing altered your enterprise pipeline focus for 2027?'
      }
    ]
  },
  {
    id: 'DOSSIER-ANTHROPIC',
    subject: 'Anthropic',
    subjectType: 'Company',
    meetingPurpose: 'Technical Architecture Sync & Strategic Partnership',
    meetingDate: '2026-11-18',
    researchWindowDays: 30,
    generatedAt: '2026-11-09 16:35 UTC',
    trustVerificationScore: 99.8,
    executiveSummary: 'Anthropic continues its focus on constitutional AI and safety steering for enterprise deployments. Claude 3.5 Sonnet leads reasoning benchmarks, with recent announcements around computer use and autonomous tool invocation in enterprise workflows.',
    recentNews: [
      {
        id: 'NEWS-ANT-1',
        headline: 'Anthropic Deploys Claude 3.5 Sonnet Computer Use in Public Beta',
        source: 'Anthropic Research Blog',
        url: 'https://anthropic.com/news/3-5-models-and-computer-use',
        publishedDate: '2026-10-22',
        verificationStatus: 'Verified Official',
        summary: 'Enables Claude to navigate software interfaces, type text, click buttons, and execute multi-application workflows.'
      },
      {
        id: 'NEWS-ANT-2',
        headline: 'Amazon Completes Additional $4B Investment in Anthropic AWS Trainium Clusters',
        source: 'Wall Street Journal',
        url: 'https://wsj.com/tech/amazon-anthropic-investment-compute-2026',
        publishedDate: '2026-10-18',
        verificationStatus: 'Verified Official',
        summary: 'Deepens joint engineering on Trainium2 compute clusters for next-generation reasoning architectures.'
      }
    ],
    productLaunches: [
      {
        name: 'Constitutional Safety Auditing API',
        releaseDate: '2026-10-10',
        impact: 'Critical',
        description: 'Allows enterprise customers to inspect and constrain internal activation steering vectors in real time.'
      }
    ],
    leadershipChanges: [
      {
        executive: 'Dario Amodei',
        role: 'CEO & Co-founder',
        status: 'Verified Official',
        source: 'Anthropic Leadership',
        date: '2026-10-01',
        notes: 'Published comprehensive essay on "Machines of Loving Grace" detailing 5-10 year AI frontier trajectories.'
      }
    ],
    businessOpportunities: [
      {
        title: 'Benchmarking Claude Models on NexusAI AgentBench',
        priority: 'High Strategic Fit',
        description: 'Provide independent 3rd-party trust, hallucination defense, and tool-use verification metrics for enterprise procurement.'
      }
    ],
    suggestedQuestions: [
      {
        category: 'Safety & Governance',
        question: 'With computer use capabilities, what automated sandboxing and confirmation barriers do you recommend enterprises enforce for database and financial tools?'
      },
      {
        category: 'Latency & Economics',
        question: 'How are prompt caching and speculative decoding impacting latency SLAs for agentic chains requiring 20+ sequential tool calls?'
      }
    ]
  }
];
