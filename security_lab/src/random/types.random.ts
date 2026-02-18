export type GenConfig = {
    x0: number
    m: number
    a: number
    c: number
}

export type GenerateRequest = {
    config: GenConfig
    n: number
}

export type ChizaruRequest = {
    config: GenConfig
    n: number
}

export type SequencePeriodRequest = {
    config: GenConfig
}

export type CompareRequest = {
    config: GenConfig
    n: number
}

export type GenerateResponse = {
    numbers: number[]
}

export type BitBalanceResponse = {
    zeros: number
    ones: number
    ratio_zero_to_one: number
}

export type PiEstimateResponse = {
    pi_estimate: number
    abs_error_vs_math_pi: number
}

export type SequencePeriodResponse = {
    period: number
    reached_limit: boolean
}

export type CompareResponse = {
    generator: BitBalanceResponse
    builtin: BitBalanceResponse
}
