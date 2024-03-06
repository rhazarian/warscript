declare type oskeymeta = {
    readonly __oskeymeta: unique symbol
} & number

declare const OSKEY_META_NONE: oskeymeta
declare const OSKEY_META_SHIFT: oskeymeta
declare const OSKEY_META_CTRL: oskeymeta
declare const OSKEY_META_ALT: oskeymeta
