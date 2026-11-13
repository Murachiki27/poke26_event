import '@fontsource/press-start-2p';
import './style.css';

import { loadSheets } from './data/sheet.ts';

import {Screen, tileToPixel} from './graphics/screen.ts';

// import urlUi from './assets/ui.sgb?url';
// import {loadBinary} from "./io/sgb.ts";
// import {createSpriteSheet} from "./io/asset.ts";
// import {drawText, drawWindow} from "./graphics/ui.ts";
import {clickScene, renderScene, setScene, updateScene} from "./scene/scene.ts";
import { onMsgBoxStepAction, renderMsgBox, renderUI, updateMsgBox } from './sys/msgbox.ts';
import { calcEffect } from './graphics/effector.ts';
// import { scene as openingScene } from './scene/opening.ts';
import { SCREEN_PIXEL_HEIGHT, SCREEN_PIXEL_WIDTH } from './sys/device.ts';
import { scene as sceneDebug } from './scene/debug.ts';

// ---- 画面設定 (DMG: 160x144 / 4階調) -------------------------------


const FPS = 4194304 / 70224; // 約 59.7275 Hz
const FRAME_MS = 1000 / FPS;

const canvasEl = document.getElementById('app');
if (!(canvasEl instanceof HTMLCanvasElement)) throw new Error('#app canvas not found');


const screen: Screen = new Screen(canvasEl, SCREEN_PIXEL_WIDTH, SCREEN_PIXEL_HEIGHT);

screen.setEffector(p => calcEffect(p));

// const opImg: HTMLCanvasElement = createSpriteSheet(await loadBinary(urlOp), i => hexToRgb(PAL[i]));
// const uiImg: HTMLCanvasElement = createSpriteSheet(await loadBinary(urlUi), i => hexToRgb(PAL[i]));

// const sheetCharaStand = new TileSheet(await loadBinary(urlOp), 256, 256);

// const sheetUI = createSpriteSheet(await loadBinary(urlUi), 256, 256);

// const okido = sheetCharaStand.spriteTile(0, 0, 7, 7);
// okido.lighting(3);
// okido.contrasting(3);
// okido.addScheduleEffect(Effector.LIGHT_OFF);
// okido.addScheduleEffect(Effector.CONTRAST_OFF);



let upper = 0;
let isChangedMsg = true;
let msgIndex = 0;

function pushMsg(): void {
    lines[0] = lines[1];
    lines[1] = msgs[msgIndex];
    msgIndex++;
}

let lines = ['', ''];
const msgs = [
    "…やれやれ　こんどは　だれじゃ。",
    "うぉっほん…　ようこそ！",
    "ポケット　モンスターの　せかいへ",
    "はろー　わーるどっちゅうことかの",
    "どれ　ちょっとみてみようかね",
];

pushMsg();
pushMsg();

// function ticks(now: number) {
//     screen.drawRect(0, 0, W, H, PAL[0]);
//
//     screen.drawTile(opImg, 6, 4, 7, 7, 0, 0);
//
//
//
//     let uy = 0;
//     if (now < upper) {
//         uy = Math.trunc((1 - (upper - now) / 300) * 2);
//     } else if (!isChangedMsg) {
//         isChangedMsg = true;
//         pushMsg();
//     }
//
//     for (let i = 0; i < 2; i++) {
//         drawText(screen, uiImg, lines[i], 1, 14 + i * 2 - uy);
//     }
//
//     drawWindow(screen, uiImg, 0, 12, 20, 6);
//
//
//     // screen.drawImageDirect(uiImg, 0, 0, 256, 256);
//     screen.render();
//     requestAnimationFrame(ticks);
// }

await loadSheets();

setScene(sceneDebug);
// let started = false;

let tickCount = 0;
function ticks(now: number): void {
    tickCount++;

    updateMsgBox();

    if (tickCount % 2 === 0) {
        // okido.update();
        updateScene(screen, now);
    }
}

function render(): void {
    // screen.drawRect(0, 0, W, H, PAL[0]);
    screen.clearBuffer();
    // screen.drawTile(opImg, 6, 4, 7, 7, 0, 0);

    // screen.drawSpriteTile(okido, 6, 4);
    renderMsgBox(screen);
    renderUI(screen);
    renderScene(screen);


    // effector.render();
    screen.render();
}


let lastTime: number = 0;
let accumulator: number = 0;
function loop(now: number): void {
    if (lastTime === 0) {
        lastTime = now;
    }

    // タブ復帰などによる大量の追いつき処理を防ぐ
    const delta: number = Math.min(now - lastTime, 100);
    lastTime = now;
    accumulator += delta;

    let changed: boolean = false;

    while (accumulator >= FRAME_MS) {
        ticks(now);
        accumulator -= FRAME_MS;
        changed = true;
    }

    if (changed) {
        render();
    }
    requestAnimationFrame(loop);
}

function pointerClick(this: HTMLCanvasElement, ev: PointerEvent): void {
    if (msgIndex < msgs.length) {
        upper = performance.now() + 300;
        isChangedMsg = false;
    }
    // const rect = canvas.getBoundingClientRect();
    const [x, y] = screen.coordScreenToLocal(ev.clientX, ev.clientY);
    
    // // ブラウザ上のクリック位置を計算
    // const clickX = ev.clientX - rect.left;
    // const clickY = ev.clientY - rect.top;
    
    // // CSSサイズとCanvas内部の解像度比率を計算して補正
    // const x = clickX * (canvas.width / rect.width);
    // const y = clickY * (canvas.height / rect.height);
    // console.log(ev.x, ev.y);
    onMsgBoxStepAction(x, y);
    clickScene(screen);
    // if (!started) {
    //     setScene(openingScene);
    //     started = true;
    // }
}

addEventListener('resize', screen.rescale);
requestAnimationFrame(loop);

screen.canvas.addEventListener('pointerdown', pointerClick);



