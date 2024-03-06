import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { SyntaxKind } from "typescript-to-lua"
import * as lua from "typescript-to-lua/dist/LuaAST"
import { getCalledExpression } from "typescript-to-lua/dist/transformation/visitors/call"
import { transformImportExpression } from "typescript-to-lua/dist/transformation/visitors/modules/import"
import {
    getOptionalContinuationData,
    transformOptionalChain
} from "typescript-to-lua/dist/transformation/visitors/optional-chaining"
import {
    isMultiReturnCall,
    shouldMultiReturnCallBeWrapped
} from "typescript-to-lua/dist/transformation/visitors/language-extensions/multi"
import { TransformationContext } from "typescript-to-lua/dist/transformation/context"
import {
    invalidMethodCallExtensionUse,
    invalidSpreadInCallExtension,
    unsupportedBuiltinOptionalCall
} from "typescript-to-lua/dist/transformation/utils/diagnostics"
import { wrapInTable } from "typescript-to-lua/dist/transformation/utils/lua-ast"
import {
    moveToPrecedingTemp,
    transformOrderedExpressions
} from "typescript-to-lua/dist/transformation/visitors/expression-list"

export enum WarscriptExtensionKind {
    BitwiseAndNotZeroOperatorMethodType = "BitwiseAndNotZeroMethod",
    BitwiseAndEqualsRightMethodType = "BitwiseAndEqualsRightMethod",
    BitwiseAndNotMethodType = "BitwiseAndNotMethod",
    PlusPointZeroMethodType = "PlusPointZeroMethod",
}

const extensionValues: Set<string> = new Set(Object.values(WarscriptExtensionKind))

const excludedTypeFlags: ts.TypeFlags =
    ((1 << 18) - 1) | // All flags from Any...Never
    ts.TypeFlags.Index |
    ts.TypeFlags.NonPrimitive

function getPropertyValue(
    context: TransformationContext,
    type: ts.Type,
    propertyName: string
): string | undefined {
    if (type.flags & excludedTypeFlags) return
    const property = type.getProperty(propertyName)
    if (!property) return undefined
    const propertyType = context.checker.getTypeOfSymbolAtLocation(property, context.sourceFile)
    if (propertyType.isStringLiteral()) return propertyType.value
    return
}

function getExtensionKindForType(
    context: TransformationContext,
    type: ts.Type
): WarscriptExtensionKind | undefined {
    const value = getPropertyValue(context, type, "__warscriptTstlExtension")
    if (value && extensionValues.has(value)) {
        return value as WarscriptExtensionKind
    }
    return
}

export const methodExtensionKinds: ReadonlySet<WarscriptExtensionKind> = new Set<WarscriptExtensionKind>([
    WarscriptExtensionKind.BitwiseAndNotZeroOperatorMethodType,
    WarscriptExtensionKind.BitwiseAndEqualsRightMethodType,
    WarscriptExtensionKind.BitwiseAndEqualsRightMethodType,
    WarscriptExtensionKind.PlusPointZeroMethodType,
])

function getNaryCallExtensionArgs(
    context: TransformationContext,
    node: ts.CallExpression,
    kind: WarscriptExtensionKind,
    numArgs: number
): readonly ts.Expression[] | undefined {
    let expressions: readonly ts.Expression[]
    if (node.arguments.some(ts.isSpreadElement)) {
        context.diagnostics.push(invalidSpreadInCallExtension(node))
        return undefined
    }
    if (methodExtensionKinds.has(kind)) {
        if (
            !(
                ts.isPropertyAccessExpression(node.expression) ||
                ts.isElementAccessExpression(node.expression)
            )
        ) {
            context.diagnostics.push(invalidMethodCallExtensionUse(node))
            return undefined
        }
        if (node.arguments.length < numArgs - 1) {
            // assumed to be TS error
            return undefined
        }
        expressions = [node.expression.expression, ...node.arguments]
    } else {
        if (node.arguments.length < numArgs) {
            // assumed to be TS error
            return undefined
        }
        expressions = node.arguments
    }
    return expressions
}

export function getUnaryCallExtensionArg(
    context: TransformationContext,
    node: ts.CallExpression,
    kind: WarscriptExtensionKind
): ts.Expression | undefined {
    return getNaryCallExtensionArgs(context, node, kind, 1)?.[0]
}

export function getBinaryCallExtensionArgs(
    context: TransformationContext,
    node: ts.CallExpression,
    kind: WarscriptExtensionKind
): readonly [ts.Expression, ts.Expression] | undefined {
    const expressions = getNaryCallExtensionArgs(context, node, kind, 2)
    if (expressions === undefined) return undefined
    return [expressions[0], expressions[1]]
}

