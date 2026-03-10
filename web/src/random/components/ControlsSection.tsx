import Input from "../../shared/input.shared"
import { useRandom } from "../use-random.random"
import styles from "../module.random.module.scss"
import ActionBar from "./ActionBar"
import { useMemo } from "react"

const ControlsSection = () => {
    const { n, setN } = useRandom()
    const { loading, error } = useRandom()

    const errorMsg = useMemo(() => `Error: ${error}`, [error])

    return (
        <section className={styles.panel + " " + styles.relative}>
            <div className={styles.sectionTitle}>Run Controls</div>
            <div className={styles.sectionText}>Set sample size and period limit before executing tests.</div>
            <div className={styles.inputGrid}>
                <Input placeholder="Amount (n)" value={n} onChange={(e) => setN(e.target.value)} />
            </div>
            <ActionBar />
            {loading && <div className={styles.loading} />}
            {error && <div className={styles.error}>{errorMsg}</div>}
        </section>
    )
}

export default ControlsSection
