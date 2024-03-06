declare interface Number {
    readonly toFloat: LuaPlusPointZeroMethod<number>
}

/**
 * Indicates a type is a language extension provided by Warscript's TypescriptToLua plugin when used as a value or function call.
 * @param TBrand A string used to uniquely identify the language extension type
 */
declare interface WarscriptLuaExtension<TBrand extends string> {
    readonly __warscriptTstlExtension: TBrand;
}

/**
 * @param TReturn The resulting (return) type of the operation.
 */
declare type LuaPlusPointZeroMethod<TReturn> = (() => TReturn)
    & WarscriptLuaExtension<"PlusPointZeroMethod">;

/**
 * @param TRight The type of the right-hand-side of the operation.
 */
declare type LuaBitwiseAndUnequalsZeroMethod<TRight> = ((right: TRight) => boolean)
    & WarscriptLuaExtension<"BitwiseAndNotZeroMethod">;

/**
 * @param TRight The type of the right-hand-side of the operation.
 */
declare type LuaBitwiseAndEqualsRightMethod<TRight> = ((right: TRight) => boolean)
    & WarscriptLuaExtension<"BitwiseAndEqualsRightMethod">;

/**
 * @param TRight The type of the right-hand-side of the operation.
 * @param TReturn The resulting (return) type of the operation.
 */
declare type LuaBitwiseAndNotMethod<TRight, TReturn> = ((right: TRight) => TReturn)
    & WarscriptLuaExtension<"BitwiseAndNotMethod">;
