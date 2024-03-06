import { array } from "../../../utility/arrays"
import { TupleOf } from "../../../utility/types"

import { AttachmentPreset, AttachmentPresetInput } from "../auxiliary/attachment-preset"
import { Race } from "../auxiliary/race"
import { SoundPresetName } from "../auxiliary/sound-preset-name"
import { ObjectDataEntry, ObjectDataEntryId } from "../entry"
import { ObjectDataEntryIdGenerator } from "../utility/object-data-entry-id-generator"

import { LightningTypeId } from "./lightning-type"

export type BuffTypeId = ObjectDataEntryId & { readonly __buffTypeId: unique symbol }

export abstract class BuffType<Id extends BuffTypeId = BuffTypeId> extends ObjectDataEntry<Id> {
    private static readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("B000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.buff
    }

    // Art

    public get effectAttachmentPreset(): AttachmentPreset | undefined {
        return this.getAttachmentPresetField("feat", "feft")
    }

    public set effectAttachmentPreset(effectAttachmentPreset: AttachmentPresetInput | undefined) {
        this.setAttachmentPresetField("feat", "feft", effectAttachmentPreset)
    }

    public get iconPath(): string {
        return this.getStringField("fart")
    }

    public set iconPath(iconPath: string) {
        this.setStringField("fart", iconPath)
    }

    public get iconPathSD(): string {
        return this.getStringField("fart:sd")
    }

    public set iconPathSD(iconPathSD: string) {
        this.setStringField("fart:sd", iconPathSD)
    }

    public get iconPathHD(): string {
        return this.getStringField("fart:hd")
    }

    public set iconPathHD(iconPathHD: string) {
        this.setStringField("fart:hd", iconPathHD)
    }

    public get isMissileHoming(): boolean {
        return this.getBooleanField("fmho")
    }

    public set isMissileHoming(isMissileHoming: boolean) {
        this.setBooleanField("fmho", isMissileHoming)
    }

    public get lightningTypeIds(): LightningTypeId[] {
        return this.getObjectDataEntryIdsField("flig")
    }

    public set lightningTypeIds(lightningTypeIds: LightningTypeId[]) {
        this.setObjectDataEntryIdsField("flig", lightningTypeIds)
    }

    public get missileModelPath(): string {
        return this.getStringField("fmat")
    }

    public set missileModelPath(missileModelPath: string) {
        this.setStringField("fmat", missileModelPath)
    }

    public get missileModelPathSD(): string {
        return this.getStringField("fmat:sd")
    }

    public set missileModelPathSD(missileModelPathSD: string) {
        this.setStringField("fmat:sd", missileModelPathSD)
    }

    public get missileModelPathHD(): string {
        return this.getStringField("fmat:hd")
    }

    public set missileModelPathHD(missileModelPathHD: string) {
        this.setStringField("fmat:hd", missileModelPathHD)
    }

    public get missileMovementArc(): number {
        return this.getNumberField("fmac")
    }

    public set missileMovementArc(missileMovementArc: number) {
        this.setNumberField("fmac", missileMovementArc)
    }

    public get missileMovementSpeed(): number {
        return this.getNumberField("fmsp")
    }

    public set missileMovementSpeed(missileMovementSpeed: number) {
        this.setNumberField("fmsp", missileMovementSpeed)
    }

    public get specialAttachmentPreset(): AttachmentPreset | undefined {
        return this.getAttachmentPresetField("fsat", "fspt")
    }

    public set specialAttachmentPreset(specialAttachmentPreset: AttachmentPresetInput | undefined) {
        this.setAttachmentPresetField("fsat", "fspt", specialAttachmentPreset)
    }

    public get targetAttachmentPresets(): TupleOf<AttachmentPreset, 0 | 1 | 2 | 3 | 4 | 5 | 6> {
        return this.getAttachmentPresetListField(
            "ftat",
            array(6, (i) => `fta${i}`)
        ) as TupleOf<AttachmentPreset, 0 | 1 | 2 | 3 | 4 | 5 | 6>
    }

    public set targetAttachmentPresets(
        targetAttachmentPresets: TupleOf<AttachmentPresetInput, 0 | 1 | 2 | 3 | 4 | 5 | 6>
    ) {
        this.setAttachmentPresetListField(
            "ftat",
            array(6, (i) => `fta${i}`),
            "ftac",
            targetAttachmentPresets
        )
    }

    // Sound

    public get soundPresetName(): SoundPresetName {
        return this.getStringField("fefs") as SoundPresetName
    }

    public set soundPresetName(soundPresetName: SoundPresetName) {
        this.setStringField("fefs", soundPresetName)
    }

    public get loopingSoundPresetName(): SoundPresetName {
        return this.getStringField("fefl") as SoundPresetName
    }

    public set loopingSoundPresetName(loopingSoundPresetName: SoundPresetName) {
        this.setStringField("fefl", loopingSoundPresetName)
    }

    // Stats

    public get race(): Race {
        return this.getStringField("frac") as Race
    }

    public set race(race: Race) {
        this.setStringField("frac", race)
    }

    // Text

    public get name(): string {
        return this.getStringField("fnam")
    }

    public set name(name: string) {
        this.setStringField("fnam", name)
    }

    public get tooltipText(): string {
        return this.getStringField("ftip")
    }

    public set tooltipText(tooltipText: string) {
        this.setStringField("ftip", tooltipText)
    }

    public get tooltipExtendedText(): string {
        return this.getStringField("fube")
    }

    public set tooltipExtendedText(tooltipText: string) {
        this.setStringField("fube", tooltipText)
    }
}

const makeBaseBuffType = (id: number): typeof BuffType => {
    return class BaseBuffType<Id extends BuffTypeId = BuffTypeId> extends BuffType<Id> {
        public static override readonly BASE_ID = id as BuffTypeId
    }
}

export class AvatarBuffType extends makeBaseBuffType(fourCC("BHav")) {}
export class DevotionAuraBuffType extends makeBaseBuffType(fourCC("BHad")) {}
export class DivineShieldBuffType extends makeBaseBuffType(fourCC("BHds")) {}
