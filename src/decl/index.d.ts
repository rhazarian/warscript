/** @noSelfInFile */

/// <reference path="./native.d.ts"/>
/// <reference types="warpack-types/warpack"/>
/// <reference types="lua-types/5.3"/>

declare function setmetatable<
    T extends object,
    TMetatable extends LuaMetatable<T>
>(
    table: T,
    metatable?: TMetatable | null
): TMetatable extends { __index(this: T): infer TValue }
    ? T extends LuaTable<infer TKey, infer TTableValue>
        ? LuaTable<TKey, NonNullable<TTableValue> | TValue>
        : T extends LuaMap<infer TKey, infer TMapValue>
            ? TValue extends NonNullable<TValue>
                ? LuaTable<TKey, NonNullable<TMapValue> | TValue>
                : LuaMap<TKey, NonNullable<TMapValue> | TValue>
            : T extends Record<infer TKey, infer TRecordValue>
                ? Record<TKey, NonNullable<TRecordValue> | TValue>
                : T & { [key: string | number]: TValue }
    : TMetatable extends { __index(this: T, key: infer TKey): infer TValue }
        ? TKey extends string | number | symbol
            ? T & { [K in TKey & (string | number)]: TValue }
            : T & LuaTable<TKey & {}, TValue>
        : TMetatable extends { __index: infer TIndex }
            ? TIndex extends object
                ? {
                    [K in keyof T]: T[K] extends NonNullable<T[K]> ? T[K] : K extends keyof TIndex ? (NonNullable<T[K]> | TIndex[K]) : T[K]
                } & {
                    [K in keyof TIndex]: K extends keyof T ? unknown : TIndex[K]
                }
                : T
            : TMetatable extends LuaMetatable<T, undefined>
                ? T
                : TMetatable extends LuaMetatable<T, ((this: T, key: infer TKey) => infer TValue)>
                    ? T & { [K in TKey & string]: TValue }
                    : TMetatable extends LuaMetatable<T, infer TIndex>
                        ? TIndex extends object
                            ? T & TIndex
                            : T
                        : T;

declare function rawget<K extends AnyNotNil, V>(t: LuaTable<K, V>, key: K): V
declare function rawset<K extends AnyNotNil, V>(t: LuaTable<K, V>, key: K, val: V): void
declare function rawset<K extends AnyNotNil, V>(t: LuaMap<K, V>, key: K, val: V | undefined): void
declare function pairs<K extends AnyNotNil, V>(t: LuaTable<K, V>): LuaIterable<LuaMultiReturn<[K, Exclude<V, undefined | null>]>>
declare function pairs<T>(t: T): LuaIterable<LuaMultiReturn<[keyof T, Exclude<T[keyof T], undefined | null>]>>
declare function ipairs<T>(t: Record<number, T>): LuaIterable<LuaMultiReturn<[number, Exclude<T, undefined | null>]>, Record<number, T>>

declare namespace coroutine {
    /**
     * Starts or continues the execution of coroutine co. The first time you
     * resume a coroutine, it starts running its body. The values val1, ... are
     * passed as the arguments to the body function. If the coroutine has yielded,
     * resume restarts it; the values val1, ... are passed as the results from the
     * yield.
     *
     * If the coroutine runs without any errors, resume returns true plus any
     * values passed to yield (when the coroutine yields) or any values returned
     * by the body function (when the coroutine terminates). If there is any
     * error, resume returns false plus the error message.
     */
    function resume(
        co: LuaThread,
        ...val: any[]
    ): LuaMultiReturn<[true, ...any[]] | [false, any]>
}

declare namespace math {
    const idiv: LuaFloorDivision<number, number, number>
}

interface String {
    /**
     * Returns a formatted version of its variable number of arguments following
     * the description given in its first argument (which must be a string). The
     * format string follows the same rules as the ISO C function sprintf. The
     * only differences are that the options/modifiers *, h, L, l, n, and p are
     * not supported and that there is an extra option, q.
     *
     * The q option formats a string between double quotes, using escape sequences
     * when necessary to ensure that it can safely be read back by the Lua
     * interpreter. For instance, the call
     *
     * `string.format('%q', 'a string with "quotes" and \n new line')`
     *
     * may produce the string:
     *
     * `"a string with \"quotes\" and \
     *  new line"` Options A, a, E, e, f, G, and g all expect a number as
     * argument. Options c, d, i, o, u, X, and x expect an integer. When Lua is
     * compiled with a C89 compiler, options A and a (hexadecimal floats) do not
     * support any modifier (flags, width, length).
     *
     * Option s expects a string; if its argument is not a string, it is converted
     * to one following the same rules of tostring. If the option has any modifier
     * (flags, width, length), the string argument should not contain embedded
     * zeros.
     */
    format(...args: any[]): string;
}

declare namespace string {
    /**
     * Partitions a string into equal-sized chunks. The last chunk may be smaller if
     * the string is not equally divisible by the specified length.
     *
     * @param target string to partition
     * @param length size of chunk
     */
    function partition(target: string, length: number): string[]
}

declare function FourCC(id: string): number
