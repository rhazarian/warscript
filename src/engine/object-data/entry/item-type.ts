import { ArmorSoundType } from "../auxiliary/armor-sound-type"
import { ObjectDataEntry, ObjectDataEntryId } from "../entry"
import { ObjectDataEntryIdGenerator } from "../utility/object-data-entry-id-generator"
import type { AbilityTypeId } from "./ability-type"

export type ItemTypeId = ObjectDataEntryId & { readonly __itemTypeId: unique symbol }

export class ItemType extends ObjectDataEntry<ItemTypeId> {
    private static readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("I000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.item
    }

    // Abilities

    public get abilityTypeIds(): AbilityTypeId[] {
        return this.getObjectDataEntryIdsField("iabi")
    }

    public set abilityTypeIds(abilityTypeIds: AbilityTypeId[]) {
        this.setObjectDataEntryIdsField("iabi", abilityTypeIds)
    }

    // Art

    public get iconPath(): string {
        return this.getStringField("iico")
    }

    public set iconPath(iconPath: string) {
        this.setStringField("iico", iconPath)
    }

    public get iconPathSD(): string {
        return this.getStringField("iico:sd")
    }

    public set iconPathSD(iconPathSD: string) {
        this.setStringField("iico:sd", iconPathSD)
    }

    public get iconPathHD(): string {
        return this.getStringField("iico:hd")
    }

    public set iconPathHD(iconPathHD: string) {
        this.setStringField("iico:hd", iconPathHD)
    }

    public get modelPath(): string {
        return this.getStringField("ifil")
    }

    public set modelPath(modelPath: string) {
        this.setStringField("ifil", modelPath)
    }

    public get modelPathSD(): string {
        return this.getStringField("ifil:sd")
    }

    public set modelPathSD(modelPathSD: string) {
        this.setStringField("ifil:sd", modelPathSD)
    }

    public get modelPathHD(): string {
        return this.getStringField("ifil:hd")
    }

    public set modelPathHD(modelPathHD: string) {
        this.setStringField("ifil:hd", modelPathHD)
    }

    public get scale(): number {
        return this.getNumberField("isca")
    }

    public set scale(scale: number) {
        this.setNumberField("isca", scale)
    }

    public get scaleSD(): number {
        return this.getNumberField("isca:sd")
    }

    public set scaleSD(scaleSD: number) {
        this.setNumberField("isca:sd", scaleSD)
    }

    public get scaleHD(): number {
        return this.getNumberField("isca:hd")
    }

    public set scaleHD(scaleHD: number) {
        this.setNumberField("isca:hd", scaleHD)
    }

    // Combat

    public get armorSoundType(): ArmorSoundType {
        return this.getStringField("iarm") as ArmorSoundType
    }

    public set armorSoundType(armorSoundType: ArmorSoundType) {
        this.setStringField("iarm", armorSoundType)
    }

    public get armorSoundTypeSD(): ArmorSoundType {
        return this.getStringField("iarm:sd") as ArmorSoundType
    }

    public set armorSoundTypeSD(armorSoundTypeSD: ArmorSoundType) {
        this.setStringField("iarm:sd", armorSoundTypeSD)
    }

    public get armorSoundTypeHD(): ArmorSoundType {
        return this.getStringField("iarm:hd") as ArmorSoundType
    }

    public set armorSoundTypeHD(armorSoundTypeHD: ArmorSoundType) {
        this.setStringField("iarm:hd", armorSoundTypeHD)
    }

    // Text

    public get description(): string {
        return this.getStringField("ides")
    }

    public set description(description: string) {
        this.setStringField("ides", description)
    }

    public get hotkey(): string {
        return this.getStringField("uhot")
    }

    public set hotkey(hotkey: string) {
        this.setStringField("uhot", hotkey)
    }

    public get name(): string {
        return this.getStringField("unam")
    }

    public set name(name: string) {
        this.setStringField("unam", name)
    }

    public get tooltipText(): string {
        return this.getStringField("utip")
    }

    public set tooltipText(tooltipText: string) {
        this.setStringField("utip", tooltipText)
    }

    public get tooltipExtendedText(): string {
        return this.getStringField("utub")
    }

    public set tooltipExtendedText(tooltipText: string) {
        this.setStringField("utub", tooltipText)
    }
}
