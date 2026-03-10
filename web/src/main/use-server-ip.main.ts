import { useCallback, useMemo, useState } from "react"
import { API } from "../API"
import {
    normalizeServerUrl,
    SERVER_URL_STORAGE_KEY,
    DEFAULT_API_URL,
} from "./utils.main"

const getInitialServerUrl = () => {
    const saved = window.localStorage.getItem(SERVER_URL_STORAGE_KEY)
    const candidate = saved ?? API.url ?? DEFAULT_API_URL
    return normalizeServerUrl(candidate)
}

const persistServerUrl = (nextValue: string) => {
    const nextUrl = normalizeServerUrl(nextValue)
    API.url = nextUrl
    window.localStorage.setItem(SERVER_URL_STORAGE_KEY, nextUrl)
    return nextUrl
}

export const useServerIp = () => {
    const [serverUrlInput, setServerUrlInput] = useState(() => {
        const initialUrl = getInitialServerUrl()
        API.url = initialUrl
        return initialUrl
    })

    const currentUrl = useMemo(() => API.url, [serverUrlInput])

    const updateServerUrlInput = useCallback((value: string) => {
        setServerUrlInput(value)
    }, [])

    const commitServerUrl = useCallback((value?: string) => {
        const nextUrl = persistServerUrl(value ?? serverUrlInput)
        setServerUrlInput(nextUrl)
    }, [serverUrlInput])

    return {
        serverUrlInput,
        currentUrl,
        updateServerUrlInput,
        commitServerUrl,
    }
}
