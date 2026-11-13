export const W = 256, H = 256, SIZE = W * H, BYTES = SIZE / 4;

export function unpack(bytes: Uint8Array): Uint8Array {
    if (bytes.length !== BYTES)
        throw new Error(`サイズが不正です(${bytes.length} bytes / 期待値 ${BYTES} bytes)`);
    const px = new Uint8Array(SIZE);
    for (let i = 0; i < BYTES; i++) {
        const b = bytes[i], j = i * 4;
        px[j] = b >> 6;
        px[j + 1] = (b >> 4) & 3;
        px[j + 2] = (b >> 2) & 3;
        px[j + 3] = b & 3;
    }
    return px;
}

export async function loadBinary(url: URL|string): Promise<Uint8Array> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return unpack(new Uint8Array(arrayBuffer));
}
