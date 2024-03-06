import { UnitBehavior } from "../unit"
import { Unit } from "../../unit"
import { BuffTypeId } from "../../object-data/entry/buff-type"
import { AbilityType } from "../../object-data/entry/ability-type"
import { flatMapToLuaSet, map } from "../../../utility/arrays"
import { TextTag, TextTagPreset } from "../../text-tag"
import { Destructor } from "../../../destroyable"

const DEFAULT_BUFF_TYPE_IDS = postcompile(() => {
    return flatMapToLuaSet(
        AbilityType.getAllByBaseIds(
            map(
                [
                    "Aslo",
                    "AHtc",
                    "Aens",
                    "Aprg",
                    "Apg2",
                    "AOeq",
                    "SNeq",
                    "Aweb",
                    "Afra",
                    "Afrb",
                    "Afrc",
                    "Afr2",
                    "Acri",
                    "Scri",
                    "AUfn",
                    "Aspo",
                    "AEer",
                    "ACwb",
                ],
                fourCC
            )
        ),
        (abilityType) => abilityType.buffTypeIds.flat()
    )
})

export type StunImmunityUnitBehaviourParameters = {
    buffTypeIds?: LuaSet<BuffTypeId>
    textTagPreset?: TextTagPreset
    textTagText?: string
}

export class StunImmunityUnitBehavior extends UnitBehavior {
    public static defaultParameters: StunImmunityUnitBehaviourParameters = {
        buffTypeIds: DEFAULT_BUFF_TYPE_IDS,
        textTagPreset: TextTag.MISS,
        textTagText: undefined,
    }

    public constructor(
        unit: Unit,
        private readonly parameters: StunImmunityUnitBehaviourParameters = StunImmunityUnitBehavior.defaultParameters
    ) {
        super(unit)
        unit.decrementStunCounter()
        this.onBuffsCheck()
    }

    protected override onDestroy(): Destructor {
        this.unit.incrementStunCounter()
        return super.onDestroy()
    }

    private onBuffsCheck(): void {
        let hasRemovedBuffs = false
        for (const buffTypeId of this.parameters.buffTypeIds ?? DEFAULT_BUFF_TYPE_IDS) {
            hasRemovedBuffs = hasRemovedBuffs || this.unit.removeBuff(buffTypeId)
        }
        if (hasRemovedBuffs && this.parameters.textTagText != undefined) {
            TextTag.flash(TextTag.MISS, this.parameters.textTagText, this.unit.x, this.unit.y)
        }
    }
}
