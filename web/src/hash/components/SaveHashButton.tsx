import { useHash } from "../use-hash.hash"
import styles from "../../shared/module.ui.module.scss"
import DownloadIcon from "../../shared/components/DownloadIcon"

const DEFAULT_HASH_FILENAME = "hash"
const DEFAULT_LABEL = "Save hash"

type SaveHashButtonProps = {
    label?: string
    filename?: string
}

const SaveHashButton = ({ label = DEFAULT_LABEL, filename = DEFAULT_HASH_FILENAME }: SaveHashButtonProps) => {
    const { hashResult } = useHash()

    if (!hashResult?.hash) {
        return null
    }

    const handleSave = () => {
        const blob = new Blob([hashResult.hash], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.append(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    return (
        <button
            type="button"
            className={styles.saveFloatingButton}
            onClick={handleSave}
            title={label}
            aria-label={label}
        >
            <DownloadIcon className={styles.saveIcon} />
        </button>
    )
}

export default SaveHashButton
