const condition = Condition
const createTrigger = CreateTrigger
const triggerAddCondition = TriggerAddCondition
const triggerClearConditions = TriggerClearConditions
const destroyTrigger = DestroyTrigger

const safeCall = warpack.safeCall

const next = _G.next

export type EventListener<T extends any[]> = (...args: T) => void

export const enum EventListenerPriority {
    LOWEST = 0,
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    HIGHEST = 4,
}

export class Event<T extends any[] = []> {
    protected listeners: EventListener<any>[] = []
    protected priorityByListener = new LuaMap<EventListener<any>, EventListenerPriority>()

    public addListener(listener: EventListener<T>): void
    public addListener(priority: EventListenerPriority, listener: EventListener<T>): void

    public addListener(
        priority: EventListenerPriority | EventListener<T>,
        listener?: EventListener<T>
    ): void {
        if (listener == undefined) {
            listener = priority as EventListener<T>
            priority = EventListenerPriority.MEDIUM
        }
        this.addListenerInternal(priority as EventListenerPriority, listener)
    }

    protected addListenerInternal(
        priority: EventListenerPriority,
        listener: EventListener<T>
    ): boolean {
        const priorityByListener = this.priorityByListener
        const previousPriority = priorityByListener.get(listener)
        if (previousPriority == undefined) {
            const listeners = this.listeners
            const length = listeners.length
            listeners[length] = listener
            priorityByListener.set(listener, priority)
            for (const i of $range(length, 1, -1)) {
                const otherListener = listeners[i - 1]
                const otherPriority = priorityByListener.get(otherListener)
                if (priority > otherPriority!) {
                    listeners[i - 1] = listener
                    listeners[i] = otherListener
                } else {
                    return true
                }
            }
            return true
        }
        return false
    }

    public removeListener(listener: EventListener<T>): boolean {
        if (this.priorityByListener.has(listener)) {
            this.priorityByListener.delete(listener)
            const listeners = this.listeners
            for (const i of $range(1, listeners.length)) {
                if (listeners[i - 1] == listener) {
                    for (const j of $range(i, listeners.length)) {
                        listeners[j - 1] = listeners[j]
                    }
                    return true
                }
            }
        }
        return false
    }

    public static invoke<T extends any[]>(this: void, event: Event<T>, ...args: T): void {
        const listeners = event.listeners
        for (const i of $range(1, listeners.length)) {
            safeCall(listeners[i - 1], ...args)
        }
    }
}

export class InitializingEvent<T extends any[] = [], Data = void> extends Event<T> {
    #destroyed?: boolean
    #data?: Data

    public constructor(
        private readonly initialize: (this: void, event: InitializingEvent<T, Data>) => Data,
        private readonly deinitialize?: (this: void, data: Data) => void
    ) {
        super()
    }

    protected override addListenerInternal(
        priority: EventListenerPriority,
        listener: EventListener<T>
    ): boolean {
        if (this.#destroyed) {
            return false
        }
        const success = super.addListenerInternal(priority, listener)
        if (success && this.listeners.length == 1) {
            this.#data = this.initialize(this)
        }
        return success
    }

