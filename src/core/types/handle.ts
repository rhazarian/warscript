import { Event } from "../../event"
import { getClass, getSuperclass } from "../../utility/reflection"
import { AbstractConstructor } from "../../utility/types"
import { IllegalStateException } from "../../exception"

const getHandleId = GetHandleId

export type HandleConstructor<H extends jhandle, T extends Handle<H>, Args extends any[]> = new (
    handle: H,
    ...args: Args
) => T

export type HandleDestructor = {
    readonly __handleDestructor: unique symbol
}

const onCreateEventByHandleConstructor = new LuaMap<
    HandleConstructor<any, any, any>,
    Event<[any]>
>()

const onDestroyEventByHandleConstructor = new LuaMap<
    HandleConstructor<any, any, any>,
    Event<[any]>
>()

declare const noOverrideSymbol: unique symbol
type NoOverride = { [noOverrideSymbol]: typeof noOverrideSymbol }

/** @internal For use by internal systems only. */
export const enum HandleState {
    BEING_CREATED,
    CREATED,
    BEING_DESTROYED,
    DESTROYED,
}

const enum HandlePropertyKey {
    STATE,
}

export class Handle<H extends jhandle, DestroyParameters extends any[] = []>
    implements Destroyable
{
    public readonly handle: H

    private [HandlePropertyKey.STATE]?: HandleState

    private onDestroyEvent?: Event

    /**
     * @deprecated Do not use the constructor directly, use the factory methods.
     * The constructor is public solely for type inference purposes.
     */
    public constructor(handle: H) {
        this[HandlePropertyKey.STATE] = HandleState.BEING_CREATED

        const id = getHandleId(handle)
        const clazz = this.constructor as typeof Handle
        if (clazz.memoized[id]) {
            error(`Double-constructor run for handle ${id}!`)
        }
        clazz.memoized[id] = this

        this.handle = handle
    }

    /** @internal For use by internal systems only. */
    protected get state(): HandleState {
        return this[HandlePropertyKey.STATE] ?? HandleState.CREATED
    }

    protected static get onCreateEvent(): Event<[any]> {
        let onCreateEvent = onCreateEventByHandleConstructor.get(this)
        if (onCreateEvent == undefined) {
            onCreateEvent = new Event()
            onCreateEventByHandleConstructor.set(this, onCreateEvent)
        }
        return onCreateEvent
    }

    protected static get onDestroyEvent(): Event<[any]> {
        let onDestroyEvent = onDestroyEventByHandleConstructor.get(this)
        if (onDestroyEvent == undefined) {
            onDestroyEvent = new Event()
            onDestroyEventByHandleConstructor.set(this, onDestroyEvent)
        }
        return onDestroyEvent
    }

    private static get memoized(): { [id: number]: Handle<any> } {
        const memoized = {}
        rawset(this as any, "memoized", memoized)
        return memoized
    }

    public static of<H extends jhandle, T extends Handle<H>, Args extends any[] = []>(
        this: HandleConstructor<H, T, Args>,
        handle: null,
        ...args: Args
    ): null

    public static of<H extends jhandle, T extends Handle<H>, Args extends any[] = []>(
        this: HandleConstructor<H, T, Args>,
        handle: undefined,
        ...args: Args
    ): undefined

    public static of<H extends jhandle, T extends Handle<H>, Args extends any[] = []>(
        this: HandleConstructor<H, T, Args>,
        handle: H,
        ...args: Args
    ): T

    public static of<H extends jhandle, T extends Handle<H>, Args extends any[] = []>(
        this: HandleConstructor<H, T, Args>,
        handle: H | null,
        ...args: Args
    ): T | null

    public static of<H extends jhandle, T extends Handle<H>, Args extends any[] = []>(
        this: HandleConstructor<H, T, Args>,
        handle: H | undefined,
        ...args: Args
    ): T | undefined

    public static of<H extends jhandle, T extends Handle<H>, Args extends any[]>(
        this: HandleConstructor<H, T, Args> & typeof Handle,
        handle: H | null | undefined,
        ...args: Args
    ): T | null | undefined {
        return (
            handle &&
            ((
                this as unknown as {
                    memoized: { [id: number]: T }
                }
            ).memoized[getHandleId(handle)] ??
                this.createInternal<H, T, Args>(handle, ...args))
        )
    }

    private static createInternal<H extends jhandle, T extends Handle<H>, Args extends any[]>(
        this: HandleConstructor<H, T, Args>,
        handle: H,
        ...args: Args
    ): T {
        const object = new this(handle, ...args)
        Handle.invokeOnCreateEvent(getClass(object), object)
        object[HandlePropertyKey.STATE] = undefined // HandleState.CREATED
        return object
    }

    private static invokeOnCreateEvent(
        clazz: AbstractConstructor<Handle<any>> | undefined,
        handle: Handle<any>
    ): void {
        if (clazz == undefined) {
            return
        }
        Handle.invokeOnCreateEvent(getSuperclass(clazz), handle)
        const onCreateEvent = onCreateEventByHandleConstructor.get(clazz as typeof Handle)
        if (onCreateEvent != undefined) {
            Event.invoke(onCreateEvent, handle)
        }
    }

    public static get onCreate(): Event<[Handle<jhandle>]> {
        return this.onCreateEvent
    }

    public static get destroyEvent(): Event<[Handle<jhandle>]> {
        return this.onDestroyEvent
    }

    public get destroyEvent(): Event {
        if (!this.onDestroyEvent) {
            this.onDestroyEvent = new Event()
        }
        return this.onDestroyEvent
    }

    public toString(): string {
        return `${this.constructor.name}@${getHandleId(this.handle)}`
    }

    /**
     * An overriding function should always call the super one at the end of it,
     * in the following manner: `return super.onDestroy()`.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onDestroy(...parameters: DestroyParameters): HandleDestructor {
        this[HandlePropertyKey.STATE] = HandleState.DESTROYED
        return undefined!
    }

    /**
     * Frees this handle, and runs any associated destruction hooks.
     */
    public destroy(...parameters: DestroyParameters): NoOverride {
        const clazz = this.constructor as typeof Handle

        const id = getHandleId(this.handle)
        if (!clazz.memoized[id]) {
            throw new IllegalStateException(`Double-destroy run for handle ${id}`)
        }

        this[HandlePropertyKey.STATE] = HandleState.BEING_DESTROYED

        if (this.onDestroyEvent) {
            Event.invoke(this.onDestroyEvent)
        }
        Handle.invokeOnDestroyEvent(clazz, this)

        this.onDestroy(...parameters)
        if ((this[HandlePropertyKey.STATE] as HandleState) != HandleState.DESTROYED) {
            throw new IllegalStateException(
                `'onDestroy' is incorrectly overridden (class '${clazz.name}').`
            )
        }

        delete clazz.memoized[id]

        return undefined!
    }

    private static invokeOnDestroyEvent(
        clazz: AbstractConstructor<Handle<any>> | undefined,
        handle: Handle<any>
    ): void {
        if (clazz == undefined) {
            return
        }
        const onDestroyEvent = onDestroyEventByHandleConstructor.get(clazz as typeof Handle)
        if (onDestroyEvent != undefined) {
            Event.invoke(onDestroyEvent, handle)
        }
        Handle.invokeOnDestroyEvent(getSuperclass(clazz), handle)
    }
}
