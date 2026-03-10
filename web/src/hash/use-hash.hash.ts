import { useContext } from "react"
import { HashContext } from "./context.hash"

export const useHash = () => {
    const context = useContext(HashContext)
    if (!context) {
        throw new Error("useHash must be used inside HashProvider")
    }
    return context
}
