/** @noSelfInFile */

declare interface Vec2 {
    x: number
    y: number
    z: undefined | number
}

declare namespace vec2 {
    const zero: Readonly<Vec2>
    const one: Readonly<Vec2>
    const up: Readonly<Vec2>
    const down: Readonly<Vec2>
    const left: Readonly<Vec2>
    const right: Readonly<Vec2>
    const maxinteger: Readonly<Vec2>
    const mininteger: Readonly<Vec2>

    const add: LuaAddition<Readonly<Vec2>, Readonly<Vec2>, Vec2>
    const subtract: LuaSubtraction<Readonly<Vec2>, Readonly<Vec2>, Vec2>
    const negate: LuaNegation<Readonly<Vec2>, Vec2>
    const multiply: LuaMultiplication<Readonly<Vec2>, number, Vec2>
    const divide: LuaDivision<Readonly<Vec2>, number, Vec2>

    /** Gets the height of the terrain at the position specified by the vector. */
    function terrainZ(vector: Readonly<Vec2>): number
    /** Returns true if two vectors are approximately equal. */
    function equals(a: Readonly<Vec2>, b: Readonly<Vec2>, eps?: number): number
    /** Returns the magnitude of the vector. */
    function magnitude(vector: Readonly<Vec2>): number
    /** Returns the unsigned angle in degrees between from and to. */
    function angle(from: Readonly<Vec2>, to: Readonly<Vec2>): number
    /** Returns the distance between a and b. */
    function distance(a: Readonly<Vec2>, b: Readonly<Vec2>): number
    /** Dot Product of two vectors. */
    function dot(a: Readonly<Vec2>, b: Readonly<Vec2>): number
    /** Linearly interpolates between vectors a and b by t. */
    function lerp(a: Readonly<Vec2>, b: Readonly<Vec2>, t: number): Vec2
    /** Returns a vector that is made from the largest components of two vectors. */
    function max(a: Readonly<Vec2>, b: Readonly<Vec2>): Vec2
    /** Returns a vector that is made from the smallest components of two vectors. */
    function min(a: Readonly<Vec2>, b: Readonly<Vec2>): Vec2
    /** Returns a vector that is made from the largest integral values smaller than or equal to components of the vector. */
    function floor(vector: Readonly<Vec2>): Vec2
    /** Returns a vector that is made from the smallest integral values larger than or equal to components of the vector. */
    function ceil(vector: Readonly<Vec2>): Vec2
    /** Moves a point current towards target. */
    function moveTowards(current: Vec2, target: Vec2, dist: number): Vec2
    /** Gets a polar offset from this vector. Angle should be specified in degrees. */
    function polarOffset(vector: Vec2, angle: number, dist: number): Vec2
    /** Rotates this vector. Angle should be specified in degrees. */
    function rotate(vector: Vec2, angle: number): Vec2
    /** Returns the 2D vector perpendicular to this 2D vector.
     * The result is always rotated 90-degrees in a counter-clockwise direction for a 2D coordinate system where the positive Y axis goes up. */
    function perpendicular(inDirection: Readonly<Vec2>): Vec2
    /** Reflects a vector off the vector defined by a normal. */
    function reflect(inDirection: Readonly<Vec2>, inNormal: Readonly<Vec2>): Vec2
    /** Multiplies two vectors component-wise. */
    function scale(a: Readonly<Vec2>, b: Readonly<Vec2>): Vec2
    /** Returns an independent copy of the vector. */
    function copy(vector: Readonly<Vec2>): Vec2

    function withZ(vector: Readonly<Vec2>, z: number): Vec3
    function withTerrainZ(vector: Readonly<Vec2>, zOffset?: number): Vec3
}

declare function vec2(this: void, x?: number, y?: number): Vec2
