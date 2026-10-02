import { Unit } from "../../internal/unit"
import "../../internal/unit/ability"
import { EventListenerPriority } from "../../../event"
import { Timer } from "../../../core/types/timer"
import { Effect, EffectParameters } from "../../../core/types/effect"
import { mapValues } from "../../../utility/lua-maps"
import { Ability } from "../../internal/ability"
import { array, map, mapIndexed } from "../../../utility/arrays"
import { TupleOf } from "../../../utility/types"

import { AnimationName } from "../auxiliary/animation-name"
import { AnimationQualifier } from "../auxiliary/animation-qualifier"
import {
    AttachmentPoint,
    AttachmentPointInput,
    attachmentPointToNodeFQN,
    AttachmentPresetInput,
    EffectPresetWithParameters,
    EffectPresetWithParametersInput,
    extractAttachmentPresetInputModelPath,
    extractAttachmentPresetInputNodeFQN,
    splitAttachmentNodeFQN,
    toEffectPreset,
} from "../auxiliary/attachment-preset"
import {
    CombatClassifications,
    combatClassificationsToStringArray,
    stringArrayToCombatClassifications,
} from "../auxiliary/combat-classification"
import { Race } from "../auxiliary/race"
import {
    extractTechTreeDependencyInputLevel,
    extractTechTreeDependencyInputObjectDataEntryId,
    TechTreeDependency,
    TechTreeDependencyInput,
} from "../auxiliary/tech-tree-dependency"
import {
    extractObjectDataEntryLevelFieldValue,
    ObjectDataEntry,
    CustomObjectDataEntryId,
    ObjectDataEntryLevelFieldValueSupplier,
} from "../entry"
import { abilityTypeIdGenerator } from "../utility/object-data-entry-id-generator"

import { BuffTypeId } from "./buff-type"
import { LightningTypeId } from "./lightning-type"
import { UnitTypeId } from "./unit-type"
import { Upgrade, UpgradeId } from "./upgrade"
import { SoundPresetId } from "./sound-preset"
import { isSoundLabelCustom, Sound3D, SoundSettings } from "../../../core/types/sound"
import { luaSetOf } from "../../../utility/lua-sets"
import { Widget } from "../../../core/types/widget"
import { StandardAbilityTypeId } from "../../standard/entries/ability-type"
import { GraphicsMode } from "../../index"
import { LocalClient } from "../../local-client"

export type AbilityTypeId =
    | (CustomObjectDataEntryId & number & { readonly __abilityTypeId: unique symbol })
    | StandardAbilityTypeId

const castAnimationFQNByAbilityTypeId = new LuaMap<AbilityTypeId, string>()

const isButtonVisibleFalseAbilityTypes = new LuaSet<AbilityType>()

const casterCastingEffectPresetsByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    EffectPresetWithParameters[]
>()

const casterChannelingEffectPresetsByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    EffectPresetWithParameters[]
>()

const targetCastingEffectPresetsByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    EffectPresetWithParameters[]
>()

const targetChannelingEffectPresetsByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    EffectPresetWithParameters[]
>()

const targetChannelingEffectPresetsSDByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    EffectPresetWithParameters[]
>()

const targetChannelingEffectPresetsHDByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    EffectPresetWithParameters[]
>()

const targetChannelingEffectPresetsDEByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    EffectPresetWithParameters[]
>()

const targetEffectSoundPresetByAbilityTypeId = new LuaMap<
    AbilityTypeId,
    SoundPresetId | undefined
>()

