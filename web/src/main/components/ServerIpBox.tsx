import Input from "../../shared/input.shared"
import styles from "../module.main.module.scss"

type ServerIpBoxProps = {
    value: string
    currentUrl: string
    onChange: (value: string) => void
    onCommit: (value?: string) => void
}

const ServerIpBox = ({ value, currentUrl, onChange, onCommit }: ServerIpBoxProps) => {
    return (
        <aside className={styles.serverBox}>
            <div className={styles.serverLabel}>Server URL (e.g. https://security-lab-one.vercel.app/ or http://127.0.0.1:8000/)</div>
            <div className={styles.ipForm}>
                <Input
                    boxed
                    value={value}
                    inputMode="url"
                    placeholder="https://security-lab-one.vercel.app/"
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => onCommit()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onCommit()
                    }}
                />
            </div>
            <p className={styles.serverHint}>Current API base URL: {currentUrl}</p>
        </aside>
    )
}

export default ServerIpBox
