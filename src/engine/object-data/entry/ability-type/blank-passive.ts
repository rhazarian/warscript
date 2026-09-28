import { DiseaseCloudAbilityType } from "./disease-cloud"

import { UnitTypeId } from "../unit-type"

import {
    CombatClassification,
    CombatClassifications,
    combatClassificationsOf,
    combatClassificationsToStringArray,
} from "../../auxiliary/combat-classification"
import { ObjectDataEntryLevelFieldValueSupplier } from "../../entry"
import { ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD } from "../../../standard/fields/ability"

const noneCombatClassificationStrings = (): string[] =>
    combatClassificationsToStringArray(combatClassificationsOf(CombatClassification.NONE))

export class BlankPassiveAbilityType extends DiseaseCloudAbilityType {
    public static override readonly IS_SYNTHETIC = true

    public constructor(object: WarObject) {
        super(object)
        this.levelCount = 1
        this.iconPath = ""
        this.targetEffectPresets = []
        this.diseaseDuration = () => 0
        this.damagePerSecond = () => 0
        this.plagueWardDuration = () => 0
        this.plagueWardUnitTypeId = () => 0 as UnitTypeId
        this.setStringsLevelField("atar", noneCombatClassificationStrings)
        this.areaOfEffect = () => 0
        this.buffTypeIds = () => []
        this.techTreeDependencies = []
    }

    // The native allowed targets of the underlying Disease Cloud must stay "none": any real
    // targets revive the native cloud, which then applies its buff to the owner. The value
    // is stored as the object field's own default instead, so the runtime field reads and
    // writes it without touching the native one.

    public override get allowedTargetCombatClassifications(): CombatClassifications[] {
        return ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD.getValue(this)
    }

    public override set allowedTargetCombatClassifications(
        allowedTargetCombatClassifications: ObjectDataEntryLevelFieldValueSupplier<CombatClassifications>,
    ) {
        ALLOWED_TARGETS_ABILITY_COMBAT_CLASSIFICATIONS_LEVEL_FIELD.setValue(
            this,
            allowedTargetCombatClassifications,
        )
    }
}
