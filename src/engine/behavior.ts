import { AbstractDestroyable, Destructor } from "../destroyable"
import { Timer } from "../core/types/timer"
import { increment } from "../utility/functions"

const safeCall = warpack.safeCall

const firstBehaviorByObject = new LuaMap<AnyNotNil, Behavior<AnyNotNil> | undefined>()
const lastBehaviorByObject = new LuaMap<AnyNotNil, Behavior<AnyNotNil> | undefined>()

export type BehaviorConstructor<
    T extends Behavior<AnyNotNil>,
    Parameters extends any[] = any[],
> = OmitConstructor<typeof Behavior<any>> & (abstract new (...parameters: Parameters) => T)

const enum BehaviorPropertyKey {
    PREVIOUS_BEHAVIOR,
    NEXT_BEHAVIOR,
    TIMER,
}

const invokeBehaviorOnPeriod = (behavior: Behavior<any>, ...args: any[]): void => {
    behavior["onPeriod"](...args)
}

const reduceBehaviors = <
    T extends Behavior<AnyNotNil>,
    ConstructorParameters extends any[],
    ConsumerParameters extends any[],
    Accumulator,
    R,
>(
    behaviorConstructor: BehaviorConstructor<T, ConstructorParameters>,
    object: T extends Behavior<infer Object> ? Object : never,
    operation: (this: void, accumulator: Accumulator, value: R) => Accumulator,
    initial: Accumulator,
    consumerOrKey:
        | ((this: void, behavior: T, ...parameters: ConsumerParameters) => R)
        | KeysOfType<T, (this: T, ...parameters: ConsumerParameters) => R>,
    ...parameters: ConsumerParameters
): Accumulator => {
    let accumulator = initial as Accumulator
    let behavior = firstBehaviorByObject.get(object)
    if (behavior != undefined) {
        if (typeof consumerOrKey == "function") {
            do {
                if (behavior instanceof behaviorConstructor) {
                    const [isSuccessful, result] = safeCall(
                        consumerOrKey,
                        behavior as T,
                        ...parameters,
                    )
                    if (isSuccessful) {
                        accumulator = operation(accumulator, result)
                    }
                }
                behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
            } while (behavior != undefined)
        } else {
            do {
                if (behavior instanceof behaviorConstructor) {
                    const [isSuccessful, result] = safeCall(
                        (behavior as T)[consumerOrKey] as (
                            this: T,
                            ...parameters: ConsumerParameters
                        ) => R,
                        behavior as T,
                        ...parameters,
                    )
                    if (isSuccessful) {
                        accumulator = operation(accumulator, result)
                    }
                }
                behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
            } while (behavior != undefined)
        }
    }
    return accumulator
}

export abstract class Behavior<
    T extends AnyNotNil,
    PeriodicActionParameters extends any[] = any[],
