import { Event, InitializingEvent } from "../../event"
import { ObjectPool } from "../../util/objectPool"
import { AbstractDestroyable, Destructor } from "../../destroyable"
import { BehaviorConstructor } from "../../engine/behavior"

const createTimer = CreateTimer
const timerStart = TimerStart
const pauseTimer = PauseTimer
const timerGetElapsed = TimerGetElapsed
const timerGetRemaining = TimerGetRemaining
const timerGetTimeout = TimerGetTimeout
const resumeTimer = ResumeTimer
const getExpiredTimer = GetExpiredTimer
const getHandleId = GetHandleId

const pcall = _G.pcall
const print = _G.print
const select = _G.select
const type = _G.type

const safeCall = warpack.safeCall

const corunning = coroutine.running
const coresume = coroutine.resume
const coyield = coroutine.yield

const unpack = table.unpack

const { get, release } = new ObjectPool(createTimer, pauseTimer)

const timerByHandleId = new LuaMap<number, Timer>()

const timerSafeCall = () => {
    const timer = timerByHandleId.get(getHandleId(getExpiredTimer()))
    if (timer != undefined) {
        if (timer[TimerPropertyKey.DESTROY_ON_EXPIRATION]) {
            timer.destroy()
        }
        const callback = timer[TimerPropertyKey.CALLBACK]
        if (callback != undefined) {
            safeCall(
                callback,
                ...unpack(
                    timer as any,
                    TimerPropertyKey.ARGS_LENGTH + 1,
                    TimerPropertyKey.ARGS_LENGTH + (timer[TimerPropertyKey.ARGS_LENGTH] ?? 0),
                ),
            )
        }
    }
}

const enum TimerPropertyKey {
    HANDLE,
    DESTROY_ON_EXPIRATION,
    CALLBACK,
    ARGS_LENGTH,
}

export class Timer extends AbstractDestroyable {
    private readonly [TimerPropertyKey.HANDLE]: jtimer

    private [TimerPropertyKey.DESTROY_ON_EXPIRATION]?: true

    private [TimerPropertyKey.CALLBACK]?: (this: void, ...args: any) => void
    private [TimerPropertyKey.ARGS_LENGTH]?: number

    private constructor() {
        super()
        this[TimerPropertyKey.HANDLE] = get()
        timerByHandleId.set(getHandleId(this[TimerPropertyKey.HANDLE]), this)
    }

    public get handle() {
        return this[TimerPropertyKey.HANDLE]
    }

    public start<Args extends any[]>(
        timeout: number,
        periodic: boolean,
        callback: (...args: Args) => void,
        ...args: Args
    ): void {
        this[TimerPropertyKey.CALLBACK] = callback
        const argsLength = select("#", ...args)
        this[TimerPropertyKey.ARGS_LENGTH] = argsLength
        for (const i of $range(1, argsLength)) {
            ;(this as any)[TimerPropertyKey.ARGS_LENGTH + i] = select(i, ...args)[0]
        }
        timerStart(this.handle, timeout, periodic, timerSafeCall)
    }

    public override onDestroy(): Destructor {
        const handle = this[TimerPropertyKey.HANDLE]
        timerByHandleId.delete(getHandleId(handle))
        release(handle)
        return super.onDestroy()
    }

    public get elapsed(): number {
        return timerGetElapsed(this[TimerPropertyKey.HANDLE])
    }

    public get remaining(): number {
        return timerGetRemaining(this[TimerPropertyKey.HANDLE])
    }

    public get timeout(): number {
        return timerGetTimeout(this[TimerPropertyKey.HANDLE])
    }

    public pause(): void {
        pauseTimer(this[TimerPropertyKey.HANDLE])
    }

    public resume(): void {
        resumeTimer(this[TimerPropertyKey.HANDLE])
    }

    public static create(): Timer {
        return new Timer()
    }

