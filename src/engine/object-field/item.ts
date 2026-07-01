import { ObjectField } from "../object-field"
import { Item } from "../internal/item"
import { ItemType, ItemTypeId } from "../object-data/entry/item-type"
import { luaSetOf } from "../../utility/lua-sets"

const convertItemBooleanField = ConvertItemBooleanField
const convertItemIntegerField = ConvertItemIntegerField
const getItemBooleanField = BlzGetItemBooleanField
const getItemIntegerField = BlzGetItemIntegerField
const setItemBooleanField = BlzSetItemBooleanField
const setItemIntegerField = BlzSetItemIntegerField

export abstract class ItemField<
    ValueType extends number | string | boolean = number | string | boolean,
    NativeFieldType = any,
> extends ObjectField<ItemType, Item, ValueType, NativeFieldType> {
    protected override get instanceClass(): typeof Item {
        return Item
    }

    protected override getObjectDataEntryId(instance: Item): ItemTypeId {
        return instance.typeId
    }
}

const nativeItemBooleanFieldIds = luaSetOf(
    fourCC("iusa"),
    // TODO
)

export class ItemBooleanField extends ItemField<boolean, jitembooleanfield> {
    protected override get defaultValue(): boolean {
        return false
    }

    protected getNativeFieldById(id: number): jitembooleanfield {
        return convertItemBooleanField(id)
    }

    protected override hasNativeFieldValue(): boolean {
        return nativeItemBooleanFieldIds.has(this.id)
    }

    protected override getNativeFieldValue(instance: Item): boolean {
        return getItemBooleanField(instance.handle, this.nativeField)
    }

    protected override setNativeFieldValue(instance: Item, value: boolean): boolean {
        return setItemBooleanField(instance.handle, this.nativeField, value)
    }
}

const nativeItemIntegerFieldIds = luaSetOf(
    fourCC("ilev"),
    fourCC("iuse"),
    fourCC("icid"),
    fourCC("ihtp"),
    fourCC("ihpc"),
    fourCC("ipri"),
    fourCC("iarm"),
    fourCC("iclr"),
    fourCC("iclg"),
    fourCC("iclb"),
    fourCC("ical"),
)

export class ItemIntegerField extends ItemField<number, jitemintegerfield> {
    protected override get defaultValue(): number {
        return 0
    }

    protected getNativeFieldById(id: number): jitemintegerfield {
        return convertItemIntegerField(id)
    }

    protected override hasNativeFieldValue(): boolean {
        return nativeItemIntegerFieldIds.has(this.id)
    }

    protected override getNativeFieldValue(instance: Item): number {
        return getItemIntegerField(instance.handle, this.nativeField)
    }

    protected override setNativeFieldValue(instance: Item, value: number): boolean {
        return setItemIntegerField(instance.handle, this.nativeField, value)
    }
}
