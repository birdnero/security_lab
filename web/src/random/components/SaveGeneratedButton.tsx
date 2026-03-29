import { useRandom } from "../use-random.random"
import styles from "../../shared/module.ui.module.scss"
import type { GenConfig } from "../types.random"
import DownloadIcon from "../../shared/components/DownloadIcon"

const DOWNLOAD_FILENAME = "gen_numbers.txt"

const buildGenerationParams = (config: GenConfig, n: number) =>
    [
        "generation_params:",
        `x0=${config.x0}`,
        `m=${config.m}`,
        `a=${config.a}`,
        `c=${config.c}`,
        `n=${n}`,
    ].join("\n")

const saveGeneratedNumbers = (numbers: number[], config: GenConfig, n: number) => {
    const payload = [buildGenerationParams(config, n), "", `[${numbers.join(", ")}]`].join("\n")
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
    const { generated, config, n } = useRandom()

    if (!generated.length) {
        return null
    }

    return (
        <button
            type="button"
            className={styles.saveFloatingButton}
            onClick={() => saveGeneratedNumbers(generated, config, n)}
            title="Save generated numbers"
            aria-label="Save generated numbers"
        >
            <DownloadIcon className={styles.saveIcon} />
        </button>
    )
}

export default SaveGeneratedButton
