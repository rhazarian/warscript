import { max } from "../math"

const safeCall = warpack.safeCall
const select = _G.select
const tableMove = table.move
const tableUnpack = table.unpack

type Callback = {
    readonly __callback: unique symbol
}

export type CallbackArray = {
    readonly __callbackArray: unique symbol
} & Callback[]

export const callbackArray = () => [] as unknown as CallbackArray

type CallbackArrayInternal = CallbackArray & any[]

export function addCallback<Args extends any[]>(
    this: void,
    array: CallbackArray,
    callback: (...args: Args) => unknown,
    ...args: Args
): void

export function addCallback<Args extends any[]>(
    this: void,
    array: CallbackArrayInternal,
    callback: (...args: Args) => unknown,
    ...args: Args
): void {
    let i = array[0] || 2
    array[i - 1] = callback
    const argsCount = select("#", ...args)
    ++i
    array[i - 1] = argsCount
    for (const j of $range(1, argsCount)) {
        ++i
        array[i - 1] = select(j, ...args)[0]
    }
    array[0] = i + 1
}

export function clearCallbacks(this: void, array: CallbackArray): void

export function clearCallbacks(this: void, array: CallbackArrayInternal): void {
    const length = array[0] || 2
    tableMove(array, length, length + length - 2, 1)
}

export function consumeCallbacks(this: void, array: CallbackArray): void

export function consumeCallbacks(this: void, array: CallbackArrayInternal): void {
    const length = array[0] || 2
    invokeCallbacks(array)
    const newLength = array[0] || 2
    tableMove(array, length, length + newLength - 3, 2)
    array[0] = newLength - length + 2
}

export function invokeCallbacks(this: void, array: CallbackArray): void

export function invokeCallbacks(this: void, array: CallbackArrayInternal): void {
    const length = array[0] || 2
    let i = 2
    while (i != length) {
        const callback = array[i - 1]
        ++i
        const argsCount = array[i - 1]
        ++i
        safeCall(callback, ...tableUnpack(array, i, i + argsCount - 1))
        i += argsCount
    }
}