export abstract class AbilityType extends ObjectDataEntry<AbilityTypeId> {
    private static readonly idGenerator = abilityTypeIdGenerator

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.ability
    }

    private _isButtonVisible = true

    // Art

    public get channelingAnimation(): [...([] | [AnimationName]), ...AnimationQualifier[]] {
        return this.getStringsField("aani") as [...([] | [AnimationName]), ...AnimationQualifier[]]
    }

    public set channelingAnimation(
        animations: [...([] | [AnimationName]), ...AnimationQualifier[]],
    ) {
        this.setStringsField("aani", animations)
    }

    public get areaEffectModelPaths(): string[] {
        return this.getStringsField("aaea")
    }

    public set areaEffectModelPaths(areaEffectModelPaths: string[]) {
        this.setStringsField("aaea", areaEffectModelPaths)
    }

    public get buttonPositionX(): number {
        return this.getNumberField("abpx")
    }

    public set buttonPositionX(buttonPositionX: number) {
        this.setNumberField("abpx", buttonPositionX)
    }

    public get buttonPositionY(): number {
        return this.getNumberField("abpy")
    }

    public set buttonPositionY(buttonPositionY: number) {
        this.setNumberField("abpy", buttonPositionY)
    }

    public get casterCastingEffectPresets(): EffectPresetWithParameters[] {
        return casterCastingEffectPresetsByAbilityTypeId.get(this.id) ?? []
    }

    public set casterCastingEffectPresets(
        casterCastingEffectPresets: EffectPresetWithParametersInput[],
    ) {
        casterCastingEffectPresetsByAbilityTypeId.set(
            this.id,
            map(casterCastingEffectPresets, toEffectPreset),
        )
    }

    public get casterChannelingEffectPresets(): EffectPresetWithParameters[] {
        return casterChannelingEffectPresetsByAbilityTypeId.get(this.id) ?? []
    }

    public set casterChannelingEffectPresets(
        casterChannelingEffectPresets: EffectPresetWithParametersInput[],
    ) {
        casterChannelingEffectPresetsByAbilityTypeId.set(
            this.id,
            map(casterChannelingEffectPresets, toEffectPreset),
        )
    }

    public get casterEffectPresets(): TupleOf<EffectPresetWithParameters, 0 | 1 | 2> {
        return this.getAttachmentPresetListField("acat", ["acap", "aca1"]) as TupleOf<
            EffectPresetWithParameters,
            0 | 1 | 2
        >
    }

    public set casterEffectPresets(casterEffectPresets: TupleOf<AttachmentPresetInput, 0 | 1 | 2>) {
        this.setAttachmentPresetListField("acat", ["acap", "aca1"], "acac", casterEffectPresets)
    }

    public get effectModelPaths(): string[] {
        return this.getStringsField("aeat")
    }

    public set effectModelPaths(effectModelPaths: string[]) {
        this.setStringsField("aeat", effectModelPaths)
    }

    public get effectModelPathsSD(): string[] {
        return this.getStringsField("aeat:sd")
    }

    public set effectModelPathsSD(effectModelPathsSD: string[]) {
        this.setStringsField("aeat:sd", effectModelPathsSD)
    }

    public get effectModelPathsHD(): string[] {
        return this.getStringsField("aeat:hd")
    }

    public set effectModelPathsHD(effectModelPathsHD: string[]) {
        this.setStringsField("aeat:hd", effectModelPathsHD)
    }

    public get effectModelPathsDE(): string[] {
        return this.getStringsField("aeat:de")
    }

    public set effectModelPathsDE(effectModelPathsDE: string[]) {
        this.setStringsField("aeat:de", effectModelPathsDE)
    }

    public get iconPath(): string {
        return this.getStringField("aart")
    }

    public set iconPath(iconPath: string) {
        this.setStringField("aart", iconPath)
    }

    public get iconPathSD(): string {
        return this.getStringField("aart:sd")
    }

    public set iconPathSD(iconPathSD: string) {
        this.setStringField("aart:sd", iconPathSD)
    }

    public get iconPathHD(): string {
        return this.getStringField("aart:hd")
    }

    public set iconPathHD(iconPathHD: string) {
        this.setStringField("aart:hd", iconPathHD)
    }

    public get iconPathDE(): string {
        return this.getStringField("aart:de")
    }

    public set iconPathDE(iconPathDE: string) {
        this.setStringField("aart:de", iconPathDE)
    }

    public get isButtonVisible(): boolean {
        return this._isButtonVisible
    }

    public set isButtonVisible(isButtonVisible: boolean) {
        if (isButtonVisible) {
            isButtonVisibleFalseAbilityTypes.delete(this)
        } else {
            isButtonVisibleFalseAbilityTypes.add(this)
        }
        this._isButtonVisible = isButtonVisible
    }

    public get isMissileHoming(): boolean {
        return this.getBooleanField("amho")
    }

    public set isMissileHoming(isMissileHoming: boolean) {
        this.setBooleanField("amho", isMissileHoming)
    }

    public get learnButtonPositionX(): number {
        return this.getNumberField("arpx")
    }

    public set learnButtonPositionX(buttonPositionX: number) {
        this.setNumberField("arpx", buttonPositionX)
    }

    public get learnButtonPositionY(): number {
        return this.getNumberField("arpy")
    }

    public set learnButtonPositionY(buttonPositionY: number) {
        this.setNumberField("arpy", buttonPositionY)
    }

    public get learnIconPath(): string {
        return this.getStringField("arar")
    }

    public set learnIconPath(learnIconPath: string) {
        this.setStringField("arar", learnIconPath)
    }

    public get lightningTypeIds(): LightningTypeId[] {
        return this.getObjectDataEntryNumericIdsField("alig")
    }

    public set lightningTypeIds(lightningTypeIds: LightningTypeId[]) {
        this.setObjectDataEntryNumericIdsField("alig", lightningTypeIds)
    }

    public get missileModelPath(): string {
        return this.getStringField("amat")
    }

    public set missileModelPath(missileModelPath: string) {
        this.setStringField("amat", missileModelPath)
    }

    public get missileModelPathSD(): string {
        return this.getStringField("amat:sd")
    }

    public set missileModelPathSD(missileModelPathSD: string) {
        this.setStringField("amat:sd", missileModelPathSD)
    }

    public get missileModelPathHD(): string {
        return this.getStringField("amat:hd")
    }

    public set missileModelPathHD(missileModelPathHD: string) {
        this.setStringField("amat:hd", missileModelPathHD)
    }

    public get missileModelPathDE(): string {
        return this.getStringField("amat:de")
    }

    public set missileModelPathDE(missileModelPathDE: string) {
        this.setStringField("amat:de", missileModelPathDE)
    }

    public get missileMovementArc(): number {
        return this.getNumberField("amac")
    }

    public set missileMovementArc(missileMovementArc: number) {
        this.setNumberField("amac", missileMovementArc)
    }

    public get missileMovementSpeed(): number {
        return this.getNumberField("amsp")
    }

    public set missileMovementSpeed(missileMovementSpeed: number) {
        this.setNumberField("amsp", missileMovementSpeed)
    }

    /** Model paths of the special art (`asat`); Flame Strike, for one, uses three. */
    public get specialEffectModelPaths(): string[] {
        return this.getStringsField("asat")
    }

    public set specialEffectModelPaths(specialEffectModelPaths: string[]) {
        this.setStringsField("asat", specialEffectModelPaths)
    }

    /** Where the special art attaches (`aspt`), shared by all its models. */
    public get specialEffectAttachmentPoint(): AttachmentPoint {
        const [nodeName, nodeQualifiers] = splitAttachmentNodeFQN(this.getStringField("aspt"))
        return { nodeName, nodeQualifiers }
    }

    public set specialEffectAttachmentPoint(specialEffectAttachmentPoint: AttachmentPointInput) {
        this.setStringField("aspt", attachmentPointToNodeFQN(specialEffectAttachmentPoint))
    }

    public get targetCastingEffectPresets(): EffectPresetWithParameters[] {
        return targetCastingEffectPresetsByAbilityTypeId.get(this.id) ?? []
    }

    public set targetCastingEffectPresets(targetCastingEffectPresets: AttachmentPresetInput[]) {
        targetCastingEffectPresetsByAbilityTypeId.set(
            this.id,
            map(targetCastingEffectPresets, toEffectPreset),
        )
    }

    public get targetChannelingEffectPresets(): EffectPresetWithParameters[] {
        return targetChannelingEffectPresetsByAbilityTypeId.get(this.id) ?? []
    }

    public set targetChannelingEffectPresets(
        targetChannelingEffectPresets: EffectPresetWithParametersInput[],
    ) {
        targetChannelingEffectPresetsByAbilityTypeId.set(
            this.id,
            map(targetChannelingEffectPresets, toEffectPreset),
        )
    }

    public get targetChannelingEffectPresetsSD(): EffectPresetWithParameters[] {
        return (
            targetChannelingEffectPresetsSDByAbilityTypeId.get(this.id) ??
            this.targetChannelingEffectPresets
        )
    }

    public set targetChannelingEffectPresetsSD(
        targetChannelingEffectPresetsSD: EffectPresetWithParametersInput[],
    ) {
        targetChannelingEffectPresetsSDByAbilityTypeId.set(
            this.id,
            map(targetChannelingEffectPresetsSD, toEffectPreset),
        )
    }

    public get targetChannelingEffectPresetsHD(): EffectPresetWithParameters[] {
        return (
            targetChannelingEffectPresetsHDByAbilityTypeId.get(this.id) ??
            this.targetChannelingEffectPresets
        )
    }

    public set targetChannelingEffectPresetsHD(
        targetChannelingEffectPresetsHD: EffectPresetWithParametersInput[],
    ) {
        targetChannelingEffectPresetsHDByAbilityTypeId.set(
            this.id,
            map(targetChannelingEffectPresetsHD, toEffectPreset),
        )
    }

    public get targetChannelingEffectPresetsDE(): EffectPresetWithParameters[] {
        return (
            targetChannelingEffectPresetsDEByAbilityTypeId.get(this.id) ??
            this.targetChannelingEffectPresets
        )
    }

    public set targetChannelingEffectPresetsDE(
        targetChannelingEffectPresetsDE: EffectPresetWithParametersInput[],
    ) {
        targetChannelingEffectPresetsDEByAbilityTypeId.set(
            this.id,
            map(targetChannelingEffectPresetsDE, toEffectPreset),
        )
    }

    public get targetEffectPresets(): TupleOf<
        EffectPresetWithParameters,
        0 | 1 | 2 | 3 | 4 | 5 | 6
    > {
        return this.getAttachmentPresetListField(
            "atat",
            array(6, (i) => `ata${i}`),
        ) as TupleOf<EffectPresetWithParameters, 0 | 1 | 2 | 3 | 4 | 5 | 6>
    }

    public set targetEffectPresets(
        targetEffectPresets: TupleOf<AttachmentPresetInput, 0 | 1 | 2 | 3 | 4 | 5 | 6>,
    ) {
        this.setAttachmentPresetListField(
            "atat",
            array(6, (i) => `ata${i}`),
            "atac",
            targetEffectPresets,
        )
    }

    public get targetEffectPresetsSD(): TupleOf<
        EffectPresetWithParameters,
        0 | 1 | 2 | 3 | 4 | 5 | 6
    > {
        return this.getAttachmentPresetListField(
            "atat:sd",
            array(6, (i) => `ata${i}:sd`),
        ) as TupleOf<EffectPresetWithParameters, 0 | 1 | 2 | 3 | 4 | 5 | 6>
    }

    public set targetEffectPresetsSD(
        targetEffectPresetsSD: TupleOf<AttachmentPresetInput, 0 | 1 | 2 | 3 | 4 | 5 | 6>,
    ) {
        this.setAttachmentPresetListField(
            "atat:sd",
            array(6, (i) => `ata${i}:sd`),
            "atac:sd",
            targetEffectPresetsSD,
        )
    }

    public get targetEffectPresetsHD(): TupleOf<
        EffectPresetWithParameters,
        0 | 1 | 2 | 3 | 4 | 5 | 6
    > {
        return this.getAttachmentPresetListField(
            "atat:hd",
            array(6, (i) => `ata${i}:hd`),
        ) as TupleOf<EffectPresetWithParameters, 0 | 1 | 2 | 3 | 4 | 5 | 6>
    }

    public set targetEffectPresetsHD(
        targetEffectPresetsHD: TupleOf<AttachmentPresetInput, 0 | 1 | 2 | 3 | 4 | 5 | 6>,
    ) {
        this.setAttachmentPresetListField(
            "atat:hd",
            array(6, (i) => `ata${i}:hd`),
            "atac:hd",
            targetEffectPresetsHD,
        )
    }

    public get targetEffectPresetsDE(): TupleOf<
        EffectPresetWithParameters,
        0 | 1 | 2 | 3 | 4 | 5 | 6
    > {
        return this.getAttachmentPresetListField(
            "atat:de",
            array(6, (i) => `ata${i}:de`),
        ) as TupleOf<EffectPresetWithParameters, 0 | 1 | 2 | 3 | 4 | 5 | 6>
    }

    public set targetEffectPresetsDE(
        targetEffectPresetsDE: TupleOf<AttachmentPresetInput, 0 | 1 | 2 | 3 | 4 | 5 | 6>,
    ) {
        this.setAttachmentPresetListField(
            "atat:de",
            array(6, (i) => `ata${i}:de`),
            "atac:de",
            targetEffectPresetsDE,
        )
    }

    public get turnOffButtonPositionX(): number {
        return this.getNumberField("aubx")
    }

    public set turnOffButtonPositionX(buttonPositionX: number) {
        this.setNumberField("aubx", buttonPositionX)
    }

    public get turnOffButtonPositionY(): number {
        return this.getNumberField("auby")
    }

    public set turnOffButtonPositionY(buttonPositionY: number) {
        this.setNumberField("auby", buttonPositionY)
    }

    public get turnOffIconPath(): string {
        return this.getStringField("auar")
    }

    public set turnOffIconPath(turnOffIconPath: string) {
        this.setStringField("auar", turnOffIconPath)
    }

    // Tech Tree

    public get shouldCheckTechTreeDependencies(): boolean {
        return this.getBooleanField("achd")
    }

    public set shouldCheckTechTreeDependencies(shouldCheckTechTreeDependencies: boolean) {
        this.setBooleanField("achd", shouldCheckTechTreeDependencies)
    }

    public get techTreeDependencies(): TechTreeDependency[] {
        const techTreeDependencyIds = this.getObjectDataEntryNumericIdsField("areq")
        const techTreeDependencyInternalLevels = this.getNumbersField("arqa")
        return mapIndexed(techTreeDependencyIds, (index, techTreeDependencyId) => {
            const techTreeDependencyInternalLevel = techTreeDependencyInternalLevels[index] ?? 1
            if (Upgrade.getAllIdsByBaseIds(techTreeDependencyId).length != 0) {
                return {
                    upgradeId: techTreeDependencyId as UpgradeId,
                    level: techTreeDependencyInternalLevel - 1,
                } as TechTreeDependency
            } else {
                return {
                    unitTypeId: techTreeDependencyId as UnitTypeId,
                } as TechTreeDependency
            }
        })
    }

    public set techTreeDependencies(techTreeDependencies: TechTreeDependencyInput[]) {
        const techTreeDependencyIds = map(
            techTreeDependencies,
            extractTechTreeDependencyInputObjectDataEntryId,
        )
        const techTreeDependencyInternalLevels = map(
            map(techTreeDependencies, extractTechTreeDependencyInputLevel),
            (techTreeDependencyLevel) => techTreeDependencyLevel + 1,
        )
        this.setObjectDataEntryNumericIdsField("areq", techTreeDependencyIds)
        this.setNumbersField("arqa", techTreeDependencyInternalLevels)
    }

    // Text

    public get activateOrderTypeStringId(): string {
        return this.getStringField("aoro")
    }

    public set activateOrderTypeStringId(activateOrderTypeStringId: string) {
        this.setStringField("aoro", activateOrderTypeStringId)
    }

    public get deactivateOrderTypeStringId(): string {
        return this.getStringField("aoro")
    }

    public set deactivateOrderTypeStringId(deactivateOrderTypeStringId: string) {
        this.setStringField("aorf", deactivateOrderTypeStringId)
    }

    public get hotkey(): string {
        return this.getStringField("ahky")
    }

    public set hotkey(hotkey: string) {
        this.setStringField("ahky", hotkey)
    }

    public get learnHotkey(): string {
        return this.getStringField("arhk")
    }

    public set learnHotkey(learnHotkey: string) {
        this.setStringField("arhk", learnHotkey)
    }

    public get learnTooltipText(): string {
        return this.getStringField("aret")
    }

    public set learnTooltipText(learnTooltipText: string) {
        this.setStringField("aret", learnTooltipText)
    }

    public get learnTooltipExtendedText(): string {
        return this.getStringField("arut")
    }

    public set learnTooltipExtendedText(learnTooltipExtendedText: string) {
        this.setStringField("arut", learnTooltipExtendedText)
    }

    public get name(): string {
        return this.getStringField("anam")
    }

    public set name(name: string) {
        this.setStringField("anam", name)
    }

    public get orderTypeStringId(): string {
        return this.getStringField("aord")
    }

    public set orderTypeStringId(orderTypeStringId: string) {
        this.setStringField("aord", orderTypeStringId)
    }

    public get tooltipText(): string[] {
        return this.getStringLevelField("atp1")
    }

    public set tooltipText(tooltipText: ObjectDataEntryLevelFieldValueSupplier<string>) {
        this.setStringLevelField("atp1", tooltipText)
    }

    public get tooltipExtendedText(): string[] {
        return this.getStringLevelField("aub1")
    }

    public set tooltipExtendedText(
        tooltipExtendedText: ObjectDataEntryLevelFieldValueSupplier<string>,
    ) {
        this.setStringLevelField("aub1", tooltipExtendedText)
    }

    public get turnOffHotkey(): string {
        return this.getStringField("auhk")
    }

    public set turnOffHotkey(turnOffHotkey: string) {
        this.setStringField("auhk", turnOffHotkey)
    }

    public get turnOffOrderTypeStringId(): string {
        return this.getStringField("aoru")
    }

    public set turnOffOrderTypeStringId(turnOffOrderTypeStringId: string) {
        this.setStringField("aoru", turnOffOrderTypeStringId)
    }

    public get turnOffTooltipText(): string[] {
        return this.getStringLevelField("aut1")
    }

    public set turnOffTooltipText(
        turnOffTooltipText: ObjectDataEntryLevelFieldValueSupplier<string>,
    ) {
        this.setStringLevelField("aut1", turnOffTooltipText)
    }

    public get turnOffTooltipExtendedText(): string[] {
        return this.getStringLevelField("auu1")
    }

    public set turnOffTooltipExtendedText(
        turnOffTooltipExtendedText: ObjectDataEntryLevelFieldValueSupplier<string>,
    ) {
        this.setStringLevelField("auu1", turnOffTooltipExtendedText)
    }

    // Sound

    public get casterEffectSoundPresetId(): SoundPresetId | undefined {
        const casterEffectSoundPresetId = this.getStringField("aefs")
        return casterEffectSoundPresetId != ""
            ? (casterEffectSoundPresetId as SoundPresetId)
            : undefined
    }

    public set casterEffectSoundPresetId(casterEffectSoundPresetId: SoundPresetId | undefined) {
        this.setStringField("aefs", casterEffectSoundPresetId ?? ("" as SoundPresetId))
    }

    public get casterEffectLoopingSoundPresetId(): SoundPresetId {
        return this.getStringField("aefl") as SoundPresetId
    }

    public set casterEffectLoopingSoundPresetId(casterEffectLoopingSoundPresetId: SoundPresetId) {
        this.setStringField("aefl", casterEffectLoopingSoundPresetId)
    }

    public get targetEffectSoundPresetId(): SoundPresetId | undefined {
        return targetEffectSoundPresetByAbilityTypeId.get(this.id)
    }

    public set targetEffectSoundPresetId(targetEffectSoundPresetId: SoundPresetId | undefined) {
        targetEffectSoundPresetByAbilityTypeId.set(this.id, targetEffectSoundPresetId)
    }

    // Stats

    public get allowedTargetCombatClassifications(): CombatClassifications[] {
        return map(this.getStringsLevelField("atar"), stringArrayToCombatClassifications)
    }

    public set allowedTargetCombatClassifications(
        allowedTargetCombatClassifications: ObjectDataEntryLevelFieldValueSupplier<CombatClassifications>,
    ) {
        this.setStringsLevelField("atar", (level, currentValue) =>
            combatClassificationsToStringArray(
                extractObjectDataEntryLevelFieldValue(
                    allowedTargetCombatClassifications,
                    level,
                    stringArrayToCombatClassifications(currentValue),
                ),
            ),
        )
    }

    public get areaOfEffect(): number[] {
        return this.getNumberLevelField("aare")
    }

    public set areaOfEffect(areaOfEffect: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("aare", areaOfEffect)
    }

    public get buffDuration(): number[] {
        return this.getNumberLevelField("adur")
    }

    public set buffDuration(buffDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("adur", buffDuration)
    }

    public get buffTypeIds(): BuffTypeId[][] {
        return this.getObjectDataEntryNumericIdsLevelField("abuf")
    }

    public set buffTypeIds(buffTypeIds: ObjectDataEntryLevelFieldValueSupplier<BuffTypeId[]>) {
        this.setObjectDataEntryNumericIdsLevelField("abuf", buffTypeIds)
    }

    public get castRange(): number[] {
        return this.getNumberLevelField("aran")
    }

    public set castRange(castRange: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("aran", castRange)
    }

    public get castingDuration(): number[] {
        return this.getNumberLevelField("acas")
    }

    public set castingDuration(castingDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("acas", castingDuration)
    }

    public get cooldown(): number[] {
        return this.getNumberLevelField("acdn")
    }

    public set cooldown(cooldown: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("acdn", cooldown)
    }

    public get effectBuffTypeIds(): BuffTypeId[][] {
        return this.getObjectDataEntryNumericIdsLevelField("aeff")
    }

    public set effectBuffTypeIds(
        effectBuffTypeIds: ObjectDataEntryLevelFieldValueSupplier<BuffTypeId[]>,
    ) {
        this.setObjectDataEntryNumericIdsLevelField("aeff", effectBuffTypeIds)
    }

    public get heroBuffDuration(): number[] {
        return this.getNumberLevelField("ahdu")
    }

    public set heroBuffDuration(heroBuffDuration: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("ahdu", heroBuffDuration)
    }

    public get isHeroAbility(): boolean {
        return this.getBooleanField("aher")
    }

    public set isHeroAbility(isHeroAbility: boolean) {
        this.setBooleanField("aher", isHeroAbility)
    }

    public get learnLevelMinimum(): number {
        return this.getNumberField("arlv")
    }

    public set learnLevelMinimum(learnLevelMinimum: number) {
        this.setNumberField("arlv", learnLevelMinimum)
    }

    public get learnLevelStep(): number {
        return this.getNumberField("alsk")
    }

    public set learnLevelStep(learnLevelStep: number) {
        this.setNumberField("alsk", learnLevelStep)
    }

    public get levelCount(): number {
        return this.getNumberField("alev")
    }

    public set levelCount(levelCount: number) {
        this.setNumberField("alev", levelCount)
    }

    public get manaCost(): number[] {
        return this.getNumberLevelField("amcs")
    }

    public set manaCost(manaCost: ObjectDataEntryLevelFieldValueSupplier<number>) {
        this.setNumberLevelField("amcs", manaCost)
    }

    public get race(): Race {
        return this.getStringField("arac") as Race
    }

    public set race(race: Race) {
        this.setStringField("arac", race)
    }

    public get spellStealPriority(): number[] {
        return this.getNumberLevelField("apri")
    }

    public set spellStealPriority(
        spellStealPriority: ObjectDataEntryLevelFieldValueSupplier<number>,
    ) {
        this.setNumberLevelField("apri", spellStealPriority)
    }
}

