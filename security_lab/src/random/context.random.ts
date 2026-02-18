import { createContext } from "react"
import type {
    CompareResponse,
    GenConfig,
    PiEstimateResponse,
    SequencePeriodResponse,
} from "./types.random"

export type RandomAction = "generate" | "chizaru" | "sequence-period" | "compare"

export type RandomContextValue = {
    config: GenConfig
    n: number
    generated: number[]
    piEstimate: PiEstimateResponse | null
    sequence: SequencePeriodResponse | null
    compare: CompareResponse | null
    error: string | null
    loading: RandomAction | null
    setConfigField: (field: keyof GenConfig, value: string) => void
    setN: (value: string) => void
    onGenerate: () => Promise<void>
    onChizaru: () => Promise<void>
    onSequencePeriod: () => Promise<void>
    onCompare: () => Promise<void>
}

export const RandomContext = createContext<RandomContextValue | null>(null)
