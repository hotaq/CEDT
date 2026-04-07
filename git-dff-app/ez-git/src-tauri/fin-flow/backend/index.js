require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '12mb' }))

// In-memory store (replace with DB in production)
let transactions = []

// ─── OCR + LLM Route (Task 2.1, 2.2, 2.3) ────────────────────────────────────
const { parseReceiptImage } = require('./ocr')
app.post('/api/parse', async (req, res) => {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'No image provided.' })
    try {
        const extracted = await parseReceiptImage(image)
        res.json(extracted)
    } catch (err) {
        console.error('Parse error:', err.message)
        res.status(500).json({ error: err.message || 'Processing failed.' })
    }
})

// ─── Transactions CRUD (Tasks 3.1, 3.3) ──────────────────────────────────────
app.get('/api/transactions', (req, res) => {
    res.json([...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

app.post('/api/transactions', (req, res) => {
    const { total, date, category, merchant, status } = req.body
    if (!total || !date) return res.status(400).json({ error: 'total and date are required.' })
    const tx = { id: uuidv4(), total: parseFloat(total), date, category: category || 'Other', merchant: merchant || 'Unknown', status: status || 'pending', createdAt: new Date().toISOString() }
    transactions.push(tx)
    res.status(201).json(tx)
})

app.put('/api/transactions/:id', (req, res) => {
    const idx = transactions.findIndex(t => t.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found.' })
    transactions[idx] = { ...transactions[idx], ...req.body, id: req.params.id }
    res.json(transactions[idx])
})

app.delete('/api/transactions/:id', (req, res) => {
    const before = transactions.length
    transactions = transactions.filter(t => t.id !== req.params.id)
    if (transactions.length === before) return res.status(404).json({ error: 'Not found.' })
    res.json({ ok: true })
})

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`SmartBudget backend running on http://localhost:${PORT}`))