const _: void = postcompile(() => {
    for (const abilityType of isButtonVisibleFalseAbilityTypes) {
        abilityType.hotkey = ""
        abilityType.buttonPositionX = 0
        abilityType.buttonPositionY = -11
    }
})

for (const [abilityTypeId, animationFQN] of postcompile(() => castAnimationFQNByAbilityTypeId)) {
    Unit.abilityCastingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        (caster, ability) => {
            if (ability.getField(ABILITY_RLF_CASTING_TIME) != 0) {
                Timer.run(caster, "playAnimation", animationFQN)
            }
        },
    )
}

for (const [abilityTypeId, soundPresetId] of postcompile(
    () => targetEffectSoundPresetByAbilityTypeId,
)) {
    if (soundPresetId !== undefined) {
        Unit.abilityWidgetTargetChannelingStartEvent[abilityTypeId].addListener(
            EventListenerPriority.HIGHEST,
            (caster, ability, target) => {
                if (target instanceof Unit) {
                    Sound3D.playFromLabel(soundPresetId, SoundSettings.Ability, target)
                } else {
                    Sound3D.playFromLabel(soundPresetId, SoundSettings.Ability, target.x, target.y)
                }
            },
        )
        Unit.abilityPointTargetChannelingStartEvent[abilityTypeId].addListener(
            EventListenerPriority.HIGHEST,
            (caster, ability, x, y) => {
                Sound3D.playFromLabel(soundPresetId, SoundSettings.Ability, x, y)
            },
        )
    }
}

