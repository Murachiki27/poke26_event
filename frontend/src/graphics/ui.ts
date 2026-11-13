import type {Screen} from "./screen.ts";
import { getSheet, getSpriteSheet } from '../data/sheet.ts';

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

// const sheetUiStand = new TileSheet(await loadBinary(urlUi), 256, 256);
// const sheetUI = createSpriteSheet(await loadBinary(urlUi), 256, 256);
// const sheetUI = getSheet('UI');
const binSheetUI = getSpriteSheet('UI');

// function drawText(screen: Screen, ui: HTMLCanvasElement, msg: string, tx: number, ty: number): void {
function drawText(screen: Screen, ui: Uint8Array, msg: string, tx: number, ty: number): void {
    for (let p = 0; p < msg.length; p++) {
        const ch: string = msg.charAt(p);
        if (ch === "　") {
            continue;
        }
        let ch2 = ch;
        if (CH2_SET[ch]) {
            ch2 = CH2_SET[ch];
            screen.blitCell(ui, tx + p, ty - 1, 1, 1, 26, 4);
        } else if (CH3_SET[ch]) {
            ch2 = CH3_SET[ch];
            screen.blitCell(ui, tx + p, ty - 1, 1, 1, 25, 4);
        }

        const i = CHAR_SET.indexOf(ch2);
        if (i === -1) {
            continue;
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
        let u;
        if (x === 0) {
            u = 27;
        } else if (x === tw - 1) {
            u = 29;
        } else {
            u = 28;
        }
        screen.blitCell(ui, tx + x, ty, 1, 1, u, 4);
    }
    for (let x = 0; x < tw; x++) {
        let u;
        if (x === 0) {
            u = 30;
        } else if (x === tw - 1) {
            u = 31;
        } else {
            u = 28;
        }
        screen.blitCell(ui, tx + x, ty + th - 1, 1, 1, u, 4);
    }
    for (let y = 1; y < th - 1; y++) {
        screen.blitCell(ui, tx, ty + y, 1, 1, 0, 5);
    }
    for (let y = 1; y < th - 1; y++) {
        screen.blitCell(ui, tx + tw - 1, ty + y, 1, 1, 0, 5);
    }
}

export function drawWindowUI(screen: Screen, tx: number, ty: number, tw: number, th: number): void {
    // drawWindow(screen, sheetUI.value, tx, ty, tw, th);
    drawWindow(screen, binSheetUI.value, tx, ty, tw, th);
}

// function drawWaitIcon(screen: Screen, ui: HTMLCanvasElement, tx: number, ty: number): void {
function drawWaitIcon(screen: Screen, ui: Uint8Array, tx: number, ty: number): void {
    // screen.drawTile(ui, tx, ty, 1, 1, 24, 4);
    screen.blitCell(ui, tx, ty, 1, 1, 24, 4);
}

export function drawWaitIconUI(screen: Screen, tx: number, ty: number): void {
    // drawWaitIcon(screen, sheetUI.value, tx, ty);
    drawWaitIcon(screen, binSheetUI.value, tx, ty);
}

export function drawSpriteUI(screen: Screen, tx: number, ty: number, tu: number, tv: number): void {
    screen.blitCell(binSheetUI.value, tx, ty, 1, 1, tu, tv);
}
