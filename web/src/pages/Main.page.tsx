import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import ServerIpBox from "../main/components/ServerIpBox"
import Tabs from "../main/components/Tabs"
import styles from "../main/module.main.module.scss"
import { useServerIp } from "../main/use-server-ip.main"
import { pageTitleResolve } from "../main/utils.main"
import RandomPage from "./Random.page"
import HashPage from "./Hash.page"

const MainPage = () => {
    const { pathname } = useLocation()
    const { serverUrlInput, currentUrl, updateServerUrlInput, commitServerUrl } = useServerIp()
    const pageTitle = pageTitleResolve(pathname)

    return <div className={styles.page}>
        <div className={styles.hero}>
            <div className={styles.kicker}>LPNU Security Lab</div>
            <h1 className={styles.title}>{pageTitle}</h1>
            <p className={styles.subtitle}>
                Feel yourself mom`s hacker by generating random numbers and other cool cool things 😎
            </p>
        </div>

        <div>
            <Tabs />
            <div className={styles.ctn}>
                <Routes>
                    <Route path="/" element={<section className={styles.panel}>
                        <div className={styles.mainPanelGrid}>
                            <div>
                                <div className={styles.sectionTitle}>Main</div>
                                <p className={styles.sectionText}>Лабораторна з безпеки.</p>
                            </div>

                            <ServerIpBox
                                value={serverUrlInput}
                                currentUrl={currentUrl}
                                onChange={updateServerUrlInput}
                                onCommit={commitServerUrl}
                            />
                        </div>
                    </section>} />
                    <Route path="/random" element={<RandomPage />} />
                    <Route path="/hash" element={<HashPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    </div>
}

export default MainPage
