export const SERVER_URL_STORAGE_KEY = "security_lab_server_url"
export const DEFAULT_API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "https://security-lab-one.vercel.app/"
export const TAB_NAMES = ["Main", "Random", "Hash"] as const

export type TabName = typeof TAB_NAMES[number]

const TAB_PATHS: Record<TabName, string> = {
    Main: "/",
    Random: "/random",
    Hash: "/hash"
}

const TAB_PAGE_TITLES: Record<TabName, string> = {
    Main: "Pick-me Security 🌸",
    Random: "Pseudo-Random Generator 🍭",
    Hash: "Speed-light hash evaluator 😈"
}

const isLikelyLocalHost = (value: string) => {
    const host = value.split("/")[0] ?? ""
    if (host === "localhost") return true
    if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true
    if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host)) return true
    return false
}

const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`)

export const normalizeServerUrl = (value: string) => {
    const raw = value.trim()
    if (!raw) return DEFAULT_API_URL
    const withScheme = raw.includes("://")
        ? raw
        : `${isLikelyLocalHost(raw) ? "http" : "https"}://${raw}`
    try {
        const url = new URL(withScheme)
        const path = url.pathname.replace(/\/+$/, "")
        return ensureTrailingSlash(`${url.origin}${path}`)
    } catch {
        return DEFAULT_API_URL
    }
}

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
