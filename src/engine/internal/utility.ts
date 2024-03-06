import { AbilityTypeId } from "../object-data/entry/ability-type"

const getUnitAbility = BlzGetUnitAbility
const unitAddAbility = UnitAddAbility
const unitMakeAbilityPermanent = UnitMakeAbilityPermanent

/** @internal For use by internal systems only. */
export const addInternalAbility = (
    unit: junit,
    abilityTypeId: AbilityTypeId
): jability | undefined => {
    if (unitAddAbility(unit, abilityTypeId)) {
        unitMakeAbilityPermanent(unit, true, abilityTypeId)
    }
    return getUnitAbility(unit, abilityTypeId)
}
