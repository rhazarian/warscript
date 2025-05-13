import { AbilityTypeId } from "../../object-data/entry/ability-type"

const disableAbility = BlzUnitDisableAbility

/** @internal For use by internal systems only. */
export const increaseAbilityDisableCounter = (
    unit: junit,
    abilityTypeId: AbilityTypeId,
    times: number,
): void => {
    for (const _ of $range(1, times)) {
        disableAbility(unit, abilityTypeId, true, false)
    }
    for (const _ of $range(times, -1)) {
        disableAbility(unit, abilityTypeId, false, false)
    }
}