const unsupportedEffectSoundAbilityTypeIds = luaSetOf(fourCC("AAns"))

Unit.abilityChannelingStartEvent.addListener((caster, ability) => {
    const soundPresetId = ability.getField(ABILITY_SF_EFFECT_SOUND)
    if (
        isSoundLabelCustom(soundPresetId) ||
        (soundPresetId != "" && unsupportedEffectSoundAbilityTypeIds.has(ability.parentTypeId))
    ) {
        Sound3D.playFromLabel(soundPresetId, SoundSettings.Ability, caster)
    }
})

const casterCastingEffectModelPathsByAbilityTypeId = postcompile(() => {
    return mapValues(casterCastingEffectPresetsByAbilityTypeId, (casterCastingEffectPresets) =>
        map(casterCastingEffectPresets, extractAttachmentPresetInputModelPath),
    )
})

const casterCastingEffectAttachmentPointsByAbilityTypeId = postcompile(() => {
    return mapValues(casterCastingEffectPresetsByAbilityTypeId, (casterCastingEffectPresets) =>
        map(casterCastingEffectPresets, extractAttachmentPresetInputNodeFQN),
    )
})

const casterCastingEffectParametersByAbilityTypeId = postcompile(() => {
    return mapValues(casterCastingEffectPresetsByAbilityTypeId, (casterCastingEffectPresets) =>
        map(casterCastingEffectPresets, "parameters"),
    )
})

