import { OnAttackCastSpellAbilityType } from "./on-attack-cast-spell"
import { AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export const enum OnHitCastSpellAbilityTypeDamageType {
    MELEE = 0,
    RANGED = 1,
    ALL = 2,
}

export class OnHitCastSpellAbilityType extends OnAttackCastSpellAbilityType {
    public static override readonly BASE_ID = fourCC("Atds") as AbilityTypeId

    /** Allowed Damage Type */
    public get allowedDamageType(): OnHitCastSpellAbilityTypeDamageType[] {
        return this.getNumberLevelField("ohp1")
    }

    public set allowedDamageType(
        allowedDamageType: ObjectDataEntryLevelFieldValueSupplier<OnHitCastSpellAbilityTypeDamageType>,
    ) {
        this.setNumberLevelField("ohp1", allowedDamageType)
    }
}
