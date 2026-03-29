import Input from "../../shared/input.shared"
import { useRandom } from "../use-random.random"
import styles from "../../shared/module.ui.module.scss"

const ConfigSection = () => {
    const { config, setConfigField } = useRandom()

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>Generator Config</div>
            <div className={styles.sectionText}>Control the generator core parameters.</div>
            <div className={styles.inputGrid}>
                <Input placeholder="Start value (x0)" value={config.x0} onChange={(e) => setConfigField("x0", e.target.value)} />
                <Input placeholder="Modulus (m)" value={config.m} onChange={(e) => setConfigField("m", e.target.value)} />
                <Input placeholder="Multiplier (a)" value={config.a} onChange={(e) => setConfigField("a", e.target.value)} />
                <Input placeholder="Increment (c)" value={config.c} onChange={(e) => setConfigField("c", e.target.value)} />
            </div>
        </section>
    )
}

export default ConfigSection