const casterCastingEffectsByCaster = new LuaMap<Unit, Effect[]>()

const handleAbilityCastingStartEvent = (caster: Unit, ability: Ability): void => {
    const effectModelPaths = casterCastingEffectModelPathsByAbilityTypeId.get(ability.typeId)
    const attachmentPoints = casterCastingEffectAttachmentPointsByAbilityTypeId.get(ability.typeId)
    const parameters = casterCastingEffectParametersByAbilityTypeId.get(ability.typeId)
    const effects: Effect[] = []
    if (effectModelPaths != undefined) {
        for (const i of $range(1, effectModelPaths.length)) {
            const effectModelPath = effectModelPaths[i - 1]
            let attachmentPoint = attachmentPoints && attachmentPoints[i - 1]
            if (attachmentPoint == undefined || attachmentPoint == "") {
                attachmentPoint = "origin"
            }
            effects[i - 1] = Effect.create(
                effectModelPath,
                caster,
                attachmentPoint,
                parameters && parameters[i - 1],
            )
        }
    }
    casterCastingEffectsByCaster.set(caster, effects)
}

const handleAbilityStopCastingEvent = (caster: Unit): void => {
    const effects = casterCastingEffectsByCaster.get(caster)
    if (effects != undefined) {
        for (const i of $range(1, effects.length)) {
            effects[i - 1].destroy()
        }
        casterCastingEffectsByCaster.delete(caster)
    }
}

