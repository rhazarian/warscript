import { EnsnareAbilityType } from "./ensnare"
import { AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Apprehend (Aena) — ensnare with stun/attack speed/bonus damage/silence extensions (Data D-G).
 */
export class ApprehendAbilityType extends EnsnareAbilityType {
    public static override readonly BASE_ID = fourCC("Aena") as AbilityTypeId

    /** Stun Duration */
    public get stunDuration(): number[] {
        return this.getNumberLevelField("Ens4")
    }

    public set stunDuration(stunDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Ens4", stunDuration)
    }

    /** Attack Speed Reduction Percent */
    public get attackSpeedReductionPercentage(): number[] {
        return this.getNumberLevelField("Ens5")
    }

    public set attackSpeedReductionPercentage(
        attackSpeedReductionPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ens5", attackSpeedReductionPercentage)
    }

    /** Bonus Damage Taken Percent */
    public get bonusDamageTakenPercentage(): number[] {
        return this.getNumberLevelField("Ens6")
    }

    public set bonusDamageTakenPercentage(
        bonusDamageTakenPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Ens6", bonusDamageTakenPercentage)
    }

    /** Silences When Ensnared */
    public get silencesWhenEnsnared(): boolean[] {
        return this.getBooleanLevelField("Ens7")
    }

    public set silencesWhenEnsnared(
        silencesWhenEnsnared: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("Ens7", silencesWhenEnsnared)
    }
}
