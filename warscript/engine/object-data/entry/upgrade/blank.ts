import { Upgrade, UpgradeId } from "../upgrade"

export class BlankUpgrade extends Upgrade {
    public static override readonly BASE_ID = fourCC("Rhsb") as UpgradeId

    protected static override readonly IS_SYNTHETIC = true

    public constructor(object: WarObject) {
        super(object)
        this.iconPath = ""
        this.hotkey = ""
        this.name = ""
        this.tooltipText = ""
        this.tooltipExtendedText = ""
        this.techTreeDependencies = []
    }
}
