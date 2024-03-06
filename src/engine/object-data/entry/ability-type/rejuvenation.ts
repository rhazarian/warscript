import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export const enum RejuvenationAbilityTypeAllowWhenFull {
    NEVER = 0,
    HEALTH_ONLY = 1,
    MANA_ONLY = 2,
    ALWAYS = 3,
}

export class RejuvenationAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("Arej") as AbilityTypeId

    public get healing(): number[] {
        return this.getNumberLevelField("Rej1")
    }

    public set healing(healing: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Rej1", healing)
    }

    public get manaGain(): number[] {
        return this.getNumberLevelField("Rej2")
    }

    public set manaGain(manaGain: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Rej2", manaGain)
    }

    public get allowWhenFull(): RejuvenationAbilityTypeAllowWhenFull[] {
        return this.getNumberLevelField("Rej3")
    }

    public set allowWhenFull(
        allowWhenFull: ObjectDataEntryLevelFieldValueSupplier<RejuvenationAbilityTypeAllowWhenFull>
    ) {
        this.setNumberLevelField("Rej3", allowWhenFull)
    }

    public get isSelfCast(): boolean[] {
        return this.getBooleanLevelField("Rej4")
    }

    public set isSelfCast(isSelfCast: ObjectDataEntryLevelFieldValueSupplier<boolean>) {
        this.setBooleanLevelField("Rej4", isSelfCast)
    }
}
