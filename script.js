// Confetti effect
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const confetti = [];
for (let i = 0; i < 150; i++) {
  confetti.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 6 + 4,
    d: Math.random() * 100,
    color: "hsl(" + Math.random() * 360 + ",100%,50%)",
    tilt: Math.floor(Math.random() * 10) - 10
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confetti.forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c.color;
    ctx.fillRect(c.x, c.y, c.r, c.r);
  });
  update();
}

function update() {
  confetti.forEach((c, i) => {
    c.y += Math.cos(c.d) + 1 + c.r/2;
    c.x += Math.sin(0);
    if (c.y > canvas.height) {
      c.x = Math.random() * canvas.width;
      c.y = -10;
    }
  });
}

setInterval(draw, 20);
