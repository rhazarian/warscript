export function keypair(
    this: void,
    seed?: string
): LuaMultiReturn<[privateKey: string, publicKey: string]>
export function sign(this: void, privateKey: string, data: string): string
export function verify(this: void, publicKey: string, signature: string, data: string): boolean
