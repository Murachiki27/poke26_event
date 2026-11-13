import {palletToRgb, TILE_PIXEL} from "../graphics/screen.ts";

export class TileSheet {
    private graphics: CanvasRenderingContext2D;
    public readonly pixels: Uint8Array;
    public readonly width: number;
    public readonly height: number;

    public constructor(pixels: Uint8Array, width: number, height: number) {
        this.pixels = pixels;
        this.width = width;
        this.height = height;

        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        const g = c.getContext('2d', { willReadFrequently: true });
        if (!g) throw new Error('2D context unavailable');
        this.graphics = g;
    }

    public spriteTile(u: number, v: number, w: number, h: number): Sprite {
        return this.sprite(u * TILE_PIXEL, v * TILE_PIXEL, w * TILE_PIXEL, h * TILE_PIXEL);
    }

    public sprite(u: number, v: number, w: number, h: number): Sprite {
        let dat = new Uint8Array(w * h);
        for (let row = 0; row < h; row++) {

            const srcRowStart = (v + row) * this.width + u;
            const srcRowEnd = srcRowStart + w;
            const chunk = this.pixels.subarray(srcRowStart, srcRowEnd);
            const destRowStart = row * w;
            dat.set(chunk, destRowStart);
        }
        return new Sprite(dat, w, h, this.graphics.createImageData(w, h));
    }
}

const Effector = {
    LIGHT_OFF: 0,
    LIGHT_ON: 1,
    CONTRAST_OFF: 2,
    CONTRAST_ON: 3,
} as const;

export type Effector = typeof Effector[keyof typeof Effector];

export class Sprite {
    public readonly pixels: Uint8Array;
    public readonly width: number;
    public readonly height: number;
    private img: ImageData;
    private dirty: boolean = false;

    private light = 0;
    private contrast = 0;

    private effectSchedule: Effector[] = [];
    private currentEffector: Effector | null = null;


    public constructor(pixels: Uint8Array, width: number, height: number, img: ImageData) {
        this.pixels = pixels;
        this.width = width;
        this.height = height;
        this.img = new ImageData(width, height);
        this.sync();
    }

    public addScheduleEffect(schedule: Effector) {
        this.effectSchedule.push(schedule);
    }

    public contrasting(num: number): void {
        const n = this.contrast;
        this.contrast = Math.max(0, Math.min(num, 3));
        this.dirty = this.dirty || (n !== this.contrast);
    }

    public lighting(num: number): void {
        const n = this.light;
        this.light = Math.max(0, Math.min(num, 3));
        this.dirty = this.dirty || (n !== this.light);
    }

    private effect(i: number): number {
        let p = this.pixels[i];

        p = p >= 1 && this.contrast >= 1 ? (p === 2 ? 3 : Math.max(this.contrast, p)) : p;
        p = Math.max(p - this.light, 0);

        return p;
    }

    private sync(): void {
        for (let i = 0; i < this.img.data.length; i += 4) {
            const [r, g, b] = palletToRgb(this.effect(i / 4));
            this.img.data[i] = r;
            this.img.data[i + 1] = g;
            this.img.data[i + 2] = b;
            this.img.data[i + 3] = 255;
        }
        this.dirty = false;
    }

    public update(): void {
        if (this.effectSchedule.length > 0) {
            if (this.currentEffector === null) {
                const s = this.effectSchedule.shift();
                if (s !== undefined) {
                    this.currentEffector = s;
                }
            }
        }

        if (this.currentEffector !== null) {
            switch (this.currentEffector) {
                case Effector.CONTRAST_OFF:
                    if (this.contrast > 0) {
                        this.contrasting(this.contrast - 1);
                    } else {
                        this.currentEffector = null;
                    }
                    break;
                case Effector.CONTRAST_ON:
                    if (this.contrast < 3) {
                        this.contrasting(this.contrast + 1);
                    } else {
                        this.currentEffector = null;
                    }
                    break;
                case Effector.LIGHT_ON:
                    if (this.light < 3) {
                        this.lighting(this.light + 1);
                    } else {
                        this.currentEffector = null;
                    }
                    break;
                default:
                    if (this.light > 0) {
                        this.lighting(this.light - 1);
                    } else {
                        this.currentEffector = null;
                    }
                    break;
            }
        }
    }

    public put(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        if (this.dirty) {
            this.sync();
        }
        ctx.putImageData(this.img, x, y);
    }
}

export function createSpriteSheet(pixels: Uint8Array, width: number, height: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) throw new Error('2D context unavailable');

    const img = g.createImageData(width, height);
    for (let i = 0; i < img.data.length; i += 4) {
        const [r, gr, b] = palletToRgb(pixels[i / 4]);
        img.data[i] = r;
        img.data[i + 1] = gr;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
}
