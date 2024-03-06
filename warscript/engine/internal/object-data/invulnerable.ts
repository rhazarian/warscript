import { InvulnerableAbilityType } from "../../object-data/entry/ability-type/invulnerable"

/** @internal For use by internal systems only. */
export const INVULNERABLE_INTERNAL_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = InvulnerableAbilityType.create()
    abilityType.isInternal = true
    return abilityType.id
})
