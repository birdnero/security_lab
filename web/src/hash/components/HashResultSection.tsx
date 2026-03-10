import { useHash } from "../use-hash.hash"
import styles from "../../random/module.random.module.scss"
import SaveHashButton from "./SaveHashButton"

const   HashResultSection = () => {
    const { hashResult } = useHash()

    return (
        <section className={styles.panel}>
            <div className={`${styles.sectionTitle} ${styles.relative}`}>
                <SaveHashButton />
                Hash Output
            </div>
            <div className={styles.hashOutput}>{hashResult?.hash ? hashResult.hash : "-"}</div>
        </section>
    )
}

export default HashResultSection
