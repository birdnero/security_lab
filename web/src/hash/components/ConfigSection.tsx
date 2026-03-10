import * as Select from "@radix-ui/react-select"
import { useHash } from "../use-hash.hash"
import styles from "../../random/module.random.module.scss"
import inputStyles from "../../shared/input.shared.module.scss"

const ConfigSection = () => {
    const { config, selectedConfig, setSelectedConfig } = useHash()
    const selectOptions = config.map((option) => ({ value: option, label: option }))

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>Config</div>
            <div className={styles.sectionText}>Specify parameters or a configuration template.</div>
            <div className={styles.inputGrid}>
                <Select.Root value={selectedConfig} onValueChange={setSelectedConfig}>
                    <Select.Trigger className={[inputStyles.input, styles.hashSelectTrigger].join(" ")} aria-label="Config">
                        <Select.Value placeholder={config[0] ?? selectedConfig} />
                        <Select.Icon className={styles.hashSelectIcon}>▾</Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content
                            className={styles.hashSelectContent}
                            position="item-aligned"
                            sideOffset={6}
                            align="start"
                        >
                            <Select.Viewport className={styles.hashSelectViewport}>
                                {selectOptions.map((option) => (
                                    <Select.Item
                                        key={option.value}
                                        value={option.value}
                                        className={styles.hashSelectItem}
                                    >
                                        <Select.ItemText>{option.label}</Select.ItemText>
                                        <Select.ItemIndicator className={styles.hashSelectItemIndicator}>
                                            ✓
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
            </div>
        </section>
    )
}

export default ConfigSection
