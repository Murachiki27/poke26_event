import { palletToRgb } from "./screen";

export type ColorValue = 0 | 1 | 2 | 3;

export type ColorMapper = (val: number) => number;

export class FrameBuffer {

    private readonly buf: Uint8Array;
    private readonly width: number;
    private readonly height: number;
    private mapper: ColorMapper | null = null;

    public constructor(width: number, height: number) {
        this.buf = new Uint8Array(width * height);
        this.width = width;
        this.height = height;
    }

    public setColorMapper(mapper: ColorMapper): void {
        this.mapper = mapper;
    }

    public clear(color: ColorValue): void {
        this.buf.fill(color);
    }

    public blit(src: Uint8Array, x: number, y: number, w: number, h: number, u: number, v: number, scale: number, srcW: number): void {
        this._blit(src, x, y, w, h, u, v, scale, srcW);
    }

    private _blit(src: Uint8Array, x: number, y: number, w: number, h: number, u: number, v: number, scale: number, sw: number, transparent: ColorValue | null = null): void {
        if (w <= 0 || h <= 0 || scale <= 0) return;

        // 画面内にクリップした描画先範囲
        const x0 = Math.max(0, x);
        const y0 = Math.max(0, y);
        const x1 = Math.min(this.width, x + w);
        const y1 = Math.min(this.height, y + h);
        if (x0 >= x1 || y0 >= y1) return;

        // 等倍：行ごとにコピー
        if (scale === 1) {
            const len = x1 - x0;
            for (let dy = y0; dy < y1; dy++) {
                const si = (v + dy - y) * sw + u + (x0 - x);
                const di = dy * this.width + x0;
                if (transparent === null) {
                    this.buf.set(src.subarray(si, si + len), di);
                } else {
                    for (let i = 0; i < len; i++) {
                        const c = src[si + i];
                        if (c !== transparent)
                            this.buf[di + i] = c;
                    }
                }
            }
        } else {

        }
    }

    public store(img: ImageData): void {
        for (let i = 0; i < this.buf.length; i++) {
            const j = i * 4;
            let p = this.buf[i];
            if (this.mapper !== null) {
                p = this.mapper(p);
            }
            const [r, gr, b] = palletToRgb(p);
            img.data[j] = r;
            img.data[j + 1] = gr;
            img.data[j + 2] = b;
            img.data[j + 3] = 255;
        }
    }
}