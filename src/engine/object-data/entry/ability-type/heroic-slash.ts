import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HeroicSlashAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHhs") as AbilityTypeId

    /** Damage */
    public get damage(): number[] {
        return this.getNumberLevelField("hsl1")
    }

    public set damage(damage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hsl1", damage)
    }

    /** Bonus Damage Percent Against Debuffed */
    public get bonusDamageFactorAgainstDebuffed(): number[] {
        return this.getNumberLevelField("hsl2")
    }

    public set bonusDamageFactorAgainstDebuffed(
        bonusDamageFactorAgainstDebuffed: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsl2", bonusDamageFactorAgainstDebuffed)
    }

    /** Refreshes Cooldown On Kill */
    public get refreshesCooldownOnKill(): boolean[] {
        return this.getBooleanLevelField("hsl3")
    }

    public set refreshesCooldownOnKill(
        refreshesCooldownOnKill: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("hsl3", refreshesCooldownOnKill)
    }

    /** Heal Percent On Damage Dealt */
    public get healFactorOnDamageDealt(): number[] {
        return this.getNumberLevelField("hsl4")
    }

    public set healFactorOnDamageDealt(
        healFactorOnDamageDealt: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsl4", healFactorOnDamageDealt)
    }
}
