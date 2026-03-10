import { useEffect, useRef, useState, type ReactNode } from "react"
import { API, type ApiResponse } from "../API"
import { HashContext, type HashContextValue } from "./context.hash"
import { useDebounce } from "../utils/debounce"
import type { HashConfig, HashResponse, Md5StreamRequest } from "./types.hash"

const md5Path = (algorithm: string) => `hash/md5-stream?algorithm=${encodeURIComponent(algorithm)}`

const postMd5Stream = ({ algorithm, body, temlpate }: Md5StreamRequest) => {
    return API.postQuery<HashResponse>({
        path: md5Path(algorithm),
        body,
        ...(temlpate ? { temlpate } : {}),
    })
}

const HashProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<string[]>(["default"])
    const [selectedConfig, setSelectedConfig] = useState<string>("default")

    const [inputText, setInputText] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [signatureValue, setSignatureValue] = useState<string>("")
    const [hashResult, setHashResult] = useState<HashResponse | null>(null)
    const [isFileHashing, setIsFileHashing] = useState(false)
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(0)
    const [hasTimingStarted, setHasTimingStarted] = useState(false)
    const activeRequestsRef = useRef(0)
    const timerRef = useRef<number | null>(null)
    const startTimeRef = useRef(0)

    const debauncedText = useDebounce(inputText, 300)

    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    const startTimer = () => {
        if (activeRequestsRef.current === 0) {
            startTimeRef.current = performance.now()
            setTotalTimeSeconds(0)
            setHasTimingStarted(true)
            timerRef.current = window.setInterval(() => {
                const elapsed = (performance.now() - startTimeRef.current) / 1000
                setTotalTimeSeconds(Number(elapsed.toFixed(2)))
            }, 60)
        }
        activeRequestsRef.current += 1
    }

    const stopTimer = () => {
        activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1)
        if (activeRequestsRef.current === 0 && timerRef.current !== null) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    function md5ResponseHandler(response: ApiResponse<HashResponse>) {
        if (response.data) return void setHashResult(response.data)
        //! error handling
    }

    useEffect(() => {
        API.getQuery<HashConfig>({ path: ["hash", "config"] })
            .then(r => r.data ? setConfig(r.data.algorithm) : void 0)
    }, [])

    useEffect(() => {
        startTimer()
        postMd5Stream({
            algorithm: selectedConfig,
            body: inputText,
        })
            .then(md5ResponseHandler)
            .finally(stopTimer)
    }, [debauncedText, selectedConfig])

    useEffect(() => {
        if (selectedFile != null) {
            setIsFileHashing(true)
            startTimer()
            postMd5Stream({
                algorithm: selectedConfig,
                body: selectedFile,
                temlpate: "formDataBody",
            })
                .then(md5ResponseHandler)
                .finally(() => {
                    stopTimer()
                    setIsFileHashing(false)
                })
        }
    }, [selectedFile, selectedConfig])

    const value: HashContextValue = {
        config,
        selectedConfig,
        inputText,
        selectedFile,
        signatureValue,
        hashResult,
        isFileHashing,
        totalTimeSeconds,
        hasTimingStarted,
        setConfig,
        setSelectedConfig,
        setInputText,
        setSelectedFile,
        setSignatureValue,
        setHashResult,
    }

    return <HashContext.Provider value={value}>{children}</HashContext.Provider>
}

export default HashProvider
