import { ArmorSoundType } from "../auxiliary/armor-sound-type"
import {
    CombatClassifications,
    combatClassificationsToStringArray,
    stringArrayToCombatClassifications,
} from "../auxiliary/combat-classification"
import { ObjectDataEntry, ObjectDataEntryId } from "../entry"
import { ObjectDataEntryIdGenerator } from "../utility/object-data-entry-id-generator"

export type DestructibleTypeId = ObjectDataEntryId &
    number & {
        readonly __destructibleTypeId: unique symbol
    }

export abstract class DestructibleType extends ObjectDataEntry<DestructibleTypeId> {
    private static readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("D000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.destructable
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
}
