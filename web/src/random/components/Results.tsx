import type { BitBalanceResponse } from "../types.random"
import { useRandom } from "../use-random.random"
import styles from "../module.random.module.scss"
import SaveGeneratedButton from "./SaveGeneratedButton";

const BalanceCard = ({ title, value }: { title: string; value: BitBalanceResponse | null }) => (
    <div className={styles.statCard}>
        <strong className={styles.acccentText}>{title}</strong>
        <div className={styles.sectionText}>zeros: {value?.zeros ?? "-"}</div>
        <div className={styles.sectionText}>ones: {value?.ones ?? "-"}</div>
        <div className={styles.sectionText}>ratio_zero_to_one: {value?.ratio_zero_to_one ?? "-"}</div>
    </div>
)

const Results = () => {
    const { generated, piEstimate, sequence, compare } = useRandom()

    return (
        <div className={styles.resultsGrid}>
            <section className={styles.panel}>
                <div className={styles.sectionTitle + " " + styles.relative}>
                    <SaveGeneratedButton />
                    Generate Result
                </div>
                <div className={styles.codeBlock + " " + styles.relative}>
                    {generated.length ? generated.join(", ") : "-"}</div>
            </section>

            <section className={styles.panel}>
                <div className={styles.sectionTitle}>Chizaru Result</div>
                <div className={styles.sectionText}>pi_estimate: {piEstimate?.pi_estimate ?? "-"}</div>
                <div className={styles.sectionText}>abs_error_vs_math_pi: {piEstimate?.abs_error_vs_math_pi ?? "-"}</div>
            </section>

            <section className={styles.panel}>
                <div className={styles.sectionTitle}>Sequence Period Result</div>
                <div className={styles.sectionText}>period: {sequence?.period ?? "-"}</div>
                <div className={styles.sectionText}>reached_limit: {sequence ? String(sequence.reached_limit) : "-"}</div>
            </section>

            <section className={styles.panel}>
                <div className={styles.sectionTitle}>Compare Result</div>
                <BalanceCard title="generator" value={compare?.generator ?? null} />
                <BalanceCard title="builtin" value={compare?.builtin ?? null} />
            </section>
        </div>
    )
}

export default Results
