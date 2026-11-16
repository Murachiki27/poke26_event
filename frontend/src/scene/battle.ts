import { createWindow, deleteWindow, setActiveWindow } from "../sys/msgbox";
import { UISelector } from "../sys/uibase";
import { createScene, input, Scene, selector, selectorFunc, setScene, wait } from "./scene";


let fetchRooms = false;
let rooms: string[] = [];

let roomElId = -1;

export const scene = createScene([
    selector({ items: ["ばなな", "りんご"], tx: 1, ty: 1, tileWidth: 10, tileHeight: 16 }, (index) => {
        // const response = await fetch('/api/room.php', {
        //     method: 'GET',
        //     headers: {
        //     'Content-Type': 'application/json', // Content-TypeをJSONに変更
        //     },
        //     body: JSON.stringify({ ans: trimmedInput }), // オブジェクトをJSON文字列に変換
        // });
        fetch(`/api/room`)
            .then(res => {
                return res.json();
            }).then(data => {
                rooms = [];
                for (const dat of data) {
                    rooms.push(dat.id + ":" + dat.name);
                }
                fetchRooms = true;
            }
        );
    }),
    wait(() => !fetchRooms),
    selectorFunc((screen) => { return { items: rooms, tx: 0, ty: 2, tileWidth: 16, tileHeight: 20, showAfter: true } }, (index, elId) => {
        roomElId = elId;
    }),
    input({
        input: { name: 'ルームコード', tx: 1, ty: 6, tileWidth: 14, tileHeight: 5, maxLength: 6 },
        button: { label: { value: 'けってい', tx: 6, ty: 12 }, tx: 5, ty: 11, tileWidth: 6, tileHeight: 3 },
    }, (value) => {
        
        deleteWindow(roomElId);
    }),

    
]);
