import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000'

function formatDate(ts) {
  if (!ts) return '-'
  const date = new Date(ts)
  if (Number.isNaN(date.getTime())) return ts
  return date.toLocaleString()
}

function shortId(value) {
  if (!value) return '-'
  return String(value).slice(0, 8)
}

const FOLLOWUP_DEFAULTS = {
  duration: '',
  severity: 'unknown',
  pain_scale: '',
  shortness_of_breath: 'unknown',
  fever: 'unknown',
  vomiting: 'unknown',
  bleeding: 'unknown',
  loss_of_consciousness: 'unknown',
  chronic_conditions: '',
  current_medications: '',
  drug_allergies: ''
}

function hasMeaningfulFollowupAnswers(answers) {
  if ((answers.duration || '').trim()) return true
  if ((answers.pain_scale || '').trim()) return true
  if ((answers.chronic_conditions || '').trim()) return true
  if ((answers.current_medications || '').trim()) return true
  if ((answers.drug_allergies || '').trim()) return true
  if (answers.severity && answers.severity !== 'unknown') return true
  if (answers.shortness_of_breath && answers.shortness_of_breath !== 'unknown') return true
  if (answers.fever && answers.fever !== 'unknown') return true
  if (answers.vomiting && answers.vomiting !== 'unknown') return true
  if (answers.bleeding && answers.bleeding !== 'unknown') return true
  if (answers.loss_of_consciousness && answers.loss_of_consciousness !== 'unknown') return true
  return false
}

function buildFollowupMessage(answers) {
  const mapYesNoUnknown = (value) => {
    if (value === 'yes') return 'Yes'
    if (value === 'no') return 'No'
    return 'Unknown'
  }

  return [
    'Follow-up questionnaire answers:',
    `- Duration: ${answers.duration || 'Unknown'}`,
    `- Severity: ${answers.severity || 'unknown'}`,
    `- Pain scale (0-10): ${answers.pain_scale || 'Unknown'}`,
    `- Shortness of breath: ${mapYesNoUnknown(answers.shortness_of_breath)}`,
    `- Fever: ${mapYesNoUnknown(answers.fever)}`,
    `- Vomiting: ${mapYesNoUnknown(answers.vomiting)}`,
    `- Bleeding: ${mapYesNoUnknown(answers.bleeding)}`,
    `- Loss of consciousness: ${mapYesNoUnknown(answers.loss_of_consciousness)}`,
    `- Chronic conditions: ${answers.chronic_conditions || 'None reported'}`,
    `- Current medications: ${answers.current_medications || 'None reported'}`,
    `- Drug allergies: ${answers.drug_allergies || 'None reported'}`
  ].join('\n')
}

function normalizeError(error) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error.detail) {
    return typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail)
  }
  return JSON.stringify(error)
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  let body = null
  const text = await response.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = { detail: text }
    }
  }

  if (!response.ok) {
    throw new Error(normalizeError(body) || `HTTP ${response.status}`)
  }
  return body
}

function LevelBadge({ level }) {
  const normalized = level || 'Unknown'
  return <span className={`level-badge level-${normalized.toLowerCase()}`}>{normalized}</span>
}

function ShellHeader({ title, subtitle }) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/doctor'
  const doctorActive = path === '/' || path.startsWith('/doctor')
  const patientActive = path.startsWith('/patient')

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">AI Border Triage</p>
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      <div className="topbar-actions">
        <nav className="mode-switch" aria-label="App pages">
          <a className={doctorActive ? 'active' : ''} href="/doctor">Doctor</a>
          <a className={patientActive ? 'active' : ''} href="/patient">Patient</a>
        </nav>
        <span className="api-label">API: {API_BASE}</span>
      </div>
    </header>
  )
}

