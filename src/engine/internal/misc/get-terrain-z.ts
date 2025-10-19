const getLocationZ = GetLocationZ
const moveLocation = MoveLocation
const location = Location(0, 0)

/** @internal For use by internal systems only. */
export const getTerrainZ = (x: number, y: number): number => {
    moveLocation(location, x, y)
    return getLocationZ(location)
}
