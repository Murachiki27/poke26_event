// ---- フォーマット: .sgb ---------------------------------------------
// ヘッダなし。256x256 を左上から右へ、上から下へ(行優先)。
// 1ピクセル2bit(0〜3)、1バイトに4ピクセル、先頭ピクセルが上位ビット。
//   byte = p0<<6 | p1<<4 | p2<<2 | p3   → 合計 16384 バイト
const W = 256, H = 256, SIZE = W * H, BYTES = SIZE / 4;
const PALETTE = ['#e0f8d0', '#88c070', '#346856', '#081820'];
const RGB = PALETTE.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));

export function pack(px) {
  const out = new Uint8Array(BYTES);
  for (let i = 0; i < BYTES; i++) {
    const j = i * 4;
    out[i] = (px[j] << 6) | (px[j + 1] << 4) | (px[j + 2] << 2) | px[j + 3];
  }
  return out;
}
export function unpack(bytes) {
  if (bytes.length !== BYTES) throw new Error(`サイズが不正です(${bytes.length} bytes / 期待値 ${BYTES} bytes)`);
  const px = new Uint8Array(SIZE);
  for (let i = 0; i < BYTES; i++) {
    const b = bytes[i], j = i * 4;
    px[j] = b >> 6; px[j + 1] = (b >> 4) & 3; px[j + 2] = (b >> 2) & 3; px[j + 3] = b & 3;
  }
  return px;
}

// ---- 状態 -----------------------------------------------------------
const $ = id => document.getElementById(id);
const canvas = $("canvas"), overlay = $("overlay"), statusEl = $("status");
const ctx = canvas.getContext("2d");
const img = ctx.createImageData(W, H);
let px = new Uint8Array(SIZE);
let tool = "pen", color = 3, zoom = 3;
let undoStack = [], redoStack = [];
let sel = null; // 選択範囲 {x, y, w, h}
let flt = null; // 持ち上げ中のピクセル (w*h)。nullなら未移動
const box = $("selbox");
const cl = (v, m) => Math.max(0, Math.min(m - 1, v));

function say(msg, err = false) { statusEl.textContent = msg; statusEl.classList.toggle("err", err); }

function render() {
  const d = img.data;
  for (let i = 0; i < SIZE; i++) {
    const c = RGB[px[i]], o = i * 4;
    d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
  }
  if (flt) { // 持ち上げ中の選択範囲を重ねて表示
    for (let y = 0; y < sel.h; y++) for (let x = 0; x < sel.w; x++) {
      const c = RGB[flt[y * sel.w + x]], o = ((sel.y + y) * W + sel.x + x) * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2];
    }
  }
  ctx.putImageData(img, 0, 0);
}

function drawGrid() {
  const s = W * zoom;
  overlay.width = s; overlay.height = s;
  overlay.style.width = s + "px"; overlay.style.height = s + "px";
  const g = overlay.getContext("2d");
  g.clearRect(0, 0, s, s);
  if (!$("grid").checked) return;
  g.lineWidth = 1;
  for (let i = 1; i < W; i++) {
    const tile = i % 8 === 0;
    if (!tile && zoom < 4) continue; // 細かいグリッドは×4のみ
    g.strokeStyle = tile ? "rgba(15,56,15,.45)" : "rgba(15,56,15,.15)";
    const p = i * zoom + 0.5;
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, s); g.moveTo(0, p); g.lineTo(s, p); g.stroke();
  }
}

function setZoom(z) {
  zoom = z;
  canvas.style.width = canvas.style.height = W * zoom + "px";
  drawGrid();
  updateBox();
}

// ---- 履歴 -----------------------------------------------------------
function snapshot() {
  undoStack.push(px.slice());
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
}
function undo() { deselect(); if (!undoStack.length) return; redoStack.push(px); px = undoStack.pop(); render(); }
function redo() { deselect(); if (!redoStack.length) return; undoStack.push(px); px = redoStack.pop(); render(); }

// ---- 描画 -----------------------------------------------------------
function plot(x, y) { if (x >= 0 && y >= 0 && x < W && y < H) px[y * W + x] = color; }

