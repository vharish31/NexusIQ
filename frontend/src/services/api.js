import axios from 'axios';
import {
  PLATFORM_STATS,
  AVAILABLE_MODELS,
  BENCHMARK_SUITES,
  BENCHMARK_RESULTS,
  AGENT_TRACES,
  MEETINGS_DATA,
  MEETING_BRIEFING_DETAILS,
  RADAR_COMPARISON_DATA,
  ACCURACY_LATENCY_DATA,
  RESEARCH_DOSSIERS
} from './mockData';

// Configure Axios client
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Platform': 'NexusAI-Frontend'
  }
});

// Request interceptor to attach bearer token if configured
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified enterprise error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.warn('[NexusAI API] Request intercepted with error, falling back to verified demo simulation', error.message);
    return Promise.reject(error);
  }
);

// Simulated network delay helper for realistic UX loading states
const simulateDelay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * NexusAI Service Layer
 * Fully encapsulates all HTTP and simulated benchmark & meeting telemetry endpoints
 */
export const api = {
  /**
   * Global Dashboard Stats & Health Telemetry
   */
  async getPlatformStats() {
    await simulateDelay(350);
    return {
      success: true,
      data: PLATFORM_STATS,
      isSimulated: true
    };
  },

  /**
   * Workspace 1: Models & Agent Benchmarking
   */
  async getModels() {
    await simulateDelay(300);
    return {
      success: true,
      data: AVAILABLE_MODELS
    };
  },

  async registerAgentModel(modelData) {
    await simulateDelay(600);
    const newModel = {
      id: modelData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: modelData.name,
      provider: modelData.provider || 'Custom Sovereign Endpoint',
      type: modelData.type || 'Enterprise Agentic',
      trustScore: +(95 + Math.random() * 4).toFixed(1),
      status: 'Registered',
      color: '#3B82F6',
      endpoint: modelData.endpoint || 'https://api.internal/v1/chat/completions'
    };
    AVAILABLE_MODELS.unshift(newModel);
    return {
      success: true,
      data: newModel,
      message: `Agent model "${newModel.name}" successfully registered into NexusAI test harness.`
    };
  },

  async getBenchmarkSuites() {
    await simulateDelay(350);
    return {
      success: true,
      data: BENCHMARK_SUITES
    };
  },

  async getBenchmarkResults(filters = {}) {
    await simulateDelay(400);
    let results = [...BENCHMARK_RESULTS];
    
    if (filters.modelId && filters.modelId !== 'all') {
      results = results.filter((r) => r.modelId === filters.modelId);
    }
    if (filters.suiteId && filters.suiteId !== 'all') {
      results = results.filter((r) => r.suiteId === filters.suiteId);
    }
    if (filters.status && filters.status !== 'all') {
      results = results.filter((r) => r.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (r) =>
          r.modelName.toLowerCase().includes(q) ||
          r.suiteName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: results,
      total: results.length,
      radarData: RADAR_COMPARISON_DATA,
      scatterData: ACCURACY_LATENCY_DATA
    };
  },

  async getBenchmarkResultById(id) {
    await simulateDelay(300);
    const result = BENCHMARK_RESULTS.find((r) => r.id === id);
    if (!result) {
      throw new Error(`Benchmark result #${id} not found.`);
    }
    return {
      success: true,
      data: result
    };
  },

  async runBenchmark(payload) {
    await simulateDelay(1200);
    const newRun = {
      id: `RUN-2026-${Math.floor(910 + Math.random() * 80)}`,
      modelId: payload.modelId || 'nexus-agent-v2.1',
      modelName: AVAILABLE_MODELS.find(m => m.id === payload.modelId)?.name || 'Nexus-Agent v2.1',
      suiteId: payload.suiteId || 'suite-tool-use',
      suiteName: BENCHMARK_SUITES.find(s => s.id === payload.suiteId)?.name || 'Tool Calling & Multi-API Orchestration',
      status: 'Verified',
      trustScore: +(97 + Math.random() * 2.5).toFixed(1),
      accuracy: +(96 + Math.random() * 3.5).toFixed(1),
      faithfulness: +(97.5 + Math.random() * 2).toFixed(1),
      latencyP95: Math.floor(260 + Math.random() * 180),
      costPer1k: +(0.003 + Math.random() * 0.003).toFixed(4),
      safetyPassRate: 100.0,
      sampleSize: payload.sampleSize || 100,
      runTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      testedBy: 'Interactive Web Session Operator',
      summary: 'Automated test suite completed successfully with full constraint adherence.'
    };

    BENCHMARK_RESULTS.unshift(newRun);

    return {
      success: true,
      data: newRun,
      message: 'Benchmark execution completed and verified by NexusAI Trust Node.'
    };
  },

  /**
   * Workspace 1: Agent Trace Telemetry
   */
  async getAgentTraces() {
    await simulateDelay(350);
    return {
      success: true,
      data: AGENT_TRACES
    };
  },

  async getAgentTraceById(id) {
    await simulateDelay(300);
    const trace = AGENT_TRACES.find((t) => t.id === id);
    if (!trace) {
      throw new Error(`Agent trace #${id} could not be retrieved.`);
    }
    return {
      success: true,
      data: trace
    };
  },

  /**
   * Workspace 2: Pre-Meeting Research Intelligence
   */
  async conductPreMeetingResearch({ subject, subjectType = 'Company', meetingDate, meetingPurpose, researchWindowDays = 30 }) {
    await simulateDelay(1400);

    // Check if we have an existing curated dossier for the subject
    const normalized = (subject || '').trim().toLowerCase();
    const existing = RESEARCH_DOSSIERS.find(d => d.subject.toLowerCase() === normalized);

    if (existing) {
      return {
        success: true,
        data: {
          ...existing,
          meetingDate: meetingDate || existing.meetingDate,
          meetingPurpose: meetingPurpose || existing.meetingPurpose,
          researchWindowDays: Number(researchWindowDays)
        }
      };
    }

    // Otherwise, generate high-fidelity dynamic research dossier
    const generatedDossier = {
      id: `DOSSIER-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject || 'Target Enterprise',
      subjectType: subjectType || 'Company',
      meetingPurpose: meetingPurpose || 'Executive Strategic Alignment',
      meetingDate: meetingDate || new Date().toISOString().substring(0, 10),
      researchWindowDays: Number(researchWindowDays) || 30,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      trustVerificationScore: +(98.0 + Math.random() * 1.8).toFixed(1),
      executiveSummary: `${subject} has undergone strategic shifts over the past ${researchWindowDays} days. Key operational focal points include expanding AI automation workflows, tightening cloud unit economics, and aligning procurement guardrails with emerging regulatory standards.`,
      recentNews: [
        {
          id: `NEWS-${Date.now()}-1`,
          headline: `${subject} Expands AI Automation Architecture for Enterprise Customers`,
          source: 'PR Newswire / Financial Tech Digest',
          url: `https://example.com/news/${encodeURIComponent(subject.toLowerCase())}-expansion-2026`,
          publishedDate: '2026-10-28',
          verificationStatus: 'Verified Official',
          summary: `Announced unified API integrations and autonomous agent capabilities with strict compliance audit logs.`
        },
        {
          id: `NEWS-${Date.now()}-2`,
          headline: `${subject} Closes Strategic Ecosystem Partnership to Scale Cloud Telemetry`,
          source: 'TechCrunch Enterprise',
          url: `https://techcrunch.com/2026/10/${encodeURIComponent(subject.toLowerCase())}-strategic-partnership`,
          publishedDate: '2026-10-15',
          verificationStatus: 'Cross-Referenced',
          summary: `Accelerates enterprise onboarding through pre-built connectors and verified trust validation benchmarks.`
        }
      ],
      productLaunches: [
        {
          name: `${subject} Enterprise Core v4.0`,
          releaseDate: '2026-10-05',
          impact: 'High',
          description: `Enhanced low-latency data pipelines and end-to-end auditability for mission-critical client workloads.`
        }
      ],
      leadershipChanges: [
        {
          executive: 'Sarah Lindqvist',
          role: 'Chief Revenue & Strategic Partnerships Officer',
          status: 'Verified Official',
          source: 'SEC Filings / Corporate PR',
          date: '2026-09-22',
          notes: 'Leading commercial expansion across North American and European enterprise sectors.'
        }
      ],
      businessOpportunities: [
        {
          title: `NexusAI Guardrail Verification for ${subject}`,
          priority: 'Immediate Revenue Opportunity',
          description: `Integrate independent hallucination defense and tool telemetry into their standard enterprise customer proposals.`
        },
        {
          title: 'Executive Pre-Meeting Briefing Automation',
          priority: 'High Strategic Fit',
          description: `Equip their sales and partnership teams with automated research briefings prior to C-level discussions.`
        }
      ],
      suggestedQuestions: [
        {
          category: 'Strategic Probing',
          question: `In light of ${subject}'s focus over the last ${researchWindowDays} days, how are your teams measuring agent hallucination and cost per query across production workloads?`
        },
        {
          category: 'Operational Scalability',
          question: `What specific latency and data sovereignty benchmarks are required before approving third-party autonomous AI integrations?`
        },
        {
          category: 'Icebreaker / Alignment',
          question: `Congratulations on the recent milestones announced last month — what is the primary success metric for your team in the upcoming quarter?`
        }
      ]
    };

    RESEARCH_DOSSIERS.unshift(generatedDossier);

    return {
      success: true,
      data: generatedDossier
    };
  },

  async getResearchDossiers() {
    await simulateDelay(300);
    return {
      success: true,
      data: RESEARCH_DOSSIERS
    };
  },

  /**
   * Workspace 2: Meeting Audio & Diarization
   */
  async getMeetings(filters = {}) {
    await simulateDelay(400);
    let meetings = [...MEETINGS_DATA];

    if (filters.department && filters.department !== 'all') {
      meetings = meetings.filter((m) => m.department.toLowerCase() === filters.department.toLowerCase());
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      meetings = meetings.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.participants.some((p) => p.name.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      data: meetings,
      total: meetings.length
    };
  },

  async getMeetingById(id) {
    await simulateDelay(300);
    const meeting = MEETINGS_DATA.find((m) => m.id === id);
    if (!meeting) {
      throw new Error(`Meeting with ID ${id} not found.`);
    }
    return {
      success: true,
      data: meeting
    };
  },

  async getMeetingBriefing(id = 'MTG-101') {
    await simulateDelay(450);
    const briefing = MEETING_BRIEFING_DETAILS[id] || MEETING_BRIEFING_DETAILS['MTG-101'];
    return {
      success: true,
      data: briefing
    };
  },

  async uploadMeetingAudio(meetingData) {
    await simulateDelay(1500);
    const newMeeting = {
      id: `MTG-${Math.floor(105 + Math.random() * 50)}`,
      title: meetingData.title || 'Untitled Strategic Sync',
      date: new Date().toISOString().substring(0, 10),
      time: '16:00 - 16:35 EST',
      duration: '35m',
      department: meetingData.department || 'Executive',
      sentiment: 'Positive',
      sentimentScore: 82,
      status: 'Briefing Ready',
      trustScore: 98.9,
      participants: [
        { name: 'Sarah Chen', role: 'CTO', avatar: 'SC', color: '#3B82F6' },
        { name: 'David Miller', role: 'CFO', avatar: 'DM', color: '#10B981' }
      ],
      summaryExcerpt: 'Successfully transcribed and generated executive briefing with diarization and action items.',
      actionItemsCount: 3,
      keyDecisionsCount: 2,
      audioDurationSeconds: 2100,
      hasTranscript: true,
      hasAudio: true,
      topics: ['Q4 Roadmap', 'Security Audit', 'Resource Reallocation']
    };

    MEETINGS_DATA.unshift(newMeeting);

    return {
      success: true,
      data: newMeeting,
      message: 'Meeting audio ingested, diarized, and executive briefing generated.'
    };
  },

  async updateActionItemStatus(meetingId, actionId, newStatus) {
    await simulateDelay(250);
    const briefing = MEETING_BRIEFING_DETAILS[meetingId] || MEETING_BRIEFING_DETAILS['MTG-101'];
    const item = briefing.actionItems.find((a) => a.id === actionId);
    if (item) {
      item.status = newStatus;
    }
    return {
      success: true,
      data: item
    };
  }
};

export default api;
