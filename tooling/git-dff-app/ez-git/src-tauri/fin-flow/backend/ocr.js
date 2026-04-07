/**
 * ocr.js — Typhoon OCR + regex parsing (Tasks 2.2 & 2.3)
 *
 * Uses:
 *  - https://api.opentyphoon.ai/v1/ocr  → extract raw text from image
 *  - Local regex heuristics              → parse into { total, date, category, merchant }
 */

const FormData = require('form-data')
const fetch = require('node-fetch')

// ─── Task 2.2: Call Typhoon OCR ──────────────────────────────────────────────
async function callTyphoonOCR(imageBuffer, mimeType) {
    const TYPHOON_API_KEY = process.env.TYPHOON_API_KEY
    if (!TYPHOON_API_KEY) throw new Error('TYPHOON_API_KEY is not set in .env')

    const formData = new FormData()
    formData.append('file', imageBuffer, { filename: `receipt.${mimeType.split('/')[1] || 'jpg'}`, contentType: mimeType })
    formData.append('model', 'typhoon-ocr')
    formData.append('task_type', 'default')
    formData.append('max_tokens', '16384')
    formData.append('temperature', '0.1')
    formData.append('top_p', '0.6')
    formData.append('repetition_penalty', '1.2')

    const response = await fetch('https://api.opentyphoon.ai/v1/ocr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TYPHOON_API_KEY}`, ...formData.getHeaders() },
        body: formData,
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Typhoon OCR error ${response.status}: ${errText.slice(0, 300)}`)
    }

    const result = await response.json()
    const extractedTexts = []

    for (const pageResult of result.results || []) {
        if (pageResult.success && pageResult.message) {
            let content = pageResult.message.choices[0].message.content
            try {
                const parsed = JSON.parse(content)
                content = parsed.natural_text || content
            } catch { /* use as-is */ }
            extractedTexts.push(content)
        } else if (!pageResult.success) {
            console.warn(`OCR page error: ${pageResult.error}`)
        }
    }

    return extractedTexts.join('\n')
}

// ─── Task 2.3: Parse extracted text with regex heuristics ────────────────────
const THAI_MONTHS = {
    'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
    'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
    'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12',
}

function parseOCRText(text) {
    // ── Total ──────────────────────────────────────────────────────────────
    // Thai slip: จำนวน: 37.00 บาท | Total: 37.00 | ยอดรวม 37.00 | รวม 37.00
    let total = null
    const totalPatterns = [
        /จำนวน[:\s]+([0-9,]+(?:\.[0-9]{2})?)\s*บาท/,
        /ยอด(?:รวม|สุทธิ|ชำระ)[:\s]+([0-9,]+(?:\.[0-9]{2})?)/,
        /รวม[:\s]+([0-9,]+(?:\.[0-9]{2})?)/,
        /total[:\s]+([0-9,]+(?:\.[0-9]{2})?)/i,
        /amount[:\s]+([0-9,]+(?:\.[0-9]{2})?)/i,
    ]
    for (const re of totalPatterns) {
        const m = text.match(re)
        if (m) { total = parseFloat(m[1].replace(/,/g, '')); break }
    }

    // ── Date ───────────────────────────────────────────────────────────────
    // Thai: "24 ก.พ. 69" (Buddhist year) | ISO: 2026-02-24 | 24/02/2026
    let date = null
    const thaiDateRe = /(\d{1,2})\s*(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*(\d{2,4})/
    const isoRe = /(\d{4})-(\d{2})-(\d{2})/
    const slashRe = /(\d{1,2})\/(\d{1,2})\/(\d{4})/

    const thaiM = text.match(thaiDateRe)
    if (thaiM) {
        const day = thaiM[1].padStart(2, '0')
        const month = THAI_MONTHS[thaiM[2]] || '01'
        let year = parseInt(thaiM[3])
        // Convert Buddhist Era (2500+) if > 2100. 2-digit: era is ~2500s so +1957 gives CE.
        if (year < 100) year = year + 2500 - 543  // e.g. 69 BE → 2026 CE
        else if (year > 2400) year = year - 543
        date = `${year}-${month}-${day}`
    } else {
        const isoM = text.match(isoRe)
        if (isoM) { date = `${isoM[1]}-${isoM[2]}-${isoM[3]}` }
        else {
            const slashM = text.match(slashRe)
            if (slashM) { date = `${slashM[3]}-${slashM[2].padStart(2, '0')}-${slashM[1].padStart(2, '0')}` }
        }
    }

    // ── Merchant ───────────────────────────────────────────────────────────
    let merchant = null
    // Thai slip usually has ร้าน prefix or store name on its own line
    const merchantRe = /ร้าน([^\n]+)/
    const mm = text.match(merchantRe)
    if (mm) {
        merchant = 'ร้าน' + mm[1].trim()
    } else {
        // Find first non-empty non-numeric line not matching known header words
        const skipWords = /^(ชำระ|K\+|วันที่|เลข|จำนวน|ค่า|www|Tel|tax|วat|#)/i
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.match(skipWords) && isNaN(l))
        if (lines.length > 0) merchant = lines[0]
    }

    // ── Category heuristic ─────────────────────────────────────────────────
    const lowerText = text.toLowerCase() + (merchant || '').toLowerCase()
    let category = 'Other'
    if (/ร้านอาหาร|food|coffee|ก๋วยเตี๋ยว|ข้าว|ส้มตำ|ปิ้งย่าง|ชา|milk|bakery|pizza|snack|7-eleven|เซเว่น|grab food|foodpanda/.test(lowerText)) category = 'Food & Drink'
    else if (/bts|mrt|grab|taxi|เดินทาง|น้ำมัน|ปตท|เชลล์|บางจาก|parking|รถ/.test(lowerText)) category = 'Transport'
    else if (/pharmacy|โรงพยาบาล|hospital|clinic|drug|ยา|health|dental/.test(lowerText)) category = 'Health'
    else if (/เสื้อ|กางเกง|central|robinson|jmart|power buy|เครื่องใช้ไฟฟ้า|electronic/.test(lowerText)) category = 'Shopping'

    return {
        total,
        date,
        category,
        merchant: merchant?.replace(/\s+/g, ' ').trim() || null,
        incomplete: !total || !date,
    }
}

// ─── Main Export ─────────────────────────────────────────────────────────────
async function parseReceiptImage(base64Image) {
    // Convert base64 data URL to buffer
    const matches = base64Image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!matches) throw new Error('Invalid base64 image format')
    const mimeType = matches[1]
    const buffer = Buffer.from(matches[2], 'base64')

    // Step 1: OCR to get raw text
    let ocrText
    try {
        ocrText = await callTyphoonOCR(buffer, mimeType)
        console.log('OCR raw text:\n' + ocrText)
        if (!ocrText.trim()) throw new Error('OCR returned empty text.')
    } catch (err) {
        throw new Error(`OCR failed: ${err.message}`)
    }

    // Step 2: Parse text with regex (no second API call needed)
    const extracted = parseOCRText(ocrText)
    console.log('Parsed result:', extracted)
    return extracted
}

module.exports = { parseReceiptImage }
