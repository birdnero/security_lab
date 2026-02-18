export const SERVER_URL_STORAGE_KEY = "security_lab_server_url"
export const BACKEND_PORT = 8000
export const DEFAULT_IP_OCTETS = ["127", "0", "0", "1"] as const
export const TAB_NAMES = ["Main", "Random"] as const

export type IpOctets = [string, string, string, string]
export type TabName = typeof TAB_NAMES[number]

const TAB_PATHS: Record<TabName, string> = {
    Main: "/",
    Random: "/random",
}

const TAB_PAGE_TITLES: Record<TabName, string> = {
    Main: "Pick-me Security 🌸",
    Random: "Pseudo-Random Generator 🍭",
}

export const normalizeOctet = (value: string) => value.replace(/\D/g, "").slice(0, 3)

export const isValidOctet = (value: string) => {
    if (value.length === 0) return false
    const n = Number(value)
    return Number.isInteger(n) && n >= 0 && n <= 255
}

export const parseIpFromUrl = (value: string): IpOctets | null => {
    try {
        const normalized = value.includes("://") ? value : `http://${value}`
        const host = new URL(normalized).hostname
        const parts = host.split(".")
        if (parts.length !== 4 || !parts.every(isValidOctet)) return null
        return [parts[0], parts[1], parts[2], parts[3]]
    } catch {
        return null
    }
}

export const buildApiUrl = (octets: IpOctets) => `http://${octets.join(".")}:${BACKEND_PORT}/`

export const toIpOctets = (octets: string[]): IpOctets => [
    octets[0] ?? DEFAULT_IP_OCTETS[0],
    octets[1] ?? DEFAULT_IP_OCTETS[1],
    octets[2] ?? DEFAULT_IP_OCTETS[2],
    octets[3] ?? DEFAULT_IP_OCTETS[3],
]

export const tabPathResolve = (tab: TabName) => TAB_PATHS[tab]

export const pageTitleResolve = (pathname: string) => {
    const matchOrder = [...TAB_NAMES].sort((a, b) => TAB_PATHS[b].length - TAB_PATHS[a].length)
    const matchedTab = matchOrder.find((tab) => {
        const tabPath = TAB_PATHS[tab]
        if (tabPath === "/") return pathname === "/"
        return pathname === tabPath || pathname.startsWith(`${tabPath}/`)
    }) ?? TAB_NAMES[0]

    return TAB_PAGE_TITLES[matchedTab]
}
