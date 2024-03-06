import { BuffType, BuffTypeId } from "../buff-type"

export class BlankBuffType extends BuffType {
    public static override readonly BASE_ID = fourCC("BHbz") as BuffTypeId

    protected static override readonly IS_SYNTHETIC = true

    public constructor(object: WarObject) {
        super(object)
        this.name = ""
    }
}
