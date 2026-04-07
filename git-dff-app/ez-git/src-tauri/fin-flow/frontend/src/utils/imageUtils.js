/**
 * Compresses and resizes an image file before sending to the API.
 * Targets ~800px max dimension and 80% quality, returning a base64 string.
 */
export async function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()

        reader.onload = (e) => { img.src = e.target.result }
        reader.onerror = reject

        img.onload = () => {
            const MAX_DIM = 1024
            let { width, height } = img
            if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) { height = Math.round((height / width) * MAX_DIM); width = MAX_DIM }
                else { width = Math.round((width / height) * MAX_DIM); height = MAX_DIM }
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.82))
        }

        reader.readAsDataURL(file)
    })
}

export function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function formatCurrency(value, currency = 'THB') {
    if (!value && value !== 0) return '—'
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency, minimumFractionDigits: 2 }).format(value)
}

export function formatDate(dateStr) {
    if (!dateStr) return '—'
    try {
        const d = new Date(dateStr)
        if (isNaN(d)) return dateStr
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return dateStr }
}

export const CATEGORIES = ['Food & Drink', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other']

export function getCategoryColor(cat) {
    const map = {
        'food': 'var(--category-food)',
        'food & drink': 'var(--category-food)',
        'transport': 'var(--category-transport)',
        'shopping': 'var(--category-shopping)',
        'health': 'var(--category-health)',
    }
    return map[cat?.toLowerCase()] ?? 'var(--category-other)'
}
