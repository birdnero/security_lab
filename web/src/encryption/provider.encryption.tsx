import { useEffect, useMemo, useState, type ReactNode } from "react"
import { API } from "../API"
import { EncryptionContext, type EncryptionMode } from "./context.encryption"
import { buildHexPreview, decodeUtf8, hexToBytes, isHexString, toHex } from "./utils.encryption"

type EncryptionConfigResponse = {
    rc5: {
        w: number
        rounds: number
        key_length: number
    }
    passphrase?: string | null
}

const EncryptionProvider = ({ children }: { children: ReactNode }) => {
    const [wordSize, setWordSize] = useState("32")
    const [rounds, setRounds] = useState("12")
    const [passphrase, setPassphrase] = useState("")
    const [mode, setMode] = useState<EncryptionMode>("encrypt")

    const [inputText, setInputText] = useState("")
    const [outputText, setOutputText] = useState("")
    const [outputBytes, setOutputBytes] = useState<Uint8Array | null>(null)
    const [errorText, setErrorText] = useState<string | null>(null)
    const [isProcessingText, setIsProcessingText] = useState(false)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isProcessingFile, setIsProcessingFile] = useState(false)
    const [fileOutputUrl, setFileOutputUrl] = useState<string | null>(null)
    const [fileOutputName, setFileOutputName] = useState<string | null>(null)
    const [fileOutputPreview, setFileOutputPreview] = useState<string | null>(null)
    const [lastChanged, setLastChanged] = useState<"text" | "file" | null>(null)

    useEffect(() => {
        API.getQuery<EncryptionConfigResponse>({ path: ["encryption", "config"] })
            .then((r) => {
                if (!r.data) return
                setWordSize(String(r.data.rc5.w))
                setRounds(String(r.data.rc5.rounds))
                if (r.data.passphrase) {
                    setPassphrase(r.data.passphrase)
                }
            })
    }, [])

    const endpointPath = useMemo(() => {
        return mode === "encrypt" ? "encryption/encrypt" : "encryption/decrypt"
    }, [mode])

    const query = useMemo(() => {
        const params = new URLSearchParams()
        params.set("w", wordSize)
        params.set("rounds", rounds)
        params.set("passphrase", passphrase)
        return params.toString()
    }, [wordSize, rounds, passphrase])

    const processText = async (text: string) => {
        if (!text || !passphrase) return
        setIsProcessingText(true)
        setErrorText(null)
        setOutputBytes(null)
        setOutputText("")
        try {
            const body =
                mode === "decrypt" && isHexString(text)
                    ? hexToBytes(text)
                    : text
            const res = await fetch(`${API.url}${endpointPath}?${query}`, {
                method: "POST",
                body,
            })
            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText)
            }
            const buf = await res.arrayBuffer()
            const bytes = new Uint8Array(buf)
            setOutputBytes(bytes)
            const display = mode === "decrypt" ? decodeUtf8(bytes) : toHex(bytes)
            setOutputText(display)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to process text."
            setErrorText(message || "Failed to process text.")
            setOutputBytes(null)
            setOutputText("")
        } finally {
            setIsProcessingText(false)
        }
    }

    const processFile = async (file: File) => {
        if (!file || !passphrase) return
        setIsProcessingFile(true)
        setErrorText(null)
        setFileOutputUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return null
        })
        setFileOutputName(null)
        setFileOutputPreview(null)
        try {
            const res = await fetch(`${API.url}${endpointPath}?${query}`, {
                method: "POST",
                body: file,
            })
            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText)
            }
            const buf = await res.arrayBuffer()
            const bytes = new Uint8Array(buf)
            const blob = new Blob([bytes], { type: "application/octet-stream" })
            const url = URL.createObjectURL(blob)
            setFileOutputUrl(url)
            const suffix = mode === "encrypt" ? "enc" : "dec"
            setFileOutputName(`${file.name}.${suffix}`)
            setFileOutputPreview(buildHexPreview(bytes))
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to process file."
            setErrorText(message || "Failed to process file.")
            setFileOutputUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })
            setFileOutputName(null)
            setFileOutputPreview(null)
        } finally {
            setIsProcessingFile(false)
        }
    }

    const handleSetInputText = (value: string) => {
        setInputText(value)
        setLastChanged("text")
    }

    const handleSetSelectedFile = (file: File | null) => {
        setSelectedFile(file)
        if (file) {
            setLastChanged("file")
        }
    }

    const submitLatest = () => {
        if (isProcessingText || isProcessingFile) return
        if (!passphrase) return
        if (lastChanged === "file") {
            if (selectedFile) {
                void processFile(selectedFile)
            }
            return
        }
        if (lastChanged === "text") {
            if (inputText) {
                void processText(inputText)
            }
        }
    }

    const value = {
        wordSize,
        rounds,
        passphrase,
        mode,
        inputText,
        outputText,
        outputBytes,
        errorText,
        isProcessingText,
        selectedFile,
        isProcessingFile,
        fileOutputUrl,
        fileOutputName,
        fileOutputPreview,
        lastChanged,
        setWordSize,
        setRounds,
        setPassphrase,
        setMode,
        setInputText: handleSetInputText,
        setSelectedFile: handleSetSelectedFile,
        submitLatest,
    }

    return <EncryptionContext.Provider value={value}>{children}</EncryptionContext.Provider>
}

export default EncryptionProvider
