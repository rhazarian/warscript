import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export const enum OnAttackCastSpellAbilityTypeTargetType {
    SELF = 0,
    ENEMIES = 1,
}

/**
 * Common fields of the "on attack, cast spell" proc abilities (Aoas, Asas, Atds).
 */
export abstract class OnAttackCastSpellAbilityType extends AbilityType {
    /** Ability */
    public get abilityTypeIds(): AbilityTypeId[][] {
        return this.getObjectDataEntryNumericIdsLevelField("opp1")
    }

    public set abilityTypeIds(
        abilityTypeIds: ObjectDataEntryLevelFieldValueSupplier<AbilityTypeId[]>,
    ) {
        this.setObjectDataEntryNumericIdsLevelField("opp1", abilityTypeIds)
    }

    /** % Hit Chance */
    public get hitChancePercentage(): number[] {
        return this.getNumberLevelField("opp2")
    }

    public set hitChancePercentage(
        hitChancePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("opp2", hitChancePercentage)
    }

    /** Target Type */
    public get targetType(): OnAttackCastSpellAbilityTypeTargetType[] {
        return this.getNumberLevelField("opp3")
    }

    public set targetType(
        targetType: ObjectDataEntryLevelFieldValueSupplier<OnAttackCastSpellAbilityTypeTargetType>,
    ) {
        this.setNumberLevelField("opp3", targetType)
    }
}
