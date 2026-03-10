import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"

type WindowContextValue = {
    width: number
}

const WindowContext = createContext<WindowContextValue | null>(null)

const getWindowWidth = () => {
    if (typeof window === "undefined") return 0
    return window.innerWidth
}

export const WindowProvider = ({ children }: { children: ReactNode }) => {
    const [width, setWidth] = useState(getWindowWidth)

    useEffect(() => {
        const onResize = () => setWidth(getWindowWidth())
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    return <WindowContext.Provider value={{ width }}>{children}</WindowContext.Provider>
}

export const useWindow = () => {
    const context = useContext(WindowContext)
    if (!context) {
        throw new Error("useWindow must be used inside WindowProvider")
    }
    return context
}
