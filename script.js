// /** { HTMLCanvasElement } **/

const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d',{willReadFrequently:true});
const root = document.documentElement;
const cursor = document.querySelector('.draw-cursor');
const modal = document.querySelector('.brush-modal');
const value = document.querySelector('.brush-modal-value');
let isDrawing = false;
let hue = 'black';
let history;
let i;

function save() {
  const link = document.createElement('a');
  link.download = 'canvas.jpg';
  link.href = canvas.toDataURL();
  link.click();
  link.remove();
}

const clear = () => init();

function fillColor() {
  const [r,g,b] = ctx.getImageData(0,0,1,1).data;
  root.style.setProperty('--bgColor',`rgb(${r},${g},${b})`);
}

function reset() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  root.style.setProperty('--bgColor','white');
  i = -1; 
}

function redo() {
  if (i >= history.length-1) return i = history.length-1;
  i++;
  ctx.putImageData(history[i],0,0);
  fillColor();
}

function undo() {
  if (i <= 0) return reset();
  i--;
  ctx.putImageData(history[i],0,0);
  fillColor();
}

function updateFill(e) {
  ctx.fillStyle = e.target.value;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  root.style.setProperty('--bgColor',e.target.value);
}

function updateBrushColor(e) {
  hue = e.target.value; 
  root.style.setProperty('--cursorColor',e.target.value);
}

function updateBrush(e) {
  ctx.lineWidth = e.target.value;
  value.textContent = e.target.value;
  cursor.style.setProperty('--cursor',`${e.target.value}px`);
}

const showModal = () => modal.classList.toggle('active');

function update(e) {
  e.target.matches('.brush-modal-range') && updateBrush(e);
  e.target.matches('.brush-modal-brushColor') && updateBrushColor(e);
  e.target.matches('.draw-fill') && updateFill(e);
}

function activate(e) {
  e.target.matches('.icon-brush') && showModal();
  e.target.matches('.icon-fill') && document.querySelector('.draw-fill').click();
  e.target.matches('.icon-undo') && undo();
  e.target.matches('.icon-redo') && redo();
  e.target.matches('.icon-clear') && clear();
  e.target.matches('.icon-save') && save();
}

function trackCursor(e) {
  const x = e.clientX - cursor.clientWidth/2;
  const y = e.clientY - cursor.clientHeight/2;
  cursor.style.transform = `translate(${x}px,${y}px)`
}

function stop(e) {
  isDrawing = false;  
  ctx.closePath();
  if (e.type !== 'pointerup') return;
  history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
  i++;
}

function draw(e) {
  if (!isDrawing) return;
  ctx.strokeStyle = hue;
  ctx.lineTo(e.clientX,e.clientY);
  ctx.stroke();
}

function start(e) {
  isDrawing = true;
  ctx.beginPath(); 
  ctx.moveTo(e.clientX,e.clientY);
  modal.classList.remove('active');
}

function baseLine() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = value.textContent;
}

function resize() {
  baseLine();
  ctx.putImageData(history[i],0,0);
}

function init() {
  baseLine();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  history = [];
  i = -1; 
  root.style.setProperty('--bgColor','white');
}

window.addEventListener('load',init,false);
window.addEventListener('resize',resize,false);
document.addEventListener('pointermove',trackCursor,false);
document.addEventListener('click',activate,false);
document.addEventListener('input',update,false);
canvas.addEventListener('pointerdown',start,false);
canvas.addEventListener('pointermove',draw,false);
canvas.addEventListener('pointerup',stop,false);
canvas.addEventListener('pointerleave',stop,false);