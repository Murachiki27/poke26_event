import { tileToPixel } from "../graphics/screen";

export const isMobile = window.matchMedia('(max-width: 767px)').matches;

export const SCREEN_TILE_WIDTH = isMobile ? 16 : 20;
export const SCREEN_TILE_HEIGHT = isMobile ? 30 : 18;

export const SCREEN_PIXEL_WIDTH = tileToPixel(SCREEN_TILE_WIDTH);
export const SCREEN_PIXEL_HEIGHT = tileToPixel(SCREEN_TILE_HEIGHT);
