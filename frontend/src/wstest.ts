import "./wstest.css";

type User = {
  id: string;
  name: string;
  room_id?: string;
  room_code?: string;
};

type Room = {
  id: string;
  name: string;
};

type RoomCode = {
  code: string;
}


const CONFIG = {
  wsUrl: "ws://192.168.11.32/ws/",

  endpoints: {
    users: "/api/user",
    createUser: "/api/user",
    rooms: "/api/room",
    createRoom: "/api/room",
  },
};

let selectedUser: User | null = null;
let currentRoom: Room | null = null;
let currentRoomCode: RoomCode | null = null;
let socket: WebSocket | null = null;

const userNameInput = document.querySelector<HTMLInputElement>(
  "#user-name"
)!;

const createUserButton = document.querySelector<HTMLButtonElement>("#create-user")!;
const refreshUsersButton = document.querySelector<HTMLButtonElement>("#refresh-users")!;
const userList = document.querySelector<HTMLSelectElement>("#user-list")!;

const roomNameInput = document.querySelector<HTMLInputElement>("#room-name")!;
const createRoomButton = document.querySelector<HTMLButtonElement>("#create-room")!;
const refreshRoomsButton = document.querySelector<HTMLButtonElement>("#refresh-rooms")!;
const roomList = document.querySelector<HTMLSelectElement>("#room-list")!;
const roomCodeInput = document.querySelector<HTMLInputElement>("#room-code")!;
const joinRoomButton = document.querySelector<HTMLButtonElement>("#join-room")!;

const connectButton = document.querySelector<HTMLButtonElement>(
  "#connect-ws"
)!;

const joinButton = document.querySelector<HTMLButtonElement>(
  "#join-room-ws"
)!;

const readyButton = document.querySelector<HTMLButtonElement>(
  "#ready"
)!;

const leaveButton = document.querySelector<HTMLButtonElement>(
  "#leave-room"
)!;
const debugButton = document.querySelector<HTMLButtonElement>(
  "#debug-room"
)!;

const statusElement = document.querySelector<HTMLDivElement>(
  "#status"
)!;

const logElement = document.querySelector<HTMLPreElement>(
  "#log"
)!;


/**
 * ログ表示
 */
function log(message: unknown) {
  const time = new Date().toLocaleTimeString();

  const text =
    typeof message === "string"
      ? message
      : JSON.stringify(message, null, 2);

  logElement.textContent += `[${time}] ${text}\n`;
  logElement.scrollTop = logElement.scrollHeight;

  console.log(message);
}


/**
 * ステータス更新
 */
function setStatus(message: string) {
  statusElement.textContent = message;
}


/**
 * JSONレスポンスを取得する共通関数
 */
async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const response = await fetch(`${path}`, {
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `API Error: ${response.status} ${response.statusText}\n${text}`
    );
  }
  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  console.log('api() code: ' + response.status + ", body:" + text);
  // レスポンスボディが空
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("JSON parse error:", text);

    throw new Error(
      `レスポンスがJSONではありません: ${text}`
    );
  }
}


/**
 * ユーザー一覧取得
 */
