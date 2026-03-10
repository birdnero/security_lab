export const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0B"
    const units = ["B", "KB", "MB", "GB", "TB"]
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / Math.pow(1024, index)
    const precision = value >= 100 || index === 0 ? 0 : value >= 10 ? 1 : 2
    return `${value.toFixed(precision)}${units[index]}`
}

export const formatBytesPerSecond = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`
}
