import { BitSet, bitSetOf, emptyBitSet } from "../../../utility/bit-set"
import { invertRecord } from "../../../utility/records"

export const enum UnitClassification {
    GIANT = 1,
    UNDEAD = 2,
    SUMMONED = 4,
    MECHANICAL = 8,
    WORKER = 16,
    SUICIDAL = 32,
    TOWN_HALL = 64,
    ANCIENT = 128,
    NEUTRAL = 256,
    WARD = 512,
    WALKABLE = 1024,
    TAUREN = 2048,
}

const stringByUnitClassification = {
    [UnitClassification.GIANT]: "giant",
    [UnitClassification.UNDEAD]: "undead",
    [UnitClassification.SUMMONED]: "summoned",
    [UnitClassification.MECHANICAL]: "mechanical",
    [UnitClassification.WORKER]: "peon",
    [UnitClassification.SUICIDAL]: "sapper",
    [UnitClassification.TOWN_HALL]: "townhall",
    [UnitClassification.ANCIENT]: "ancient",
    [UnitClassification.NEUTRAL]: "neutral",
    [UnitClassification.WARD]: "ward",
    [UnitClassification.WALKABLE]: "standon",
    [UnitClassification.TAUREN]: "tauren",
} as const

const unitClassificationByString: Record<string, UnitClassification | undefined> = invertRecord(
    stringByUnitClassification
)

/** @internal For use by internal systems only. */
export const unitClassificationsToStringArray = (
    unitClassifications: UnitClassifications
): string[] => {
    const strings: string[] = []
    for (const [unitClassification, string] of pairs(stringByUnitClassification)) {
        if (unitClassifications.has(unitClassification)) {
            strings.push(string)
        }
    }
    return strings
}

/** @internal For use by internal systems only. */
export const stringArrayToUnitClassifications = (strings: string[]): UnitClassifications => {
    let unitClassifications = emptyUnitClassifications()
    for (const string of strings) {
        const unitClassification = unitClassificationByString[string]
        if (unitClassification != undefined) {
            unitClassifications = unitClassifications.with(unitClassification)
        }
    }
    return unitClassifications
}

export type UnitClassifications = BitSet<UnitClassification>

export const emptyUnitClassifications = emptyBitSet<UnitClassification>

export const unitClassificationsOf = (...elements: UnitClassification[]): UnitClassifications => {
    return bitSetOf(...elements)
}
