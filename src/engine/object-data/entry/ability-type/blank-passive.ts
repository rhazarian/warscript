import { DiseaseCloudAbilityType } from "./disease-cloud"

import { UnitTypeId } from "../unit-type"

import {
    CombatClassification,
    combatClassificationsOf,
} from "../../auxiliary/combat-classification"

export class BlankPassiveAbilityType extends DiseaseCloudAbilityType {
    public static override readonly IS_SYNTHETIC = true

    public constructor(object: WarObject) {
        super(object)
        this.levelCount = 1
        this.iconPath = ""
        this.targetEffectPresets = []
        this.diseaseDuration = 0
        this.damagePerSecond = 0
        this.plagueWardDuration = 0
        this.plagueWardUnitTypeId = 0 as UnitTypeId
        this.allowedTargetCombatClassifications = combatClassificationsOf(CombatClassification.NONE)
        this.areaOfEffect = 0
        this.buffTypeIds = []
        this.techTreeDependencies = []
    }
}
