import { GhostVisibleAbilityType } from "../../object-data/entry/ability-type/ghost-visible"

/** @internal For use by internal systems only. */
export const GHOST_VISIBLE_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = GhostVisibleAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.isImmuneToMorphEffects = false
    abilityType.doesNotBlockBuildings = true
    abilityType.buffTypeIds = []
    return abilityType.id
})
