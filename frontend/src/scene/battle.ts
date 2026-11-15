import { createWindow, SelectorWindow, setActiveWindow } from "../sys/msgbox";
import { Scene, setScene } from "./scene";


const scene: Scene = new Scene();

scene
    .addSelector(["ばなな", "りんご"],
        1, 1, 10, 16, (index) => {
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
                    const arr: string[] = [];
                    for (const dat of data) {
                        arr.push(dat.room_name + ":" + dat.user_name);
                    }

                    const id = createWindow(new SelectorWindow(arr, 0, 2, 16, 20));
                    setActiveWindow(id);
                });
        }
    )

    ;

export { scene };
