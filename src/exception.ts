const error = _G.error
const xpcall = _G.xpcall
const substring = string.sub

let stackTrace: string[]
let i: number
let ok: boolean

const handler = (stackTraceElement: string) => {
    if (stackTraceElement != "") {
        stackTrace[i - 1] = substring(stackTraceElement, 1, -3)
        ++i
    } else {
        ok = false
    }
}

export class Exception {
    public readonly message?: string
    public readonly cause?: Exception
    public readonly stackTrace: string[]

    public constructor()
    public constructor(message: string)
    public constructor(message: string, cause: Exception)
    public constructor(cause: Exception)

    public constructor(messageOrCause?: string | Exception, cause?: Exception) {
        if (typeof messageOrCause == "object") {
            this.message = messageOrCause.toString()
            this.cause = messageOrCause
        } else {
            this.message = messageOrCause
            this.cause = cause
        }
        stackTrace = []
        i = 1
        ok = true
        while (ok) {
            xpcall(error, handler, "", 3 + i)
        }
        this.stackTrace = stackTrace
    }

    public toString(): string {
        return `${this.constructor.name}: ${this.message}`
    }
}

export class IllegalArgumentException extends Exception {}

export class IllegalStateException extends Exception {}

export class CancellationException extends Exception {}

export class UnsupportedOperationException extends Exception {}