for (const [abilityTypeId] of casterCastingEffectModelPathsByAbilityTypeId) {
    Unit.abilityCastingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityCastingStartEvent,
    )
    Unit.abilityChannelingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopCastingEvent,
    )
    Unit.abilityStopEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopCastingEvent,
    )
}

const casterChannelingEffectModelPathsByAbilityTypeId = postcompile(() => {
    return mapValues(
        casterChannelingEffectPresetsByAbilityTypeId,
        (casterChannelingEffectPresets) =>
            map(casterChannelingEffectPresets, extractAttachmentPresetInputModelPath),
    )
})

const casterChannelingEffectAttachmentPointsByAbilityTypeId = postcompile(() => {
    return mapValues(
        casterChannelingEffectPresetsByAbilityTypeId,
        (casterChannelingEffectPresets) =>
            map(casterChannelingEffectPresets, extractAttachmentPresetInputNodeFQN),
    )
})

const casterChannelingEffectParametersByAbilityTypeId = postcompile(() => {
    return mapValues(
        casterChannelingEffectPresetsByAbilityTypeId,
        (casterChannelingEffectPresets) => map(casterChannelingEffectPresets, "parameters"),
    )
})

const casterChannelingEffectsByCaster = new LuaMap<Unit, Effect[]>()

