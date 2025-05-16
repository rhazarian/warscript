import { AbilityTypeId } from "../object-data/entry/ability-type"

const getUnitAbility = BlzGetUnitAbility
const unitAddAbility = UnitAddAbility
const unitInventorySize = UnitInventorySize
const unitItemInSlot = UnitItemInSlot
const unitMakeAbilityPermanent = UnitMakeAbilityPermanent

/** @internal For use by internal systems only. */
export const addInternalAbility = (
    unit: junit,
    abilityTypeId: AbilityTypeId,
): jability | undefined => {
    if (unitAddAbility(unit, abilityTypeId)) {
        unitMakeAbilityPermanent(unit, true, abilityTypeId)
    }
    return getUnitAbility(unit, abilityTypeId)
}

/** @internal For use by internal systems only. */
export const findUnitItemSlot = (unit: junit, item: jitem): 0 | 1 | 2 | 3 | 4 | 5 | undefined => {
    for (const slot of $range(0, unitInventorySize(unit) - 1)) {
        if (item == unitItemInSlot(unit, slot)) {
            return slot as 0 | 1 | 2 | 3 | 4 | 5
        }
    }
    return undefined
}
