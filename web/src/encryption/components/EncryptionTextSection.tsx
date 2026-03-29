import { useEncryption } from "../use-encryption.encryption"
import styles from "../../shared/module.ui.module.scss"
import Input from "../../shared/input.shared"

type EncryptionTextSectionProps = {
    title?: string
    description?: string
    placeholder?: string
}

const EncryptionTextSection = ({
    title = "Plaintext",
    description = "Enter the text you want to process.",
    placeholder = "plain text"
}: EncryptionTextSectionProps) => {
    const {
        inputText,
        setInputText,
        submitLatest,
        isProcessingText,
        isProcessingFile,
        passphrase,
        selectedFile,
        lastChanged,
        mode,
    } = useEncryption()

    const isBusy = isProcessingText || isProcessingFile
    const canSubmit = Boolean(
        passphrase &&
        ((lastChanged === "text" && inputText) || (lastChanged === "file" && selectedFile))
    )
    const targetLabel = lastChanged === "file" ? "File" : "Text"
    const buttonLabel = `${mode === "encrypt" ? "Encrypt" : "Decrypt"} ${targetLabel}`

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionText}>{description}</div>
            <div className={styles.inputGrid}>
                <Input placeholder={placeholder} value={inputText} onChange={e => setInputText(e.target.value)} />
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={submitLatest}
                        disabled={!canSubmit || isBusy}
                        aria-disabled={!canSubmit || isBusy ? "true" : "false"}
                    >
                        {isBusy ? "Processing…" : buttonLabel}
                    </button>
                </div>
            </div>
        </section>
    )
}

export default EncryptionTextSection
