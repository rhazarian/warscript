import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class BlizzardAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHbz") as AbilityTypeId

    public get waveCount(): number[] {
        return this.getNumberLevelField("Hbz1")
    }

    public set waveCount(waveCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hbz1", waveCount)
    }

    public get damage(): number[] {
        return this.getNumberLevelField("Hbz2")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hbz2", damage)
    }

    public get shardCount(): number[] {
        return this.getNumberLevelField("Hbz3")
    }

    public set shardCount(shardCount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hbz3", shardCount)
    }

    public get structureDamageDecreaseFactor(): number[] {
        return this.getNumberLevelField("Hbz4")
    }

    public set structureDamageDecreaseFactor(
        structureDamageDecreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Hbz4", structureDamageDecreaseFactor)
    }

    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Hbz5")
    }

    public set damagePerSecond(damagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Hbz5", damagePerSecond)
    }
}
