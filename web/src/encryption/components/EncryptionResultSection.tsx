import styles from "../../shared/module.ui.module.scss"
import DownloadIcon from "../../shared/components/DownloadIcon"
import { useEncryption } from "../use-encryption.encryption"
import { downloadBytes, triggerDownload, truncateText } from "../utils.encryption"

type EncryptionResultSectionProps = {
    title?: string
    emptyValue?: string
    saveLabel?: string
    saveFilename?: string
}

const EncryptionResultSection = ({
    title = "Output",
    emptyValue = "-",
    saveLabel = "Save output",
    saveFilename = "output"
}: EncryptionResultSectionProps) => {
    const {
        outputText,
        outputBytes,
        isProcessingText,
        isProcessingFile,
        fileOutputUrl,
        fileOutputName,
        fileOutputPreview,
        lastChanged,
        errorText,
    } = useEncryption()

    const handleSave = () => {
        if (lastChanged === "file" && fileOutputUrl) {
            triggerDownload(fileOutputUrl, fileOutputName ?? saveFilename)
            return
        }

        if (outputBytes) {
            downloadBytes(outputBytes, saveFilename)
            return
        }

        if (fileOutputUrl) {
            triggerDownload(fileOutputUrl, fileOutputName ?? saveFilename)
        }
    }

    const renderOutputText = () => {
        const preferredText = lastChanged === "file" ? fileOutputPreview : outputText
        const sourceText = preferredText || outputText || fileOutputPreview || ""
        if (!sourceText) return emptyValue
        return truncateText(sourceText, { maxLines: 1, maxChars: 100 })
    }

    return (
        <section className={styles.panel} color-status={errorText ? "error" : undefined}>
            <div className={`${styles.sectionTitle} ${styles.relative}`}>
                {outputBytes || fileOutputUrl ? (
                    <button
                        type="button"
                        className={styles.saveFloatingButton}
                        onClick={handleSave}
                        title={saveLabel}
                        aria-label={saveLabel}
                    >
                        <DownloadIcon className={styles.saveIcon} />
                    </button>
                ) : null}
                {title}
            </div>
            <div className={styles.outputBlock}>
                {isProcessingText ? "…" : renderOutputText()}
            </div>
            {errorText ? <div className={styles.errorText}>{errorText}</div> : null}
        </section>
    )
}

export default EncryptionResultSection
