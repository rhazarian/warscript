import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class HeadsplitterAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHhr") as AbilityTypeId

    /** Damage Bonus */
    public get bonusDamage(): number[] {
        return this.getNumberLevelField("hhr1")
    }

    public set bonusDamage(bonusDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hhr1", bonusDamage)
    }

    /** Stun Duration - Normal */
    public get stunDuration(): number[] {
        return this.getNumberLevelField("hhr2")
    }

    public set stunDuration(stunDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hhr2", stunDuration)
    }

    /** Stun Duration - Hero */
    public get stunHeroDuration(): number[] {
        return this.getNumberLevelField("hhr3")
    }

    public set stunHeroDuration(stunHeroDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hhr3", stunHeroDuration)
    }

    /** Bonus Damage Debuff Duration - Normal */
    public get bonusDamageDebuffDuration(): number[] {
        return this.getNumberLevelField("hhr4")
    }

    public set bonusDamageDebuffDuration(
        bonusDamageDebuffDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hhr4", bonusDamageDebuffDuration)
    }

    /** Bonus Damage Debuff Duration - Hero */
    public get bonusDamageDebuffHeroDuration(): number[] {
        return this.getNumberLevelField("hhr5")
    }

    public set bonusDamageDebuffHeroDuration(
        bonusDamageDebuffHeroDuration: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hhr5", bonusDamageDebuffHeroDuration)
    }

    /** Debuff Bonus Damage Received Percent */
    public get debuffBonusDamageReceivedPercentage(): number[] {
        return this.getNumberLevelField("hhr6")
    }

    public set debuffBonusDamageReceivedPercentage(
        debuffBonusDamageReceivedPercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hhr6", debuffBonusDamageReceivedPercentage)
    }

    /** Refreshes Cooldown On Kill */
    public get refreshesCooldownOnKill(): boolean[] {
        return this.getBooleanLevelField("hhr7")
    }

    public set refreshesCooldownOnKill(
        refreshesCooldownOnKill: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("hhr7", refreshesCooldownOnKill)
    }
}
