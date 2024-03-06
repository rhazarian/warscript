const atan = math.atan
const cos = math.cos
const deg = math.deg
const rad = math.rad
const sin = math.sin
const sqrt = math.sqrt

const getLocationZ = _G.GetLocationZ
const moveLocation = _G.MoveLocation
const location = _G.Location(0, 0)

/** Gets the height of the terrain at the position specified by the vector. */
export const getTerrainZ = (x: number, y: number): number => {
    moveLocation(location, x, y)
    return getLocationZ(location)
}

/** Returns the unsigned angle in degrees between from and to. */
export const angleBetweenPoints = (x1: number, y1: number, x2: number, y2: number): number => {
    return deg(atan(y2 - y1, x2 - x1))
}

/** Returns the distance between a and b. */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1
    const dy = y2 - y1
    return sqrt(dx * dx + dy * dy)
}

/** Moves a point current towards target. */
export const moveTowards = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    distance: number
): LuaMultiReturn<[number, number]> => {
    const dx = x2 - x1
    const dy = y2 - y1
    const d = sqrt(dx * dx + dy * dy)
    if (d != 0) {
        const ratio = distance / d
        return $multi(x1 + dx * ratio, y1 + dy * ratio)
    }
    return $multi(x1 + distance, y1)
}

/** Gets a polar offset from this vector. Angle should be specified in degrees. */
export const polarOffset = (
    x: number,
    y: number,
    angle: number,
    distance: number
): LuaMultiReturn<[number, number]> => {
    angle = rad(angle)
    return $multi(x + cos(angle) * distance, y + sin(angle) * distance)
}
