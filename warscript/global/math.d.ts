/** @noSelfInFile */

declare namespace math {
    /** Clamps the given value between the given minimum and maximum values. Returns the given value if it is within the min and max range. */
    function clamp(v: number, min: number, max: number): number
    /** Returns the sign of v. Return value is 1 when v is positive or zero, -1 when v is negative. */
    function sign(v: number): number
    /** Linearly interpolates between a and b by t. */
    function lerp(a: number, b: number, t: number): number
}

declare namespace table {
    function bininsert<T>(list: T[], value: T, comp?: (a: T, b: T) => boolean): void
    function binsearch<T>(
        list: T[],
        value: T,
        comp?: (a: T, b: T) => boolean
    ): LuaMultiReturn<[number, number] | [undefined]>
}
