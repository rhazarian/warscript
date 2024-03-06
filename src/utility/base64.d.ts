interface Base64Encoder {
    readonly __base64Encoder: unique symbol
}

interface Base64Decoder {
    readonly __base64Decoder: unique symbol
}

export function makeencoder(this: void, s62: string, s63: string, padding: string): Base64Encoder
export function makedecoder(this: void, s62: string, s63: string, padding: string): Base64Decoder

export function encode(
    this: void,
    raw: string,
    encoder?: Base64Encoder,
    useCaching?: boolean
): string
export function decode(
    this: void,
    encoded: string,
    decoder?: Base64Decoder,
    useCaching?: boolean
): string