const handleAbilityChannelingStartEvent = (caster: Unit, ability: Ability): void => {
    const effectModelPaths = casterChannelingEffectModelPathsByAbilityTypeId.get(ability.typeId)
    const attachmentPoints = casterChannelingEffectAttachmentPointsByAbilityTypeId.get(
        ability.typeId,
    )
    const parameters = casterChannelingEffectParametersByAbilityTypeId.get(ability.typeId)
    const effects: Effect[] = []
    if (effectModelPaths != undefined) {
        for (const i of $range(1, effectModelPaths.length)) {
            const effectModelPath = effectModelPaths[i - 1]
            let attachmentPoint = attachmentPoints && attachmentPoints[i - 1]
            if (attachmentPoint == undefined || attachmentPoint == "") {
                attachmentPoint = "origin"
            }
            effects[i - 1] = Effect.create(
                effectModelPath,
                caster,
                attachmentPoint,
                parameters && parameters[i - 1],
            )
        }
    }
    casterChannelingEffectsByCaster.set(caster, effects)
}

type TargetChannelingEffectData = {
    readonly modelPaths: string[]
    /** Absent when every preset uses the default attachment point. */
    readonly attachmentPoints?: string[]
    /** Absent when no preset has parameters. */
    readonly parameters?: (EffectParameters | undefined)[]
}

/**
 * Per-mode data is stored only where it was set explicitly, since the serialized postcompile
 * values do not share tables: the fallback chain is resolved at runtime instead.
 */
type TargetChannelingEffectsData = {
    /**
     * The same on every client: effects are created synchronously, so a graphics mode with
     * fewer presets creates the missing effects without a model.
     */
    readonly effectCount: number
    readonly data?: TargetChannelingEffectData
    readonly dataSD?: TargetChannelingEffectData
    readonly dataHD?: TargetChannelingEffectData
    readonly dataDE?: TargetChannelingEffectData
}

