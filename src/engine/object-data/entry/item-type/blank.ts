import { ItemType, ItemTypeId } from "../item-type"

export class BlankItemType extends ItemType {
    public static override readonly BASE_ID = fourCC("ches") as ItemTypeId

    protected static override readonly IS_SYNTHETIC = true

    public constructor(object: WarObject) {
        super(object)
        this.iconPath = ""
        this.description = ""
        this.name = ""
        this.tooltipText = ""
        this.tooltipExtendedText = ""
    }
}
