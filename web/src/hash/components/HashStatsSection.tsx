import styles from "../../shared/module.ui.module.scss"
import { useHash } from "../use-hash.hash"
import { formatBytesPerSecond } from "../utils.hash"
import TimeSpeedIcon from "../../assets/time-speed_.svg?react"
import WifiSpeedIcon from "../../assets/internet-speed-wifi.svg?react"
import TimeIcon from "../../assets/time.svg?react"

type HashStatsSectionProps = {
    title?: string
    description?: string
    hashSpeedLabel?: string
    uploadSpeedLabel?: string
    totalTimeLabel?: string
}

const HashStatsSection = ({
    title = "Speed & Time",
    description = "Check and test metrics of hashing big data.",
    hashSpeedLabel = "Hash speed",
    uploadSpeedLabel = "Upload speed",
    totalTimeLabel = "Total Time"
}: HashStatsSectionProps) => {
    const { totalTimeSeconds, hasTimingStarted, hashResult } = useHash()
    const totalTimeValue = hasTimingStarted ? `${totalTimeSeconds.toFixed(2)} s` : "—"
    const hashSpeedValue = hashResult ? formatBytesPerSecond(hashResult.hash_speed_bps) : "—"
    const uploadSpeedValue = hashResult ? formatBytesPerSecond(hashResult.upload_speed_bps) : "—"

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sectionText}>{description}</div>
            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <div className={styles.statIconWrap}>
                        <TimeSpeedIcon className={styles.statIcon} aria-label={hashSpeedLabel} role="img" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>{hashSpeedLabel}</div>
                        <div className={styles.statValue}>{hashSpeedValue}</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIconWrap}>
                        <WifiSpeedIcon className={styles.statIcon} aria-label={uploadSpeedLabel} role="img" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>{uploadSpeedLabel}</div>
                        <div className={styles.statValue}>{uploadSpeedValue}</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIconWrap}>
                        <TimeIcon className={styles.statIcon} aria-label={totalTimeLabel} role="img" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>{totalTimeLabel}</div>
                        <div className={styles.statValue}>{totalTimeValue}</div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HashStatsSection
