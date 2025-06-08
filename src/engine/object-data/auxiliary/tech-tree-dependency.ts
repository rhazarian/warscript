import { ObjectDataEntryId } from "../entry"
import { UnitTypeId } from "../entry/unit-type"
import { UpgradeId } from "../entry/upgrade"

export type TechTreeDependency =
    | {
          unitTypeId: UnitTypeId
          upgradeId: undefined
          level: undefined
      }
    | {
          unitTypeId: undefined
          upgradeId: UpgradeId
          level: number
      }

export type TechTreeDependencyInput = TechTreeDependency | UnitTypeId | UpgradeId

export const extractTechTreeDependencyInputObjectDataEntryId = (
    techTreeDependencyInput: TechTreeDependencyInput,
): ObjectDataEntryId & number => {
    return typeof techTreeDependencyInput == "number"
        ? techTreeDependencyInput
        : (techTreeDependencyInput.unitTypeId ?? techTreeDependencyInput.upgradeId)
}

export const extractTechTreeDependencyInputLevel = (
    techTreeDependencyInput: TechTreeDependencyInput,
): number => {
    return typeof techTreeDependencyInput == "number" ? 0 : (techTreeDependencyInput.level ?? 0)
}
