import { MAX_GENERATE_N, MIN_N } from "./constants.random"
import type { GenConfig } from "./types.random"

export const parseNumberInput = (value: string) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const toInt = (value: number, fallback: number) => {
    if (!Number.isFinite(value)) return fallback
    return Math.trunc(value)
}

export const sanitizeConfig = (config: GenConfig): GenConfig => ({
    // Backend expects int values; m must be > 0 for modulo operations.
    x0: toInt(config.x0, 0),
    m: Math.max(1, toInt(config.m, 1)),
    a: toInt(config.a, 0),
    c: toInt(config.c, 0),
})

export const sanitizeN = (n: number, max?: number) => {
    const minApplied = Math.max(MIN_N, toInt(n, MIN_N))
    if (typeof max === "number") {
        return Math.min(max, minApplied)
    }
    return minApplied
}

export const sanitizeGenerateN = (n: number) => sanitizeN(n, MAX_GENERATE_N)
