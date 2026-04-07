import { useState, useRef, useCallback } from 'react'
import { compressImage, formatBytes } from '../utils/imageUtils'
import ExtractionConfirm from '../components/ExtractionConfirm'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const LOADING_STEPS = [
    { key: 'upload', label: 'Uploading image…' },
    { key: 'ocr', label: 'Running OCR analysis…' },
    { key: 'extract', label: 'Extracting receipt data…' },
]

export default function CapturePage() {
    const [phase, setPhase] = useState('idle') // idle | preview | loading | confirm | done | error
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [dragging, setDragging] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [extracted, setExtracted] = useState(null)
    const [errorMsg, setErrorMsg] = useState('')
    const inputRef = useRef(null)

    const handleFile = useCallback((f) => {
        if (!f || !f.type.startsWith('image/')) {
            setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).')
            return
        }
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setPhase('preview')
        setErrorMsg('')
    }, [])

    const onDrop = (e) => {
        e.preventDefault(); setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    const onInputChange = (e) => { const f = e.target.files[0]; if (f) handleFile(f) }

    const handleSubmit = async () => {
        setPhase('loading')
        setLoadingStep(0)
        try {
            setLoadingStep(0)
            const base64 = await compressImage(file)
            setLoadingStep(1)
            const res = await axios.post(`${API_BASE}/api/parse`, { image: base64 })
            setLoadingStep(2)
            await new Promise(r => setTimeout(r, 600))
            setExtracted(res.data)
            setPhase('confirm')
        } catch (err) {
            setErrorMsg(err?.response?.data?.error || 'Failed to process the receipt. Please try again.')
            setPhase('error')
        }
    }

    const handleReset = () => {
        setPhase('idle'); setFile(null); setPreview(null); setExtracted(null); setErrorMsg('')
        if (inputRef.current) inputRef.current.value = ''
    }

    const handleConfirmed = () => { setPhase('done') }

    return (
        <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>📷 Capture Receipt</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
                Take a photo or upload a receipt image to auto-extract the total, date, and category.
            </p>

            {phase === 'done' && (
                <div className="alert alert-success">
                    ✅ Transaction saved! <a onClick={handleReset} style={{ cursor: 'pointer', marginLeft: 8, textDecoration: 'underline' }}>Capture another</a>
                </div>
            )}
            {phase === 'error' && (
                <div className="alert alert-error">⚠️ {errorMsg}</div>
            )}

            {(phase === 'idle' || phase === 'error') && (
                <div
                    className={`card upload-zone ${dragging ? 'dragging' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    id="upload-zone"
                >
                    <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={onInputChange} style={{ display: 'none' }} />
                    <div className="upload-icon">🧾</div>
                    <div className="upload-title">Drop receipt here or tap to capture</div>
                    <div className="upload-sub">Camera or file upload supported</div>
                    <div className="upload-formats">JPEG · PNG · WEBP · HEIC</div>
                </div>
            )}

            {phase === 'preview' && file && (
                <div className="card">
                    <div className="card-title">📋 Preview</div>
                    <div className="preview-wrap">
                        <img src={preview} alt="Receipt preview" className="preview-img" />
                        <p className="preview-info">{file.name} · {formatBytes(file.size)}</p>
                        <div className="preview-actions">
                            <button className="btn btn-secondary" onClick={handleReset}>🔄 Change</button>
                            <button className="btn btn-primary btn-lg" onClick={handleSubmit} id="parse-btn">
                                ✨ Parse Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'loading' && (
                <div className="card">
                    <div className="loading-wrap">
                        <div className="spinner" />
                        <div className="loading-title">Analysing your receipt…</div>
                        <div className="loading-sub">This usually takes a few seconds</div>
                        <div className="loading-steps">
                            {LOADING_STEPS.map((s, i) => (
                                <div key={s.key} className={`loading-step ${i < loadingStep ? 'done' : i === loadingStep ? 'active' : ''}`}>
                                    {i < loadingStep ? '✓' : i === loadingStep ? '⟳' : '○'} {s.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {phase === 'confirm' && extracted && (
                <ExtractionConfirm extracted={extracted} onConfirmed={handleConfirmed} onRetry={handleReset} />
            )}
        </div>
    )
}
