import { createSpriteSheet } from "../io/asset";
import { loadBinary } from "../io/sgb";
import { DefferedConst } from "../util/ref";

export const SHEET_TYPE = {
    UI: {
        index: 0,
        path: 'assets/sheet/ui.sgb',
    },
    OP: {
        index: 1,
        path: 'assets/sheet/op.sgb',
    },
} as const;
export type SheetType = keyof typeof SHEET_TYPE;

export const SHEET_WIDTH = 256;
export const SHEET_HEIGHT = 256;

const _sheets: DefferedConst<HTMLCanvasElement>[] = Array(Object.keys(SHEET_TYPE).length).fill(null).map(() => new DefferedConst<HTMLCanvasElement>());
const _binSheets: DefferedConst<Uint8Array>[] = Array(Object.keys(SHEET_TYPE).length).fill(null).map(() => new DefferedConst<Uint8Array>());

export async function loadSheets(): Promise<void> {
    for (const url of Object.values(SHEET_TYPE)) {
        const bin = await loadBinary(url.path);
        const sheet = createSpriteSheet(bin, SHEET_WIDTH, SHEET_HEIGHT);
        _binSheets[url.index].value = bin;
        _sheets[url.index].value = sheet;
    }
}

export function getSheet(type: SheetType): DefferedConst<HTMLCanvasElement> {
    const index = SHEET_TYPE[type].index;
    return _sheets[index];
}

export function getSpriteSheet(type: SheetType): DefferedConst<Uint8Array> {
    const index = SHEET_TYPE[type].index;
    return _binSheets[index];
}
