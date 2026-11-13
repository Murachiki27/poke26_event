const socket = new WebSocket("ws://192.168.11.32/ws/");

socket.onopen = () => {
  console.log("WebSocket connected");
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message);
};

socket.onclose = () => {
  console.log("WebSocket closed.");
};

socket.onerror = (error) => {
  console.error("WebSocket error", error);
};

const canvasEl = document.getElementById('app');
if (!(canvasEl instanceof HTMLCanvasElement)) throw new Error('#app canvas not found');

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const pTag = document.createElement("p");
const n = getRandomInt(100);
const num = n + "";
pTag.textContent = num;

console.log('UserId:' + n);

canvasEl.appendChild(pTag);

function key(this: Window, ev: KeyboardEvent) {
    if (ev.key === '1') {
      socket.send(JSON.stringify({
        type: "user_id",
        user_id: n,
      }));
    }
    if (ev.key === '2') {
        socket.send(JSON.stringify({
          type: "ready",
          user_id: n,
          uuid: num,
        }));
    }
  if (ev.key === 'f') {
        socket.send(JSON.stringify({
          type: "debug",
          user_id: n,
          uuid: num,
        }));
    }
}
addEventListener('keypress', key);

