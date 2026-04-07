import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, formatDate, getCategoryColor, CATEGORIES } from '../utils/imageUtils'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function DashboardPage() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editId, setEditId] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [filter, setFilter] = useState('all')

    const fetchTransactions = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await axios.get(`${API_BASE}/api/transactions`)
            setTransactions(res.data)
        } catch {
            setError('Could not load transactions.')
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchTransactions() }, [fetchTransactions])

    const handleDelete = async (id) => {
        if (!confirm('Delete this transaction?')) return
        try { await axios.delete(`${API_BASE}/api/transactions/${id}`); fetchTransactions() }
        catch { alert('Failed to delete.') }
    }

    const startEdit = (tx) => {
        setEditId(tx.id)
        setEditForm({ total: tx.total, date: tx.date?.split('T')[0] ?? tx.date, category: tx.category, merchant: tx.merchant })
    }

    const saveEdit = async () => {
        try {
            await axios.put(`${API_BASE}/api/transactions/${editId}`, { ...editForm, total: parseFloat(editForm.total), status: 'confirmed' })
            setEditId(null); fetchTransactions()
        } catch { alert('Failed to update.') }
    }

    const displayed = filter === 'all' ? transactions : transactions.filter(t => t.status === filter)
    const totalSpend = transactions.filter(t => t.status === 'confirmed').reduce((s, t) => s + Number(t.total || 0), 0)
    const pending = transactions.filter(t => t.status !== 'confirmed').length

    return (
        <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>📊 Expense Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>All your parsed and confirmed transactions.</p>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-value">{transactions.length}</div>
                    <div className="stat-label">Total Receipts</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--success)' }}>฿{totalSpend.toFixed(2)}</div>
                    <div className="stat-label">Confirmed Spend</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: pending > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{pending}</div>
                    <div className="stat-label">Pending Review</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {['all', 'confirmed', 'pending'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
                <button className="btn btn-sm btn-secondary" onClick={fetchTransactions} style={{ marginLeft: 'auto' }}>↺ Refresh</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }} /> Loading…
                </div>
            ) : displayed.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🧾</div>
                    <div className="empty-state-title">No transactions yet</div>
                    <div className="empty-state-sub">Go to <a href="/" style={{ color: 'var(--accent)' }}>Capture</a> to add your first receipt.</div>
                </div>
            ) : (
                <div className="tx-list">
                    {displayed.map(tx => (
                        <div key={tx.id} className={`tx-item ${tx.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                            <div className="tx-cat-dot" style={{ background: getCategoryColor(tx.category) }} />
                            {editId === tx.id ? (
                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <input className="form-input" style={{ fontSize: 12, padding: '4px 8px' }} value={editForm.merchant} onChange={e => setEditForm(f => ({ ...f, merchant: e.target.value }))} placeholder="Merchant" />
                                    <input className="form-input" style={{ fontSize: 12, padding: '4px 8px' }} type="number" step="0.01" value={editForm.total} onChange={e => setEditForm(f => ({ ...f, total: e.target.value }))} placeholder="Total" />
                                    <input className="form-input" style={{ fontSize: 12, padding: '4px 8px' }} type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                                    <select className="form-select" style={{ fontSize: 12, padding: '4px 8px' }} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="tx-meta">
                                    <div className="tx-merchant">{tx.merchant || 'Unknown'}</div>
                                    <div className="tx-date">{formatDate(tx.date)} · <span style={{ color: getCategoryColor(tx.category), fontSize: 11 }}>{tx.category}</span></div>
                                </div>
                            )}
                            <div className="tx-amount">{formatCurrency(tx.total)}</div>
                            <span className={`tx-badge ${tx.status === 'confirmed' ? 'confirmed' : 'pending'}`}>{tx.status}</span>
                            <div className="tx-actions">
                                {editId === tx.id ? (
                                    <>
                                        <button className="btn btn-sm btn-success" onClick={saveEdit} id={`save-edit-${tx.id}`}>✓</button>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>✗</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-sm btn-secondary" onClick={() => startEdit(tx)} id={`edit-btn-${tx.id}`}>✏️</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tx.id)} id={`del-btn-${tx.id}`}>🗑</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
