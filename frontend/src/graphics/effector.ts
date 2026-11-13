let light: number = 0, contrast: number = 0;

export function effectContrast(num: number): void {
    contrast = Math.max(0, Math.min(num, 3));
}

export function effectLight(num: number): void {
    light = Math.max(0, Math.min(num, 3));
}

export function calcEffect(p: number): number {
    p = p >= 1 && contrast >= 1 ? (p === 2 ? 3 : Math.max(contrast, p)) : p;
    return Math.max(p - light, 0);
}


