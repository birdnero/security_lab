import { useHash } from "../use-hash.hash"
import styles from "../../random/module.random.module.scss"
import Input from "../../shared/input.shared"

const TextSection = () => {
    const { inputText, setInputText } = useHash()

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>String or sentence</div>
            <div className={styles.sectionText}>Enter the text you want to hash.</div>
            <div className={styles.inputGrid}>
                <Input placeholder="hashed text" value={inputText} onChange={e => setInputText(e.target.value)} />
            </div>
        </section>
    )
}

export default TextSection
