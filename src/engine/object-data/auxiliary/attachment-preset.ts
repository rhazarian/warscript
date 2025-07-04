import { ModelNodeName } from "./model-node-name"
import { ModelNodeQualifier } from "./model-node-qualifier"

import { Optional } from "../../../utility/types"
import { EffectParameters } from "../../../core/types/effect"

export type AttachmentPreset = {
    modelPath: string
    nodeName: ModelNodeName
    nodeQualifiers: ModelNodeQualifier[]
}

export type EffectPresetWithParameters = AttachmentPreset & {
    parameters?: EffectParameters
}

export type AttachmentPresetInput<T extends AttachmentPreset = AttachmentPreset> =
    | Optional<T, "nodeName" | "nodeQualifiers">
    | string

export type EffectPresetWithParametersInput = AttachmentPresetInput<EffectPresetWithParameters>

export const toEffectPreset = (
    effectPresetInput: EffectPresetWithParametersInput,
): EffectPresetWithParameters => {
    return typeof effectPresetInput == "string"
        ? {
              modelPath: effectPresetInput,
              nodeName: ModelNodeName.ORIGIN,
              nodeQualifiers: [],
          }
        : {
              modelPath: effectPresetInput.modelPath,
              nodeName: effectPresetInput.nodeName ?? ModelNodeName.ORIGIN,
              nodeQualifiers: effectPresetInput.nodeQualifiers ?? [],
              parameters: effectPresetInput.parameters,
          }
}

export const extractAttachmentPresetInputModelPath = (
    attachmentPresetInput: AttachmentPresetInput | undefined,
): string => {
    return typeof attachmentPresetInput == "string"
        ? attachmentPresetInput
        : (attachmentPresetInput?.modelPath ?? "")
}

export const extractAttachmentPresetInputNodeFQN = (
    attachmentPresetInput: AttachmentPresetInput | undefined,
): string => {
    if (typeof attachmentPresetInput == "string" || attachmentPresetInput == undefined) {
        return ""
    }
    return [attachmentPresetInput.nodeName, ...(attachmentPresetInput.nodeQualifiers ?? [])].join(
        ",",
    )
}

export const splitAttachmentNodeFQN = (
    attachmentNodeFQN: string,
): LuaMultiReturn<
    [attachmentNodeName: ModelNodeName, attachmentNodeQualifiers: ModelNodeQualifier[]]
> => {
    const [attachmentNodeName, ...attachmentNodeQualifiers] = attachmentNodeFQN.split(",")
    return $multi(
        attachmentNodeName == "" ? ModelNodeName.ORIGIN : (attachmentNodeName as ModelNodeName),
        attachmentNodeQualifiers as ModelNodeQualifier[],
    )
}
