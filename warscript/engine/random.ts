import { MAXIMUM_INTEGER } from "../math"

const getRandomInt = GetRandomInt
const getRandomReal = GetRandomReal

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
