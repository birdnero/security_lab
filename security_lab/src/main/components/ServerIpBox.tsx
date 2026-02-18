import Input from "../../shared/input.shared"
import styles from "../module.main.module.scss"
import { BACKEND_PORT } from "../utils.main"

type ServerIpBoxProps = {
    ipOctets: string[]
    ipPreview: string
    onOctetChange: (index: number, value: string) => void
}

const ServerIpBox = ({ ipOctets, ipPreview, onOctetChange }: ServerIpBoxProps) => {
    return (
        <aside className={styles.serverBox}>
            <div className={styles.serverLabel}>Server IP / URL (e.g. 127.0.0.1:8000)</div>
            <div className={styles.ipForm}>
                <div className={styles.ipRow}>
                    {ipOctets.map((part, index) => (
                        <div key={index} className={styles.ipOctet}>
                            <Input
                                boxed
                                value={part}
                                inputMode="numeric"
                                maxLength={3}
                                onChange={(e) => onOctetChange(index, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <p className={styles.serverHint}>Current API base URL: http://{ipPreview}:{BACKEND_PORT}/</p>
        </aside>
    )
}

export default ServerIpBox