function DoctorDashboard() {
  const [queue, setQueue] = useState([])
  const [queueLoading, setQueueLoading] = useState(false)
  const [queueError, setQueueError] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')

  const [sessionData, setSessionData] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState('')

  const [actionLoading, setActionLoading] = useState({
    summary: false,
    triage: false,
    override: false
  })

  const [toast, setToast] = useState(null)

  const [overrideOpen, setOverrideOpen] = useState(false)
  const [overrideLevel, setOverrideLevel] = useState('Urgent')
  const [overrideReason, setOverrideReason] = useState('')

  const currentTriageResult = sessionData?.latest_triage_result || null
  const latestSummary = sessionData?.latest_ai_summary?.payload?.summary || null

  const sortedMessages = useMemo(() => {
    const messages = sessionData?.messages || []
    return [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [sessionData])

  async function loadQueue(preserveSelection = true) {
    setQueueLoading(true)
    setQueueError('')
    try {
      const data = await apiRequest('/triage/queue')
      const items = data.items || []
      setQueue(items)

      if (!preserveSelection || !selectedSessionId) {
        if (items.length > 0) setSelectedSessionId(items[0].session_id)
        return
      }

      const stillExists = items.some((item) => item.session_id === selectedSessionId)
      if (!stillExists && items.length > 0) {
        setSelectedSessionId(items[0].session_id)
      }
    } catch (error) {
      setQueueError(String(error.message || error))
    } finally {
      setQueueLoading(false)
    }
  }

  async function loadSession(sessionId) {
    if (!sessionId) return
    setSessionLoading(true)
    setSessionError('')
    try {
      const data = await apiRequest(`/sessions/${sessionId}`)
      setSessionData(data)
    } catch (error) {
      setSessionError(String(error.message || error))
      setSessionData(null)
    } finally {
      setSessionLoading(false)
    }
  }

  function showToast(type, message) {
    setToast({ type, message })
    window.clearTimeout(window.__triageToastTimer)
    window.__triageToastTimer = window.setTimeout(() => setToast(null), 3600)
  }

  useEffect(() => {
    loadQueue(false)
    const intervalId = setInterval(() => loadQueue(true), 20000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (selectedSessionId) {
      loadSession(selectedSessionId)
    }
  }, [selectedSessionId])

  async function handleGenerateSummary() {
    if (!selectedSessionId) return
    setActionLoading((prev) => ({ ...prev, summary: true }))
    try {
      await apiRequest(`/sessions/${selectedSessionId}/ai-summary`, {
        method: 'POST',
        body: JSON.stringify({})
      })
      showToast('success', 'AI summary generated.')
      await loadSession(selectedSessionId)
    } catch (error) {
      showToast('error', `Summary failed: ${error.message}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, summary: false }))
    }
  }

  async function handleGenerateTriage() {
    if (!selectedSessionId) return
    setActionLoading((prev) => ({ ...prev, triage: true }))
    try {
      await apiRequest(`/sessions/${selectedSessionId}/triage`, {
        method: 'POST',
        body: JSON.stringify({})
      })
      showToast('success', 'Triage result generated.')
      await Promise.all([loadQueue(true), loadSession(selectedSessionId)])
    } catch (error) {
      showToast('error', `Triage failed: ${error.message}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, triage: false }))
    }
  }

  async function handleOverrideSubmit(event) {
    event.preventDefault()
    if (!currentTriageResult?.id) {
      showToast('error', 'No triage result to override.')
      return
    }
    if (!overrideReason.trim()) {
      showToast('error', 'Override reason is required.')
      return
    }

    setActionLoading((prev) => ({ ...prev, override: true }))
    try {
      await apiRequest(`/triage/${currentTriageResult.id}/override`, {
        method: 'POST',
        body: JSON.stringify({
          final_level: overrideLevel,
          reason: overrideReason.trim()
        })
      })
      showToast('success', `Override applied: ${overrideLevel}`)
      setOverrideOpen(false)
      setOverrideReason('')
      await Promise.all([loadQueue(true), loadSession(selectedSessionId)])
    } catch (error) {
      showToast('error', `Override failed: ${error.message}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, override: false }))
    }
  }

  return (
    <div className="app-shell">
      <ShellHeader title="Doctor Dashboard" subtitle="Queue, summary, triage, and overrides" />

      <main className="layout-grid">
        <aside className="queue-panel card">
          <div className="panel-head">
            <h2>Patient Queue</h2>
            <span className="count-pill">{queue.length}</span>
          </div>

          {queueError ? <p className="error-text">{queueError}</p> : null}

          <div className="queue-list">
            {queue.length === 0 && !queueLoading ? (
              <p className="empty-text">No active sessions yet.</p>
            ) : null}

            {queue.map((item) => (
              <button
                key={item.triage_result_id || item.session_id}
                className={`queue-item ${selectedSessionId === item.session_id ? 'selected' : ''}`}
                onClick={() => setSelectedSessionId(item.session_id)}
              >
                <div className="queue-item-head">
                  <LevelBadge level={item.final_level} />
                  <span className="timestamp">{formatDate(item.created_at)}</span>
                </div>
                <p>Session #{shortId(item.session_id)}</p>
                <p>Patient #{shortId(item.patient_id)}</p>
                <p className="muted">Override: {item.rule_override ? 'Yes' : 'No'}</p>
                {!item.triage_result_id ? <p className="muted">Awaiting triage generation</p> : null}
              </button>
            ))}
          </div>
        </aside>

        <section className="detail-panel card">
          <div className="panel-head with-actions">
            <h2>Session Detail</h2>
            <div className="inline-actions">
              <button className="action-btn" onClick={handleGenerateSummary} disabled={!selectedSessionId || actionLoading.summary}>
                {actionLoading.summary ? 'Generating...' : 'Generate Summary'}
              </button>
              <button className="action-btn" onClick={handleGenerateTriage} disabled={!selectedSessionId || actionLoading.triage}>
                {actionLoading.triage ? 'Generating...' : 'Generate Triage'}
              </button>
              <button
                className="action-btn warning"
                onClick={() => {
                  setOverrideLevel(currentTriageResult?.final_level || 'Urgent')
                  setOverrideOpen(true)
                }}
                disabled={!currentTriageResult}
              >
                Doctor Override
              </button>
            </div>
          </div>

          {!selectedSessionId ? <p className="empty-text">Select a queue item to view details.</p> : null}
          {sessionLoading ? <p className="muted">Loading session...</p> : null}
          {sessionError ? <p className="error-text">{sessionError}</p> : null}

          {sessionData ? (
            <div className="detail-content">
              <article className="data-block">
                <h3>Session Meta</h3>
                <div className="meta-grid">
                  <p><strong>Session:</strong> {sessionData.session?.session_id}</p>
                  <p><strong>Patient:</strong> {sessionData.session?.patient_id}</p>
                  <p><strong>Status:</strong> {sessionData.session?.status}</p>
                  <p><strong>Started:</strong> {formatDate(sessionData.session?.started_at)}</p>
                </div>
              </article>

              <article className="data-block">
                <h3>Latest Triage</h3>
                {currentTriageResult ? (
                  <>
                    <div className="triage-line">
                      <p><strong>Model:</strong> <LevelBadge level={currentTriageResult.model_level} /></p>
                      <p><strong>Final:</strong> <LevelBadge level={currentTriageResult.final_level} /></p>
                    </div>
                    <p><strong>Rule Override:</strong> {currentTriageResult.rule_override ? 'Yes' : 'No'}</p>
                    <p><strong>Updated:</strong> {formatDate(currentTriageResult.reviewed_at || currentTriageResult.created_at)}</p>
                    {currentTriageResult.rationale?.triggered_rules?.length ? (
                      <div>
                        <p><strong>Triggered Rules:</strong></p>
                        <ul>
                          {currentTriageResult.rationale.triggered_rules.map((rule, idx) => (
                            <li key={`${rule.rule_id}-${idx}`}>
                              {rule.rule_id}: {rule.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {currentTriageResult.rationale?.doctor_override ? (
                      <p>
                        <strong>Doctor Note:</strong> {currentTriageResult.rationale.doctor_override.reason}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="muted">No triage result yet.</p>
                )}
              </article>

              <article className="data-block">
                <h3>AI Summary</h3>
                {latestSummary ? (
                  <div className="summary-grid">
                    <p><strong>Chief Complaint:</strong> {latestSummary.chief_complaint || '-'}</p>
                    <p><strong>Duration:</strong> {latestSummary.duration || '-'}</p>
                    <p><strong>Severity:</strong> {latestSummary.severity || '-'}</p>
                    <p><strong>Recommended Level:</strong> {latestSummary.recommended_triage_level || '-'}</p>
                    <p><strong>Symptoms:</strong> {(latestSummary.symptoms || []).join(', ') || '-'}</p>
                    <p><strong>Red Flags:</strong> {(latestSummary.red_flags || []).join(', ') || '-'}</p>
                    <p><strong>Clinical Summary:</strong> {latestSummary.clinical_summary || '-'}</p>
                  </div>
                ) : (
                  <p className="muted">No summary generated yet.</p>
                )}
              </article>

              <article className="data-block">
                <h3>Conversation</h3>
                <div className="messages-list">
                  {sortedMessages.map((msg) => (
                    <div key={msg.id} className="message-item">
                      <div className="message-head">
                        <span className="sender-tag">{msg.sender}</span>
                        <span className="timestamp">{formatDate(msg.created_at)}</span>
                      </div>
                      <p><strong>Source ({msg.source_language}):</strong> {msg.source_text}</p>
                      <p><strong>Translated:</strong> {msg.translated_text || '-'}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          ) : null}
        </section>
      </main>

      {overrideOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card" onSubmit={handleOverrideSubmit}>
            <h3>Doctor Override</h3>
            <label>
              Final Level
              <select value={overrideLevel} onChange={(e) => setOverrideLevel(e.target.value)}>
                <option value="Critical">Critical</option>
                <option value="Urgent">Urgent</option>
                <option value="Moderate">Moderate</option>
                <option value="Mild">Mild</option>
              </select>
            </label>

            <label>
              Reason
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Clinical reason for override"
                rows={4}
                required
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setOverrideOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="action-btn warning" disabled={actionLoading.override}>
                {actionLoading.override ? 'Saving...' : 'Confirm Override'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {toast ? <div className={`toast ${toast.type}`}>{toast.message}</div> : null}
    </div>
  )
}

function PatientPage() {
  const [sessionId, setSessionId] = useState('')
  const [sessionInput, setSessionInput] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('th')
  const [translatedLanguage, setTranslatedLanguage] = useState('en')
  const [externalRef, setExternalRef] = useState('')
  const [initialText, setInitialText] = useState('')
  const [messageText, setMessageText] = useState('')
  const [followupAnswers, setFollowupAnswers] = useState(FOLLOWUP_DEFAULTS)

  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const latestTriage = sessionData?.latest_triage_result || null
  const latestSummary = sessionData?.latest_ai_summary?.payload?.summary || null

  const messages = useMemo(() => {
    const rows = sessionData?.messages || []
    return [...rows].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [sessionData])

  function showToast(type, message) {
    setToast({ type, message })
    window.clearTimeout(window.__patientToastTimer)
    window.__patientToastTimer = window.setTimeout(() => setToast(null), 3600)
  }

  async function loadSession(targetSessionId) {
    if (!targetSessionId) return
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest(`/sessions/${targetSessionId}`)
      setSessionData(data)
    } catch (err) {
      setError(String(err.message || err))
      setSessionData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!sessionId) return
    loadSession(sessionId)
    const intervalId = setInterval(() => loadSession(sessionId), 15000)
    return () => clearInterval(intervalId)
  }, [sessionId])

  async function handleStartSession(event) {
    event.preventDefault()
    if (!initialText.trim()) {
      showToast('error', 'Please describe your symptoms first.')
      return
    }

    let composedInitialText = initialText.trim()
    if (hasMeaningfulFollowupAnswers(followupAnswers)) {
      composedInitialText = `${composedInitialText}\n\n${buildFollowupMessage(followupAnswers)}`
    }

    setSending(true)
    try {
      const response = await apiRequest('/intake', {
        method: 'POST',
        body: JSON.stringify({
          source_language: sourceLanguage,
          initial_text: composedInitialText,
          translated_language: translatedLanguage,
          external_ref: externalRef.trim() || null
        })
      })
      const newSessionId = response.session_id
      setSessionId(newSessionId)
      setSessionInput(newSessionId)
      setInitialText('')
      setFollowupAnswers(FOLLOWUP_DEFAULTS)
      showToast('success', `Session created: ${shortId(newSessionId)}`)
    } catch (err) {
      showToast('error', `Failed to start session: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault()
    if (!sessionId) {
      showToast('error', 'No active session. Start or load a session first.')
      return
    }
    if (!messageText.trim()) {
      showToast('error', 'Message cannot be empty.')
      return
    }

    setSending(true)
    try {
      await apiRequest(`/sessions/${sessionId}/message`, {
        method: 'POST',
        body: JSON.stringify({
          sender: 'patient',
          source_language: sourceLanguage,
          source_text: messageText.trim()
        })
      })
      setMessageText('')
      await loadSession(sessionId)
      showToast('success', 'Message sent.')
    } catch (err) {
      showToast('error', `Failed to send message: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  function handleLoadExistingSession(event) {
    event.preventDefault()
    const value = sessionInput.trim()
    if (!value) {
      showToast('error', 'Please enter session ID.')
      return
    }
    setSessionId(value)
  }

  return (
    <div className="app-shell">
      <ShellHeader title="Patient Portal" subtitle="Start triage session and update your symptoms" />

      <main className="patient-layout">
        <section className="card patient-card">
          <h2>Start New Session</h2>
          <form className="patient-form" onSubmit={handleStartSession}>
            <label>
              Source Language
              <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
                <option value="th">Thai (th)</option>
                <option value="en">English (en)</option>
                <option value="my">Burmese (my)</option>
                <option value="ksw">Karen (ksw)</option>
              </select>
            </label>

            <label>
              Translation Target
              <select value={translatedLanguage} onChange={(e) => setTranslatedLanguage(e.target.value)}>
                <option value="en">English (en)</option>
                <option value="th">Thai (th)</option>
              </select>
            </label>

            <label>
              Reference (optional)
              <input
                type="text"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="Hospital ID, phone, or visit ref"
              />
            </label>

            <label>
              Describe symptoms
              <textarea
                rows={5}
                value={initialText}
                onChange={(e) => setInitialText(e.target.value)}
                placeholder="Example: เจ็บหน้าอก หายใจลำบาก เวียนหัว 30 นาที"
                required
              />
            </label>

            <p className="muted">Optional follow-up details for faster doctor triage.</p>
            <div className="followup-grid">
              <label>
                Duration
                <input
                  type="text"
                  value={followupAnswers.duration}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 30 minutes, 2 hours, since morning"
                />
              </label>

              <label>
                Severity
                <select
                  value={followupAnswers.severity}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="unknown">Unknown</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label>
                Pain Scale (0-10)
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={followupAnswers.pain_scale}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, pain_scale: e.target.value }))}
                  placeholder="0-10"
                />
              </label>

              <label>
                Shortness of Breath
                <select
                  value={followupAnswers.shortness_of_breath}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, shortness_of_breath: e.target.value }))}
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>
                Fever
                <select
                  value={followupAnswers.fever}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, fever: e.target.value }))}
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>
                Vomiting
                <select
                  value={followupAnswers.vomiting}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, vomiting: e.target.value }))}
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>
                Bleeding
                <select
                  value={followupAnswers.bleeding}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, bleeding: e.target.value }))}
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>
                Loss of Consciousness
                <select
                  value={followupAnswers.loss_of_consciousness}
                  onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, loss_of_consciousness: e.target.value }))}
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>

            <label>
              Chronic Conditions
              <input
                type="text"
                value={followupAnswers.chronic_conditions}
                onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, chronic_conditions: e.target.value }))}
                placeholder="e.g., hypertension, diabetes, asthma"
              />
            </label>

            <label>
              Current Medications
              <input
                type="text"
                value={followupAnswers.current_medications}
                onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, current_medications: e.target.value }))}
                placeholder="e.g., aspirin, metformin"
              />
            </label>

            <label>
              Drug Allergies
              <input
                type="text"
                value={followupAnswers.drug_allergies}
                onChange={(e) => setFollowupAnswers((prev) => ({ ...prev, drug_allergies: e.target.value }))}
                placeholder="e.g., penicillin"
              />
            </label>

            <button className="action-btn" type="submit" disabled={sending}>
              {sending ? 'Starting...' : 'Start Session'}
            </button>
          </form>
        </section>

        <section className="card patient-card">
          <h2>Open Existing Session</h2>
          <form className="inline-form" onSubmit={handleLoadExistingSession}>
            <input
              type="text"
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              placeholder="Paste session ID"
            />
            <button className="ghost-btn" type="submit">Load</button>
          </form>

          <p className="muted">Current session: {sessionId || '-'}</p>

          <form className="patient-form" onSubmit={handleSendMessage}>
            <label>
              Add message
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Update your current symptoms"
              />
            </label>
            <div className="inline-actions">
              <button className="action-btn" type="submit" disabled={!sessionId || sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
              <button className="ghost-btn" type="button" onClick={() => loadSession(sessionId)} disabled={!sessionId || loading}>
                {loading ? 'Refreshing...' : 'Check Status'}
              </button>
            </div>
          </form>
        </section>

        <section className="card patient-card">
          <h2>Triage Status</h2>
          {error ? <p className="error-text">{error}</p> : null}
          {!sessionId ? <p className="empty-text">Start or load a session to view status.</p> : null}

          {sessionData ? (
            <>
              <p><strong>Session:</strong> {sessionData.session?.session_id}</p>
              <p><strong>Started:</strong> {formatDate(sessionData.session?.started_at)}</p>
              <p><strong>Status:</strong> {sessionData.session?.status}</p>

              <div className="status-box">
                <p><strong>Current Triage:</strong></p>
                {latestTriage ? (
                  <>
                    <p><LevelBadge level={latestTriage.final_level} /></p>
                    <p className="muted">Updated {formatDate(latestTriage.reviewed_at || latestTriage.created_at)}</p>
                  </>
                ) : (
                  <p className="muted">Pending review by medical staff.</p>
                )}
              </div>

              {latestSummary ? (
                <div className="status-box">
                  <p><strong>AI Summary:</strong> {latestSummary.clinical_summary || '-'}</p>
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="card patient-card">
          <h2>Conversation</h2>
          <div className="messages-list">
            {messages.length === 0 ? <p className="muted">No messages yet.</p> : null}
            {messages.map((msg) => (
              <div key={msg.id} className="message-item">
                <div className="message-head">
                  <span className="sender-tag">{msg.sender}</span>
                  <span className="timestamp">{formatDate(msg.created_at)}</span>
                </div>
                <p><strong>Source ({msg.source_language}):</strong> {msg.source_text}</p>
                <p><strong>Translated:</strong> {msg.translated_text || '-'}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {toast ? <div className={`toast ${toast.type}`}>{toast.message}</div> : null}
    </div>
  )
}

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/doctor'
  if (path.startsWith('/patient')) {
    return <PatientPage />
  }
  return <DoctorDashboard />
}
