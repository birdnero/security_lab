import { useState, type ReactNode } from "react"
import { chizaru, compareRequest, generateRandom, sequencePeriod } from "./api.random"
import { DEFAULT_CONFIG, DEFAULT_N } from "./constants.random"
import { RandomContext, type RandomAction, type RandomContextValue } from "./context.random"
import type { CompareResponse, GenConfig, PiEstimateResponse, SequencePeriodResponse } from "./types.random"
import { parseNumberInput, sanitizeConfig, sanitizeGenerateN, sanitizeN } from "./validation.random"

const RandomProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<GenConfig>(DEFAULT_CONFIG)
    const [n, setNState] = useState(DEFAULT_N)

    const [generated, setGenerated] = useState<number[]>([])
    const [piEstimate, setPiEstimate] = useState<PiEstimateResponse | null>(null)
    const [sequence, setSequence] = useState<SequencePeriodResponse | null>(null)
    const [compare, setCompare] = useState<CompareResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<RandomAction | null>(null)

    const setConfigField = (field: keyof GenConfig, value: string) => {
        setConfig((prev) => ({ ...prev, [field]: parseNumberInput(value) }))
    }

    const setN = (value: string) => setNState(parseNumberInput(value))

    const normalizeRequestValues = (action: RandomAction) => {
        const nextConfig = sanitizeConfig(config)
        if (
            nextConfig.x0 !== config.x0 ||
            nextConfig.m !== config.m ||
            nextConfig.a !== config.a ||
            nextConfig.c !== config.c
        ) {
            setConfig(nextConfig)
        }

        if (action === "sequence-period") {
            return { nextConfig, nextN: n }
        }

        const nextN = action === "generate" ? sanitizeGenerateN(n) : sanitizeN(n)
        if (nextN !== n) {
            setNState(nextN)
        }

        return { nextConfig, nextN }
    }

    const run = async <T,>(
        action: RandomAction,
        fn: () => Promise<{ data?: T; error?: string }>,
        onSuccess: (data: T) => void,
    ) => {
        setLoading(action)
        const response = await fn()
        setLoading(null)
        if (response.error || !response.data) {
            let error = response.error ?? "Unknown error"
            if (error.length > 16) error = error.substring(0, 16) + "..."
            setError(error)
            return
        }
        if (response.data) {
            onSuccess(response.data)
            setError(null)
        }
    }

    const onGenerate = () => {
        const { nextConfig, nextN } = normalizeRequestValues("generate")
        return run("generate", () => generateRandom({ config: nextConfig, n: nextN }), (data) => setGenerated(data.numbers))
    }
    const onChizaru = () => {
        const { nextConfig, nextN } = normalizeRequestValues("chizaru")
        return run("chizaru", () => chizaru({ config: nextConfig, n: nextN }), setPiEstimate)
    }
    const onSequencePeriod = () => {
        const { nextConfig } = normalizeRequestValues("sequence-period")
        return run("sequence-period", () => sequencePeriod({ config: nextConfig }), setSequence)
    }
    const onCompare = () => {
        const { nextConfig, nextN } = normalizeRequestValues("compare")
        return run("compare", () => compareRequest({ config: nextConfig, n: nextN }), setCompare)
    }

    const value: RandomContextValue = {
        config,
        n,
        generated,
        piEstimate,
        sequence,
        compare,
        error,
        loading,
        setConfigField,
        setN,
        onGenerate,
        onChizaru,
        onSequencePeriod,
        onCompare,
    }

    return <RandomContext.Provider value={value}>{children}</RandomContext.Provider>
}

export default RandomProvider
