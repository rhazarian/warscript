import { Unit, UnitClassification } from "../../internal/unit"
import { Widget } from "../../../core/types/widget"
import { Item } from "../../internal/item"
import { invertRecord } from "../../../utility/records"

export const enum CombatClassification {
    NONE = 1, // 2^0
    GROUND = 2, // 2^1
    AIR = 4, // 2^2
    STRUCTURE = 8, // 2^3
    WARD = 16, // 2^4
    ITEM = 32, // 2^5
    TREE = 64, // 2^6
    WALL = 128, // 2^7
    DEBRIS = 256, // 2^8
    DECORATION = 512, // 2^9
    BRIDGE = 1024, // 2^10
    SELF = 4096, // 2^12
    SAME_OWNER = 8192, // 2^13
    ALLY = 16384, // 2^14
    FRIEND = 24576, // SAME_OWNER | ALLIED
    NEUTRAL = 32768, // 2^15
    ENEMY = 65536, // 2^16
    NOT_SELF = 122880, // ENEMY | NEUTRAL | FRIEND
    VULNERABLE = 1048576, // 2^20
    INVULNERABLE = 2097152, // 2^21
    HERO = 4194304, // 2^22
    NON_HERO = 8388608, // 2^23
    ALIVE = 16777216, // 2^24
    DEAD = 33554432, // 2^25
    ORGANIC = 67108864, // 2^26
    MECHANICAL = 134217728, // 2^27
    NON_SUICIDAL = 268435456, // 2^28
    SUICIDAL = 536870912, // 2^29
    NON_ANCIENT = 1073741824, // 2^30
    ANCIENT = -2147483648, // 2^31
}

const stringByCombatClassification = {
    [CombatClassification.NONE]: "none",
    [CombatClassification.GROUND]: "ground",
    [CombatClassification.AIR]: "air",
    [CombatClassification.STRUCTURE]: "structure",
    [CombatClassification.WARD]: "ward",
    [CombatClassification.ITEM]: "item",
    [CombatClassification.TREE]: "tree",
    [CombatClassification.WALL]: "wall",
    [CombatClassification.DEBRIS]: "debris",
    [CombatClassification.DECORATION]: "decoration",
    [CombatClassification.BRIDGE]: "bridge",
    [CombatClassification.SELF]: "self",
    [CombatClassification.SAME_OWNER]: "player",
    [CombatClassification.ALLY]: "ally",
    [CombatClassification.FRIEND]: "friend",
    [CombatClassification.NEUTRAL]: "neutral",
    [CombatClassification.ENEMY]: "enemy",
    [CombatClassification.NOT_SELF]: "notself",
    [CombatClassification.VULNERABLE]: "vulnerable",
    [CombatClassification.INVULNERABLE]: "invulnerable",
    [CombatClassification.HERO]: "hero",
    [CombatClassification.NON_HERO]: "nonhero",
    [CombatClassification.ALIVE]: "alive",
    [CombatClassification.DEAD]: "dead",
    [CombatClassification.ORGANIC]: "organic",
    [CombatClassification.MECHANICAL]: "mechanical",
    [CombatClassification.NON_SUICIDAL]: "nonsapper",
    [CombatClassification.SUICIDAL]: "sapper",
    [CombatClassification.NON_ANCIENT]: "nonancient",
    [CombatClassification.ANCIENT]: "ancient",
} as const

const combatClassificationByString: Record<string, CombatClassification | undefined> =
    Object.assign(invertRecord(stringByCombatClassification), {
        allies: CombatClassification.ALLY,
        enemies: CombatClassification.ENEMY,
        vuln: CombatClassification.VULNERABLE,
        invu: CombatClassification.INVULNERABLE,
    })

export type CombatClassifications = number & {
    readonly has: LuaBitwiseAndEqualsRightMethod<CombatClassification>
    readonly hasAny: LuaBitwiseAndUnequalsZeroMethod<CombatClassifications>
    readonly intersect: LuaBitwiseAndMethod<CombatClassifications, CombatClassifications>
    readonly union: LuaBitwiseOrMethod<CombatClassifications, CombatClassifications>
    readonly with: LuaBitwiseOrMethod<CombatClassification, CombatClassifications>
    readonly without: LuaBitwiseAndNotMethod<CombatClassification, CombatClassifications>

    readonly __combatClassifications: unique symbol
}

export const emptyCombatClassifications = () => 0 as CombatClassifications

export const combatClassificationsOf = (
    ...elements: CombatClassification[]
): CombatClassifications => {
    let combatClassifications = 0 as CombatClassifications
    for (const i of $range(1, select("#", ...elements))) {
        combatClassifications = combatClassifications.with(select(i, ...elements)[0])
    }
    return combatClassifications
}

const unitTargetTypeClassifications = combatClassificationsOf(
    CombatClassification.AIR,
    CombatClassification.GROUND,
    CombatClassification.STRUCTURE,
    CombatClassification.WARD
)

const unitOwnershipClassifications = combatClassificationsOf(
    CombatClassification.SELF,
    CombatClassification.NOT_SELF,
    CombatClassification.SAME_OWNER,
    CombatClassification.ENEMY,
    CombatClassification.FRIEND,
    CombatClassification.NEUTRAL,
    CombatClassification.ALLY
)

