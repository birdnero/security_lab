import * as Select from "@radix-ui/react-select"
import Input from "../../shared/input.shared"
import styles from "../../shared/module.ui.module.scss"
import inputStyles from "../../shared/input.shared.module.scss"
import { useEncryption } from "../use-encryption.encryption"

const Rc5ConfigSection = () => {
    const { wordSize, setWordSize, rounds, setRounds, passphrase, setPassphrase, mode, setMode } = useEncryption()
    const wordSizeOptions = ["16", "32", "64"]
    const modeOptions = [
        { value: "encrypt", label: "Encrypt" },
        { value: "decrypt", label: "Decrypt" }
    ]

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>Encryptor Config</div>
            <div className={styles.sectionText}>Control the RC5 core parameters.</div>
            <div className={styles.inputGrid}>
                <div className={inputStyles.ctn}>
                    <Select.Root value={wordSize} onValueChange={setWordSize}>
                        <Select.Trigger
                            className={[inputStyles.input, styles.selectTrigger].join(" ")}
                            aria-label="Word size (w)"
                        >
                            <Select.Value />
                            <Select.Icon className={styles.selectIcon}>▾</Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content
                                className={styles.selectContent}
                                position="item-aligned"
                                sideOffset={6}
                                align="start"
                            >
                                <Select.Viewport className={styles.selectViewport}>
                                    {wordSizeOptions.map((option) => (
                                        <Select.Item
                                            key={option}
                                            value={option}
                                            className={styles.selectItem}
                                        >
                                            <Select.ItemText>{option}</Select.ItemText>
                                            <Select.ItemIndicator className={styles.selectItemIndicator}>
                                                ✓
                                            </Select.ItemIndicator>
                                        </Select.Item>
                                    ))}
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>
                    <div className={inputStyles.placeholderCtn} style={{ paddingRight: "8px" }}>
                        <div className={inputStyles.placeholder}>Word size (w)</div>
                    </div>
                </div>
                <Input
                    placeholder="Rounds (r)"
                    value={rounds}
                    onChange={(e) => setRounds(e.target.value)}
                />
                <div className={inputStyles.ctn}>
                    <Select.Root value={mode} onValueChange={(value) => setMode(value as "encrypt" | "decrypt")}>
                        <Select.Trigger
                            className={[inputStyles.input, styles.selectTrigger].join(" ")}
                            aria-label="Mode"
                        >
                            <Select.Value />
                            <Select.Icon className={styles.selectIcon}>▾</Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content
                                className={styles.selectContent}
                                position="item-aligned"
                                sideOffset={6}
                                align="start"
                            >
                                <Select.Viewport className={styles.selectViewport}>
                                    {modeOptions.map((option) => (
                                        <Select.Item
                                            key={option.value}
                                            value={option.value}
                                            className={styles.selectItem}
                                        >
                                            <Select.ItemText>{option.label}</Select.ItemText>
                                            <Select.ItemIndicator className={styles.selectItemIndicator}>
                                                ✓
                                            </Select.ItemIndicator>
                                        </Select.Item>
                                    ))}
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>
                    <div className={inputStyles.placeholderCtn} style={{ paddingRight: "8px" }}>
                        <div className={inputStyles.placeholder}>Mode</div>
                    </div>
                </div>
                <Input
                    placeholder="Passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                />
            </div>
        </section>
    )
}

export default Rc5ConfigSection
