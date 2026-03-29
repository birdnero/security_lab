import { useId, useState } from "react"
import styles from "../../shared/module.ui.module.scss"
import UploadIcon from "../../hash/components/UploadIcon"
import { useEncryption } from "../use-encryption.encryption"
import { formatBytes } from "../../hash/utils.hash"

type EncryptionFileSectionProps = {
    title?: string
    description?: string
}

const EncryptionFileSection = ({
    title = "File",
    description = "Upload a file to process it."
}: EncryptionFileSectionProps) => {
    const { selectedFile, setSelectedFile, isProcessingFile } = useEncryption()
    const inputId = useId()
    const [isDragActive, setIsDragActive] = useState(false)

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionText}>{description}</div>
            <div className={styles.inputGrid}>
                <div className={styles.uploadZoneWrapper}>
                    <label
                        className={styles.uploadZone}
                        htmlFor={inputId}
                        data-blocked={isProcessingFile ? "true" : "false"}
                        data-dragover={isDragActive ? "true" : "false"}
                        onDragEnter={() => {
                            if (isProcessingFile) return
                            setIsDragActive(true)
                        }}
                        onDragOver={(event) => {
                            if (isProcessingFile) return
                            event.preventDefault()
                            setIsDragActive(true)
                        }}
                        onDrop={(event) => {
                            if (isProcessingFile) return
                            event.preventDefault()
                            setIsDragActive(false)
                            setSelectedFile(event.dataTransfer.files?.[0] ?? null)
                        }}
                        onDragLeave={(event) => {
                            if (isProcessingFile) return
                            const relatedTarget = event.relatedTarget as Node | null
                            if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
                                setIsDragActive(false)
                            }
                        }}
                    >
                        <UploadIcon className={styles.uploadIcon} />
                    </label>

                    <input
                        id={inputId}
                        className={styles.uploadInput}
                        type="file"
                        disabled={isProcessingFile}
                        onChange={event => setSelectedFile(event.target.files?.[0] ?? null)}
                    />
                </div>

                <div className={styles.fileStatus}>
                    {selectedFile ? (
                        <>
                            <span className={styles.fileStatusIcon}>
                                {isProcessingFile ? (
                                    <span className={styles.fileStatusSpinner} />
                                ) : (
                                    <span className={styles.fileStatusCheck}>✓</span>
                                )}
                            </span>
                            <span className={styles.fileStatusText}>
                                Selected: {" " + formatBytes(selectedFile.size) + " "}
                                {selectedFile.name.slice(0, 40) + (selectedFile.name.length > 40 ? "..." : "")}
                            </span>
                        </>
                    ) : null}

                </div>
            </div>
        </section>
    )
}

export default EncryptionFileSection
