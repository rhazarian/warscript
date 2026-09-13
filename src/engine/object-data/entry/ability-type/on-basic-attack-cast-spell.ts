import { OnAttackCastSpellAbilityType } from "./on-attack-cast-spell"
import { AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"

export class OnBasicAttackCastSpellAbilityType extends OnAttackCastSpellAbilityType {
    public static override readonly BASE_ID = fourCC("Aoas") as AbilityTypeId

    /** % Hit chance on Unit */
    public get unitHitChancePercentage(): number[] {
        return this.getNumberLevelField("oap1")
    }

    public set unitHitChancePercentage(
        unitHitChancePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("oap1", unitHitChancePercentage)
    }

    /** % Hit chance on Hero */
    public get heroHitChancePercentage(): number[] {
        return this.getNumberLevelField("oap2")
    }

    public set heroHitChancePercentage(
        heroHitChancePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("oap2", heroHitChancePercentage)
    }

    /** % Hit chance on Summon */
    public get summonHitChancePercentage(): number[] {
        return this.getNumberLevelField("oap3")
    }

    public set summonHitChancePercentage(
        summonHitChancePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("oap3", summonHitChancePercentage)
    }

    /** % Hit chance on Critical Strike */
    public get criticalStrikeHitChancePercentage(): number[] {
        return this.getNumberLevelField("oap4")
    }

    public set criticalStrikeHitChancePercentage(
        criticalStrikeHitChancePercentage: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("oap4", criticalStrikeHitChancePercentage)
    }
}
