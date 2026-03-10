import { useId, useState } from "react"
import { useHash } from "../use-hash.hash"
import styles from "../../random/module.random.module.scss"
import UploadIcon from "./UploadIcon"
import SignatureFileButton from "./SignatureFileButton"
import { formatBytes } from "../utils.hash"


const FileSection = () => {
    const { selectedFile, setSelectedFile, isFileHashing, signatureValue, hashResult } = useHash()
    const inputId = useId()
    const [isDragActive, setIsDragActive] = useState(false)
    const compareStatus =
        !isFileHashing && selectedFile && signatureValue && hashResult?.hash
            ? (hashResult.hash === signatureValue ? "success" : "error")
            : "none"

    const fileNameLength = signatureValue ? 20 : 40

    return (
        <section className={styles.panel} color-status={compareStatus}>
            <div className={styles.sectionTitle}>File</div>
            <div className={styles.sectionText}>Upload a file and optionaly signature to compute its hash.</div>
            <div className={styles.inputGrid}>
                <div className={styles.uploadZoneWrapper}>
                    <label
                        className={styles.uploadZone}
                        htmlFor={inputId}
                        data-blocked={isFileHashing ? "true" : "false"}
                        data-dragover={isDragActive ? "true" : "false"}
                        onDragEnter={() => {
                            if (isFileHashing) return
                            setIsDragActive(true)
                        }}
                        onDragOver={(event) => {
                            if (isFileHashing) return
                            event.preventDefault()
                            setIsDragActive(true)
                        }}
                        onDrop={(event) => {
                            if (isFileHashing) return
                            event.preventDefault()
                            setIsDragActive(false)
                            setSelectedFile(event.dataTransfer.files?.[0] ?? null)
                        }}
                        onDragLeave={(event) => {
                            if (isFileHashing) return
                            const relatedTarget = event.relatedTarget as Node | null
                            if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
                                setIsDragActive(false)
                            }
                        }}
                    >
                        <UploadIcon className={styles.uploadIcon} />
                    </label>
                    <SignatureFileButton disabled={isFileHashing} />

                    <input
                        id={inputId}
                        className={styles.uploadInput}
                        type="file"
                        disabled={isFileHashing}
                        onChange={event => setSelectedFile(event.target.files?.[0] ?? null)}
                    />
                </div>
                <div className={styles.fileStatus}>
                    {selectedFile ? (
                        <>
                            <span className={styles.fileStatusIcon}>
                                {isFileHashing ? (
                                    <span className={styles.fileStatusSpinner} />
                                ) : (
                                    <span className={styles.fileStatusCheck}>✓</span>
                                )}
                            </span>
                            <span className={styles.fileStatusText}>Selected:
                                {" " + formatBytes(selectedFile.size) + " "}
                                {selectedFile.name.slice(0, fileNameLength) + (selectedFile.name.length > fileNameLength ? "..." : "")}</span>
                        </>
                    ) : null}
                    {!!signatureValue && <>
                        <span></span>
                        <span className={styles.fileStatusCheck}>✓</span>
                        <span className={styles.fileStatusText}>Signature uploaded</span>
                    </>}
                </div>
            </div>
        </section>
    )
}

export default FileSection
