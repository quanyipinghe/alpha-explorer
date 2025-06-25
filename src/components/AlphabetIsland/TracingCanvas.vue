<template>
  <div class="relative w-full max-w-md mx-auto aspect-square bg-white rounded-2xl shadow-inner overflow-hidden">
    <canvas ref="canvas" class="w-full h-full"></canvas>
    <button @click="clearCanvas" class="absolute bottom-4 right-4 px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 transition-colors">
      清除
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  letter: {
    type: String,
    required: true,
  },
});

const canvas = ref(null);
let ctx = null;
let isDrawing = false;

const resizeCanvas = () => {
  const canvasEl = canvas.value;
  if (!canvasEl) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvasEl.getBoundingClientRect();
  canvasEl.width = rect.width * dpr;
  canvasEl.height = rect.height * dpr;
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
};

const drawGuideLetter = () => {
  if (!ctx) return;
  const canvasEl = canvas.value;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.fillStyle = '#E5E7EB'; // Light gray
  ctx.font = 'bold 200px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(props.letter, canvasEl.offsetWidth / 2, canvasEl.offsetHeight / 2);
};

const startDrawing = (event) => {
  event.preventDefault();
  isDrawing = true;
  const { x, y } = getCoords(event);
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const draw = (event) => {
  if (!isDrawing) return;
  event.preventDefault();
  const { x, y } = getCoords(event);
  ctx.lineTo(x, y);
  ctx.strokeStyle = '#3B82F6'; // Blue
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
};

const stopDrawing = () => {
  isDrawing = false;
  ctx.closePath();
};

const getCoords = (event) => {
  const canvasEl = canvas.value;
  let x, y;
  if (event.touches) {
    x = event.touches[0].clientX - canvasEl.getBoundingClientRect().left;
    y = event.touches[0].clientY - canvasEl.getBoundingClientRect().top;
  } else {
    x = event.offsetX;
    y = event.offsetY;
  }
  return { x, y };
};

const clearCanvas = () => {
  drawGuideLetter();
};

onMounted(() => {
  const canvasEl = canvas.value;
  ctx = canvasEl.getContext('2d');
  resizeCanvas();
  drawGuideLetter();

  canvasEl.addEventListener('mousedown', startDrawing);
  canvasEl.addEventListener('mousemove', draw);
  canvasEl.addEventListener('mouseup', stopDrawing);
  canvasEl.addEventListener('mouseleave', stopDrawing);

  canvasEl.addEventListener('touchstart', startDrawing);
  canvasEl.addEventListener('touchmove', draw);
  canvasEl.addEventListener('touchend', stopDrawing);
});

watch(() => props.letter, () => {
  drawGuideLetter();
});
</script>
