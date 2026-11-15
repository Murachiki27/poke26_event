import { SCREEN_TILE_HEIGHT, SCREEN_TILE_WIDTH } from "../sys/device";
import { Scene, setScene } from "./scene";
import { scene as openingScene } from './opening.ts';
import { scene as battleScene } from './battle.ts';
import { makeScene as makeInputScene } from './input.ts';
import type { Screen } from "../graphics/screen.ts";

const w = SCREEN_TILE_WIDTH - 4;
const h = SCREEN_TILE_HEIGHT - 6;
const x = Math.trunc(SCREEN_TILE_WIDTH / 2 - w / 2);
const y = Math.trunc(SCREEN_TILE_HEIGHT / 2 - h / 2);

export function makeScene(screen: Screen): Scene {
    function sceneSelect(index: number): void {
        switch (index) {
            case 0:
                setScene(openingScene);
                break;
            case 1:
                setScene(battleScene);
                break;
            case 2:
                setScene(makeInputScene(screen));
                break;
        }
    }
    const scene: Scene = new Scene();

    scene
        .addSelector(["オープニングテスト", "バトルテスト", "にゅうりょく"],
            x, y, w, h, sceneSelect
        )
        
        ;

    return scene;
}