async function fetchUsers() {
  try {
    log("ユーザー一覧を取得中...");

    const users = await api<User[]>(CONFIG.endpoints.users);

    userList.innerHTML = "";
    users!.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.name} (${user.id})`;
      userList.appendChild(option);
    });

    if (users!.length > 0) {
      selectedUser = users![0];
    }
    log({
      message: "ユーザー一覧取得成功",
      users,
    });
  } catch (error) {
    log(`ユーザー一覧取得失敗: ${String(error)}`);
  }
}


/**
 * ユーザー新規作成
 */
async function createUser() {
  const userName = userNameInput.value.trim();

  if (!userName) {
    alert("ユーザー名を入力してください");
    return;
  }

  try {
    log(`ユーザー作成: ${userName}`);
    const user = await api<User>(
      CONFIG.endpoints.createUser,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
        }),
      }
    );

    log({
      message: "ユーザー作成成功",
      user,
    });

    userNameInput.value = "";

    await fetchUsers();

    selectedUser = user;
    userList.value = user!.id;
    setStatus(
      `選択ユーザー: ${user!.name} (${user!.id})`
    );
  } catch (error) {
    log(`ユーザー作成失敗: ${String(error)}`);
  }
}


/**
 * ユーザー選択変更
 */
userList.addEventListener("change", async () => {
  const userId = userList.value;

  const selectedOption = userList.selectedOptions[0];
  const userRoom = await api<User>('/api/user?user_id=' + userId);

  selectedUser = {
    id: userId,
    name: selectedOption.textContent ?? "",
  };
  if (userRoom?.room_id) {
    selectedUser.room_id = userRoom.room_id;
    selectedUser.room_code = userRoom.room_code;
  }

  setStatus(`選択ユーザー: ${selectedUser.id} ${selectedUser.room_id ? ('RoomID:' + selectedUser.room_id + ', Code:' + selectedUser.room_code) : ''}`);

  log({
    message: "ユーザー選択",
    user: selectedUser,
  });
});


/**
 * Room一覧取得
 */
async function fetchRooms() {
  try {
    log("Room一覧を取得中...");

    const rooms = await api<Room[]>(
      CONFIG.endpoints.rooms
    );

    roomList.innerHTML = "";

    rooms!.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.id;
      option.textContent =
        `${room.name} (${room.id})`;

      roomList.appendChild(option);
    });

    log({
      message: "Room一覧取得成功",
      rooms,
    });
  } catch (error) {
    log(`Room一覧取得失敗: ${String(error)}`);
  }
}


/**
 * Room作成
 */
async function createRoom() {
  if (!selectedUser) {
    alert("先にユーザーを選択してください");
    return;
  }

  const roomName = roomNameInput.value.trim();

  if (!roomName) {
    alert("Room名を入力してください");
    return;
  }

  try {
    log({
      message: "Room作成開始",
      user_id: selectedUser.id,
      name: roomName,
    });

    const roomCode = await api<RoomCode>(
      CONFIG.endpoints.createRoom,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          name: roomName,
        }),
      }
    );

    currentRoomCode = roomCode;

    roomNameInput.value = "";

    log({
      message: "Room作成成功",
      roomCode,
    });

    await fetchRooms();

    setStatus(
      `Room作成完了`
    );
  } catch (error) {
    log(`Room作成失敗: ${String(error)}`);
  }
}

/**
 * Room選択
 */
roomList.addEventListener("change", () => {
  if (!selectedUser) {
    alert("先にユーザーを選択してください");
    return;
  }
  const roomId = roomList.value;
  const selectedOption = roomList.selectedOptions[0];
  

  currentRoom = {
    id: roomId,
    name: selectedOption.textContent ?? "",
  };

  log({
    message: "Room選択",
    room: currentRoom,
  });
});

/**
 * Room参加
 */
async function joinRoom() {
  if (!selectedUser) {
    alert("先にユーザーを選択してください");
    return;
  }

  const roomCode = roomCodeInput.value.trim();
  if (!roomCode) {
    alert("Roomコードを入力してください");
    return;
  }

  try {
    log({
      message: "Room参加開始",
      user_id: selectedUser.id,
      code: roomCode,
    });

    await api(
      '/api/room',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          code: roomCode,
        }),
      }
    );

    log({message: "Room参加成功"});
    setStatus(`Room参加完了`);
  } catch (error) {
    log(`Room参加失敗: ${String(error)}`);
  }
}

/**
 * WebSocket接続
 */
function connectWebSocket() {
  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    log("WebSocketは既に接続されています");
    return;
  }

  log(`WebSocket接続開始: ${CONFIG.wsUrl}`);

  socket = new WebSocket(CONFIG.wsUrl);

  socket.addEventListener("open", () => {
    log("WebSocket接続成功");
    setStatus("WebSocket: 接続済み");
  });

  socket.addEventListener("message", (event) => {
    let data: unknown = event.data;

    try {
      data = JSON.parse(event.data);
    } catch {
      // JSONではない場合はそのまま表示
    }

    log({
      message: "WebSocket受信",
      data,
    });
  });

  socket.addEventListener("close", (event) => {
    log({
      message: "WebSocket切断",
      code: event.code,
      reason: event.reason,
    });

    setStatus("WebSocket: 切断");
  });

  socket.addEventListener("error", (event) => {
    log({
      message: "WebSocketエラー",
      event,
    });
  });
}


/**
 * WebSocket送信
 */
function sendWebSocket(data: unknown) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert("WebSocketが接続されていません");
    return;
  }

  const json = JSON.stringify(data);

  socket.send(json);

  log({
    message: "WebSocket送信",
    data,
  });
}


/**
 * join送信
 */
function joinRoomWs() {
  if (!selectedUser) {
    alert("ユーザーを選択してください");
    return;
  }

  if (!currentRoom) {
    alert("Roomを作成または選択してください");
    return;
  }

  sendWebSocket({
    type: "join",
    user_id: Number(selectedUser.id),
    room_id: Number(currentRoom.id),
  });
}


/**
 * ready送信
 */
function sendReady() {
  if (!selectedUser) {
    alert("ユーザーを選択してください");
    return;
  }

  if (!currentRoom) {
    alert("Roomを選択してください");
    return;
  }

  sendWebSocket({
    type: "ready",
    user_id: Number(selectedUser.id),
  });
}


/**
 * leave送信
 */
function leaveRoom() {
  if (!selectedUser) {
    alert("ユーザーを選択してください");
    return;
  }

  if (!currentRoom) {
    alert("Roomを選択してください");
    return;
  }

  sendWebSocket({
    type: "leave",
    user_id: Number(selectedUser.id),
  });
}

function debugRoom() {
  if (!selectedUser) {
    alert("ユーザーを選択してください");
    return;
  }

  sendWebSocket({
    type: "debug",
    user_id: Number(selectedUser.id),
  });
}


/**
 * イベント登録
 */
createUserButton.addEventListener("click", createUser);
refreshUsersButton.addEventListener("click", fetchUsers);
createRoomButton.addEventListener("click", createRoom);
refreshRoomsButton.addEventListener("click", fetchRooms);
joinRoomButton.addEventListener("click", joinRoom);

connectButton.addEventListener("click", connectWebSocket);
joinButton.addEventListener("click", joinRoomWs);
readyButton.addEventListener("click", sendReady);

leaveButton.addEventListener("click", leaveRoom);
debugButton.addEventListener("click", debugRoom);

/**
 * 初期化
 */
async function initialize() {
  setStatus("初期化中...");

  await fetchUsers();
  await fetchRooms();

  setStatus("準備完了");
}

initialize();