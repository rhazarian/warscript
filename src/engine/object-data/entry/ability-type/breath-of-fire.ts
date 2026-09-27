import { AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { CarrionSwarmAbilityType } from "./carrion-swarm"

/** Brewmaster's Breath of Fire (`ANbf`): Carrion Swarm's wave fields plus a burning damage. */
export class BreathOfFireAbilityType extends CarrionSwarmAbilityType {
    public static override readonly BASE_ID = fourCC("ANbf") as AbilityTypeId

    /** Damage Per Second (of the burning buff) */
    public get damagePerSecond(): number[] {
        return this.getNumberLevelField("Nbf5")
    }

    public set damagePerSecond(damagePerSecond: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("Nbf5", damagePerSecond)
    }
}
