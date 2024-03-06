import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export const enum HealingSalveAbilityTypeAllowWhenFull {
    NEVER = 0,
    HEALTH_ONLY = 1,
    MANA_ONLY = 2,
    ALWAYS = 3,
}

export class HealingSalveAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AIrl") as AbilityTypeId

    public get healing(): number[] {
        return this.getNumberLevelField("irl1")
    }

    public set healing(healing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("irl1", healing)
    }

    public get manaGain(): number[] {
        return this.getNumberLevelField("irl2")
    }

    public set manaGain(manaGain: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("irl2", manaGain)
    }

    public get allowWhenFull(): HealingSalveAbilityTypeAllowWhenFull[] {
        return this.getNumberLevelField("irl3")
    }

    public set allowWhenFull(
        allowWhenFull: ObjectDataEntryLevelFieldValueSupplier<HealingSalveAbilityTypeAllowWhenFull>
    ) {
        this.setNumberLevelField("irl3", allowWhenFull)
    }

    public get isSelfCast(): boolean[] {
        return this.getBooleanLevelField("irl4")
    }

    public set isSelfCast(isSelfCast: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("irl4", isSelfCast)
    }

    public get shouldCancelOnDamage(): boolean[] {
        return this.getBooleanLevelField("irl5")
    }

    public set shouldCancelOnDamage(
        shouldCancelOnDamage: ObjectDataEntryLevelFieldValueSupplier<boolean>
    ) {
        this.setBooleanLevelField("irl5", shouldCancelOnDamage)
    }
}