const unitItemOrDestructibleClassifications = combatClassificationsOf(
    CombatClassification.AIR,
    CombatClassification.GROUND,
    CombatClassification.STRUCTURE,
    CombatClassification.WARD,
    CombatClassification.TREE,
    CombatClassification.BRIDGE,
    CombatClassification.DEBRIS,
    CombatClassification.DECORATION,
    CombatClassification.ITEM,
    CombatClassification.WALL
)

/** @internal For use by internal systems only. */
export const combatClassificationsToStringArray = (
    combatClassifications: CombatClassifications
): string[] => {
    const strings: string[] = []
    for (const [combatClassification, string] of pairs(stringByCombatClassification)) {
        if (combatClassifications.has(combatClassification)) {
            strings.push(string)
        }
    }
    return strings
}

/** @internal For use by internal systems only. */
export const stringArrayToCombatClassifications = (strings: string[]): CombatClassifications => {
    let combatClassifications = 0 as CombatClassifications
    for (const string of strings) {
        const combatClassification = combatClassificationByString[string]
        if (combatClassification != undefined) {
            combatClassifications = combatClassifications.with(combatClassification)
        }
    }
    return combatClassifications
}

const testTarget = (
    source: Unit,
    target: Widget,
    combatClassifications: CombatClassifications
): boolean => {
    if (combatClassifications.has(CombatClassification.NONE)) {
        return false
    }

    combatClassifications.hasAny(unitItemOrDestructibleClassifications)

    if (target instanceof Unit) {
        if (
            combatClassifications.hasAny(unitTargetTypeClassifications) &&
            !combatClassifications.hasAny(
                target.combatClassifications.intersect(unitTargetTypeClassifications)
            )
        ) {
            return false
        }

        if (combatClassifications.hasAny(unitOwnershipClassifications)) {
            if (source == target) {
                if (!combatClassifications.has(CombatClassification.SELF)) {
                    return false
                }
            } else if (!combatClassifications.has(CombatClassification.NOT_SELF)) {
                if (target.isAllyOf(source)) {
                    if (
                        !combatClassifications.has(CombatClassification.FRIEND) &&
                        !(source.owner == target.owner
                            ? combatClassifications.has(CombatClassification.SAME_OWNER)
                            : combatClassifications.has(CombatClassification.ALLY))
                    ) {
                        return false
                    }
                } else if (target.isEnemyOf(source)) {
                    if (!combatClassifications.has(CombatClassification.ENEMY)) {
                        return false
                    }
                } else {
                    if (!combatClassifications.has(CombatClassification.NEUTRAL)) {
                        return false
                    }
                }
            }
        }

        if (combatClassifications.has(CombatClassification.SUICIDAL)) {
            if (
                !combatClassifications.has(CombatClassification.NON_SUICIDAL) &&
                !target.hasClassification(UnitClassification.SUICIDAL)
            ) {
                return false
            }
        } else if (
            combatClassifications.has(CombatClassification.NON_SUICIDAL) &&
            target.hasClassification(UnitClassification.SUICIDAL)
        ) {
            return false
        }

        if (combatClassifications.has(CombatClassification.ANCIENT)) {
            if (
                !combatClassifications.has(CombatClassification.NON_ANCIENT) &&
                !target.hasClassification(UnitClassification.ANCIENT)
            ) {
                return false
            }
        } else if (
            combatClassifications.has(CombatClassification.NON_ANCIENT) &&
            target.hasClassification(UnitClassification.ANCIENT)
        ) {
            return false
        }

        if (combatClassifications.has(CombatClassification.MECHANICAL)) {
            if (
                !combatClassifications.has(CombatClassification.ORGANIC) &&
                !target.hasClassification(UnitClassification.MECHANICAL)
            ) {
                return false
            }
        } else if (
            combatClassifications.has(CombatClassification.ORGANIC) &&
            target.hasClassification(UnitClassification.MECHANICAL)
        ) {
            return false
        }

        if (combatClassifications.has(CombatClassification.HERO)) {
            if (!combatClassifications.has(CombatClassification.NON_HERO) && !target.isHero) {
                return false
            }
        } else if (combatClassifications.has(CombatClassification.NON_HERO) && target.isHero) {
            return false
        }
    } else if (target instanceof Item) {
        if (!combatClassifications.has(CombatClassification.ITEM)) {
            return false
        }
    } else {
        // Destructible
    }

    if (combatClassifications.has(CombatClassification.DEAD)) {
        if (!combatClassifications.has(CombatClassification.ALIVE) && target.isAlive) {
            return false
        }
    } else if (!target.isAlive) {
        return false
    }

    if (combatClassifications.has(CombatClassification.INVULNERABLE)) {
        if (!combatClassifications.has(CombatClassification.VULNERABLE) && !target.isInvulnerable) {
            return false
        }
    } else if (target.isInvulnerable) {
        return false
    }

    return true
}

let filterTargetSource: Unit
let filterTargetCombatClassifications: CombatClassifications

/** @internal For use by internal systems only. */
export const initializeFilterTargetState = (
    source: Unit,
    allowedTargetCombatClassifications: CombatClassifications
): void => {
    filterTargetSource = source
    filterTargetCombatClassifications = allowedTargetCombatClassifications
}

/**
 * Don't forget to call `initializeFilterTargetState` first.
 *
 * @internal For use by internal systems only.
 */
export const filterTarget = (target: Widget): boolean => {
    return testTarget(filterTargetSource, target, filterTargetCombatClassifications)
}
