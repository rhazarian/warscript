/** @noSelfInFile */

declare interface Vec3 extends Vec2 {
    z: number
}

declare namespace vec3 {
    const zero: Readonly<Vec3>

    const add: LuaAddition<Readonly<Vec3>, Readonly<Vec3>, Vec3>
    const subtract: LuaSubtraction<Readonly<Vec3>, Readonly<Vec3>, Vec3>
    const negate: LuaNegation<Readonly<Vec3>, Vec3>
    const multiply: LuaMultiplication<Readonly<Vec3>, number, Vec3>
    const divide: LuaDivision<Readonly<Vec3>, number, Vec3>

    /** Returns the magnitude of the vector. */
    function magnitude(vector: Readonly<Vec3>): number
    /** Returns the unsigned angle in degrees between from and to. */
    function angles(
        from: Readonly<Vec3>,
        to: Readonly<Vec3>
    ): LuaMultiReturn<[yaw: number, pitch: number]>
    /** Returns the distance between a and b. */
    function distance(a: Readonly<Vec3>, b: Readonly<Vec3>): number
    /** Linearly interpolates between vectors a and b by t. */
    function lerp(a: Readonly<Vec3>, b: Readonly<Vec3>, t: number): Vec3
    /** Returns a vector that is made from the largest components of two vectors. */
    function max(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3
    /** Returns a vector that is made from the smallest components of two vectors. */
    function min(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3
    function floor(vector: Readonly<Vec3>): Vec3
    function ceil(vector: Readonly<Vec3>): Vec3
    /** Moves a point current towards target. */
    function moveTowards(current: Vec3, target: Vec3, dist: number): Vec3
    /** Multiplies two vectors component-wise. */
    function scale(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3
}

declare function vec3(x?: number, y?: number, z?: number): Vec3
