
// Sweet Cheeks Mochi - Interactivity
const state = {
  cart: JSON.parse(localStorage.getItem('scm_cart') || '[]'),
  slide: 0,
  products: [
    {id:'strawberry', name:'Strawberry Kiss', price:25000, img:'assets/mochi-strawberry.svg'},
    {id:'matcha', name:'Matcha Dream', price:27000, img:'assets/mochi-matcha.svg'},
    {id:'black-sesame', name:'Black Sesame Hug', price:26000, img:'assets/mochi-black-sesame.svg'},
    {id:'assorted', name:'Assorted Box (6)', price:135000, img:'assets/mochi-strawberry.svg'},
  ]
};

// Currency helper (IDR)
const rupiah = (n) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n);

// Render product cards
function renderProducts(){
  const grid = document.querySelector('#products');
  grid.innerHTML = state.products.map(p => `
    <article class="card" aria-label="${p.name}">
      <img src="${p.img}" alt="${p.name} mochi">
      <div class="card-inner">
        <div class="flavor">${p.name}</div>
        <div class="price">${rupiah(p.price)}</div>
        <button class="btn add" data-id="${p.id}">Tambah ke Keranjang</button>
      </div>
    </article>
  `).join('');
  grid.querySelectorAll('.add').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.id)));
}

// Cart operations
function addToCart(id){
  const item = state.cart.find(i => i.id === id);
  if(item){ item.qty += 1; } else {
    const p = state.products.find(x => x.id === id);
    state.cart.push({id, name:p.name, price:p.price, img:p.img, qty:1});
  }
  persistCart();
  renderCart();
  bumpCart();
  confettiBurst();
}

function changeQty(id, delta){
  const idx = state.cart.findIndex(i => i.id===id);
  if(idx === -1) return;
  state.cart[idx].qty += delta;
  if(state.cart[idx].qty <= 0) state.cart.splice(idx,1);
  persistCart(); renderCart();
}

function removeItem(id){
  const idx = state.cart.findIndex(i => i.id===id);
  if(idx !== -1){ state.cart.splice(idx,1); persistCart(); renderCart(); }
}

function persistCart(){ localStorage.setItem('scm_cart', JSON.stringify(state.cart)); }

function renderCart(){
  const list = document.querySelector('.cart-items');
  const count = state.cart.reduce((a,b)=>a+b.qty,0);
  document.querySelector('.cart-count').textContent = count;
  if(state.cart.length === 0){
    list.innerHTML = `<p>Keranjang kosong. Yuk pilih mochi favoritmu!</p>`;
  } else {
    list.innerHTML = state.cart.map(i => `
      <div class="cart-row">
        <img src="${i.img}" alt="${i.name}">
        <div>
          <div><strong>${i.name}</strong></div>
          <div class="qty">
            <button aria-label="Kurangi" onclick="changeQty('${i.id}', -1)">−</button>
            <span>${i.qty}</span>
            <button aria-label="Tambah" onclick="changeQty('${i.id}', 1)">+</button>
            <button class="btn btn-outline" style="margin-left:8px" onclick="removeItem('${i.id}')">Hapus</button>
          </div>
        </div>
        <div>${rupiah(i.price * i.qty)}</div>
      </div>
    `).join('');
  }
  const total = state.cart.reduce((a,b)=>a+b.price*b.qty,0);
  document.querySelector('.total').textContent = rupiah(total);
  document.querySelector('.checkout').disabled = total === 0;
}

// Cart drawer toggle
const cartDrawer = {
  open(){ document.querySelector('.cart').classList.add('open'); },
  close(){ document.querySelector('.cart').classList.remove('open'); },
  toggle(){ document.querySelector('.cart').classList.toggle('open'); }
};

function bumpCart(){
  const el = document.querySelector('.cart-count');
  el.animate([{transform:'scale(1)'},{transform:'scale(1.2)'},{transform:'scale(1)'}], {duration:320, easing:'ease-out'});
}

// Carousel
let autoTimer;
function gotoSlide(i){
  const slides = document.querySelectorAll('.slide');
  state.slide = (i + slides.length) % slides.length;
  document.querySelector('.slides').style.transform = `translateX(-${state.slide*100}%)`;
  const dots = document.querySelectorAll('.dots button');
  dots.forEach((d,idx) => d.classList.toggle('active', idx===state.slide));
  resetAuto();
}
function next(){ gotoSlide(state.slide+1); }
function prev(){ gotoSlide(state.slide-1); }
function resetAuto(){
  clearInterval(autoTimer);
  autoTimer = setInterval(next, 5000);
}

// Checkout
function openCheckout(){
  document.querySelector('#checkoutModal').classList.add('open');
  document.querySelector('#name').focus();
}
function closeCheckout(){
  document.querySelector('#checkoutModal').classList.remove('open');
}
function submitOrder(e){
  e.preventDefault();
  const form = new FormData(e.target);
  const order = {
    name: form.get('name'),
    phone: form.get('phone'),
    address: form.get('address'),
    payment: form.get('payment'),
    items: state.cart.slice(),
    total: state.cart.reduce((a,b)=>a+b.price*b.qty,0)
  };
  // For demo, "submit" by logging + clearing cart
  console.log('Order submitted', order);
  localStorage.setItem('scm_last_order', JSON.stringify(order));
  state.cart = []; persistCart(); renderCart();
  closeCheckout();
  alert('Terima kasih! Pesananmu sedang diproses 💖');
}

// Confetti
function confettiBurst(){
  const container = document.querySelector('.confetti');
  for(let i=0;i<24;i++){
    const span = document.createElement('span');
    span.style.left = (50 + (Math.random()*40-20)) + 'vw';
    span.style.top = (20 + Math.random()*5) + 'vh';
    span.style.background = Math.random() > .5 ? 'var(--cotton-candy)' : 'var(--polar-sky)';
    span.style.transform = `translateY(0) rotate(${Math.random()*90}deg)`;
    span.style.animationDelay = (Math.random()*0.2)+'s';
    container.appendChild(span);
    setTimeout(()=> span.remove(), 1200);
  }
}

// Audio control (user gesture to play)
let audio;
function initAudio(){
  audio = new Audio('assets/audio/sweet-cheeks-ambient.wav');
  audio.loop = true;
  audio.volume = 0.25;
}
function toggleAudio(){
  if(!audio) initAudio();
  const isPlaying = !audio.paused;
  if(isPlaying){ audio.pause(); document.querySelector('#audioDot').style.background='var(--polar-sky)'; }
  else { audio.play(); document.querySelector('#audioDot').style.background='var(--cotton-candy)'; }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();
  gotoSlide(0);
  resetAuto();
  // buttons
  document.querySelector('#cartBtn').addEventListener('click', cartDrawer.toggle);
  document.querySelector('#checkoutBtn').addEventListener('click', openCheckout);
  document.querySelector('#closeModal').addEventListener('click', closeCheckout);
  document.querySelector('#checkoutForm').addEventListener('submit', submitOrder);
  document.querySelector('#audioCtrl').addEventListener('click', toggleAudio);
});
