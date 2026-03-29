import { useHash } from "../use-hash.hash"
import styles from "../../shared/module.ui.module.scss"
import SaveHashButton from "./SaveHashButton"

type HashResultSectionProps = {
    title?: string
    saveLabel?: string
    saveFilename?: string
    emptyValue?: string
}

const HashResultSection = ({
    title = "Hash Output",
    saveLabel,
    saveFilename,
    emptyValue = "-"
}: HashResultSectionProps) => {
    const { hashResult } = useHash()

    return (
        <section className={styles.panel}>
            <div className={`${styles.sectionTitle} ${styles.relative}`}>
                <SaveHashButton label={saveLabel} filename={saveFilename} />
                {title}
            </div>
            <div className={styles.outputBlock}>{hashResult?.hash ? hashResult.hash : emptyValue}</div>
        </section>
    )
}

export default HashResultSection
