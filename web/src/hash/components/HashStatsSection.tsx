import styles from "../../random/module.random.module.scss"
import { useHash } from "../use-hash.hash"
import { formatBytesPerSecond } from "../utils.hash"
import TimeSpeedIcon from "../../assets/time-speed_.svg?react"
import WifiSpeedIcon from "../../assets/internet-speed-wifi.svg?react"
import TimeIcon from "../../assets/time.svg?react"

const HashStatsSection = () => {
    const { totalTimeSeconds, hasTimingStarted, hashResult } = useHash()
    const totalTimeLabel = hasTimingStarted ? `${totalTimeSeconds.toFixed(2)} s` : "—"
    const hashSpeedLabel = hashResult ? formatBytesPerSecond(hashResult.hash_speed_bps) : "—"
    const uploadSpeedLabel = hashResult ? formatBytesPerSecond(hashResult.upload_speed_bps) : "—"

    return (
        <section className={styles.panel}>
            <div className={styles.sectionTitle}>Speed & Time</div>
            <div className={styles.sectionText}>Enter the text you want to hash.</div>
            <div className={styles.hashStatsGrid}>
                <div className={styles.hashStatItem}>
                    <div className={styles.hashStatIconWrap}>
                        <TimeSpeedIcon className={styles.hashStatIcon} aria-label="Hash speed" role="img" />
                    </div>
                    <div>
                        <div className={styles.hashStatLabel}>Hash speed</div>
                        <div className={styles.hashStatValue}>{hashSpeedLabel}</div>
                    </div>
                </div>
                <div className={styles.hashStatItem}>
                    <div className={styles.hashStatIconWrap}>
                        <WifiSpeedIcon className={styles.hashStatIcon} aria-label="Upload speed" role="img" />
                    </div>
                    <div>
                        <div className={styles.hashStatLabel}>Upload speed</div>
                        <div className={styles.hashStatValue}>{uploadSpeedLabel}</div>
                    </div>
                </div>
                <div className={styles.hashStatItem}>
                    <div className={styles.hashStatIconWrap}>
                        <TimeIcon className={styles.hashStatIcon} aria-label="Total Time" role="img" />
                    </div>
                    <div>
                        <div className={styles.hashStatLabel}>Total Time</div>
                        <div className={styles.hashStatValue}>{totalTimeLabel}</div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HashStatsSection