    public removeListener(callback: EventListener<T>): boolean {
        if (super.removeListener(callback)) {
            if (this.deinitialize && next(this.listeners)[0] == undefined) {
                this.deinitialize(this.#data!)
                this.#data = undefined
            }
            return true
        }
        return false
    }

    public destroy(): void {
        this.#destroyed = true
        if (this.listeners.length > 0) {
            this.listeners = []
            this.priorityByListener = new LuaMap()
            if (this.deinitialize) {
                this.deinitialize(this.#data!)
                this.#data = undefined
            }
        }
    }
}

const invoke = Event.invoke

const IgnoreEvent: unique symbol = Symbol()
type IgnoreEvent = typeof IgnoreEvent
export { IgnoreEvent }

const invokeEventIfNotIgnored: {
    <T extends any[]>(event: Event<T>, ...[arg, ...args]: [IgnoreEvent] | [...T]): void
    // make TSTL emit better code
} = (event: Event<any[]>, arg?: any, ...args: any[]): void => {
    if (arg != IgnoreEvent) {
        invoke(event, arg, ...args)
    }
}

export class TriggerEvent<T extends any[] = []> extends InitializingEvent<T, jtrigger | undefined> {
    public constructor(r: (trigger: jtrigger) => void, c: () => LuaMultiReturn<T | [IgnoreEvent]>) {
        super(
            (event) => {
                const trigger = createTrigger()
                triggerAddCondition(
                    trigger,
                    condition(() => {
                        invokeEventIfNotIgnored(event, ...c())
                    })
                )
                r(trigger)
                return trigger
            },
            (trigger) => {
                if (trigger) {
                    triggerClearConditions(trigger)
                    destroyTrigger(trigger)
                }
            }
        )
    }
}

export type EventParameters<T> = T extends Event<infer P> ? P : never

export type EventDispatchTable<EventType extends Event<any>, KeyType extends number = number> = {
    readonly [key in KeyType]: EventType
}

export type DispatchingEvent<
    P extends any[],
    T extends Event<P> = Event<P>,
    S extends Event<P> = Event<P>
> = T & EventDispatchTable<S>

export const createDispatchingEvent: {
    <T extends Event<any>, S extends Event<EventParameters<T>>>(
        underlyingEvent: T,
        extractKey: (...args: EventParameters<T>) => number,
        ...createEvent: [...(Event<any> extends S ? [(() => S)?] : [() => S])]
    ): DispatchingEvent<EventParameters<T>, T>
} = <T extends Event<any>, S extends Event<EventParameters<T>>>(
    underlyingEvent: T,
    extractKey: (...args: EventParameters<T>) => number,
    createEvent?: () => S
): DispatchingEvent<EventParameters<T>, T, S> => {
    const actualCreateEvent = createEvent ?? ((() => new Event()) as () => S)
    let initialized = false
    return setmetatable({} as EventDispatchTable<EventParameters<T>>, {
        __index(id: number | keyof T): T[keyof T] | Event<EventParameters<T>> {
            if (typeof id != "number") {
                return underlyingEvent[id]
            }
            if (!initialized) {
                const invoke = Event.invoke
                underlyingEvent.addListener((...args) => {
                    const key = extractKey(...args)
                    const event = rawget(this, key)
                    if (event) {
                        invoke(event, ...args)
                    }
                })
                initialized = true
            }
            const event = actualCreateEvent()
            rawset(
                this as {
                    readonly [id: number]: Event<EventParameters<T>>
                },
                id,
                event
            )
            return event
        },
        __newindex: underlyingEvent,
    }) as T & EventDispatchTable<EventParameters<T>>
}

const invokeEventIfNeeded: {
    <T extends any[]>(event: Event<T>, ...[needed, ...args]: [false] | [boolean, ...T]): void
    // make TSTL emit better code
} = <T extends any[]>(event: Event<T>, needed: boolean, ...args: T | []): void => {
    if (needed) {
        Event.invoke(event, ...args)
    }
}

export class DependentInitializingEvent<T extends any[], R extends any[]> extends InitializingEvent<
    R,
    EventListener<T>
> {
    public constructor(
        underlyingEvent: Event<T>,
        priority: EventListenerPriority,
        collector: (...args: T) => LuaMultiReturn<[false] | [true, ...R]>
    ) {
        super(
            (event) => {
                const listener: EventListener<T> = (...args) => {
                    invokeEventIfNeeded(event, ...(collector(...args) as [false] | [true, ...R]))
                }
                underlyingEvent.addListener(priority, listener)
                return listener
            },
            (listener) => {
                underlyingEvent.removeListener(listener)
            }
        )
    }
}

const tableUnpack = table.unpack

const captorsToProcessByEvent = new LuaMap<Event<any>, LuaSet<EventParametersCaptor<any>>>()
const lastParametersByEvent = new LuaMap<
    Event<any>,
    any[] & {
        n: number
    }
>()

export class EventParametersCaptor<T extends any[]> {
    private invoked?: true

    private constructor(private readonly event: Event<T>) {
        let captorsToProcess = captorsToProcessByEvent.get(event)
        if (captorsToProcess == undefined) {
            captorsToProcess = setmetatable(new LuaSet<EventParametersCaptor<T>>(), { __mode: "k" })
            captorsToProcessByEvent.set(event, captorsToProcess)
            event.addListener(EventListenerPriority.HIGHEST, (...args) => {
                let lastParameters = lastParametersByEvent.get(event)
                if (lastParameters == undefined) {
                    lastParameters = {
                        n: 0,
                    } as any[] & {
                        n: number
                    }
                    lastParametersByEvent.set(event, lastParameters)
                }

                const argsN = select("#", ...args)
                for (const captor of captorsToProcess!) {
                    if (!captor.invoked) {
                        for (const i of $range(1, argsN)) {
                            const [arg] = select(i, ...args)
                            ;(captor as EventParametersCaptorInternals<any[]>)[i - 1] = arg
                        }
                        captor.invoked = true
                    }
                }
                if (next(captorsToProcess!)[0] != undefined) {
                    captorsToProcess = setmetatable(new LuaSet<EventParametersCaptor<T>>(), {
                        __mode: "k",
                    })
                    captorsToProcessByEvent.set(event, captorsToProcess)
                }
                for (const i of $range(1, argsN)) {
                    const [arg] = select(i, ...args)
                    lastParameters[i - 1] = arg
                }
                for (const i of $range(argsN, lastParameters.n)) {
                    lastParameters[i - 1] = undefined
                }
                lastParameters.n = argsN
            })
        }
        captorsToProcess.add(this)
    }

    public getFirstParameters(): LuaMultiReturn<[] | T> {
        if (this.invoked) {
            return tableUnpack(this as any as EventParametersCaptorInternals<T>)
        } else {
            return $multi()
        }
    }

    public getLastParameters(): LuaMultiReturn<[] | T> {
        if (this.invoked) {
            return tableUnpack(lastParametersByEvent.get(this.event) as any as T)
        } else {
            return $multi()
        }
    }

    public static create<T extends any[]>(event: Event<T>): EventParametersCaptor<T> {
        return new EventParametersCaptor(event)
    }
}

type EventParametersCaptorInternals<T extends any[]> = EventParametersCaptor<T> & T
