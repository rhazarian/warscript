import { AbilityType, AbilityTypeId } from "../ability-type"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { TupleOf } from "../../../../utility/types"
import { EMPTY_ARRAY, map } from "../../../../utility/arrays"
import { BuffType } from "../buff-type"
import { checkNotNull } from "../../../../utility/preconditions"

compiletime(() => {
    const engineeringUpgradeBuffType = checkNotNull(BuffType.of(fourCC("BNeg")))
    engineeringUpgradeBuffType.targetAttachmentPresets = []
})

export class EngineeringUpgradeAbilityType extends AbilityType {
    public static override readonly BASE_ID = fourCC("ANeg") as AbilityTypeId

    public get movementSpeedIncreaseFactor(): number[] {
        return this.getNumberLevelField("Neg1")
    }

    public set movementSpeedIncreaseFactor(
        movementSpeedIncreaseFactor: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Neg1", movementSpeedIncreaseFactor)
    }

    public get autoAttackDamageIncrease(): number[] {
        return this.getNumberLevelField("Neg2")
    }

    public set autoAttackDamageIncrease(
        autoAttackDamageIncrease: ObjectDataEntryLevelFieldValueSupplier<number>
    ) {
        this.setNumberLevelField("Neg2", autoAttackDamageIncrease)
    }

    public get abilityUpgrades(): TupleOf<[AbilityTypeId, AbilityTypeId], 0 | 1 | 2 | 3 | 4>[] {
        const abilityUpgrades: TupleOf<[AbilityTypeId, AbilityTypeId], 0 | 1 | 2 | 3 | 4>[] = []
        for (const i of $range(0, 3)) {
            const abilityUpgrade = this.getObjectDataEntryIdsLevelField(`Neg${3 + i}`)
            for (const level of $range(0, abilityUpgrade.length - 1)) {
                const levelAbilityUpgrade = abilityUpgrade[level]
                if (levelAbilityUpgrade.length == 2) {
                    const levelAbilityUpgrades = abilityUpgrades[level] ?? []
                    levelAbilityUpgrades[levelAbilityUpgrades.length as 0 | 1 | 2 | 3] =
                        levelAbilityUpgrade as [AbilityTypeId, AbilityTypeId]
                    abilityUpgrades[level] = levelAbilityUpgrades
                }
            }
        }
        return abilityUpgrades
    }

    public set abilityUpgrades(
        abilityUpgrades:
            | TupleOf<[AbilityTypeId, AbilityTypeId], 0 | 1 | 2 | 3 | 4>
            | TupleOf<[AbilityTypeId, AbilityTypeId], 0 | 1 | 2 | 3 | 4>[]
    ) {
        const isArray = Array.isArray(abilityUpgrades[0]?.[0])
        for (const i of $range(0, abilityUpgrades.length - 1)) {
            this.setObjectDataEntryIdsLevelField(
                `Neg${3 + i}`,
                isArray
                    ? map(
                          abilityUpgrades as TupleOf<
                              [AbilityTypeId, AbilityTypeId],
                              0 | 1 | 2 | 3 | 4
                          >[],
                          (levelAbilityUpgrades) => {
                              return levelAbilityUpgrades[i]
                          }
                      )
                    : abilityUpgrades[i] ?? EMPTY_ARRAY
            )
        }
    }
}
