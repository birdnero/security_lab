import { API } from "../API";
import type {
    ChizaruRequest,
    CompareRequest,
    CompareResponse,
    GenerateRequest,
    GenerateResponse,
    PiEstimateResponse,
    SequencePeriodRequest,
    SequencePeriodResponse,
} from "./types.random";

const prefix = "random"

export const generateRandom = (request: GenerateRequest) =>
    API.postQuery<GenerateResponse>({
        path: [prefix, "generate"],
        body: JSON.stringify(request),
    })

export const chizaru = (request: ChizaruRequest) =>
    API.postQuery<PiEstimateResponse>({
        path: [prefix, "chizaru"],
        body: JSON.stringify(request),
    })

export const sequencePeriod = (request: SequencePeriodRequest) =>
    API.postQuery<SequencePeriodResponse>({
        path: [prefix, "sequence-period"],
        body: JSON.stringify(request),
    })

export const compareRequest = (request: CompareRequest) =>
    API.postQuery<CompareResponse>({
        path: [prefix, "compare"],
        body: JSON.stringify(request),
    })
