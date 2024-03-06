import { Unit, UnitClassification } from "../../unit"
import "../../unit+ability"

import { luaSetOf } from "../../../../utility/lua-sets"
import { EventListenerPriority } from "../../../../event"

const cannibalizeAbilityTypeIds = luaSetOf(fourCC("Acan"), fourCC("Acn2"), fourCC("ACcn"))

Unit.abilityUnitTargetChannelingStartEvent.addListener(
    EventListenerPriority.HIGHEST,
    (caster, ability, target) => {
        if (cannibalizeAbilityTypeIds.has(ability.parentTypeId)) {
            target.removeClassification(UnitClassification.TAUREN)
        }
    }
)
