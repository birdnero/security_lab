// Опції для побудови компактного hex-прев’ю (для прев’ю файлів).
type HexPreviewOptions = {
    bytesPerLine?: number
    maxLines?: number
}

// Опції для обрізання текстового прев’ю у блоці результату.
type TruncateOptions = {
    maxLines?: number
    maxChars?: number
}

// Перетворює байти у hex-рядок (нижній регістр).
// Використовується в provider.encryption.tsx для текстового виводу й прев’ю файлу.
export const toHex = (bytes: Uint8Array) => {
    let out = ""
    for (let i = 0; i < bytes.length; i += 1) {
        out += bytes[i].toString(16).padStart(2, "0")
    }
    return out
}

// Декодує байти як UTF-8 для дешифрованого тексту.
// Використовується в provider.encryption.tsx.
export const decodeUtf8 = (bytes: Uint8Array) => {
    try {
        return new TextDecoder("utf-8").decode(bytes)
    } catch {
        return ""
    }
}

// Перевіряє, чи валідний hex-рядок (ігнорує пробіли).
// Використовується перед дешифруванням тексту, щоб приймати hex-ввід.
export const isHexString = (value: string) => {
    const normalized = value.replace(/\s+/g, "")
    if (!normalized || normalized.length % 2 !== 0) return false
    return /^[0-9a-fA-F]+$/.test(normalized)
}

// Перетворює hex-рядок у байти для запитів на дешифрування.
// Використовується в provider.encryption.tsx у режимі decrypt.
export const hexToBytes = (value: string) => {
    const normalized = value.replace(/\s+/g, "")
    const out = new Uint8Array(normalized.length / 2)
    for (let i = 0; i < normalized.length; i += 2) {
        out[i / 2] = parseInt(normalized.slice(i, i + 2), 16)
    }
    return out
}

// Будує коротке hex-прев’ю (N рядків, M байтів у рядку) і додає "..." при обрізанні.
// Використовується в provider.encryption.tsx для прев’ю результату файлу.
export const buildHexPreview = (bytes: Uint8Array, options: HexPreviewOptions = {}) => {
    const bytesPerLine = options.bytesPerLine ?? 16
    const maxLines = options.maxLines ?? 1
    const maxPreviewBytes = bytesPerLine * maxLines
    const previewBytes = bytes.slice(0, maxPreviewBytes)
    const previewHex = toHex(previewBytes)
    const previewLines: string[] = []
    for (let i = 0; i < previewHex.length; i += bytesPerLine * 2) {
        previewLines.push(previewHex.slice(i, i + bytesPerLine * 2))
    }
    let preview = previewLines.join("\n")
    if (bytes.length > previewBytes.length) {
        preview += "..."
    }
    return preview
}

// Обрізає довгий вивід для UI (спочатку по рядках, потім по символах) і додає "...".
// Використовується в EncryptionResultSection.tsx.
export const truncateText = (text: string, options: TruncateOptions = {}) => {
    const maxLines = options.maxLines ?? 1
    const maxChars = options.maxChars ?? 100
    const lines = text.split(/\r?\n/)
    if (lines.length > maxLines) {
        return `${lines.slice(0, maxLines).join("\n")}...`
    }
    if (text.length > maxChars) {
        return `${text.slice(0, maxChars)}...`
    }
    return text
}

// Запускає завантаження з готового object URL.
// Використовується в EncryptionResultSection.tsx.
export const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()
}

// Створює blob URL з байтів і завантажує його, потім звільняє URL.
// Використовується в EncryptionResultSection.tsx для завантаження текстового результату.
export const downloadBytes = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    triggerDownload(url, filename)
    URL.revokeObjectURL(url)
}
