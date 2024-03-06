import { IllegalStateException } from "./exception"

declare const noOverrideSymbol: unique symbol
type NoOverride = { [noOverrideSymbol]: typeof noOverrideSymbol }

export type Destructor = {
    readonly __destructor: unique symbol
}

export interface Destroyable {
    destroy(): void
}

const enum State {
    BEING_DESTROYED,
    DESTROYED,
}

const stateByDestroyable = setmetatable(new LuaMap<AbstractDestroyable, State>(), { __mode: "k" })

export abstract class AbstractDestroyable implements Destroyable {
    /**
     * An overriding function should always call the super one at the end of it,
     * in the following manner: `return super.onDestroy()`.
     */
    protected onDestroy(): Destructor {
        stateByDestroyable.set(this, State.DESTROYED)
        return undefined!
    }

    public destroy(): boolean & NoOverride {
        if (stateByDestroyable.has(this)) {
            return false as false & NoOverride
        }

        stateByDestroyable.set(this, State.BEING_DESTROYED)

        this.onDestroy()

        if (stateByDestroyable.get(this) != State.DESTROYED) {
            throw new IllegalStateException(
                `'onDestroy' is incorrectly overridden (class '${this.constructor.name}').`
            )
        }

        return true as true & NoOverride
    }
}
