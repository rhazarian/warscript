import {
    UnitClassificationsField,
    UnitFloatField,
    UnitPropulsionWindowField,
} from "../../object-field/unit"

export const PROPULSION_WINDOW_UNIT_FLOAT_FIELD = UnitPropulsionWindowField.create(fourCC("urpw"))

export const UNIT_CLASSIFICATIONS_FIELD = UnitClassificationsField.create(fourCC("utyp"))

export const FLY_HEIGHT_UNIT_FLOAT_FIELD = UnitFloatField.create(fourCC("ufyh"))
