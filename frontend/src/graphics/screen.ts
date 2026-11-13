import { SHEET_WIDTH } from "../data/sheet.ts";
import type {Sprite} from "../io/asset.ts";
import { FrameBuffer, type ColorMapper } from "./framebuffer.ts";

export const TILE_PIXEL = 8;
const PALLET = ['#e0f8d0', '#88c070', '#346856', '#081820'] as const;
const PALLET_INDEX = Object.fromEntries(PALLET.map((value, index) => [value, index]));

export function rgbToPallet(r: number, g: number, b: number): number {
    const c = ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
    const key = '#' + c.toString(16).padStart(6, '0');
    if (Object.hasOwn(PALLET_INDEX, key)) {
        return PALLET_INDEX[key];
    }
    throw new Error("Unsupported pixel color " + key);
}

export function palletToRgb(index: number): [number, number, number] {
    return hexToRgb(PALLET[index]);
}

export function hexToRgb(hex: string): [number, number, number] {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function tileToPixel(p: number): number {
    return p * TILE_PIXEL;
}

export function pixelToTile(p: number): number {
    return Math.floor(p / TILE_PIXEL);
}

export class Screen {
    public readonly canvas: HTMLCanvasElement;
    public readonly width: number;
    public readonly height: number;

    private screenCtx: CanvasRenderingContext2D;
    private buf: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private frameData: ImageData;
    private frameBuffer: FrameBuffer;

    private scale: number = 1;

    public constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.canvas = canvas;
        const screenCtx = canvas.getContext('2d');
        if (!screenCtx) throw new Error('2D context unavailable');
        this.screenCtx = screenCtx;

        // 160x144 の論理画面（描画はすべてここに行う）
        this.buf = document.createElement('canvas');
        this.buf.width = width;
        this.buf.height = height;
        this.width = width;
        this.height = height;
        const ctx = this.buf.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('2D context unavailable');
        ctx.imageSmoothingEnabled = false;
        this.ctx = ctx;
        
        this.frameData = ctx.createImageData(width, height);
        this.frameBuffer = new FrameBuffer(width, height);

        this.rescale();
    }

    public rescale(): void {
        const dpr = window.devicePixelRatio || 1;
        this.scale = Math.max(1, Math.floor(Math.min((innerWidth * dpr) / this.width, (innerHeight * dpr) / this.height)));
        this.canvas.width = this.width * this.scale; // ※ 変更すると描画状態がリセットされる
        this.canvas.height = this.height * this.scale;
        this.screenCtx.imageSmoothingEnabled = false;
        this.canvas.style.width = `${this.canvas.width / dpr}px`;
        this.canvas.style.height = `${this.canvas.height / dpr}px`;
        // 中央寄せもデバイスピクセル単位の整数に揃える（半ピクセルずれ防止）
        this.canvas.style.left = `${Math.floor((innerWidth * dpr - this.canvas.width) / 2) / dpr}px`;
        this.canvas.style.top = `${Math.floor((innerHeight * dpr - this.canvas.height) / 2) / dpr}px`;
    }

    public clearBuffer(): void {
        this.frameBuffer.clear(0);
    }

    public setEffector(effector: ColorMapper): void {
        this.frameBuffer.setColorMapper(effector);
    }

    public render(): void {
        this.frameBuffer.store(this.frameData);
        this.ctx.putImageData(this.frameData, 0, 0);
        this.screenCtx.drawImage(this.buf, 0, 0, this.width * this.scale, this.height * this.scale);
    }

    public getCanvasContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public coordScreenToLocal(x: number, y: number): [number, number] {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = x - rect.left;
        const clickY = y - rect.top;
        return [Math.floor(clickX * (this.width / rect.width)), Math.floor(clickY * (this.height / rect.height))];
    }

    public drawSpriteTile(s: Sprite, x: number, y: number): void {
        s.put(this.ctx, x * TILE_PIXEL, y * TILE_PIXEL);
    }

    public drawImageDirect(
        img: CanvasImageSource,
        x: number, y: number, w: number, h: number,
        u?: number, v?: number, uW?: number, uH?: number
    ): void {
        this.ctx.drawImage(img, u ?? 0, v ?? 0, uW ?? 256, uH ?? 256, x, y, w, h);
    }

    public blitImage(img: Uint8Array, x: number, y: number, w: number, h: number, u: number, v: number): void {
        this.frameBuffer.blit(img, x, y, w, h, u, v, 1, SHEET_WIDTH);
    }

    public blitCell(img: Uint8Array, tx: number, ty: number, tw: number, th: number, tu: number, tv: number): void {
        const w = tw * TILE_PIXEL, h = th * TILE_PIXEL;
        this.blitImage(img, tx * TILE_PIXEL, ty * TILE_PIXEL, w, h, tu * TILE_PIXEL, tv * TILE_PIXEL);
    }

    public drawTile(
        img: CanvasImageSource, tx: number, ty: number, tw: number, th: number, tu: number, tv: number
    ): void {
        const w = tw * TILE_PIXEL, h = th * TILE_PIXEL;
        this.drawImageDirect(img, tx * TILE_PIXEL, ty * TILE_PIXEL, w, h, tu * TILE_PIXEL, tv * TILE_PIXEL, w, h);
    }

    // ---- 描画パーツ ----------------------------------------------------
    public drawRect(x: number, y: number, w: number, h: number, color: string): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }
}

