import * as Select from "@radix-ui/react-select"
import { useHash } from "../use-hash.hash"
import styles from "../../shared/module.ui.module.scss"
import inputStyles from "../../shared/input.shared.module.scss"

type ConfigSectionProps = {
    title?: string
    description?: string
    selectAriaLabel?: string
}

const ConfigSection = ({
    title = "Config",
    description = "Specify parameters or a configuration template.",
    selectAriaLabel = "Config"
}: ConfigSectionProps) => {
    const { config, selectedConfig, setSelectedConfig } = useHash()
    const selectOptions = config.map((option) => ({ value: option, label: option }))

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionText}>{description}</div>
            <div className={styles.inputGrid}>
                <Select.Root value={selectedConfig} onValueChange={setSelectedConfig}>
                    <Select.Trigger className={[inputStyles.input, styles.selectTrigger].join(" ")} aria-label={selectAriaLabel}>
                        <Select.Value placeholder={config[0] ?? selectedConfig} />
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
                                {selectOptions.map((option) => (
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
            </div>
        </section>
    )
}

export default ConfigSection
