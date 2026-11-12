import axios from 'axios';

// Configure Axios client pointing to FastAPI backend (/api via Vite proxy or VITE_API_BASE_URL)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Platform': 'NexusIQ-Frontend',
  },
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

// Response interceptor for unified FastAPI error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const backendError =
      error?.response?.data?.error?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      'Backend API request failed.';
    return Promise.reject(new Error(backendError));
  }
);

// Lightweight client-side GET cache & in-flight request deduplication (invalidated on writes)
const _getCache = new Map();
const _inflightGets = new Map();
const CLIENT_CACHE_TTL_MS = 15000;

function cachedGet(url, options = {}) {
  const key = options.params ? `${url}?${JSON.stringify(options.params)}` : url;
  const cached = _getCache.get(key);
  if (cached && Date.now() - cached.ts < CLIENT_CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }
  if (_inflightGets.has(key)) {
    return _inflightGets.get(key);
  }
  const req = apiClient
    .get(url, options)
    .then((data) => {
      _getCache.set(key, { ts: Date.now(), data });
      _inflightGets.delete(key);
      return data;
    })
    .catch((err) => {
      _inflightGets.delete(key);
      throw err;
    });
  _inflightGets.set(key, req);
  return req;
}

export function invalidateApiCache() {
  _getCache.clear();
}

/**
 * NexusIQ Service Layer
 * Connects all frontend workspaces directly to the FastAPI + Firestore + Bifrost + Tavily backend.
 */
export const api = {
  /**
   * Health & Platform Telemetry
   */
  async getHealth() {
    return cachedGet('/health');
  },

  async getFirebaseHealth() {
    return cachedGet('/health/firebase');
  },

  async getPlatformStats() {
    return cachedGet('/stats');
  },

  async globalSearch(query) {
    return apiClient.get('/search', { params: { q: query || '' } });
  },

  /**
   * Datasets (FEVER & FEVEROUS)
   */
  async getDatasets() {
    return cachedGet('/datasets');
  },

  async syncDatasets() {
    invalidateApiCache();
    return apiClient.post('/datasets/sync');
  },

  /**
   * Workspace 1: Models & Agent Benchmarking
   */
  async getModels() {
    return cachedGet('/models');
  },

  async registerAgentModel(modelData) {
    const res = await apiClient.post('/models', modelData);
    invalidateApiCache();
    return res;
  },

  async getBenchmarkSuites() {
    return cachedGet('/benchmarks/suites');
  },

  async getBenchmarkResults(filters = {}) {
    const params = {};
    if (filters.modelId && filters.modelId !== 'all') params.modelId = filters.modelId;
    if (filters.suiteId && filters.suiteId !== 'all') params.suiteId = filters.suiteId;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.query) params.query = filters.query;
    return cachedGet('/benchmarks', { params });
  },

  async getBenchmarkResultById(id) {
    return cachedGet(`/benchmarks/${encodeURIComponent(id)}`);
  },

  async runBenchmark(payload) {
    const res = await apiClient.post('/benchmarks/run', {
      modelId: payload.modelId,
      suiteId: payload.suiteId,
      sampleSize: Number(payload.sampleSize) || 50,
      temperature: payload.temperature !== undefined ? Number(payload.temperature) : 0.2,
    });
    invalidateApiCache();
    return res;
  },

  /**
   * Workspace 1: Agent Trace Telemetry
   */
  async getAgentTraces() {
    return cachedGet('/traces');
  },

  async getAgentTraceById(id) {
    return cachedGet(`/traces/${encodeURIComponent(id)}`);
  },

  /**
   * Workspace 2: Pre-Meeting Research Intelligence
   */
  async conductPreMeetingResearch({
    subject,
    subjectType = 'Company',
    meetingDate,
    meetingPurpose,
    researchWindowDays = 30,
  }) {
    const res = await apiClient.post('/briefings/research', {
      subject,
      subjectType,
      meetingDate,
      meetingPurpose,
      researchWindowDays: Number(researchWindowDays) || 30,
    });
    invalidateApiCache();
    return res;
  },

  async getResearchDossiers() {
    return cachedGet('/briefings');
  },

  /**
   * Workspace 2: Meetings & Action Items
   */
  async getMeetings(filters = {}) {
    const params = {};
    if (filters.department && filters.department !== 'all') {
      params.department = filters.department;
    }
    if (filters.query) {
      params.query = filters.query;
    }
    return cachedGet('/meetings', { params });
  },

  async getMeetingById(id) {
    return cachedGet(`/meetings/${encodeURIComponent(id)}`);
  },

  async getMeetingBriefing(id = 'MTG-101') {
    return cachedGet(`/meetings/${encodeURIComponent(id)}/briefing`);
  },

  async uploadMeetingAudio(meetingData) {
    const res = await apiClient.post('/meetings', meetingData);
    invalidateApiCache();
    return res;
  },

  async updateActionItemStatus(meetingId, actionId, newStatus) {
    const res = await apiClient.patch(
      `/meetings/${encodeURIComponent(meetingId)}/action-items/${encodeURIComponent(actionId)}`,
      { status: newStatus }
    );
    invalidateApiCache();
    return res;
  },
};

export default api;
