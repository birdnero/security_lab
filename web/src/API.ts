const LOG = (obj: Record<string, unknown>) => {
    let text = ""
    for (const key in obj) {
        text += (`\x1b[96m\x1b[1m${key}:\x1b[0m\x1b[22m ${obj[key]}\n\n`)
    }
    console.log(text);

}

const BACKEND_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "https://security-lab-one.vercel.app/"
const DEV_MODE = import.meta.env.DEV

type QueryPathPart = string | number
type QueryPath = string | QueryPathPart[]
type QueryPathInput = string | Array<QueryPathPart | QueryPathPart[]>

export type QuerySimpleT = { path: QueryPath, url?: string };
export type QueryWithBodyT = QuerySimpleT & { body: BodyInit }
export type queryMetaT = { auth?: boolean, temlpate?: "formDataBody" | "default" }
export type ApiResponse<T> = { data?: T, error?: string, status?: number }

/**
 * Singleton! use API.instance() to access it's methods
 * 
 * працює через ApiResponse: дані сервер МАЄ повертати у цій обгортці, тут же в ній приймає
 * дані при виклику доступні через .then(r => r.data) також, якщо виникла помилка, r.data будуть null | undefined, а повідомлення буде доступне через r.error (див utils/auth/auth.types.tsx#ApiResponse)
 * 
 * приклад використання є у components/AuthComponents/GoogleButton.tsx
 * 
 * @usage API.getQuery<type of response>({path: "home/"}).then(r=> r.data? r.data : r.error) 
 * @author andrii
 * 
 */
export class API {
    public static url = BACKEND_URL

    private static queryMeta({ temlpate = "default" }: queryMetaT = {}): RequestInit {
        return ({
            headers: {
                ...(!(temlpate == "formDataBody") && { "Content-Type": "application/json" }),
                // ...(auth && { "Authorization": `Bearer ${useAuth.getState().client?.accessToken}` }),
            },
        })
    }

    private static errorHandle<T>(e: Error) {
        if (DEV_MODE)
            LOG({ error: e.message })

        return { error: "connection error", data: undefined } as ApiResponse<T>
    }

    private static async responseHandler<T>(data: Response | ApiResponse<T>): Promise<ApiResponse<T>> {
        if (!(data instanceof Response)) return data
        if (data.ok) {
            const rdata = await data.json()
            LOG({ data: JSON.stringify(rdata, null, 2) })
            return {
                data: rdata as T,
                status: data.status
            } as ApiResponse<T>
        }

        const errorResponse = (await data.text())
        if (DEV_MODE) LOG({ error: errorResponse })
        return {
            error: errorResponse,
            status: data.status
        } as ApiResponse<T>
    }


    public static getQuery<T>({ path, url = API.url, ...metaParams }: QuerySimpleT & queryMetaT) {
        if (DEV_MODE) {
            LOG({ path, url, metaParams })
        }
        const init = {
            ...API.queryMeta(metaParams)
        }

        const fullUrl = API.makeUrl(url === API.url ? path : [url, path])

        return fetch(fullUrl, init)
            // .then(d => API.response401<T>(d, fullUrl, init))
            .then(API.responseHandler<T>)
            .catch(API.errorHandle<T>)
    }

    public static postQuery<T>({ path, url = API.url, body, ...metaParams }: QueryWithBodyT & queryMetaT) {
        if (DEV_MODE) {
            LOG({ path, url, metaParams, body })
        }
        const init: RequestInit = {
            ...API.queryMeta(metaParams),
            method: "POST",
            body: body,
            }

        const fullUrl = API.makeUrl(url === API.url ? path : [url, path])

        return fetch(fullUrl, init)
            // .then(d => API.response401<T>(d, fullUrl, init))
            .then(API.responseHandler<T>)
            .catch(API.errorHandle<T>)
    }


    public static putQuery<T>({ path, url = API.url, body, ...metaParams }: QueryWithBodyT & queryMetaT) {
        if (DEV_MODE) {
            LOG({ path, url, metaParams, body })
        }
        const init: RequestInit = {
            ...API.queryMeta(metaParams),
            method: "PUT",
            body: body,
        }

        const fullUrl = API.makeUrl(url === API.url ? path : [url, path])

        return fetch(fullUrl, init)
            // .then(d => API.response401<T>(d, fullUrl, init))
            .then(API.responseHandler<T>)
            .catch(API.errorHandle<T>)
    }

    public static deleteQuery({ path, url = API.url, ...metaParams }: QuerySimpleT & queryMetaT) {
        if (DEV_MODE) {
            LOG({ path, url, metaParams })
        }
        const fullUrl = API.makeUrl(url === API.url ? path : [url, path])

        return fetch(fullUrl, {
            ...API.queryMeta(metaParams),
            method: "DELETE"
        })
            .then(r => r.ok)
            .catch(e => (API.errorHandle(e), false))
    }


    private static makeUrl = (path: QueryPathInput) => {
        if (typeof path === "string") {
            const raw = path.trim()
            if (raw.includes("://")) return raw
            const cleanPath = raw.replace(/^\/+/, "")
            return `${API.url}${cleanPath}`
        }

        const parts = path
            .flatMap((p) => Array.isArray(p) ? p : [p])
            .map((p) => String(p).trim())
            .join("/")
            .replace(/^\/+/, "")

        return `${API.url}${parts}`
    }
}