> extends AbstractDestroyable {
    private [BehaviorPropertyKey.PREVIOUS_BEHAVIOR]?: Behavior<T>
    private [BehaviorPropertyKey.NEXT_BEHAVIOR]?: Behavior<T>
    private [BehaviorPropertyKey.TIMER]?: Timer

    protected constructor(protected readonly object: T) {
        super()
        const lastBehavior = lastBehaviorByObject.get(object) as Behavior<T>
        if (lastBehavior == undefined) {
            firstBehaviorByObject.set(object, this)
            lastBehaviorByObject.set(object, this)
        } else {
            this[BehaviorPropertyKey.PREVIOUS_BEHAVIOR] = lastBehavior
            lastBehavior[BehaviorPropertyKey.NEXT_BEHAVIOR] = this
            lastBehaviorByObject.set(object, this)
        }
    }

    protected onDestroy(): Destructor {
        this[BehaviorPropertyKey.TIMER]?.destroy()

        const previousBehavior = this[BehaviorPropertyKey.PREVIOUS_BEHAVIOR]
        const nextBehavior = this[BehaviorPropertyKey.NEXT_BEHAVIOR]
        if (previousBehavior != undefined) {
            previousBehavior[BehaviorPropertyKey.NEXT_BEHAVIOR] = nextBehavior
        } else {
            firstBehaviorByObject.set(this.object, nextBehavior)
        }
        if (nextBehavior != undefined) {
            nextBehavior[BehaviorPropertyKey.PREVIOUS_BEHAVIOR] = previousBehavior
        } else {
            lastBehaviorByObject.set(this.object, previousBehavior)
        }

        return super.onDestroy()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onPeriod(...parameters: PeriodicActionParameters): void {
        // no-op
    }

    protected startPeriodicAction(interval: number, ...parameters: PeriodicActionParameters): void {
        let timer = this[BehaviorPropertyKey.TIMER]
        if (timer == undefined) {
            timer = Timer.create()
            this[BehaviorPropertyKey.TIMER] = timer
        }
        timer.start(interval, true, invokeBehaviorOnPeriod, this, ...parameters)
    }

    protected stopPeriodicAction(): void {
        const timer = this[BehaviorPropertyKey.TIMER]
        if (timer != undefined) {
            timer.destroy()
            this[BehaviorPropertyKey.TIMER] = undefined
        }
    }

    public static count<T extends Behavior<AnyNotNil>, ConstructorParameters extends any[]>(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        limit?: number,
    ): number {
        let behaviorsCount = 0
        let behavior = firstBehaviorByObject.get(object)
        while (behavior != undefined && (limit == undefined || behaviorsCount < limit)) {
            if (behavior instanceof this) {
                ++behaviorsCount
            }
            behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
        }
        return behaviorsCount
    }

    public static getFirst<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        CountOrPredicate extends
            | [number]
            | []
            | [(behavior: T, ...args: PredicateArgs) => boolean, ...PredicateArgs],
        PredicateArgs extends any[],
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        ...[countOrPredicate]: CountOrPredicate
    ): CountOrPredicate extends [number] ? T[] : T | undefined

    public static getFirst<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        PredicateArgs extends any[],
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        countOrPredicate?: number | ((behavior: T, ...args: PredicateArgs) => boolean),
        ...predicateArgs: PredicateArgs
    ): T[] | T | undefined {
        let behavior = firstBehaviorByObject.get(object)
        if (typeof countOrPredicate != "number") {
            while (behavior != undefined) {
                if (
                    behavior instanceof this &&
                    (countOrPredicate == undefined ||
                        countOrPredicate(behavior as T, ...predicateArgs))
                ) {
                    return behavior as T
                }
                behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
            }
            return undefined
        }
        const behaviors: T[] = []
        let behaviorsCount = 0
        while (behavior != undefined && behaviorsCount < countOrPredicate) {
            if (behavior instanceof this) {
                ++behaviorsCount
                behaviors[behaviorsCount - 1] = behavior as T
            }
            behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
        }
        return behaviors
    }

    public static getLast<T extends Behavior<AnyNotNil>, ConstructorParameters extends any[]>(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
    ): T | undefined {
        let behavior = lastBehaviorByObject.get(object)
        while (behavior != undefined) {
            if (behavior instanceof this) {
                return behavior as T
            }
            behavior = behavior[BehaviorPropertyKey.PREVIOUS_BEHAVIOR]
        }
        return undefined
    }

    public static getAll<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        PredicateArgs extends any[],
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        predicate?: (this: void, behavior: T, ...args: PredicateArgs) => boolean,
        ...predicateArgs: PredicateArgs
    ): T[] {
        const behaviors: T[] = []
        let behaviorsCount = 0
        let behavior = firstBehaviorByObject.get(object)
        while (behavior != undefined) {
            if (
                behavior instanceof this &&
                (predicate == undefined || predicate(behavior as T, ...predicateArgs))
            ) {
                ++behaviorsCount
                behaviors[behaviorsCount - 1] = behavior as T
            }
            behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
        }
        return behaviors
    }

    public static forFirst<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        ConsumerParameters extends any[],
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        count: number,
        consumer: (this: void, behavior: T, ...parameters: ConsumerParameters) => any,
        ...parameters: ConsumerParameters
    ): number

    public static forFirst<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        K extends KeysOfType<T, (this: T, ...args: any) => any>,
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        count: number,
        key: K,
        ...parameters: T[K] extends (this: T, ...args: any) => any ? Parameters<T[K]> : never
    ): number

    public static forFirst<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        ConsumerParameters extends any[],
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        count: number,
        consumerOrKey:
            | ((this: void, behavior: T, ...parameters: ConsumerParameters) => unknown)
            | KeysOfType<T, (this: T, ...parameters: ConsumerParameters) => unknown>,
        ...parameters: ConsumerParameters
    ): number {
        let behaviorsCount = 0
        let behavior = firstBehaviorByObject.get(object)
        if (typeof consumerOrKey == "function") {
            while (behavior != undefined && behaviorsCount < count) {
                if (behavior instanceof this) {
                    safeCall(consumerOrKey, behavior as T, ...parameters)
                    ++behaviorsCount
                }
                behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
            }
        } else {
            while (behavior != undefined && behaviorsCount < count) {
                if (behavior instanceof this) {
                    safeCall(
                        (behavior as T)[consumerOrKey] as (
                            this: T,
                            ...parameters: ConsumerParameters
                        ) => unknown,
                        behavior as T,
                        ...parameters,
                    )
                    ++behaviorsCount
                }
                behavior = behavior[BehaviorPropertyKey.NEXT_BEHAVIOR]
            }
        }
        return behaviorsCount
    }

    public static forAll<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        ConsumerParameters extends any[],
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        consumer: (this: void, behavior: T, ...parameters: ConsumerParameters) => unknown,
        ...parameters: ConsumerParameters
    ): number

    public static forAll<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        K extends KeysOfType<T, (this: T, ...args: any) => any>,
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        key: K,
        ...parameters: T[K] extends (this: T, ...args: any) => any ? Parameters<T[K]> : never
    ): number

    public static forAll<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        ConsumerParameters extends any[],
    >(
        this: typeof Behavior & BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        consumerOrKey:
            | ((this: void, behavior: T, ...parameters: ConsumerParameters) => unknown)
            | KeysOfType<T, (this: T, ...parameters: ConsumerParameters) => unknown>,
        ...parameters: ConsumerParameters
    ): number {
        return reduceBehaviors(this, object, increment, 0, consumerOrKey, ...parameters)
    }

    public static reduce<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        ConsumerParameters extends any[],
        Accumulator,
        R,
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        operation: (this: void, accumulator: Accumulator, value: R) => Accumulator,
        initial: Accumulator,
        consumer: (this: void, behavior: T, ...parameters: ConsumerParameters) => R,
        ...parameters: ConsumerParameters
    ): Accumulator

    public static reduce<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        Accumulator,
        R,
        K extends KeysOfType<T, (this: T, ...args: any) => R>,
    >(
        this: BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        operation: (this: void, accumulator: Accumulator, value: R) => Accumulator,
        initial: Accumulator,
        key: K,
        ...parameters: T[K] extends (this: T, ...args: any) => R ? Parameters<T[K]> : never
    ): Accumulator

    public static reduce<
        T extends Behavior<AnyNotNil>,
        ConstructorParameters extends any[],
        ConsumerParameters extends any[],
        Accumulator,
        R,
    >(
        this: typeof Behavior & BehaviorConstructor<T, ConstructorParameters>,
        object: T extends Behavior<infer Object> ? Object : never,
        operation: (this: void, accumulator: Accumulator, value: R) => Accumulator,
        initial: Accumulator,
        consumerOrKey:
            | ((this: void, behavior: T, ...parameters: ConsumerParameters) => R)
            | KeysOfType<T, (this: T, ...parameters: ConsumerParameters) => R>,
        ...parameters: ConsumerParameters
    ): Accumulator {
        return reduceBehaviors(this, object, operation, initial, consumerOrKey, ...parameters)
    }
}
