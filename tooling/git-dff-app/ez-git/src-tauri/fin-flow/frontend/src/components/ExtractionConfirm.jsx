import { useState } from 'react'
import { CATEGORIES, getCategoryColor, formatDate } from '../utils/imageUtils'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ExtractionConfirm({ extracted, onConfirmed, onRetry }) {
    const [form, setForm] = useState({
        total: extracted.total ?? '',
        date: extracted.date ? new Date(extracted.date).toISOString().split('T')[0] : '',
        category: extracted.category ?? 'Other',
        merchant: extracted.merchant ?? '',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const incomplete = extracted.incomplete

    const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const handleConfirm = async (e) => {
        e.preventDefault()
        if (!form.total || !form.date) { setError('Total and Date are required.'); return }
        setSaving(true); setError('')
        try {
            await axios.post(`${API_BASE}/api/transactions`, {
                total: parseFloat(form.total),
                date: form.date,
                category: form.category,
                merchant: form.merchant || 'Unknown',
                status: 'confirmed',
            })
            onConfirmed()
        } catch {
            setError('Failed to save transaction. Please try again.')
            setSaving(false)
        }
    }

    return (
        <div className="card">
            <div className="card-title">✅ Confirm Extracted Data</div>

            {incomplete && (
                <div className="alert alert-warning">
                    ⚠️ Some fields could not be read automatically. Please review and fill in missing values.
                </div>
            )}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="extraction-grid">
                <div className="extraction-field">
                    <div className="extraction-field-label">Total</div>
                    <div className={`extraction-field-value ${!extracted.total ? 'muted' : ''}`}>
                        {extracted.total ? `฿${extracted.total}` : 'Not detected'}
                    </div>
                </div>
                <div className="extraction-field">
                    <div className="extraction-field-label">Date</div>
                    <div className={`extraction-field-value ${!extracted.date ? 'muted' : ''}`} style={{ fontSize: 14 }}>
                        {extracted.date ? formatDate(extracted.date) : 'Not detected'}
                    </div>
                </div>
                <div className="extraction-field">
                    <div className="extraction-field-label">Category</div>
                    <div className="extraction-field-value" style={{ fontSize: 14 }}>
                        <span className="cat-badge" style={{ background: getCategoryColor(extracted.category) + '22', color: getCategoryColor(extracted.category) }}>
                            {extracted.category || 'Other'}
                        </span>
                    </div>
                </div>
            </div>

            <hr className="divider" />

            <form onSubmit={handleConfirm} id="confirm-form">
                <div className="form-group">
                    <label className="form-label">Merchant / Store</label>
                    <input className="form-input" value={form.merchant} onChange={update('merchant')} placeholder="e.g. 7-Eleven, Grab Food…" />
                </div>
                <div className="form-group">
                    <label className="form-label">Total (THB) *</label>
                    <input className="form-input" type="number" step="0.01" min="0" value={form.total} onChange={update('total')} placeholder="0.00" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" value={form.date} onChange={update('date')} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={update('category')}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div className="preview-actions" style={{ marginTop: 16 }}>
                    <button type="button" className="btn btn-secondary" onClick={onRetry}>↩ Try Another</button>
                    <button type="submit" className="btn btn-success btn-lg" id="save-btn" disabled={saving}>
                        {saving ? 'Saving…' : '💾 Save Transaction'}
                    </button>
                </div>
            </form>
        </div>
    )
}
