import { useContext } from "react"
import { RandomContext } from "./context.random"

export const useRandom = () => {
    const context = useContext(RandomContext)
    if (!context) {
        throw new Error("useRandom must be used inside RandomProvider")
    }
    return context
}
