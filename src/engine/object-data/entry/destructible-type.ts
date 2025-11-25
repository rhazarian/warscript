import { ArmorSoundType } from "../auxiliary/armor-sound-type"
import {
    CombatClassifications,
    combatClassificationsToStringArray,
    stringArrayToCombatClassifications,
} from "../auxiliary/combat-classification"
import { ObjectDataEntry, ObjectDataEntryConstructor, ObjectDataEntryId } from "../entry"
import { ObjectDataEntryIdGenerator } from "../utility/object-data-entry-id-generator"
import { implementReadonlyNumberIndexSupplier } from "../../../utility/reflection"

export type DestructibleTypeId = ObjectDataEntryId &
    number & {
        readonly __destructibleTypeId: unique symbol
    }

export type StandardDestructibleTypeId = DestructibleTypeId & {
    readonly __standardDestructibleTypeId: unique symbol
}

export abstract class DestructibleType extends ObjectDataEntry<DestructibleTypeId> {
    static readonly [id: StandardDestructibleTypeId]: ObjectDataEntryConstructor<DestructibleType>

    private static readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("D000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.destructable
    }

    // Art

    public get modelPath(): string {
        return this.getStringField("bfil")
    }

    public set modelPath(modelPath: string) {
        this.setStringField("bfil", modelPath)
    }

    public get modelPathSD(): string {
        return this.getStringField("bfil:sd")
    }

    public set modelPathSD(modelPathSD: string) {
        this.setStringField("bfil:sd", modelPathSD)
    }

    public get modelPathHD(): string {
        return this.getStringField("bfil:hd")
    }

    public set modelPathHD(modelPathHD: string) {
        this.setStringField("bfil:hd", modelPathHD)
    }

    // Combat

    public get armorSoundType(): ArmorSoundType {
        return this.getStringField("barm") as ArmorSoundType
    }

    public set armorSoundType(armorSoundType: ArmorSoundType) {
        this.setStringField("barm", armorSoundType)
    }

    public get armorSoundTypeSD(): ArmorSoundType {
        return this.getStringField("barm:sd") as ArmorSoundType
    }

    public set armorSoundTypeSD(armorSoundTypeSD: ArmorSoundType) {
        this.setStringField("barm:sd", armorSoundTypeSD)
    }

    public get armorSoundTypeHD(): ArmorSoundType {
        return this.getStringField("barm:hd") as ArmorSoundType
    }

    public set armorSoundTypeHD(armorSoundTypeHD: ArmorSoundType) {
        this.setStringField("barm:hd", armorSoundTypeHD)
    }

    public get combatClassifications(): CombatClassifications {
        return stringArrayToCombatClassifications(this.getStringsField("btar"))
    }

    public set combatClassifications(combatClassifications: CombatClassifications) {
        this.setStringsField("btar", combatClassificationsToStringArray(combatClassifications))
    }

    // Pathing

    public get pathingTexturePath(): string {
        return this.getStringField("bptx")
    }

    public set pathingTexturePath(pathingTexturePath: string) {
        this.setStringField("bptx", pathingTexturePath)
    }

    public get deadPathingTexturePath(): string {
        return this.getStringField("bptd")
    }

    public set deadPathingTexturePath(deadPathingTexturePath: string) {
        this.setStringField("bptd", deadPathingTexturePath)
    }
}
implementReadonlyNumberIndexSupplier(DestructibleType, (id) => {
    return class extends DestructibleType {
        public static override readonly BASE_ID = id
    }
})