function line(x0, y0, x1, y1) { // Bresenham
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    plot(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

function fill(x, y) {
  const target = px[y * W + x];
  if (target === color) return;
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= W || cy >= H || px[cy * W + cx] !== target) continue;
    px[cy * W + cx] = color;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}

function pos(e) {
  const r = canvas.getBoundingClientRect();
  return [Math.floor((e.clientX - r.left) / zoom), Math.floor((e.clientY - r.top) / zoom)];
}

// ---- 範囲選択 -------------------------------------------------------
// 移動は「持ち上げ(lift) → 移動 → 確定(commit)」。持ち上げた元の場所は色0で埋まる。
// Alt+ドラッグなら元を残してコピー。移動が1回でもあれば、確定までが履歴1件。
function updateBox() {
  box.hidden = !sel;
  if (!sel) return;
  Object.assign(box.style, {
    left: sel.x * zoom + "px", top: sel.y * zoom + "px",
    width: sel.w * zoom + "px", height: sel.h * zoom + "px",
  });
  say(`選択 ${sel.w}×${sel.h} @ (${sel.x}, ${sel.y})`);
}
function lift(copy) {
  snapshot();
  flt = new Uint8Array(sel.w * sel.h);
  for (let y = 0; y < sel.h; y++) for (let x = 0; x < sel.w; x++) {
    const i = (sel.y + y) * W + sel.x + x;
    flt[y * sel.w + x] = px[i];
    if (!copy) px[i] = 0;
  }
}
function commit() {
  if (!flt) return;
  for (let y = 0; y < sel.h; y++) for (let x = 0; x < sel.w; x++) {
    px[(sel.y + y) * W + sel.x + x] = flt[y * sel.w + x];
  }
  flt = null;
}
function deselect() { commit(); sel = null; updateBox(); }
function selectAll() { setTool("select"); deselect(); sel = { x: 0, y: 0, w: W, h: H }; updateBox(); }
function deleteSel() { if (!flt) lift(false); flt = null; sel = null; updateBox(); render(); }
function nudge(dx, dy) {
  const nx = cl(sel.x + dx, W - sel.w + 1), ny = cl(sel.y + dy, H - sel.h + 1);
  if (nx === sel.x && ny === sel.y) return;
  if (!flt) lift(false);
  sel.x = nx; sel.y = ny; render(); updateBox();
}

// ---- ポインタ操作 -----------------------------------------------------
let last = null;  // ペン: 直前の座標
let drag = null;  // 範囲選択: {mode: "marquee" | "move", ...}
const inCanvas = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const inSel = (x, y) => sel && x >= sel.x && y >= sel.y && x < sel.x + sel.w && y < sel.y + sel.h;

canvas.addEventListener("pointerdown", e => {
  if (e.button !== 0) return;
  const [x, y] = pos(e);
  if (!inCanvas(x, y)) return;
  if (tool === "select") {
    canvas.setPointerCapture(e.pointerId);
    if (inSel(x, y)) {
      if (e.altKey) commit(); // 確定してから、元を残して持ち上げる
      drag = { mode: "move", ox: x - sel.x, oy: y - sel.y, copy: e.altKey };
    } else {
      deselect();
      sel = { x, y, w: 1, h: 1 };
      drag = { mode: "marquee", ax: x, ay: y, moved: false };
      updateBox();
    }
    return;
  }
  if (tool === "pick") { setColor(px[y * W + x]); return; }
  snapshot();
  if (tool === "fill") { fill(x, y); render(); return; }
  canvas.setPointerCapture(e.pointerId);
  last = [x, y];
  plot(x, y); render();
});

canvas.addEventListener("pointermove", e => {
  const [x, y] = pos(e);
  if (drag) {
    if (drag.mode === "marquee") {
      const cx = cl(x, W), cy = cl(y, H);
      sel = { x: Math.min(drag.ax, cx), y: Math.min(drag.ay, cy), w: Math.abs(cx - drag.ax) + 1, h: Math.abs(cy - drag.ay) + 1 };
      if (sel.w > 1 || sel.h > 1) drag.moved = true;
    } else {
      const nx = cl(x - drag.ox, W - sel.w + 1), ny = cl(y - drag.oy, H - sel.h + 1);
      if (nx !== sel.x || ny !== sel.y) {
        if (!flt) lift(drag.copy); // 実際に動いた時点で持ち上げる
        sel.x = nx; sel.y = ny; render();
      }
    }
    updateBox();
    return;
  }
  if (inCanvas(x, y)) say(`(${x}, ${y})  色 ${px[y * W + x]}`);
  if (tool === "select") canvas.style.cursor = inSel(x, y) ? "move" : "crosshair";
  if (!last) return;
  line(last[0], last[1], x, y);
  last = [x, y]; render();
});

const end = () => {
  last = null;
  if (drag && drag.mode === "marquee" && !drag.moved) { sel = null; updateBox(); } // クリックだけなら選択解除
  drag = null;
};
canvas.addEventListener("pointerup", end);
canvas.addEventListener("pointercancel", end);

// ---- UI -------------------------------------------------------------
function setColor(c) {
  color = c;
  [...$("palette").children].forEach((b, i) => b.classList.toggle("on", i === c));
}
function setTool(t) {
  if (t !== "select") deselect();
  tool = t;
  canvas.style.cursor = "crosshair";
  [...$("tools").children].forEach(b => b.classList.toggle("on", b.dataset.tool === t));
}

PALETTE.forEach((hex, i) => {
  const b = document.createElement("button");
  b.style.background = hex; b.title = `色 ${i} (${i + 1}キー)`; b.setAttribute("aria-label", `色 ${i}`);
  b.onclick = () => setColor(i);
  $("palette").append(b);
});
$("tools").addEventListener("click", e => { if (e.target.dataset.tool) setTool(e.target.dataset.tool); });
$("undo").onclick = undo;
$("redo").onclick = redo;
$("clear").onclick = () => { deselect(); snapshot(); px = new Uint8Array(SIZE); render(); };
$("zoom").onchange = e => setZoom(+e.target.value);
$("grid").onchange = drawGrid;

document.addEventListener("keydown", e => {
  if (e.target.matches("select, input")) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.ctrlKey || e.metaKey) && k === "y") { e.preventDefault(); redo(); return; }
  if ((e.ctrlKey || e.metaKey) && k === "a") { e.preventDefault(); selectAll(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (sel) {
    const step = e.shiftKey ? 8 : 1;
    const arrows = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
    if (arrows[k]) { e.preventDefault(); nudge(arrows[k][0] * step, arrows[k][1] * step); return; }
    if (k === "delete" || k === "backspace") { e.preventDefault(); deleteSel(); return; }
    if (k === "escape" || k === "enter") { e.preventDefault(); deselect(); return; }
  }
  if (k >= "1" && k <= "4") setColor(+k - 1);
  else if (k === "p") setTool("pen");
  else if (k === "f") setTool("fill");
  else if (k === "i") setTool("pick");
  else if (k === "s") setTool("select");
});

// ---- 保存 / 読み込み --------------------------------------------------
$("save").onclick = () => {
  commit(); // 移動中の選択範囲を確定してから書き出す
  const url = URL.createObjectURL(new Blob([pack(px)], { type: "application/octet-stream" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "image.sgb" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  say(`保存しました (${BYTES} bytes)`);
};

async function loadFile(file) {
  try {
    const next = unpack(new Uint8Array(await file.arrayBuffer()));
    deselect(); snapshot(); px = next; render();
    say(`読み込みました: ${file.name}`);
  } catch (err) {
    say(`読み込めません: ${err.message}`, true);
  }
}
$("load").onclick = () => $("file").click();
$("file").onchange = e => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = ""; };
addEventListener("dragover", e => e.preventDefault());
addEventListener("drop", e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f); });

// ---- 初期化 ---------------------------------------------------------
setColor(3); setZoom(3); render();
