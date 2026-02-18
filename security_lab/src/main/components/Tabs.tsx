import React from "react"
import { NavLink } from "react-router-dom"
import styles from "../module.main.module.scss"
import { TAB_NAMES, tabPathResolve, type TabName } from "../utils.main"

const Tabs = () => {
    const Tab: React.FC<{ tab: TabName }> = ({ tab }) => {
        const to = tabPathResolve(tab)
        return <NavLink
            to={to}
            end={tab === "Main"}
            className={({ isActive }) => styles.tab + " " + (isActive ? styles.tabActive : "")}
            children={tab} />
    }

    return <div
        className={styles.tabsCtn}
        children={TAB_NAMES.map(tab => <Tab key={tab} tab={tab} />)} />
}

export default Tabs
