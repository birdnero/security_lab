import { useHash } from "../use-hash.hash"
import styles from "../../shared/module.ui.module.scss"
import Input from "../../shared/input.shared"

type TextSectionProps = {
    title?: string
    description?: string
    placeholder?: string
}

const TextSection = ({
    title = "String or sentence",
    description = "Enter the text you want to hash.",
    placeholder = "hashed text"
}: TextSectionProps) => {
    const { inputText, setInputText } = useHash()

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionText}>{description}</div>
            <div className={styles.inputGrid}>
                <Input placeholder={placeholder} value={inputText} onChange={e => setInputText(e.target.value)} />
            </div>
        </section>
    )
}

export default TextSection
