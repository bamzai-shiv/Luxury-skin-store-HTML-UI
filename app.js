/* global window, document, localStorage, DB */
(function(){
  'use strict';
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const load = (k, d)=>{ try{return JSON.parse(localStorage.getItem(k)) ?? d;}catch{return d;} };
  const save = (k, v)=> localStorage.setItem(k, JSON.stringify(v));

  // Theme
  const theme = load('theme','light');
  if(theme==='dark') document.documentElement.classList.add('dark');

  // State
  const State = {
    products: DB.products,
    filters: { q:'', cat:'All', sort:'popular', max:null },
    cart: load('cart', []),
    reviews: load('reviews', DB.reviews),
    posts: DB.posts,
    order: null
  };

  const fmt = n => new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(n);
  const cartCount = ()=> State.cart.reduce((a,c)=>a+c.qty,0);
  const setCart = (c)=>{ State.cart=c; save('cart',c); updateCartBadge(); };
  const totals = ()=>{
    const subtotal = State.cart.reduce((a,c)=>a+c.price*c.qty,0);
    const shipping = subtotal>60 || subtotal===0 ? 0 : 6.00;
    const tax = +(subtotal*0.08).toFixed(2);
    const total = +(subtotal+shipping+tax).toFixed(2);
    return { subtotal:+subtotal.toFixed(2), shipping, tax, total };
  };

  // Shell
  const app = $('#app'); $('#year').textContent = new Date().getFullYear();
  const updateCartBadge = ()=> $('#cartCount').textContent = cartCount(); updateCartBadge();

  // Global
  $('#globalSearch').addEventListener('input', e=>{
    State.filters.q = e.target.value.trim();
    if(location.hash !== '#/products') location.hash = '#/products';
    renderProducts();
  });
  $('#themeToggle').addEventListener('click', ()=>{
    const dark = document.documentElement.classList.toggle('dark');
    save('theme', dark?'dark':'light');
  });

  // Router
  const routes = {
    '': renderHome, 'home': renderHome, 'products': renderProducts, 'about': renderAbout,
    'reviews': renderReviews, 'blog': renderBlogList, 'post': renderPost,
    'cart': renderCart, 'checkout': renderCheckout, 'thanks': renderThanks
  };
  function router(){
    const [path, param] = location.hash.replace('#/','').split('/');
    (routes[path] || routes['home'])(param);
    window.scrollTo({top:0, behavior:'smooth'});
  }
  window.addEventListener('hashchange', router);
  if(!location.hash) location.hash = '#/home';
  router();

  // Utils
  const initials = s => s.split(' ').map(x=>x[0]).join('').slice(0,3).toUpperCase();
  const thumb = p => `<div class="thumb" style="--c1:${p.c1};--c2:${p.c2}" data-initials="${initials(p.name)}"></div>`;
  const stars = r => `<span class="stars">${Array.from({length:5}).map((_,i)=>`<svg width="16" height="16" style="opacity:${i<Math.round(r)?1:.25}"><use href="#icon-star"/></svg>`).join('')}</span>`;
  const pulse = el => { el.style.transform='scale(1.1)'; el.style.transition='transform .18s ease'; setTimeout(()=>el.style.transform='none',160); };

  const applyFilters = ()=>{
    let list=[...State.products];
    const {q,cat,sort,max} = State.filters;
    if(q){ const m=q.toLowerCase(); list=list.filter(p=> [p.name,p.description,p.category].some(v=>v.toLowerCase().includes(m))); }
    if(cat!=='All') list=list.filter(p=>p.category===cat);
    if(max!=null) list=list.filter(p=>p.price<=max);
    if(sort==='popular') list.sort((a,b)=>b.rating-a.rating);
    if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
    if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
    if(sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  };

  const addToCart = (id, color=null)=>{
    const p = State.products.find(x=>x.id===id);
    if(!p || p.stock<=0) return;
    const picked = color || p.colors[0];
    const f = State.cart.find(x=>x.id===id && x.color===picked);
    if(f){ f.qty = Math.min(f.qty+1,99); } else { State.cart.push({ id:p.id, name:p.name, price:p.price, color:picked, qty:1 }); }
    setCart([...State.cart]); pulse($('#cartCount'));
  };

  const openModal = (title, bodyHTML, actionsHTML='')=>{
    const root = $('#modalRoot');
    root.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-card reveal">
          <div class="modal-head">
            <strong>${title}</strong>
            <button class="icon-btn" data-close><svg width="18" height="18"><use href="#icon-close"/></svg></button>
          </div>
          <div class="modal-body">${bodyHTML}</div>
          <div class="modal-foot">${actionsHTML}</div>
        </div>
      </div>`;
    root.querySelector('[data-close]').addEventListener('click', ()=> root.innerHTML='');
    root.addEventListener('click', e=>{ if(e.target.classList.contains('modal')) root.innerHTML=''; });
  };

  // Cards
  function cardItem(p){
    return `
      <div class="card">
        ${thumb(p)}
        <div class="info">
          <div class="row">
            <div>${p.name}</div>
            <div class="price">${fmt(p.price)}</div>
          </div>
          <div class="row">${stars(p.rating)} <span class="muted">${p.category}</span></div>
          <div class="row gap">
            <div class="color-swatches">${p.colors.map(c=>`<span class="swatch" style="background:${c}"></span>`).join('')}</div>
            <span class="muted">${p.stock>0?`${p.stock} in stock`:'Out of stock'}</span>
          </div>
          <div class="row">
            <button class="btn small" data-add="${p.id}" ${p.stock<=0?'disabled':''}>Add</button>
            <button class="btn small ghost" data-view="${p.id}">Quick view</button>
          </div>
        </div>
      </div>`;
  }
  function bindCardActions(){
    $$('#app [data-add]').forEach(b=> b.addEventListener('click',()=> addToCart(b.dataset.add)));
    $$('#app [data-view]').forEach(b=> b.addEventListener('click',()=> quickView(b.dataset.view)));
  }

  // Views
  function renderHome(){
    app.innerHTML = `
      <section class="hero reveal">
        <div>
          <h1>Discover Radiant Skin With Our Premium</h1>
          <span class="pill">Skincare Products ✨</span>
          <p>Explore refined formulas crafted with barrier‑supporting actives for a calm, luminous complexion.</p>
          <div class="cta-row">
            <a class="btn" href="#/products">Buy Our Products</a>
            <a class="btn ghost" href="#/reviews">1.5K Members</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="bottle">
            <svg width="280" height="360" viewBox="0 0 280 360" fill="none">
              <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#efe6df"/></linearGradient></defs>
              <rect x="90" y="30" width="100" height="20" rx="6" fill="#b7b7b7"/>
              <rect x="110" y="50" width="60" height="22" rx="6" fill="#9b9b9b"/>
              <rect x="65" y="72" width="150" height="250" rx="26" fill="url(#g1)" stroke="#e8ded6"/>
              <text x="90" y="165" fill="#b08a72" style="font:700 22px Inter,Arial">SiknSux</text>
              <text x="85" y="190" fill="#8f7764" style="font:500 10px Inter,Arial">Luxury Unveiled for Your Skin</text>
            </svg>
            <div class="card">
              ${State.products.slice(0,3).map(p=>`
                <div class="mini">
                  ${thumb(p)}
                  <div style="padding:6px">
                    <div style="font-weight:700; font-size:.9rem">${p.name}</div>
                    <div class="muted" style="font-size:.85rem">${fmt(p.price)}</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </section>
      <section class="section reveal">
        <h3>Popular picks</h3>
        <div class="grid">${applyFilters().slice(0,4).map(p=> cardItem(p)).join('')}</div>
      </section>`;
    bindCardActions();
  }

  function renderProducts(){
    const list = applyFilters();
    const maxPrice = Math.ceil(Math.max(...State.products.map(p=>p.price)));
    const chosenMax = State.filters.max ?? maxPrice;
    app.innerHTML = `
      <section class="section reveal">
        <h3>Products</h3>
        <div class="filters">
          <input class="input" id="q" placeholder="Search..." value="${State.filters.q}"/>
          <select class="select" id="cat">${DB.categories.map(c=>`<option ${c===State.filters.cat?'selected':''}>${c}</option>`).join('')}</select>
          <select class="select" id="sort">
            <option value="popular" ${State.filters.sort==='popular'?'selected':''}>Popular</option>
            <option value="price-asc" ${State.filters.sort==='price-asc'?'selected':''}>Price: Low to High</option>
            <option value="price-desc" ${State.filters.sort==='price-desc'?'selected':''}>Price: High to Low</option>
            <option value="name" ${State.filters.sort==='name'?'selected':''}>Name</option>
          </select>
          <div class="row" style="gap:10px">
            <label class="muted">Max: ${fmt(chosenMax)}</label>
            <input class="range" id="max" type="range" min="10" max="${maxPrice}" step="1" value="${chosenMax}"/>
          </div>
          <button class="btn small ghost" id="clear">Clear</button>
        </div>
        <div class="grid">${list.map(p=> cardItem(p)).join('')}</div>
      </section>`;
    $('#q').addEventListener('input', e=>{ State.filters.q=e.target.value.trim(); renderProducts(); });
    $('#cat').addEventListener('change', e=>{ State.filters.cat=e.target.value; renderProducts(); });
    $('#sort').addEventListener('change', e=>{ State.filters.sort=e.target.value; renderProducts(); });
    $('#max').addEventListener('input', e=>{ State.filters.max=+e.target.value; renderProducts(); });
    $('#clear').addEventListener('click', ()=>{ State.filters={ q:'', cat:'All', sort:'popular', max:null }; renderProducts(); });
    bindCardActions();
  }

  function quickView(id){
    const p = State.products.find(x=>x.id===id);
    const body = `
      <div class="row gap">
        <div style="flex:1">${thumb(p)}</div>
        <div style="flex:1.2">
          <h3 style="margin:0 0 6px">${p.name}</h3>
          <div class="row">${stars(p.rating)} <span class="price">${fmt(p.price)}</span></div>
          <p class="muted">${p.description}</p>
          <div>
            <div class="muted" style="margin-bottom:6px">Choose color</div>
            <div class="color-swatches">
              ${p.colors.map((c,i)=> `<label style="display:inline-flex;align-items:center;gap:6px;margin-right:8px;cursor:pointer">
                <input type="radio" name="pv-color" value="${c}" ${i===0?'checked':''}/>
                <span class="swatch" style="background:${c}"></span>
              </label>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
    const actions = `<button class="btn ghost" data-close>Close</button><button class="btn" data-add="${p.id}">Add to cart</button>`;
    openModal('Quick view', body, actions);
    const root = $('#modalRoot');
    root.querySelector('[data-add]').addEventListener('click', ()=>{
      const color = root.querySelector('input[name="pv-color"]:checked')?.value || p.colors[0];
      addToCart(p.id, color);
      root.innerHTML='';
    });
  }

  function renderAbout(){
    app.innerHTML = `
      <section class="section reveal">
        <h3>About SiknSux</h3>
        <p class="muted">We formulate gentle, effective essentials with barrier‑loving actives and planet‑minded packaging.</p>
        <p class="muted">Every product is cruelty‑free, fragrance‑respectful, and vetted by our in‑house R&D collective.</p>
      </section>`;
  }

  function renderReviews(){
    app.innerHTML = `
      <section class="section reveal">
        <h3>Community reviews</h3>
        <div id="revList">${State.reviews.map(r=>reviewCard(r)).join('')}</div>
        <form id="revForm" class="form" style="margin-top:16px">
          <div><label>Name</label><input class="input" name="name" required /></div>
          <div><label>Rating</label><select class="select" name="rating">${[5,4,3,2,1].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></div>
          <div class="full"><label>Comment</label><textarea class="input" name="text" rows="3" required></textarea></div>
          <div class="full"><button class="btn" type="submit">Post review</button></div>
        </form>
      </section>`;
    $('#revForm').addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const r = { name: fd.get('name'), rating:+fd.get('rating'), text: fd.get('text') };
      State.reviews = [r, ...State.reviews].slice(0, 100);
      save('reviews', State.reviews);
      renderReviews();
    });
  }
  const reviewCard = r => `
    <div class="card" style="padding:12px; margin-bottom:10px">
      <div class="row"><strong>${r.name}</strong>${stars(r.rating)}</div>
      <p class="muted" style="margin:6px 0 0">${r.text}</p>
    </div>`;

  function renderBlogList(){
    app.innerHTML = `
      <section class="section reveal">
        <h3>Blog</h3>
        <div class="grid">
          ${State.posts.map(p=>`
            <div class="card" style="overflow:hidden">
              <div class="thumb" style="--c1:#ead7c9;--c2:#d1e0cf" data-initials="BLOG"></div>
              <div class="info">
                <div style="font-weight:800">${p.title}</div>
                <p class="muted" style="margin:0">${p.excerpt}</p>
                <a class="btn small ghost" href="#/post/${p.id}">Read</a>
              </div>
            </div>`).join('')}
        </div>
      </section>`;
  }
  function renderPost(id){
    const p = State.posts.find(x=>x.id===id);
    if(!p){ location.hash='#/blog'; return; }
    app.innerHTML = `
      <section class="section reveal">
        <h3>${p.title}</h3>
        <p class="muted">${p.body}</p>
        <a class="btn ghost" href="#/blog">Back to blog</a>
      </section>`;
  }

  function renderCart(){
    const items = State.cart;
    const t = totals();
    app.innerHTML = `
      <section class="section reveal">
        <h3>Your cart</h3>
        ${items.length===0?`
          <p class="muted">Your cart is empty — find something you love in Products.</p>
          <a class="btn" href="#/products">Browse products</a>
        `:`
          <table class="table">
            <thead><tr><th>Item</th><th>Color</th><th>Price</th><th>Qty</th><th>Line</th><th></th></tr></thead>
            <tbody>
              ${items.map((it,i)=>`
                <tr data-i="${i}">
                  <td>${it.name}</td>
                  <td><span class="swatch" style="background:${it.color}"></span></td>
                  <td>${fmt(it.price)}</td>
                  <td>
                    <div class="qty">
                      <button data-dec aria-label="Decrease"><svg width="16" height="16"><use href="#icon-minus"/></svg></button>
                      <span>${it.qty}</span>
                      <button data-inc aria-label="Increase"><svg width="16" height="16"><use href="#icon-plus"/></svg></button>
                    </div>
                  </td>
                  <td>${fmt(it.price*it.qty)}</td>
                  <td><button class="icon-btn" data-del aria-label="Remove"><svg width="16" height="16"><use href="#icon-close"/></svg></button></td>
                </tr>`).join('')}
            </tbody>
          </table>
          <div class="summary">
            <div class="row"><span class="muted">Subtotal</span><strong>${fmt(t.subtotal)}</strong></div>
            <div class="row"><span class="muted">Shipping</span><strong>${t.shipping===0?'Free':fmt(t.shipping)}</strong></div>
            <div class="row"><span class="muted">Tax (8%)</span><strong>${fmt(t.tax)}</strong></div>
            <div class="row" style="margin-top:6px"><span>Total</span><strong>${fmt(t.total)}</strong></div>
            <div class="row" style="margin-top:8px">
              <a class="btn" href="#/checkout">Checkout</a>
              <a class="btn ghost" href="#/products">Continue shopping</a>
            </div>
          </div>
        `}
      </section>`;
    $$('#app [data-i]').forEach(tr=>{
      const i=+tr.dataset.i;
      tr.querySelector('[data-inc]').addEventListener('click', ()=>{ State.cart[i].qty=Math.min(State.cart[i].qty+1,99); setCart([...State.cart]); renderCart(); });
      tr.querySelector('[data-dec]').addEventListener('click', ()=>{ State.cart[i].qty=Math.max(State.cart[i].qty-1,1); setCart([...State.cart]); renderCart(); });
      tr.querySelector('[data-del]').addEventListener('click', ()=>{ State.cart.splice(i,1); setCart([...State.cart]); renderCart(); });
    });
  }

  function renderCheckout(){
    const items = State.cart;
    if(items.length===0){
      app.innerHTML = `
        <section class="section reveal">
          <h3>Checkout</h3>
          <p class="muted">Your cart is empty — add items first.</p>
          <a class="btn" href="#/products">Go to products</a>
        </section>`;
      return;
    }
    const t = totals();
    app.innerHTML = `
      <section class="section reveal">
        <h3>Checkout</h3>
        <form id="form" class="form">
          <div><label>First name</label><input class="input" name="first" required /></div>
          <div><label>Last name</label><input class="input" name="last" required /></div>
          <div class="full"><label>Email</label><input class="input" type="email" name="email" required /></div>
          <div class="full"><label>Address</label><input class="input" name="address" required /></div>
          <div><label>City</label><input class="input" name="city" required /></div>
          <div><label>Postal</label><input class="input" name="zip" required /></div>
          <div class="full"><label>Payment</label><select class="select" name="pay"><option value="card">Card</option><option value="cod">Cash on Delivery</option></select></div>
          <div class="full error" id="err"></div>
          <div class="full"><button class="btn" type="submit">Place order • ${fmt(t.total)}</button></div>
        </form>
        <div class="summary">
          <div class="row"><span class="muted">Items</span><strong>${items.length}</strong></div>
          <div class="row"><span class="muted">Subtotal</span><strong>${fmt(t.subtotal)}</strong></div>
          <div class="row"><span class="muted">Shipping</span><strong>${t.shipping===0?'Free':fmt(t.shipping)}</strong></div>
          <div class="row"><span class="muted">Tax (8%)</span><strong>${fmt(t.tax)}</strong></div>
          <div class="row" style="margin-top:6px"><span>Total</span><strong>${fmt(t.total)}</strong></div>
        </div>
      </section>`;
    $('#form').addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const data = Object.fromEntries(fd.entries());
      const err=$('#err');
      if(!/^\S+@\S+\.\S+$/.test(data.email)){ err.textContent='Enter a valid email.'; return; }
      if((data.zip||'').length<4){ err.textContent='Enter a valid postal code.'; return; }
      err.textContent='';
      const orderId = 'SS' + Math.floor(Math.random()*1e8).toString().padStart(8,'0');
      const snapshot = { id:orderId, when:new Date().toISOString(), items:[...State.cart], totals:totals(), shipTo:{ name:`${data.first} ${data.last}`.trim(), address:data.address, city:data.city, zip:data.zip, email:data.email }, pay:data.pay };
      State.order = snapshot; save('lastOrder', snapshot); setCart([]); location.hash = '#/thanks';
    });
  }

  function renderThanks(){
    const order = load('lastOrder',null) || State.order;
    app.innerHTML = `
      <section class="section reveal">
        <h3>Thank you!</h3>
        ${order?`
          <p>Your order <strong>${order.id}</strong> has been placed successfully.</p>
          <div class="summary">
            <div class="row"><span class="muted">Total</span><strong>${fmt(order.totals.total)}</strong></div>
            <div class="row"><span class="muted">Items</span><strong>${order.items.length}</strong></div>
            <div class="row"><span class="muted">Email</span><strong>${order.shipTo.email}</strong></div>
          </div>
          <div class="row" style="margin-top:10px">
            <a class="btn" href="#/products">Continue shopping</a>
            <a class="btn ghost" href="#/home">Back to home</a>
          </div>
        `:`
          <p class="muted">No recent order found.</p>
          <a class="btn" href="#/products">Browse products</a>
        `}
      </section>`;
  }
})();
