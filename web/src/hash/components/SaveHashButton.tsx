import { useHash } from "../use-hash.hash"
import styles from "../../random/module.random.module.scss"
import DownloadIcon from "../../random/components/DownloadIcon"

const DEFAULT_HASH_FILENAME = "hash"

const SaveHashButton = () => {
    const { hashResult } = useHash()

    if (!hashResult?.hash) {
        return null
    }

    const handleSave = () => {
        const blob = new Blob([hashResult.hash], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = DEFAULT_HASH_FILENAME
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
            title="Save hash"
            aria-label="Save hash"
        >
            <DownloadIcon className={styles.saveIcon} />
        </button>
    )
}

export default SaveHashButton
