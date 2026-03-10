import styles from "../random/module.random.module.scss"
import RandomProvider from "../random/provider.random"
import ConfigSection from "../random/components/ConfigSection"
import ControlsSection from "../random/components/ControlsSection"
import Results from "../random/components/Results"

const RandomPage = () => {
    return (
        <RandomProvider>
                <div className={styles.intro}>Define generator parameters, execute tests, and inspect output quality.</div>

                <div className={styles.topGrid}>
                    <ConfigSection />
                    <ControlsSection />
                </div>
                <Results />
        </RandomProvider>
    )
}

export default RandomPage
