import { createContext } from "react"
import type { HashResponse } from "./types.hash"

export type HashContextValue = {
    config: string[]
    selectedConfig: string
    inputText: string
    selectedFile: File | null
    signatureValue: string
    hashResult: HashResponse | null
    isFileHashing: boolean
    totalTimeSeconds: number
    hasTimingStarted: boolean
    setConfig: (value: string[]) => void
    setSelectedConfig: (value: string) => void
    setInputText: (value: string) => void
    setSelectedFile: (file: File | null) => void
    setSignatureValue: (value: string) => void
    setHashResult: (value: HashResponse) => void
}

export const HashContext = createContext<HashContextValue | null>(null)
