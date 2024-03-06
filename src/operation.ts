import { Event } from "./event"
import { CancellationException, IllegalStateException } from "./exception"

const rawget = _G.rawget
const rawset = _G.rawset

declare global {
    type PromiseExecutor<T> = ConstructorParameters<typeof Promise<T>>[0]
    type PromiseResolve<T> = Parameters<PromiseExecutor<T>>[0]
    type PromiseReject = Parameters<PromiseExecutor<unknown>>[1]
}

export class OperationMonitor<T> extends Promise<T> {
    private readonly o: Operation<T>

    public constructor(operation: Operation<T>, ...args: ConstructorParameters<typeof Promise<T>>) {
        super(...args)
        this.o = operation
    }

    public cancel(): boolean {
        return this.o.cancel()
    }
}

const OperationContinue: unique symbol = Symbol()
type OperationContinue = typeof OperationContinue
export { OperationContinue }

export abstract class Operation<T> {
    protected constructor() {
        // no-op
    }

    private started = false

    protected progress = 0
    protected maximum = 0
    isCanceled = false

    public get isStarted(): boolean {
        return this.started
    }

    public execute(): OperationMonitor<T> {
        if (this.started) {
            throw new IllegalStateException("Operation already started")
        }
        this.started = true
        return new OperationMonitor<T>(this, async (resolve, reject) => {
            let result: T | OperationContinue
            let progress = this.progress
            try {
                let maximum = await this.estimate()
                this.maximum = maximum
                if (maximum != 0) {
                    const onProgress = rawget(this, "onProgress")
                    if (onProgress !== undefined) {
                        Event.invoke(onProgress, this)
                    }
                }
                do {
                    if (this.isCanceled) {
                        const reason = new CancellationException()
                        reject(reason)
                        const onFailure = rawget(this, "onFailure")
                        if (onFailure !== undefined) {
                            Event.invoke(onFailure, this, reason)
                        }
                        const onComplete = rawget(this, "onComplete")
                        if (onComplete !== undefined) {
                            Event.invoke(onComplete, this, false, reason)
                        }
                        return
                    }
                    result = await this.work()
                    if (this.progress != progress || this.maximum != maximum) {
                        progress = this.progress
                        maximum = this.maximum
                        const onProgress = rawget(this, "onProgress")
                        if (onProgress !== undefined) {
                            Event.invoke(onProgress, this)
                        }
                    }
                } while (result == OperationContinue)
            } catch (reason) {
                reject(reason)
                const onFailure = rawget(this, "onFailure")
                if (onFailure !== undefined) {
                    Event.invoke(onFailure, this, reason)
                }
                const onComplete = rawget(this, "onComplete")
                if (onComplete !== undefined) {
                    Event.invoke(onComplete, this, false, reason)
                }
                return
            }
            resolve(result)
            const onSuccess = rawget(this, "onSuccess")
            if (onSuccess !== undefined) {
                Event.invoke(onSuccess, this, result)
            }
            const onComplete = rawget(this, "onComplete")
            if (onComplete !== undefined) {
                Event.invoke(onComplete, this, true, result)
            }
        })
    }

    protected abstract estimate(): number | Promise<number>

    protected abstract work(): T | OperationContinue | Promise<T | OperationContinue>

    public get onSuccess(): Event<[operation: Operation<T>, result: T]> {
        const onSuccess = new Event<[Operation<T>, T]>()
        rawset(this, "onSuccess", onSuccess)
        return onSuccess
    }

    public get onFailure(): Event<[operation: Operation<T>, reason?: any]> {
        const onFailure = new Event<[Operation<T>, any]>()
        rawset(this, "onFailure", onFailure)
        return onFailure
    }

    public get onComplete(): Event<
        [
            operation: Operation<T>,
            ...result: [success: true, result: T] | [success: false, reason?: any]
        ]
    > {
        const onComplete = new Event<[Operation<T>, ...([true, T] | [false, any])]>()
        rawset(this, "onComplete", onComplete)
        return onComplete
    }

    public get onProgress(): Event<[operation: Operation<T>]> {
        const onProgress = new Event<[Operation<T>]>()
        rawset(this, "onProgress", onProgress)
        return onProgress
    }

    protected abstract doCancel(): boolean

    public cancel(): boolean {
        if (this.doCancel()) {
            this.isCanceled = true
            /*const onCancel = rawget(this, "onCancel")
            if (onCancel) {
                Event.invoke(onCancel, this)
            }*/
            return true
        }
        return false
    }

    /*public static async prepare(): void {

    }*/
}
/*
export abstract class RelaxedOperation<T> extends Operation<T> {
    private i = 0

    protected constructor(
        private readonly relaxWorkLimit: number,
        private readonly relaxDuration: number
    ) {
        super()
    }

    protected abstract doWork(): LuaMultiReturn<[false, number] | [true, T]>

    protected async work(): Promise<T> {
        const [success, result] = this.doWork()
        if (success) {
            return result
        }
        await delay(this.relaxDuration)
    }
}

export class ComplexOperation extends Operation<void> {
    private i = 1

    public constructor(private readonly operations: Operation<any>[]) {
        super()
    }

    protected async work(): Promise<OperationContinue | void> {
        await this.operations[this.i - 1].start()
        return OperationContinue
    }

    protected doCancel(): boolean {
        return false
    }

    protected estimateWorkAmount(): number {
        let result = 0
        for (const operation of this.operations) {
            result += operation["estimateWorkAmount"]()
        }
        return result
    }
}
*/