const targetChannelingEffectsDataByAbilityTypeId = postcompile(() => {
    const toData = (
        presets: EffectPresetWithParameters[] | undefined,
    ): TargetChannelingEffectData | undefined => {
        if (presets == undefined) {
            return undefined
        }
        const attachmentPoints = map(presets, extractAttachmentPresetInputNodeFQN)
        const parameters = map(presets, "parameters")
        return {
            modelPaths: map(presets, extractAttachmentPresetInputModelPath),
            attachmentPoints: attachmentPoints.some((attachmentPoint) => attachmentPoint != "")
                ? attachmentPoints
                : undefined,
            parameters: presets.some((preset) => preset.parameters != undefined)
                ? parameters
                : undefined,
        }
    }
    const abilityTypeIds = new LuaSet<AbilityTypeId>()
    for (const presetsByAbilityTypeId of [
        targetChannelingEffectPresetsByAbilityTypeId,
        targetChannelingEffectPresetsSDByAbilityTypeId,
        targetChannelingEffectPresetsHDByAbilityTypeId,
        targetChannelingEffectPresetsDEByAbilityTypeId,
    ]) {
        for (const [abilityTypeId] of presetsByAbilityTypeId) {
            abilityTypeIds.add(abilityTypeId)
        }
    }
    const result = new LuaMap<AbilityTypeId, TargetChannelingEffectsData>()
    for (const abilityTypeId of abilityTypeIds) {
        const presets = targetChannelingEffectPresetsByAbilityTypeId.get(abilityTypeId)
        const presetsSD = targetChannelingEffectPresetsSDByAbilityTypeId.get(abilityTypeId)
        const presetsHD = targetChannelingEffectPresetsHDByAbilityTypeId.get(abilityTypeId)
        const presetsDE = targetChannelingEffectPresetsDEByAbilityTypeId.get(abilityTypeId)
        result.set(abilityTypeId, {
            effectCount: math.max(
                (presetsSD ?? presets)?.length ?? 0,
                (presetsHD ?? presets)?.length ?? 0,
                (presetsDE ?? presets)?.length ?? 0,
            ),
            data: toData(presets),
            dataSD: toData(presetsSD),
            dataHD: toData(presetsHD),
            dataDE: toData(presetsDE),
        })
    }
    return result
})

const targetChannelingEffectsByCaster = new LuaMap<Unit, Effect[]>()

const createTargetChannelingEffects = (
    caster: Unit,
    abilityTypeId: AbilityTypeId,
    xOrWidget: number | Widget,
    y?: number,
): void => {
    const effectsData = targetChannelingEffectsDataByAbilityTypeId.get(abilityTypeId)
    if (effectsData == undefined) {
        return
    }
    const graphicsMode = LocalClient.graphicsMode
    const data =
        (graphicsMode == GraphicsMode.SD
            ? effectsData.dataSD
            : graphicsMode == GraphicsMode.HD
              ? effectsData.dataHD
              : effectsData.dataDE) ?? effectsData.data
    const modelPaths = data?.modelPaths
    const attachmentPoints = data?.attachmentPoints
    const parameters = data?.parameters
    const effects: Effect[] = []
    for (const i of $range(1, effectsData.effectCount)) {
        const effectModelPath = (modelPaths && modelPaths[i - 1]) ?? ""
        const effectParameters = parameters && parameters[i - 1]
        if (typeof xOrWidget == "number") {
            effects[i - 1] = Effect.create(effectModelPath, xOrWidget, y, effectParameters)
        } else {
            let attachmentPoint = attachmentPoints && attachmentPoints[i - 1]
            if (attachmentPoint == undefined || attachmentPoint == "") {
                attachmentPoint = "origin"
            }
            effects[i - 1] = Effect.create(
                effectModelPath,
                xOrWidget,
                attachmentPoint,
                effectParameters,
            )
        }
    }
    targetChannelingEffectsByCaster.set(caster, effects)
}

const handleAbilityWidgetTargetChannelingStartEvent = (
    caster: Unit,
    ability: Ability,
    target: Widget,
): void => {
    createTargetChannelingEffects(caster, ability.typeId, target)
}

const handleAbilityPointTargetChannelingStartEvent = (
    caster: Unit,
    ability: Ability,
    x: number,
    y: number,
): void => {
    createTargetChannelingEffects(caster, ability.typeId, x, y)
}

const handleAbilityStopChannelingEvent = (caster: Unit): void => {
    const casterEffects = casterChannelingEffectsByCaster.get(caster)
    if (casterEffects != undefined) {
        for (const i of $range(1, casterEffects.length)) {
            casterEffects[i - 1].destroy()
        }
        casterChannelingEffectsByCaster.delete(caster)
    }
    const targetEffects = targetChannelingEffectsByCaster.get(caster)
    if (targetEffects != undefined) {
        for (const i of $range(1, targetEffects.length)) {
            targetEffects[i - 1].destroy()
        }
        targetChannelingEffectsByCaster.delete(caster)
    }
}

for (const [abilityTypeId] of casterChannelingEffectModelPathsByAbilityTypeId) {
    Unit.abilityChannelingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityChannelingStartEvent,
    )
    Unit.abilityChannelingFinishEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopChannelingEvent,
    )
    Unit.abilityStopEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopChannelingEvent,
    )
}

for (const [abilityTypeId] of targetChannelingEffectsDataByAbilityTypeId) {
    Unit.abilityWidgetTargetChannelingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityWidgetTargetChannelingStartEvent,
    )
    Unit.abilityPointTargetChannelingStartEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityPointTargetChannelingStartEvent,
    )
    Unit.abilityChannelingFinishEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopChannelingEvent,
    )
    Unit.abilityStopEvent[abilityTypeId].addListener(
        EventListenerPriority.HIGHEST,
        handleAbilityStopChannelingEvent,
    )
}
