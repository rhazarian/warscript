import { MAXIMUM_INTEGER, PI } from "../math"

const getRandomInt = GetRandomInt
const getRandomReal = GetRandomReal

const cos = math.cos
const sin = math.sin
const sqrt = math.sqrt

export const randomAngle = (): number => getRandomReal(0, 360)

export const randomInteger: {
    (upperBound?: number): number
    (lowerBound: number, upperBound: number): number
} = (m?: number, n?: number): number =>
    n != undefined ? getRandomInt(m!, n) : getRandomInt(0, m ?? MAXIMUM_INTEGER)

export const randomFloat: {
    (upperBound?: number): number
    (lowerBound: number, upperBound: number): number
} = (m?: number, n?: number): number =>
    n != undefined ? getRandomReal(m!, n) : getRandomReal(0, m ?? MAXIMUM_INTEGER)

export const randomXY = (
    centerX: number,
    centerY: number,
    range: number
): LuaMultiReturn<[x: number, y: number]> => {
    const r = range * sqrt(getRandomReal(0, 1))
    const t = getRandomReal(0, 1) * 2 * PI
    return $multi(centerX + r * cos(t), centerY + r * sin(t))
}
