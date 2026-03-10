import { useCallback, useMemo, useState } from "react"
import { API } from "../API"
import {
    buildApiUrl,
    DEFAULT_IP_OCTETS,
    isValidOctet,
    parseIpFromUrl,
    SERVER_URL_STORAGE_KEY,
    toIpOctets,
    type IpOctets,
    normalizeOctet,
} from "./utils.main"

const getInitialIpOctets = () => {
    const saved = window.localStorage.getItem(SERVER_URL_STORAGE_KEY) ?? API.url
    return parseIpFromUrl(saved) ?? parseIpFromUrl(API.url) ?? toIpOctets([...DEFAULT_IP_OCTETS])
}

const persistServerIp = (octets: IpOctets) => {
    const nextUrl = buildApiUrl(octets)
    API.url = nextUrl
    window.localStorage.setItem(SERVER_URL_STORAGE_KEY, nextUrl)
}

const sanitizeOctetInput = (value: string) => {
    const digitsOnly = normalizeOctet(value)
    if (!digitsOnly) return "0"
    const clamped = Math.min(255, Math.max(0, Number(digitsOnly)))
    return String(clamped)
}

export const useServerIp = () => {
    const [ipOctets, setIpOctets] = useState<IpOctets>(() => {
        const initialOctets = getInitialIpOctets()
        persistServerIp(initialOctets)
        return initialOctets
    })

    const ipPreview = useMemo(() => ipOctets.join("."), [ipOctets])

    const updateOctet = useCallback((index: number, value: string) => {
        setIpOctets((prev) => {
            const next = [...prev]
            next[index] = sanitizeOctetInput(value)
            const nextOctets = toIpOctets(next)
            if (nextOctets.every(isValidOctet)) {
                persistServerIp(nextOctets)
            }
            return nextOctets
        })
    }, [])

    return {
        ipOctets,
        ipPreview,
        updateOctet,
    }
}
