import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class LightsMercyAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("AHsf") as AbilityTypeId

    /** Burn Damage */
    public get burnDamage(): number[] {
        return this.getNumberLevelField("hsf1")
    }

    public set burnDamage(burnDamage: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hsf1", burnDamage)
    }

    /** Burn Damage Pulse Frequency */
    public get burnDamagePulseFrequency(): number[] {
        return this.getNumberLevelField("hsf2")
    }

    public set burnDamagePulseFrequency(
        burnDamagePulseFrequency: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsf2", burnDamagePulseFrequency)
    }

    /** Bonus Damage To Summons */
    public get bonusDamageToSummons(): number[] {
        return this.getNumberLevelField("hsf3")
    }

    public set bonusDamageToSummons(
        bonusDamageToSummons: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("hsf3", bonusDamageToSummons)
    }

    /** Heal Amount to Ally Units */
    public get allyHealAmount(): number[] {
        return this.getNumberLevelField("hsf4")
    }

    public set allyHealAmount(allyHealAmount: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("hsf4", allyHealAmount)
    }

    /** Enable Chain Explosion */
    public get isChainExplosionEnabled(): boolean[] {
        return this.getBooleanLevelField("hsf5")
    }

    public set isChainExplosionEnabled(
        isChainExplosionEnabled: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("hsf5", isChainExplosionEnabled)
    }

    /** Dispell Magic & Deal Bonus Damage to Summoned */
    public get dispelsMagicAndDamagesSummoned(): boolean[] {
        return this.getBooleanLevelField("hsf6")
    }

    public set dispelsMagicAndDamagesSummoned(
        dispelsMagicAndDamagesSummoned: ObjectDataEntryLevelFieldValueSupplier<boolean>,
    ) {
        this.setBooleanLevelField("hsf6", dispelsMagicAndDamagesSummoned)
    }

    /** Explosion Radius */
    public get explosionRadius(): number[] {
        return this.getNumberLevelField("sfrd")
    }

    public set explosionRadius(explosionRadius: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("sfrd", explosionRadius)
    }
}
