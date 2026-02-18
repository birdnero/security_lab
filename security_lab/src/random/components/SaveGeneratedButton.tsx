import { useRandom } from "../use-random.random"
import styles from "../module.random.module.scss"

const DOWNLOAD_FILENAME = "gen_numbers.txt"

const saveGeneratedNumbers = (numbers: number[]) => {
    const payload = `[${numbers.join(", ")}]`
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = DOWNLOAD_FILENAME
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

const SaveGeneratedButton = () => {
    const { generated } = useRandom()

    if (!generated.length) {
        return null
    }

    return (
        <button
            type="button"
            className={styles.saveFloatingButton}
            onClick={() => saveGeneratedNumbers(generated)}
            title="Save generated numbers"
            aria-label="Save generated numbers"
        >
            <svg className={styles.saveIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="m14.414,0H5c-1.654,0-3,1.346-3,3v21h20V7.586L14.414,0Zm.586,3.414l3.586,3.586h-3.586v-3.586Zm5,18.586H4V3c0-.551.448-1,1-1h8v7h7v13Zm-7-4.993l2.291-2.302,1.414,1.414-3.299,3.299c-.388.388-.897.581-1.406.581s-1.019-.193-1.406-.581l-3.299-3.299,1.414-1.414,2.291,2.291v-5.997h2v6.008Z"
                />
            </svg>
        </button>
    )
}

export default SaveGeneratedButton
