import { createContext } from "react"

export type EncryptionMode = "encrypt" | "decrypt"

export type EncryptionContextValue = {
    wordSize: string
    rounds: string
    passphrase: string
    mode: EncryptionMode
    inputText: string
    outputText: string
    outputBytes: Uint8Array | null
    errorText: string | null
    isProcessingText: boolean
    selectedFile: File | null
    isProcessingFile: boolean
    fileOutputUrl: string | null
    fileOutputName: string | null
    fileOutputPreview: string | null
    lastChanged: "text" | "file" | null
    setWordSize: (value: string) => void
    setRounds: (value: string) => void
    setPassphrase: (value: string) => void
    setMode: (value: EncryptionMode) => void
    setInputText: (value: string) => void
    setSelectedFile: (file: File | null) => void
    submitLatest: () => void
}

export const EncryptionContext = createContext<EncryptionContextValue | null>(null)
