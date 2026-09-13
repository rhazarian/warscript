import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class MindControlAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHmc") as AbilityTypeId

    /** Maximum Creep Level */
    public get maximumCreepLevel(): number[] {
        return this.getNumberLevelField("Pos1")
    }

    public set maximumCreepLevel(
        maximumCreepLevel: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("Pos1", maximumCreepLevel)
    }

    /** Explosion Damage */
    public get explosionDamage(): number[] {
        return this.getNumberLevelField("hmc2")
    }

    public set explosionDamage(explosionDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hmc2", explosionDamage)
    }

    /** Mind Controlled Unit Limit */
    public get mindControlledUnitLimit(): number[] {
        return this.getNumberLevelField("hmc3")
    }

    public set mindControlledUnitLimit(
        mindControlledUnitLimit: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hmc3", mindControlledUnitLimit)
    }

    /** Explosion Radius */
    public get explosionRadius(): number[] {
        return this.getNumberLevelField("mcrd")
    }

    public set explosionRadius(explosionRadius: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("mcrd", explosionRadius)
    }

    /** Duration - Normal */
    public get duration(): number[] {
        return this.getNumberLevelField("mcdr")
    }

    public set duration(duration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("mcdr", duration)
    }
}
