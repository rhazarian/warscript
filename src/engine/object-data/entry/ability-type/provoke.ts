import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

/**
 * Provoke / Heroic Challenge (AHhc). Its fields live in Data F-I; Data A-E have no metadata.
 */
export class ProvokeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHhc") as AbilityTypeId

    /** Shield Health */
    public get shieldHealth(): number[] {
        return this.getNumberLevelField("hhc1")
    }

    public set shieldHealth(shieldHealth: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hhc1", shieldHealth)
    }

    /** Shield Reflect Percent */
    public get shieldReflectPercentage(): number[] {
        return this.getNumberLevelField("hhc2")
    }

    public set shieldReflectPercentage(
        shieldReflectPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hhc2", shieldReflectPercentage)
    }

    /** Shield Duration */
    public get shieldDuration(): number[] {
        return this.getNumberLevelField("hhc3")
    }

    public set shieldDuration(shieldDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hhc3", shieldDuration)
    }

    /** Taunted Defense Reduction */
    public get tauntedArmorReduction(): number[] {
        return this.getNumberLevelField("hhc4")
    }

    public set tauntedArmorReduction(
        tauntedArmorReduction: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hhc4", tauntedArmorReduction)
    }
}
