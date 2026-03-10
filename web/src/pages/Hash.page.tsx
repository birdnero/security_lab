import randomStyles from "../random/module.random.module.scss"
import HashProvider from "../hash/provider.hash"
import ConfigSection from "../hash/components/ConfigSection"
import TextSection from "../hash/components/TextSection"
import FileSection from "../hash/components/FileSection"
import HashResultSection from "../hash/components/HashResultSection"
import HashStatsSection from "../hash/components/HashStatsSection"
// import styles from "../hash/module.hash.module.scss"

const HashContent = () => {
    return <>
        <div className={randomStyles.intro}>Configure settings, enter a string, or upload a file for hashing.</div>

        <div className={randomStyles.topGrid}>
            <ConfigSection />
            <TextSection />
        </div>

        <div className={randomStyles.resultsGrid}>
            <HashResultSection />
            <HashStatsSection />
            <FileSection />
        </div>
    </>
}

const HashPage = () => {
    return (
        <HashProvider>
            <HashContent />
        </HashProvider>
    )
}

export default HashPage