    public static run<T, K extends KeysOfType<T, (this: T, ...args: any) => any>>(
        object: T,
        key: K,
        ...parameters: T[K] extends (this: T, ...args: any) => any ? Parameters<T[K]> : never
    ): void

    public static run<Args extends any[]>(
        callback: (this: void, ...args: Args) => void,
        ...args: Args
    ): void

    public static run(objectOrCallback: any, keyOrFirstArg: any, ...restArgs: any[]): void {
        // TODO: batch
        if (type(objectOrCallback) == "function") {
            Timer.simple(0, objectOrCallback, keyOrFirstArg, ...restArgs)
        } else {
            Timer.simple(0, objectOrCallback[keyOrFirstArg], objectOrCallback, ...restArgs)
        }
    }

    public static simple<Args extends any[]>(
        timeout: number,
        callback: (...args: Args) => void,
        ...args: Args
    ): Timer {
        const timer = new Timer()
        timer[TimerPropertyKey.DESTROY_ON_EXPIRATION] = true
        timer.start(timeout, false, callback, ...args)
        return timer
    }

    public static periodic<Args extends any[]>(
        period: number,
        callback: (this: void, timer: Timer, ...args: Args) => void,
        ...args: Args
    ): Timer {
        const timer = Timer.create()
        timer.start(period, true, callback, timer, ...args)
        return timer
    }

    public static counted(
        period: number,
        count: number,
        callback: (this: void, timer: Timer) => void,
    ): Timer {
        const timer = Timer.create()
        if (count >= 1) {
            timer.start(period, true, () => {
                const [success, result] = pcall(callback, timer)
                count--
                if (count < 1) {
                    timer.destroy()
                }
                if (!success) {
                    throw result
                }
            })
        } else {
            timer.destroy()
        }
        return timer
    }

    public static readonly onPeriod: Readonly<Record<number, Event>> = setmetatable(
        {},
        {
            __index(this: Record<number, Event>, key: number): Event {
                const event = new InitializingEvent<[], jtimer>(
                    (event) => {
                        const invoke = Event.invoke
                        const timer = get()
                        timerStart(
                            timer,
                            key,
                            true,
                            warpack.wrapSafeCall(() => {
                                invoke(event)
                            }),
                        )
                        return timer
                    },
                    (timer) => {
                        release(timer)
                    },
                )
                rawset(this, key, event)
                return event
            },
        },
    )
}

declare global {
    function sleep(timeout: number): void
}

const threadByHandleId = setmetatable(new LuaTable<number, LuaThread | undefined>(), {
    __mode: "v",
})

const sleepHandlerFunc = () => {
    const timer = getExpiredTimer()
    const handleId = getHandleId(timer)
    const thread = threadByHandleId.get(handleId)
    if (thread) {
        threadByHandleId.delete(handleId)
        const [ok, err] = pcall(coresume, thread)
        if (!ok) {
            print("ERROR: " + err)
        }
    }
    release(timer)
}

globalThis.sleep = (timeout) => {
    const [co] = corunning()
    const timer = get()
    threadByHandleId.set(getHandleId(timer), co)
    timerStart(timer, timeout, false, sleepHandlerFunc)
    coyield()
}

const resolveByHandleId = new LuaMap<number, (this: void) => void>()

let delayTimer: jtimer
let delayDuration: number

function delayHandlerFunc(this: void): void {
    const timer = getExpiredTimer()
    const handleId = getHandleId(timer)
    release(timer)
    const resolve = resolveByHandleId.get(handleId)
    if (resolve) {
        resolveByHandleId.delete(handleId)
        resolve()
    }
}

function delayPromiseSetup(this: any, resolve: (this: void) => void): void {
    resolveByHandleId.set(getHandleId(delayTimer), resolve)
    timerStart(delayTimer, delayDuration, false, delayHandlerFunc)
}

export function delay(this: void, duration: number): Promise<void> {
    delayTimer = get()
    delayDuration = duration
    return new Promise<void>(delayPromiseSetup)
}
