import {
    CombatClassifications,
    filterTarget,
    initializeFilterTargetState,
} from "../../object-data/auxiliary/combat-classification"
import { Unit } from "../unit"

declare module "../unit" {
    interface Unit {
        isAllowedTarget(
            this: Unit,
            source: Unit,
            allowedTargetCombatClassifications: CombatClassifications,
        ): boolean
    }
}
Unit.prototype.isAllowedTarget = function (source, allowedTargetCombatClassifications) {
    initializeFilterTargetState(source, allowedTargetCombatClassifications)
    return filterTarget(this)
}

declare module "../unit" {
    namespace Unit {
        function getAllowedTargetsInRange(
            this: void,
            source: Unit,
            allowedTargetCombatClassifications: CombatClassifications,
            x: number,
            y: number,
            range: number,
        ): Unit[]
    }
}
Unit.getAllowedTargetsInRange = (
    source,
    allowedTargetCombatClassifications: CombatClassifications,
    x,
    y,
    range,
) => {
    initializeFilterTargetState(source, allowedTargetCombatClassifications)
    return Unit.getInRange(x, y, range, filterTarget)
}

declare module "../unit" {
    namespace Unit {
        function getAllowedTargetsInCollisionRange(
            this: void,
            source: Unit,
            allowedTargetCombatClassifications: CombatClassifications,
            x: number,
            y: number,
            range: number,
        ): Unit[]
    }
}
Unit.getAllowedTargetsInCollisionRange = (
    source,
    allowedTargetCombatClassifications: CombatClassifications,
    x,
    y,
    range,
) => {
    initializeFilterTargetState(source, allowedTargetCombatClassifications)
    return Unit.getInCollisionRange(x, y, range, filterTarget)
}
