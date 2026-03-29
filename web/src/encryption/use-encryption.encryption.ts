import { useContext } from "react"
import { EncryptionContext } from "./context.encryption"

export const useEncryption = () => {
    const ctx = useContext(EncryptionContext)
    if (!ctx) {
        throw new Error("useEncryption must be used within EncryptionProvider")
    }
    return ctx
}
