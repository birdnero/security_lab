export type HashConfig = {
    threads: number
    algorithm: string[]
}

export type HashResponse = {
    hash: string
    time: number
    upload_time: number
    hash_time: number
    upload_speed_bps: number
    hash_speed_bps: number
}

export type Md5StreamBody = string | File

export type Md5StreamRequest = {
    algorithm: string
    body: Md5StreamBody
    temlpate?: "formDataBody" | "default"
}
