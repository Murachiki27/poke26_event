import {tileToPixel, type Screen} from "./screen.ts";
import { getSheet, getSpriteSheet } from '../data/sheet.ts';

type CharaOffset = {
    chars: string,
    base: number,
};

const CHAR_SET = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンッャュョァィゥェォあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんっゃゅょぁぃぅぇぉー？！。円0123456789ABCDEFGHIVSLM:×./♂♀「」『』・…";
const CH2_SET: { [key: string]: string } = {
    "ガ": "カ", "ギ": "キ", "グ": "ク", "ゲ": "ケ", "ゴ": "コ",
    "ザ": "サ", "ジ": "シ", "ズ": "ス", "ゼ": "セ", "ゾ": "ソ",
    "ダ": "タ", "ヂ": "チ", "ヅ": "ツ", "デ": "テ", "ド": "ト",
    "バ": "ハ", "ビ": "ヒ", "ブ": "フ", "ベ": "ヘ", "ボ": "ホ",
    "が": "か", "ぎ": "き", "ぐ": "く", "げ": "け", "ご": "こ",
    "ざ": "さ", "じ": "し", "ず": "す", "ぜ": "せ", "ぞ": "そ",
    "だ": "た", "ぢ": "ち", "づ": "つ", "で": "て", "ど": "と",
    "ば": "は", "び": "ひ", "ぶ": "ふ", "べ": "へ", "ぼ": "ほ",
};
const CH3_SET: { [key: string]: string } = {
    "パ": "ハ", "ピ": "ヒ", "プ": "フ", "ペ": "ヘ", "ポ": "ホ",
    "ぱ": "は", "ぴ": "ひ", "ぷ": "ふ", "ぺ": "へ", "ぽ": "ほ",
};
const JP_SETS: CharaOffset[] = [
    {
        base: 6 * 32,
        chars: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンッャュョァィゥェォ"
    },
    {
        base: 8 * 32,
        chars: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんっゃゅょぁぃぅぇぉ"
    },
    {
        base: 10 * 32,
        chars: "ー。、"
    },
    {
        base: 11 * 32,
        chars: "♂♀「」『』・…×©円∞"
    },
];

type Offset = { u: number, v: number };
export const ICON_UVS = {
    jpHandaku: { u: 3, v: 10 },
    jpDakuten: { u: 4, v: 10 },

    frameLT: { u: 0, v: 17 },
    frameH: { u: 1, v: 17 },
    frameRT: { u: 2, v: 17 },
    frameLB: { u: 3, v: 17 },
    frameRB: { u: 4, v: 17 },
    frameV: { u: 5, v: 17 },
    cursorSelected: { u: 6, v: 17 },
    cursor: { u: 7, v: 17 },
    msgPoint: { u: 8, v: 17 },

    compLine: { u: 4, v: 18 },
    charCursor: { u: 5, v: 18 },
};


// const sheetUiStand = new TileSheet(await loadBinary(urlUi), 256, 256);
// const sheetUI = createSpriteSheet(await loadBinary(urlUi), 256, 256);
// const sheetUI = getSheet('UI');
const binSheetUI = getSpriteSheet('UI');

// function drawText(screen: Screen, ui: HTMLCanvasElement, msg: string, tx: number, ty: number): void {
function drawText(screen: Screen, ui: Uint8Array, msg: string, tx: number, ty: number): void {
    const msg1 = msg.replace(/[！-～]/g, (char) => {
        return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
    });

    for (let p = 0; p < msg1.length; p++) {
        const ch: string = msg1.charAt(p);
        const chi: number = msg1.charCodeAt(p);
        let i: number;

        if (chi < 128) {
            i = chi;
        } else {
            if (ch === "　") {
                continue;
            }
            let ch2 = ch;
            if (CH2_SET[ch]) {
                ch2 = CH2_SET[ch];
                screen.blitCell(ui, tx + p, ty - 1, 1, 1, ICON_UVS.jpDakuten.u, ICON_UVS.jpDakuten.v);
            } else if (CH3_SET[ch]) {
                ch2 = CH3_SET[ch];
                screen.blitCell(ui, tx + p, ty - 1, 1, 1, ICON_UVS.jpHandaku.u, ICON_UVS.jpHandaku.v);
            }
            i = -1;
            for (const s of JP_SETS) {
                i = s.chars.indexOf(ch2);
                if (i !== -1) {
                    i = s.base + i;
                    break;
                }
            }
            if (i === -1) {
                continue;
            }
        }
        screen.blitCell(ui, tx + p, ty, 1, 1, i % 32, Math.trunc(i / 32));
    }
}
export function drawTextUI(screen: Screen, msg: string, tx: number, ty: number): void {
    // drawText(screen, sheetUI.value, msg, tx, ty);
    drawText(screen, binSheetUI.value, msg, tx, ty);
}

// function drawWindow(screen: Screen, ui: HTMLCanvasElement, tx: number, ty: number, tw: number, th: number): void {
function drawWindow(screen: Screen, ui: Uint8Array, tx: number, ty: number, tw: number, th: number): void {
    for (let x = 0; x < tw; x++) {
        let off: Offset;
        if (x === 0) {
            off = ICON_UVS.frameLT;
        } else if (x === tw - 1) {
            off = ICON_UVS.frameRT;
        } else {
            off = ICON_UVS.frameH;
        }
        screen.blitCell(ui, tx + x, ty, 1, 1, off.u, off.v);
    }
    for (let x = 0; x < tw; x++) {
        let off: Offset;
        if (x === 0) {
            off = ICON_UVS.frameLB;
        } else if (x === tw - 1) {
            off = ICON_UVS.frameRB;
        } else {
            off = ICON_UVS.frameH;
        }
        screen.blitCell(ui, tx + x, ty + th - 1, 1, 1, off.u, off.v);
    }
    for (let y = 1; y < th - 1; y++) {
        screen.blitCell(ui, tx, ty + y, 1, 1, ICON_UVS.frameV.u, ICON_UVS.frameV.v);
    }
    for (let y = 1; y < th - 1; y++) {
        screen.blitCell(ui, tx + tw - 1, ty + y, 1, 1, ICON_UVS.frameV.u, ICON_UVS.frameV.v);
    }
}

export function drawWindowUI(screen: Screen, tx: number, ty: number, tw: number, th: number): void {
    // drawWindow(screen, sheetUI.value, tx, ty, tw, th);
    drawWindow(screen, binSheetUI.value, tx, ty, tw, th);
}

// function drawWaitIcon(screen: Screen, ui: HTMLCanvasElement, tx: number, ty: number): void {
function drawWaitIcon(screen: Screen, ui: Uint8Array, tx: number, ty: number): void {
    // screen.drawTile(ui, tx, ty, 1, 1, 24, 4);
    screen.blitCell(ui, tx, ty, 1, 1, ICON_UVS.msgPoint.u, ICON_UVS.msgPoint.v);
}

export function drawWaitIconUI(screen: Screen, tx: number, ty: number): void {
    // drawWaitIcon(screen, sheetUI.value, tx, ty);
    drawWaitIcon(screen, binSheetUI.value, tx, ty);
}

export function drawSpriteUI(screen: Screen, tx: number, ty: number, tu: number, tv: number): void {
    screen.blitCell(binSheetUI.value, tx, ty, 1, 1, tu, tv);
}

export function drawSpriteUIRepeat(screen: Screen, tx: number, ty: number, tw: number, th: number, tu: number, tv: number): void {
    for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
            screen.blitCell(binSheetUI.value, tx + x, ty + y, 1, 1, tu, tv);
        }
    }
}