type WarscriptLanguageExtensionCallTransformer = (
    context: TransformationContext,
    node: ts.CallExpression,
    extensionKind: WarscriptExtensionKind
) => lua.Expression

export type WarscriptLanguageExtensionCallTransformerMap = {
    [P in WarscriptExtensionKind]?: WarscriptLanguageExtensionCallTransformer
}

const allCallExtensionHandlers: WarscriptLanguageExtensionCallTransformerMap = {
    [WarscriptExtensionKind.BitwiseAndNotZeroOperatorMethodType]: (context, node, extensionKind) => {
        const args = getBinaryCallExtensionArgs(context, node, extensionKind)
        if (!args) {
            return lua.createNilLiteral()
        }

        const [left, right] = transformOrderedExpressions(context, args)
        // left & right
        const bitwiseAndExpression = lua.createBinaryExpression(
            left,
            right,
            SyntaxKind.BitwiseAndOperator
        )

        // (left & right) ~= 0
        return lua.createBinaryExpression(
            bitwiseAndExpression,
            lua.createNumericLiteral(0),
            lua.SyntaxKind.InequalityOperator,
            node
        )
    },
    [WarscriptExtensionKind.BitwiseAndNotMethodType]: (context, node, extensionKind) => {
        const args = getBinaryCallExtensionArgs(context, node, extensionKind)
        if (!args) {
            return lua.createNilLiteral()
        }

        const [left, right] = transformOrderedExpressions(context, args)

        // left & ~right
        return lua.createBinaryExpression(
            left,
            lua.createUnaryExpression(right, SyntaxKind.BitwiseNotOperator),
            SyntaxKind.BitwiseAndOperator,
            node
        )
    },
    [WarscriptExtensionKind.BitwiseAndEqualsRightMethodType]: (context, node, extensionKind) => {
        const args = getBinaryCallExtensionArgs(context, node, extensionKind)
        if (!args) {
            return lua.createNilLiteral()
        }

        const [left, right] = transformOrderedExpressions(context, args)

        const rightPreceding = moveToPrecedingTemp(context, right)

        // left & right
        const bitwiseAndExpression = lua.createBinaryExpression(
            left,
            rightPreceding,
            SyntaxKind.BitwiseAndOperator
        )

        // (left & right) == right
        return lua.createBinaryExpression(
            bitwiseAndExpression,
            rightPreceding,
            lua.SyntaxKind.EqualityOperator,
            node
        )
    },
    [WarscriptExtensionKind.PlusPointZeroMethodType]: (context, node, extensionKind) => {
        const arg = getUnaryCallExtensionArg(context, node, extensionKind)
        if (!arg) {
            return lua.createNilLiteral()
        }

        // arg + .0
        return lua.createBinaryExpression(
            context.transformExpression(arg),
            lua.createIdentifier(".0"),
            lua.SyntaxKind.AdditionOperator,
            node
        )
    },
}

function getWarscriptExtensionKindForNode(
    context: TransformationContext,
    node: ts.Node
): WarscriptExtensionKind | undefined {
    const originalNode = ts.getOriginalNode(node)
    let type = context.checker.getTypeAtLocation(originalNode)
    if (ts.isOptionalChain(originalNode)) {
        type = context.checker.getNonNullableType(type)
    }
    return getExtensionKindForType(context, type)
}

const plugin: tstl.Plugin = {
    // `visitors` is a record where keys are TypeScript node syntax kinds
    visitors: {
        // Visitor can be a function that returns Lua AST node
        [ts.SyntaxKind.CallExpression]: (node, context) => {
            const calledExpression = getCalledExpression(node)

            if (calledExpression.kind === ts.SyntaxKind.ImportKeyword) {
                return transformImportExpression(node, context)
            }

            if (ts.isOptionalChain(node)) {
                return transformOptionalChain(context, node)
            }

            const optionalContinuation = ts.isIdentifier(calledExpression)
                ? getOptionalContinuationData(calledExpression)
                : undefined
            const wrapResultInTable =
                isMultiReturnCall(context, node) && shouldMultiReturnCallBeWrapped(context, node)

            const extensionKind = getWarscriptExtensionKindForNode(context, node.expression)
            if (extensionKind != undefined) {
                if (optionalContinuation !== undefined) {
                    context.diagnostics.push(unsupportedBuiltinOptionalCall(node))
                }
                const extensionResult = allCallExtensionHandlers[extensionKind]?.(
                    context,
                    node,
                    extensionKind
                )
                if (extensionResult != undefined) {
                    return wrapResultInTable ? wrapInTable(extensionResult) : extensionResult
                }
            }

            return context.superTransformExpression(node)
        },
    },
}

export default plugin
