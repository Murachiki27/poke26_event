import { SCREEN_TILE_HEIGHT, SCREEN_TILE_WIDTH } from "../sys/device";
import { Scene, setScene } from "./scene";
import { scene as openingScene } from './opening.ts';
import { scene as battleScene } from './battle.ts';

const w = SCREEN_TILE_WIDTH - 4;
const h = SCREEN_TILE_HEIGHT - 6;
const x = Math.trunc(SCREEN_TILE_WIDTH / 2 - w / 2);
const y = Math.trunc(SCREEN_TILE_HEIGHT / 2 - h / 2);


function sceneSelect(index: number): void {
    switch (index) {
        case 0:
            setScene(openingScene);
            break;
        case 1:
            setScene(battleScene);
            break;
    }
}

const scene: Scene = new Scene();

scene
    .addSelector(["オープニングテスト", "バトルテスト"],
        x, y, w, h, sceneSelect
    )
    
    ;



export { scene };
