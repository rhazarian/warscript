import { TupleOf } from "./types"

/** @internal An ugly function type for use by internal systems only. */
export type Forward<N extends number> = <T, Args extends TupleOf<any, N>, R>(
    func: (this: T, ...args: Args) => R,
    that: T,
    ...args: [...Args, ...any[]]
) => R

/** @internal An ugly function for use by internal systems only. */
export const forward3 = <T, Arg0, Arg1, Arg2, R>(
    func: (this: T, ...args: [Arg0, Arg1, Arg2]) => R,
    that: T,
    arg0: Arg0,
    arg1: Arg1,
    arg2: Arg2,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._: any[]
): R => {
    return func.call(that, arg0, arg1, arg2)
}

/** @internal An ugly function for use by internal systems only. */
export const forward4 = <T, Arg0, Arg1, Arg2, Arg3, R>(
    func: (this: T, ...args: [Arg0, Arg1, Arg2, Arg3]) => R,
    that: T,
    arg0: Arg0,
    arg1: Arg1,
    arg2: Arg2,
    arg3: Arg3,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._: any[]
): R => {
    return func.call(that, arg0, arg1, arg2, arg3)
}

/** @internal An ugly function for use by internal systems only. */
export const forward5 = <T, Arg0, Arg1, Arg2, Arg3, Arg4, R>(
    func: (this: T, ...args: [Arg0, Arg1, Arg2, Arg3, Arg4]) => R,
    that: T,
    arg0: Arg0,
    arg1: Arg1,
    arg2: Arg2,
    arg3: Arg3,
    arg4: Arg4,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._: any[]
): R => {
    return func.call(that, arg0, arg1, arg2, arg3, arg4)
}

/** @internal An ugly function for use by internal systems only. */
export const forward6 = <T, Arg0, Arg1, Arg2, Arg3, Arg4, Arg5, R>(
    func: (this: T, ...args: [Arg0, Arg1, Arg2, Arg3, Arg4, Arg5]) => R,
    that: T,
    arg0: Arg0,
    arg1: Arg1,
    arg2: Arg2,
    arg3: Arg3,
    arg4: Arg4,
    arg5: Arg5,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._: any[]
): R => {
    return func.call(that, arg0, arg1, arg2, arg3, arg4, arg5)
}

/** @internal An ugly function for use by internal systems only. */
export const forward7 = <T, Arg0, Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, R>(
    func: (this: T, ...args: [Arg0, Arg1, Arg2, Arg3, Arg4, Arg5, Arg6]) => R,
    that: T,
    arg0: Arg0,
    arg1: Arg1,
    arg2: Arg2,
    arg3: Arg3,
    arg4: Arg4,
    arg5: Arg5,
    arg6: Arg6,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._: any[]
): R => {
    return func.call(that, arg0, arg1, arg2, arg3, arg4, arg5, arg6)
}

/** @internal An ugly function for use by internal systems only. */
export const forward8 = <T, Arg0, Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, Arg7, R>(
    func: (this: T, ...args: [Arg0, Arg1, Arg2, Arg3, Arg4, Arg5, Arg6, Arg7]) => R,
    that: T,
    arg0: Arg0,
    arg1: Arg1,
    arg2: Arg2,
    arg3: Arg3,
    arg4: Arg4,
    arg5: Arg5,
    arg6: Arg6,
    arg7: Arg7,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._: any[]
): R => {
    return func.call(that, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
}

/** @internal An ugly thing for use by internal systems only. */
export const forwardByN = {
    3: forward3,
    4: forward4,
    5: forward5,
    6: forward6,
    7: forward7,
    8: forward8,
}

export const apply: {
    <T, ConsumerParameters extends any[]>(
        object: T,
        consumer: (value: T, ...parameters: ConsumerParameters) => void,
        ...parameters: ConsumerParameters
    ): T
    <
        T,
        ConsumerParameters extends any[],
        K extends KeysOfType<T, (...parameters: ConsumerParameters) => void>,
    >(
        object: T,
        key: K,
        ...parameters: ConsumerParameters
    ): T
} = <T, ConsumerParameters extends any[]>(
    object: T,
    transform:
        | ((value: T, ...parameters: ConsumerParameters) => void)
        | KeysOfType<T, (this: T, ...parameters: ConsumerParameters) => void>,
    ...parameters: ConsumerParameters
): T => {
    if (typeof transform == "function") {
        transform(object, ...parameters)
    } else {
        ;(object[transform] as (this: T, ...parameters: ConsumerParameters) => void)(...parameters)
    }
    return object
}

export const identity = <T>(value: T): T => value

export const firstArgument = identity

export const secondArgument = <T>(_: unknown, value: T): T => value

export const thirdArgument = <T>(_first: unknown, _second: unknown, value: T): T => value

export const increment = (value: number): number => value + 1

export const or = (lhs: boolean, rhs: boolean): boolean => lhs || rhs
