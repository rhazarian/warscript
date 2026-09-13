import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class SurgeOfLightAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHsl") as AbilityTypeId

    /** Ability Passive Radius */
    public get passiveRadius(): number[] {
        return this.getNumberLevelField("slrd")
    }

    public set passiveRadius(passiveRadius: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("slrd", passiveRadius)
    }

    /** Instant Heal to Ally */
    public get allyInstantHeal(): number[] {
        return this.getNumberLevelField("sol1")
    }

    public set allyInstantHeal(allyInstantHeal: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("sol1", allyInstantHeal)
    }

    /** Heal Per Second to Ally */
    public get allyHealPerSecond(): number[] {
        return this.getNumberLevelField("sol2")
    }

    public set allyHealPerSecond(
        allyHealPerSecond: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("sol2", allyHealPerSecond)
    }

    /** Mana Restore to Ally */
    public get allyManaRestore(): number[] {
        return this.getNumberLevelField("sol3")
    }

    public set allyManaRestore(allyManaRestore: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("sol3", allyManaRestore)
    }

    /** Ally Passive Cooldown */
    public get allyPassiveCooldown(): number[] {
        return this.getNumberLevelField("sol4")
    }

    public set allyPassiveCooldown(
        allyPassiveCooldown: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("sol4", allyPassiveCooldown)
    }

    /** Ally Passive Duration */
    public get allyPassiveDuration(): number[] {
        return this.getNumberLevelField("sol5")
    }

    public set allyPassiveDuration(
        allyPassiveDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("sol5", allyPassiveDuration)
    }

    /** % Ally Passive Stat Amplify */
    public get allyPassiveStatAmplifyPercentage(): number[] {
        return this.getNumberLevelField("sol6")
    }

    public set allyPassiveStatAmplifyPercentage(
        allyPassiveStatAmplifyPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("sol6", allyPassiveStatAmplifyPercentage)
    }

    /** % Attack Speed Gain */
    public get attackSpeedGainPercentage(): number[] {
        return this.getNumberLevelField("sol7")
    }

    public set attackSpeedGainPercentage(
        attackSpeedGainPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("sol7", attackSpeedGainPercentage)
    }

    /** % Movement Speed Gain */
    public get movementSpeedGainPercentage(): number[] {
        return this.getNumberLevelField("sol8")
    }

    public set movementSpeedGainPercentage(
        movementSpeedGainPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("sol8", movementSpeedGainPercentage)
    }
}
