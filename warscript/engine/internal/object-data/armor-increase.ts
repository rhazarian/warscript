import { SpikedCarapaceAbilityType } from "../../object-data/entry/ability-type/spiked-carapace"

/** @internal For use by internal systems only. */
export const ARMOR_BONUS_DUMMY_ABILITY_TYPE_ID = compiletime(() => {
    const abilityType = SpikedCarapaceAbilityType.create()
    abilityType.isInternal = true
    abilityType.isButtonVisible = false
    abilityType.returnedDamageFactor = 0
    abilityType.receivedDamageFactor = 0
    abilityType.armorIncrease = 0
    abilityType.buffTypeIds = []
    return abilityType.id
})

/** @internal For use by internal systems only. */
export const ARMOR_BONUS_DUMMY_ABILITY_FIELD = ABILITY_RLF_DEFENSE_BONUS_UTS3
