import { Unit } from "../unit"

import { CombatClassifications } from "../../object-data/auxiliary/combat-classification"

import { max } from "../../../math"

/** @internal For use by internal systems only. */
export const damageArea = (
    source: Unit,
    allowedTargetCombatClassifications: CombatClassifications,
    x: number,
    y: number,
    range: number,
    damage: number,
    mediumDamageRange = 0,
    mediumDamageAmount = 0,
    smallDamageRange = 0,
    smallDamageAmount = 0
): void => {
    const targets = Unit.getAllowedTargetsInCollisionRange(
        source,
        allowedTargetCombatClassifications,
        x,
        y,
        max(range, mediumDamageRange, smallDamageRange)
    )
    for (const target of targets) {
        const distance = target.getCollisionDistanceTo(x, y)
        source.damageTarget(
            target,
            distance <= range
                ? damage
                : distance <= mediumDamageRange
                ? mediumDamageAmount
                : smallDamageAmount
        )
    }
}
