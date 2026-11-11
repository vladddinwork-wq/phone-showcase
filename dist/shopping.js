(() => {
  const key = 'flagman-shopping-v1';
  let state;
  try { state = JSON.parse(localStorage.getItem(key)); } catch (_) {}
  if (!state || typeof state !== 'object') state = {};
  if (!Array.isArray(state.wishlist)) state.wishlist = [];
  if (!state.cart || typeof state.cart !== 'object' || Array.isArray(state.cart)) state.cart = {};
  const products = [...document.querySelectorAll('article[data-product-id], section[data-page-type="product"]')];
  const totals = document.createElement('span');
  totals.className = 'shopping-totals';
  totals.setAttribute('aria-live', 'polite');
  document.querySelector('header').append(totals);
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {} };
  const track = (goal, product) => {
    (window._tmr || (window._tmr = [])).push({type: 'reachGoal', id: '3813741', value: product.dataset.productPrice, goal, params: {product_id: product.dataset.productId}});
  };
  const render = () => {
    totals.textContent = `Избранное: ${state.wishlist.length} · Корзина: ${Object.values(state.cart).reduce((sum, n) => sum + (Number(n) || 0), 0)}`;
    for (const product of products) {
      const id = product.dataset.productId;
      const chosen = state.wishlist.includes(id);
      const qty = Number(state.cart[id]) || 0;
      const wish = product.querySelector('[data-shopping="wishlist"]');
      wish.textContent = chosen ? '♥ В избранном' : '♡ В избранное';
      wish.setAttribute('aria-pressed', String(chosen));
      product.querySelector('[data-shopping="cart"]').textContent = qty ? `В корзине: ${qty} · +1` : 'В корзину';
      const remove = product.querySelector('[data-shopping="remove"]');
      remove.hidden = !qty;
    }
  };
  for (const product of products) {
    const group = document.createElement('div');
    group.className = 'shopping-actions';
    for (const [action, label] of [['wishlist', 'В избранное'], ['cart', 'В корзину'], ['remove', '−1 из корзины']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.shopping = action;
      button.textContent = label;
      button.addEventListener('click', () => {
        const id = product.dataset.productId;
        if (action === 'wishlist') {
          if (state.wishlist.includes(id)) state.wishlist = state.wishlist.filter(value => value !== id);
          else { state.wishlist.push(id); track('addToWishlist', product); }
        } else if (action === 'cart') {
          state.cart[id] = (Number(state.cart[id]) || 0) + 1;
          track('addToCart', product);
        } else {
          const qty = (Number(state.cart[id]) || 0) - 1;
          if (qty > 0) state.cart[id] = qty;
          else delete state.cart[id];
        }
        persist(); render();
      });
      group.append(button);
    }
    const info = product.querySelector('.product-info');
    if (info) info.insertBefore(group, info.querySelector('.back'));
    else product.append(group);
  }
  render();
  window.addEventListener('storage', event => {
    if (event.key === key) {
      try {
        const updated = JSON.parse(event.newValue);
        if (updated && Array.isArray(updated.wishlist) && updated.cart && typeof updated.cart === 'object') {state = updated; render();}
        else if (!updated) {state = {wishlist: [], cart: {}}; render();}
      } catch (_) {}
    }
  });
})();
