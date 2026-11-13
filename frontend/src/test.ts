import { FrameBuffer } from "./graphics/framebuffer";

const canvasEl = document.getElementById('app');
if (!(canvasEl instanceof HTMLCanvasElement)) throw new Error('#app canvas not found');
const canvas = canvasEl;
const width = 16, height = 16;

const tex1 = new Uint8Array([
    0, 0, 1, 1, 0, 0,
    1, 2, 2, 2, 2, 1,
    0, 1, 1, 1, 1, 1,
    1, 2, 3, 0, 2, 0,
    1, 3, 3, 2, 1, 1,
    0, 1, 1, 1, 0, 0,
]);


const fb = new FrameBuffer(width, height);

const screenCtx = canvasEl.getContext('2d');
if (!screenCtx) throw new Error('2D context unavailable');
const scCtx = screenCtx;

const buf = document.createElement('canvas');
const ctx = buf.getContext('2d', { willReadFrequently: true });
if (!ctx) throw new Error('2D context unavailable');
const img = ctx.createImageData(width, height);
let scale = 1;

let x = 1, y = 1;

function _rescale() {
    const dpr = window.devicePixelRatio || 1;
    scale = Math.max(1, Math.floor(Math.min((innerWidth * dpr) / width, (innerHeight * dpr) / height)));
    canvas.width = width * scale; // ※ 変更すると描画状態がリセットされる
    canvas.height = height * scale;
    scCtx.imageSmoothingEnabled = false;
    canvas.style.width = `${canvas.width / dpr}px`;
    canvas.style.height = `${canvas.height / dpr}px`;
    // 中央寄せもデバイスピクセル単位の整数に揃える（半ピクセルずれ防止）
    canvas.style.left = `${Math.floor((innerWidth * dpr - canvas.width) / 2) / dpr}px`;
    canvas.style.top = `${Math.floor((innerHeight * dpr - canvas.height) / 2) / dpr}px`;
}

function _render() {
    fb.clear(0);
    fb.blit(tex1, x, y, 6, 6, 0, 0, 1, 6);
    fb.store(img);
    ctx?.putImageData(img, 0, 0);
    scCtx.drawImage(buf, 0, 0, width * scale, height * scale);
    requestAnimationFrame(_render);
}
_rescale();
addEventListener('resize', _rescale);
requestAnimationFrame(_render);

function key(this: Window, ev: KeyboardEvent) {
    if (ev.key === 'w') {
        y--;
        y = Math.min(Math.max(y, 0), height);
    }
    if (ev.key === 's') {
        y++;
        y = Math.min(Math.max(y, 0), height);
    }
    if (ev.key === 'a') {
        x--;
        x = Math.min(Math.max(x, 0), width);
    }
    if (ev.key === 'd') {
        x++;
        x = Math.min(Math.max(x, 0), width);
    }

    if (ev.key === 'p') {
        fb.setColorMapper(p => Math.min(p + 1, 3));
    }
}

addEventListener('keypress', key);
