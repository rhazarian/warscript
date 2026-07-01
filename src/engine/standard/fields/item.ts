import { ItemBooleanField } from "../../object-field/item"

export const CAN_BE_SOLD_TO_MERCHANTS_ITEM_FIELD = ItemBooleanField.create(fourCC("ipaw"))

export const IS_ACTIVELY_USED_ITEM_FIELD = ItemBooleanField.create(fourCC("iusa"))
