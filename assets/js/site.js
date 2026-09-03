/* ==========================================================================
   OM'S DEHLII DARBAR MITHAIWALA — site behaviour
   Vanilla JS. No framework, no build step, no browser storage of any kind.
   All content lives in products.js — you should never need to edit this file.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var isTBC = function (v) { return String(v).indexOf('[[') !== -1; };
  var inr   = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };
  var phFmt = function (t) { return esc(t).replace(/\[\[([^\]]+)\]\]/g, '<span class="ph-note">[[$1]]</span>'); };

  /* ── THE WHATSAPP PRE-FILL — the core mechanic of the whole site ────────── */
  function waLink(item, extra) {
    var msg = "Hello Om's Dehlii Darbar! I'd like to order: *" + item + "*.";
    if (extra) { msg += ' ' + extra; }
    msg += ' Delivery area: ____';
    return 'https://wa.me/' + SHOP.whatsapp + '?text=' + encodeURIComponent(msg);
  }
  function attr(u) { return u.replace(/&/g, '&amp;'); }

  /* every kind of card builds its own item string */
  function productItem(p) {
    if (p.pricePerKg == null) { return p.name; }
    if (p.unit === 'piece')   { return p.name + ' — ' + inr(p.pricePerKg) + ' per piece'; }
    return p.name + ' — ' + inr(p.pricePerKg) + ' per kg';
  }
  function productWa(p) {
    return waLink(productItem(p), p.pricePerKg == null ? 'Please tell me the price.' : '');
  }
  var BOXNOTE = 'I understand fancy box charges are extra.';

  var ICON = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>',
    call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h3l2-2h8l2 2h3v11H3z"/><circle cx="12" cy="13" r="3.4"/></svg>'
  };

  var imgSeen = 0;
  function picture(slug, alt, sizes, label) {
    if (!slug) {
      /* No photograph for this sweet yet. Rather than a hole in the grid we set the
         shop's own mandala on cream. Add a photo in products.js and it replaces this. */
      /* two medallion designs, alternating, so a grid of them does not tile flat */
      imgSeen++;
      var med = (imgSeen % 2) ? 'medallion-b' : 'medallion';
      return '<div class="noimg"><img class="nomed" src="assets/img/' + med + '.svg" alt="" ' +
             'aria-hidden="true" width="96" height="96" loading="lazy" decoding="async">' +
             (label ? '<span class="nodev">' + esc(label) + '</span>' : '') + '</div>';
    }
    imgSeen++;
    var eager = imgSeen === 1;  /* the LCP candidate only */
    var s = sizes || '(min-width:1100px) 260px, (min-width:600px) 45vw, 92vw';
    return '<picture>' +
      '<source type="image/webp" sizes="' + s + '" srcset="assets/img/' + slug + '-400.webp 400w, assets/img/' + slug + '-800.webp 800w">' +
      '<img src="assets/img/' + slug + '-400.jpg" sizes="' + s + '" srcset="assets/img/' + slug + '-400.jpg 400w, assets/img/' + slug + '-800.jpg 800w" ' +
      'width="400" height="300" loading="' + (eager ? 'eager' : 'lazy') + '" ' +
      (imgSeen === 1 ? 'fetchpriority="high" ' : '') + 'decoding="async" alt="' + esc(alt) + '" ' +
      'onerror="this.onerror=null;this.removeAttribute(\'srcset\');this.src=\'assets/img/' + slug + '-400.jpg\'">' +
      '</picture>';
  }

  function hasCategory(p, cat) {
    if (!cat || cat === 'all') { return true; }
    if (p.categories && p.categories.indexOf(cat) !== -1) { return true; }
    if (Array.isArray(p.category)) { return p.category.indexOf(cat) !== -1; }
    return p.category === cat;
  }

  /* ── STOREFRONT PRODUCT CARD (square photo, weight, price, order) ──────── */
  function pcard(p) {
    var wt = p.unit === 'box' ? 'Special Pooja Box (21 pcs)'
           : (p.unit === 'piece' ? 'Sold by the piece'
           : (p.weightOptions && p.weightOptions.length ? p.weightOptions.join(' · ') : 'Per kg'));
    var price, sub;
    if (p.pricePerKg == null) {
      price = '<span class="ph-note">[[price]]</span>'; sub = 'Ask on WhatsApp';
    } else {
      price = inr(p.pricePerKg);
      sub = p.unit === 'box' ? 'per box' : (p.unit === 'piece' ? 'per piece' : 'per kg');
      if (p.verify) { sub += ' · [[verify]]'; }
    }
    var flag = p.flag ? '<span class="ribbonflag' + (p.flag === 'Signature' ? ' hot' : '') + '">' +
               esc(p.flag) + '</span>' : '';
    var catStr = p.categories ? p.categories.join(' ') : p.category;
    return '<article class="pcard" data-cat="' + esc(catStr) + '">' + flag +
      '<div class="pimg">' + picture(p.photo, p.name + ' — ' + p.desc, '(min-width:900px) 260px, 46vw', p.nameHi) + '</div>' +
      '<div class="pbd"><h3>' + esc(p.name) + '</h3>' +
        '<div class="deva">' + esc(p.nameHi) + '</div>' +
        '<div class="wt">' + esc(wt) + (p.shelfLifeHours ? ' · eat within ' + p.shelfLifeHours + ' hrs' : '') + '</div></div>' +
      '<div class="pfoot"><div class="ppr">' + price + '<small>' +
        sub.replace('[[verify]]', '<span class="ph-note">[[verify]]</span>') + '</small></div>' +
        '<a class="padd" href="' + attr(productWa(p)) + '" rel="noopener" aria-label="Order ' + esc(p.name) +
        ' on WhatsApp">' + ICON.wa + 'Order</a></div>' +
      buyRow(p) +
    '</article>';
  }

  /* ── CATEGORY TILE ──────────────────────────────────────────────────────── */
  function catTile(c) {
    var pic = c.photo
      ? '<img src="assets/img/' + c.photo + '-400.jpg" width="400" height="400" loading="lazy" decoding="async" alt="">'
      : '<div class="noimg" style="display:flex;align-items:center;justify-content:center;color:#F0C86A">' + ICON.camera + '</div>';
    return '<a class="cat" href="' + c.href + '"><div class="disc">' + pic + '</div>' +
      '<b>' + esc(c.label) + '</b><span>' + esc(c.note) + '</span></a>';
  }

  /* ── SWEET CARD ─────────────────────────────────────────────────────────── */
  function sweetCard(p) {
    var tags = (p.allergens || []).map(function (t) {
      var label = { nuts: 'Contains nuts', dairy: 'Contains dairy', varq: 'Silver varq', wheat: 'Contains wheat' }[t] || t;
      return '<span class="chip ' + t + '">' + label + '</span>';
    }).join('');
    var shelf = p.shelfLifeHours
      ? '<span class="chip fresh">Eat within ' + p.shelfLifeHours + ' hours</span>'
      : '';
    var price;
    if (p.pricePerKg == null) {
      price = '<div class="price"><span class="ph-note">[[price]]</span>' +
              '<span class="u">' + esc(p.priceNote || 'Ask us on WhatsApp') + '</span></div>';
    } else {
      price = '<div class="price">' + inr(p.pricePerKg) +
              '<span class="u">' + (p.unit === 'box' ? 'per box' : (p.unit === 'piece' ? 'per piece' + (p.verify ? ' · [[verify]]' : '') : 'per kg')) + '</span></div>';
      if (p.verify) { price = price.replace('[[verify]]', '<span class="ph-note">[[verify]]</span>'); }
    }
    var catStr = p.categories ? p.categories.join(' ') : p.category;
    return '<article class="card" data-cat="' + esc(catStr) + '">' +
      '<div class="ph">' + (p.flag ? '<span class="flag">' + esc(p.flag) + '</span>' : '') +
        picture(p.photo, p.name + ' — ' + p.desc, null, p.nameHi) + '</div>' +
      '<div class="bd"><h3>' + esc(p.name) + '</h3>' +
        '<div class="deva">' + esc(p.nameHi) + '</div>' +
        '<p class="desc">' + esc(p.desc) + '</p>' +
        '<div class="meta">' + tags + shelf + '</div></div>' +
      '<div class="foot">' + price +
        '<a class="btn btn-wa" href="' + attr(productWa(p)) + '" rel="noopener">' + ICON.wa +
        'Order<span class="sr-only"> ' + esc(p.name) + '</span></a></div>' +
    '</article>';
  }

  /* ── ASSORTMENT BAND CARD ───────────────────────────────────────────────── */
  function bandCard(b, i) {
    return '<article class="band c' + i + '" id="' + b.id + '">' +
      '<div class="bh"><h3>' + esc(b.name) + '</h3>' +
        '<div class="bp">' + inr(b.pricePerKg) + ' <small>per kg</small></div>' +
        '<p class="pitch">' + esc(b.pitch) + '</p></div>' +
      '<ul>' + b.contents.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      '<div class="act"><a class="btn btn-block" href="' +
        attr(waLink(b.name + ' — ' + inr(b.pricePerKg) + ' per kg')) + '" rel="noopener">' +
        ICON.wa + 'Order this box</a></div></article>';
  }

  /* ── BOX / HAMPER LADDER ────────────────────────────────────────────────── */
  function ladder(title, rows, kind) {
    var body = rows.map(function (r) {
      var item = (kind === 'hamper' ? 'Fancy Rakhi Gift Hamper, ' : '') + r.name +
                 (r.weight && r.weight !== '—' ? ' — ' + r.weight : '') + ' (' + inr(r.price) + ')';
      return '<div class="row"><span class="nm">' + esc(r.name) +
        (r.weight && r.weight !== '—' ? '<span class="lwt">' + esc(r.weight) + '</span>' : '') + '</span>' +
        '<span class="dots"></span><span class="pr">' + inr(r.price) + '</span>' +
        '<a class="btn btn-wa lbtn" href="' +
        attr(waLink(item, BOXNOTE)) + '" rel="noopener" aria-label="Order ' + esc(r.name) +
        '">' + ICON.wa + '<span class="btxt">Order</span></a></div>';
    }).join('');
    return '<div class="ladder"><div class="lh">' + esc(title) + '</div>' +
      '<div class="lb">' + body + '</div>' +
      '<div class="extra">* Fancy Boxes Charges Extra</div></div>';
  }

  /* ── RENDERERS ──────────────────────────────────────────────────────────── */
  function renderCatalogue() {
    var host = $('#catalogue'); if (!host) { return; }
    var live = PRODUCTS.filter(function (p) { return p.live !== false; });
    var bar = $('#filters'), countEl = $('#result-count');
    if (bar) {
      bar.innerHTML = CATEGORIES.map(function (c, i) {
        return '<button type="button" data-cat="' + c.id + '" aria-pressed="' + (i === 0) + '">' + esc(c.label) + '</button>';
      }).join('');
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) { return; }
        $$('button', bar).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        draw(b.dataset.cat);
      });
    }
    function draw(cat) {
      var list = (!cat || cat === 'all') ? live : live.filter(function (p) { return hasCategory(p, cat); });
      host.innerHTML = list.map(pcard).join('');
      if (countEl) {
        var label = (CATEGORIES.filter(function (c) { return c.id === cat; })[0] || {}).label;
        countEl.textContent = list.length + (list.length === 1 ? ' sweet' : ' sweets') +
          (cat && cat !== 'all' ? ' in ' + label : ' on the counter');
      }
    }
    draw('all');
  }

  function renderBands() {
    $$('[data-bands]').forEach(function (h) { h.innerHTML = BANDS.map(bandCard).join(''); });
  }
  function renderHampers() {
    $$('[data-hampers]').forEach(function (h) {
      h.innerHTML = ladder('Fancy Rakhi Gift Hampers', HAMPERS, 'hamper');
    });
  }
  function renderBoxes() {
    $$('[data-boxes]').forEach(function (h) { h.innerHTML = ladder('Dry Fruit Boxes', BOXES, 'box'); });
  }
  function renderCats() {
    var host = $('#cattiles'); if (!host) { return; }
    /* notes are computed from the price file, so a rate change can never leave
       a stale "from ..." label behind on a tile */
    function low(cat) {
      var xs = PRODUCTS.filter(function (p) { return hasCategory(p, cat) && p.pricePerKg != null; });
      if (!xs.length) { return ''; }
      var kg = xs.filter(function (p) { return p.unit === 'kg'; });
      var pc = xs.filter(function (p) { return p.unit === 'piece'; });
      if (kg.length) {
        return 'from ' + inr(Math.min.apply(null, kg.map(function (p) { return p.pricePerKg; }))) + '/kg';
      }
      return 'from ' + inr(Math.min.apply(null, pc.map(function (p) { return p.pricePerKg; }))) + ' a piece';
    }
    function shot(cat) {
      var x = PRODUCTS.filter(function (p) { return hasCategory(p, cat) && p.photo; })[0];
      return x ? x.photo : null;
    }
    var bandLow = inr(Math.min.apply(null, BANDS.map(function (b) { return b.pricePerKg; })));
    var hampLow = inr(Math.min.apply(null, HAMPERS.map(function (h) { return h.price; })));
    var hampHi  = inr(Math.max.apply(null, HAMPERS.map(function (h) { return h.price; })));
    var tiles = [
      { label:'Modak & Prasad',   note:'from ₹500 / box', href:'ganpati.html', photo:'modak-box-21' },
      { label:'Assortment Boxes', note:'from ' + bandLow + '/kg', href:'assortments.html', photo:'box-green' },
      { label:'Dry Fruit Sweets', note:low('dryfruit'),  href:'sweets.html', photo:shot('dryfruit') },
      { label:'Milk & Mawa',      note:low('milk-mawa'), href:'sweets.html', photo:shot('milk-mawa') },
      { label:'Milk & Mawa Peda', note:low('peda'),      href:'sweets.html', photo:shot('peda') },
      { label:'Gift Hampers',     note:hampLow + '–' + hampHi, href:'boxes.html', photo:'box-white' },
      { label:'Bengali Sweets',   note:low('bengali'),   href:'sweets.html', photo:shot('bengali') }
    ];
    host.innerHTML = tiles.map(catTile).join('');
  }

  function renderRow(id, ids) {
    var host = $(id); if (!host) { return; }
    host.innerHTML = ids.map(function (x) {
      return PRODUCTS.filter(function (p) { return p.id === x; })[0];
    }).filter(Boolean).map(pcard).join('');
  }

  function renderBest() {
    var host = $('#bestsellers'); if (!host) { return; }
    /* Ganpati Specials and Signature sweets lead, in menu order; everything else follows behind them. */
    var fest = PRODUCTS.filter(function (p) { return p.flag === 'Ganpati Special' || p.flag === 'Bestseller'; });
    var sig  = PRODUCTS.filter(function (p) { return p.flag === 'Signature'; });
    var rest = PRODUCTS.filter(function (p) { return p.flag !== 'Signature' && p.flag !== 'Ganpati Special' && p.flag !== 'Bestseller'; });
    host.innerHTML = fest.concat(sig).concat(rest).map(pcard).join('');
    host.setAttribute('data-stagger', '');
  }
  function renderFaq() {
    var host = $('#faq'); if (!host) { return; }
    host.innerHTML = FAQS.map(function (f) {
      return '<details><summary>' + esc(f.q) + '</summary><p>' + phFmt(f.a) + '</p></details>';
    }).join('');
  }

  /* ── SHOP DETAILS ───────────────────────────────────────────────────────── */
  function fillShop() {
    var pretty = function (n) { return n.replace(/^(\d{5})(\d{5})$/, '$1 $2'); };
    var map = {
      'shop-name': SHOP.name,
      'shop-address': SHOP.addr1 + ', ' + SHOP.addr2,
      'shop-hours': SHOP.hours,
      'shop-landmark': SHOP.landmark,
      'shop-rating': SHOP.rating,
      'shop-reviews': SHOP.reviews
    };
    Object.keys(map).forEach(function (k) {
      $$('[data-shop="' + k + '"]').forEach(function (el) { el.textContent = map[k]; });
    });
    $$('[data-phones]').forEach(function (el) {
      el.innerHTML = SHOP.phones.map(function (n) {
        return '<a href="tel:+91' + n + '">' + pretty(n) + '</a>';
      }).join('<span aria-hidden="true"> · </span>');
    });
    $$('[data-href="tel"]').forEach(function (a) { a.href = 'tel:+91' + SHOP.whatsapp.slice(2); });
    $$('[data-href="maps"]').forEach(function (a) { a.href = SHOP.maps; });
    $$('[data-href="wa"]').forEach(function (a) {
      a.href = waLink(a.dataset.waItem || 'a Fancy Rakhi Gift Hamper', a.dataset.waExtra || '');
    });
    $$('[data-ph]').forEach(function (el) {
      var k = el.dataset.ph, v = SHOP[k];
      if (isTBC(v)) { el.innerHTML = '<span class="ph-note">' + esc(v) + '</span>'; return; }
      if (k === 'email') {
        el.innerHTML = '<a href="mailto:' + esc(v) + '">' + esc(v) + '</a>';
      } else if (k === 'instagram') {
        el.innerHTML = '<a href="' + esc(v) + '" rel="noopener" target="_blank">@omsddm</a>';
      } else { el.textContent = v; }
    });
  }



  /* the add-to-basket row under each card: weight, quantity, add */
  function buyRow(p) {
    if (p.pricePerKg == null) { return ''; }
    var opts = (p.weightOptions && p.weightOptions.length ? p.weightOptions : ['1 kg'])
      .map(function (w, i) {
        return '<option value="' + esc(w) + '"' + (i === 1 || p.unit === 'piece' ? ' selected' : '') + '>' +
               esc(w) + '</option>';
      }).join('');
    var id = 'w-' + p.id;
    return '<div class="buy">' +
      '<label class="sr" for="' + id + '">Weight for ' + esc(p.name) + '</label>' +
      '<select class="wsel" id="' + id + '" data-buy-w>' + opts + '</select>' +
      '<div class="qsel"><button type="button" data-buy-less aria-label="One less">−</button>' +
        '<input type="text" inputmode="numeric" value="1" size="2" data-buy-q ' +
          'aria-label="Quantity of ' + esc(p.name) + '">' +
        '<button type="button" data-buy-more aria-label="One more">+</button></div>' +
      '<button type="button" class="pbuy" data-buy-add="' + esc(p.id) + '">Add</button>' +
    '</div>';
  }

  /* one delegated listener covers every grid on the page, now and later */
  function buyWire() {
    document.addEventListener('click', function (e) {
      var row = e.target.closest('.buy'); if (!row) { return; }
      var q = row.querySelector('[data-buy-q]');
      var n = Math.max(1, Math.min(99, parseInt(q.value, 10) || 1));
      if (e.target.closest('[data-buy-less]')) { q.value = Math.max(1, n - 1); return; }
      if (e.target.closest('[data-buy-more]')) { q.value = Math.min(99, n + 1); return; }
      var add = e.target.closest('[data-buy-add]');
      if (add) {
        q.value = n;
        cartAdd(add.dataset.buyAdd, row.querySelector('[data-buy-w]').value, n);
        add.textContent = 'Added';
        setTimeout(function () { add.textContent = 'Add'; }, 1100);
      }
    });
    document.addEventListener('input', function (e) {
      if (e.target.matches('[data-buy-q]')) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 2);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CART

     A real cart, not a decorative one. It holds lines in memory, mirrors them
     into localStorage so the basket survives moving between pages, and checks
     out by opening WhatsApp with the customer's name, number, delivery area
     and every line written out. No card is taken here and no payment is
     claimed — the shop confirms the final rate on WhatsApp, because fancy box
     charges and delivery are settled per order.
     ══════════════════════════════════════════════════════════════════════════ */
  var CART_KEY = 'oddm-cart-v1';
  var cart = [];

  function cartLoad() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) { cart = []; }
    } catch (e) { cart = []; }        /* private mode, blocked storage — memory only */
  }
  function cartSave() {
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  var GRAMS = {'250 gms': 250, '500 gms': 500, '1 kg': 1000};

  /* what one line costs: per-kg items scale by weight, per-piece items by count */
  function linePrice(l) {
    var p = byId(l.id);
    if (!p || p.pricePerKg == null) { return null; }
    if (p.unit === 'piece') { return p.pricePerKg * l.qty; }
    var g = GRAMS[l.weight] || 1000;
    return Math.round(p.pricePerKg * (g / 1000)) * l.qty;
  }
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) { if (PRODUCTS[i].id === id) { return PRODUCTS[i]; } }
    var pools = [BOXES, HAMPERS, BANDS];
    for (var j = 0; j < pools.length; j++) {
      for (var k = 0; k < pools[j].length; k++) {
        var x = pools[j][k];
        if ((x.id || slugify(x.name)) === id) {
          return {id: id, name: x.name, nameHi: x.nameHi || '', unit: 'item',
                  pricePerKg: x.price != null ? x.price : x.pricePerKg, photo: null};
        }
      }
    }
    return null;
  }
  function slugify(n) {
    return String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function cartCount() {
    return cart.reduce(function (n, l) { return n + l.qty; }, 0);
  }
  function cartTotal() {
    var t = 0, exact = true;
    cart.forEach(function (l) {
      var v = linePrice(l);
      if (v == null) { exact = false; } else { t += v; }
    });
    return {total: t, exact: exact};
  }

  function cartAdd(id, weight, qty) {
    var found = null;
    cart.forEach(function (l) { if (l.id === id && l.weight === weight) { found = l; } });
    if (found) { found.qty += qty; } else { cart.push({id: id, weight: weight, qty: qty}); }
    cartSave(); cartPaint(); cartFlash();
  }
  function cartSet(i, qty) {
    if (qty <= 0) { cart.splice(i, 1); } else { cart[i].qty = qty; }
    cartSave(); cartPaint();
  }

  /* ── drawer ─────────────────────────────────────────────────────────────── */
  function cartMount() {
    if ($('#cart-drawer')) { return; }
    var btn = document.createElement('button');
    btn.className = 'cartbtn'; btn.id = 'cart-open'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Open your basket');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16l-1.6 11.2A2 2 0 0 1 ' +
      '16.4 19H7.6a2 2 0 0 1-2-1.8L4 6z"/><path d="M9 6V4.6A2.6 2.6 0 0 1 15 4.6V6"/></svg>' +
      '<span class="cartn" id="cart-n">0</span>';
    document.body.appendChild(btn);

    var wrap = document.createElement('div');
    wrap.id = 'cart-drawer'; wrap.className = 'cartwrap'; wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<div class="cartveil" data-cart-close></div>' +
      '<aside class="cartpanel" role="dialog" aria-modal="true" aria-label="Your basket">' +
        '<header class="carthd"><h2>Your basket</h2>' +
          '<button class="cartx" type="button" data-cart-close aria-label="Close basket">&times;</button></header>' +
        '<div class="cartbody" id="cart-lines"></div>' +
        '<div class="cartsum" id="cart-sum"></div>' +
        '<form class="cartform" id="cart-form" novalidate>' +
          '<label>Your name<input name="nm" autocomplete="name" required></label>' +
          '<label>Phone number<input name="ph" inputmode="tel" autocomplete="tel" required></label>' +
          '<label>Delivery area or address<textarea name="ad" rows="2" autocomplete="street-address" required></textarea></label>' +
          '<p class="carterr" id="cart-err" role="alert" hidden></p>' +
          '<button class="cartgo" type="submit">' + ICON.wa + 'Place order on WhatsApp</button>' +
          '<p class="cartfine">Nothing is charged here. The shop confirms your final rate, ' +
            'fancy box charges and delivery on WhatsApp before you pay.</p>' +
        '</form>' +
      '</aside>';
    document.body.appendChild(wrap);

    btn.addEventListener('click', function () { cartOpen(true); });
    wrap.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-cart-close')) { cartOpen(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('on')) { cartOpen(false); }
    });
    $('#cart-form').addEventListener('submit', cartCheckout);
    $('#cart-lines').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ci]'); if (!b) { return; }
      var i = +b.dataset.ci;
      if (b.dataset.act === 'less') { cartSet(i, cart[i].qty - 1); }
      if (b.dataset.act === 'more') { cartSet(i, cart[i].qty + 1); }
      if (b.dataset.act === 'del')  { cartSet(i, 0); }
    });
    cartPaint();
  }

  var lastFocus = null;
  function cartOpen(on) {
    var wrap = $('#cart-drawer'); if (!wrap) { return; }
    wrap.classList.toggle('on', on);
    wrap.setAttribute('aria-hidden', on ? 'false' : 'true');
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) { lastFocus = document.activeElement; var f = $('#cart-drawer .cartx'); if (f) { f.focus(); } }
    else if (lastFocus) { lastFocus.focus(); }
  }
  function cartFlash() {
    var b = $('#cart-open'); if (!b) { return; }
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  }

  function cartPaint() {
    var n = $('#cart-n'); if (n) { n.textContent = cartCount(); n.classList.toggle('zero', !cartCount()); }
    var host = $('#cart-lines'); if (!host) { return; }
    if (!cart.length) {
      host.innerHTML = '<p class="cartempty">Your basket is empty. Add a sweet and it will show up here.</p>';
      $('#cart-sum').innerHTML = '';
      $('#cart-form').hidden = true;
      return;
    }
    $('#cart-form').hidden = false;
    host.innerHTML = cart.map(function (l, i) {
      var p = byId(l.id) || {name: l.id, nameHi: '', photo: null};
      var v = linePrice(l);
      return '<div class="cartline">' +
        '<div class="cartpic">' + (p.photo
          ? '<img src="assets/img/' + p.photo + '-400.jpg" alt="" width="64" height="64" loading="lazy">'
          : '<img src="assets/img/medallion.svg" alt="" width="64" height="64" loading="lazy">') + '</div>' +
        '<div class="cartinfo"><b>' + esc(p.name) + '</b>' +
          '<span>' + esc(l.weight) + '</span>' +
          '<div class="qty">' +
            '<button type="button" data-ci="' + i + '" data-act="less" aria-label="One less">−</button>' +
            '<span aria-live="polite">' + l.qty + '</span>' +
            '<button type="button" data-ci="' + i + '" data-act="more" aria-label="One more">+</button>' +
            '<button type="button" class="cartdel" data-ci="' + i + '" data-act="del" ' +
              'aria-label="Remove ' + esc(p.name) + '">Remove</button>' +
          '</div></div>' +
        '<div class="cartamt">' + (v == null ? '<span class="ph-note">ask</span>' : inr(v)) + '</div>' +
      '</div>';
    }).join('');
    var t = cartTotal();
    $('#cart-sum').innerHTML =
      '<div class="cartrow"><span>' + cartCount() + ' item' + (cartCount() === 1 ? '' : 's') + '</span>' +
      '<b>' + inr(t.total) + (t.exact ? '' : ' +') + '</b></div>' +
      '<p class="cartnote">Estimate only. Fancy box charges are extra and delivery is confirmed separately.</p>';
  }

  function cartCheckout(e) {
    e.preventDefault();
    var f = e.target, err = $('#cart-err');
    var nm = f.nm.value.trim(), ph = f.ph.value.trim(), ad = f.ad.value.trim();
    var digits = ph.replace(/\D/g, '');
    if (!nm || digits.length < 10 || !ad) {
      err.hidden = false;
      err.textContent = !nm ? 'Please add your name.'
        : digits.length < 10 ? 'Please enter a phone number of at least 10 digits.'
        : 'Please tell us where it is going.';
      return;
    }
    err.hidden = true;
    var t = cartTotal();
    var lines = cart.map(function (l, i) {
      var p = byId(l.id) || {name: l.id};
      var v = linePrice(l);
      return (i + 1) + '. ' + p.name + ' — ' + l.weight + ' x ' + l.qty +
             (v == null ? ' (rate to confirm)' : ' = ' + '₹' + v.toLocaleString('en-IN'));
    }).join('\n');
    var msg =
      "Hello Om's Dehlii Darbar! I would like to place an order.\n\n" +
      'Name: ' + nm + '\n' +
      'Phone: ' + ph + '\n' +
      'Delivery area: ' + ad + '\n\n' +
      'Order:\n' + lines + '\n\n' +
      'Estimated total: ₹' + t.total.toLocaleString('en-IN') + (t.exact ? '' : ' plus the items marked to confirm') +
      '\nI understand fancy box charges are extra and the final rate will be confirmed.';
    window.open('https://wa.me/' + SHOP.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  /* ── SEASON BANNER + COUNTDOWN ──────────────────────────────────────────── */
  function season() {
    var target = new Date(SEASON.festivalDate).getTime();
    var passed = Date.now() > target;
    var on = (SEASON.ganpatiLive || SEASON.rakhiLive) && !passed;

    var banner = $('#season-banner');
    if (banner) {
      if (!on) { banner.remove(); }
      else {
        var x = $('.x', banner);
        /* dismissal is held in memory only — nothing is written to the browser */
        if (x) { x.addEventListener('click', function () { banner.remove(); }); }
      }
    }
    if (!on) { $$('[data-season-only]').forEach(function (el) { el.remove(); }); }

    var cd = $('#countdown');
    if (cd) {
      if (passed) {
        cd.outerHTML = '<p class="desc" style="margin-top:16px">Ganesh Chaturthi ' + esc(SEASON.festivalLabel) +
          ' has passed. We prepare fresh modaks, gift hampers and prasad boxes all year — message us on WhatsApp and we will put one together.</p>';
        return;
      }
      var tick = function () {
        var d = Math.max(0, target - Date.now());
        cd.innerHTML =
          '<div class="cd"><b>' + Math.floor(d / 864e5) + '</b><span>Days</span></div>' +
          '<div class="cd"><b>' + Math.floor(d % 864e5 / 36e5) + '</b><span>Hours</span></div>' +
          '<div class="cd"><b>' + Math.floor(d % 36e5 / 6e4) + '</b><span>Minutes</span></div>';
      };
      tick(); setInterval(tick, 30000);
    }
  }

  function nav() {
    var btn = $('#navbtn'), menu = $('#nav');
    if (btn && menu) {
      btn.addEventListener('click', function () {
        btn.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
      });
    }
    var here = location.pathname.split('/').pop() || 'index.html';
    $$('#nav a').forEach(function (a) {
      if (a.getAttribute('href') === here) { a.setAttribute('aria-current', 'page'); }
    });
  }

  function corporateForm() {
    var f = $('#corp-form'); if (!f) { return; }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };
      var lines = ["Hello Om's Dehlii Darbar! Corporate gifting enquiry.",
        'Company: ' + (g('company') || '—'), 'Name: ' + (g('name') || '—'),
        'Item: ' + (g('item') || '—'), 'Quantity: ' + (g('qty') || '—'),
        'Needed by: ' + (g('date') || '—'), 'Delivery area: ' + (g('area') || '—')];
      if (g('notes')) { lines.push('Notes: ' + g('notes')); }
      lines.push('(I understand fancy box charges are extra.)');
      window.open('https://wa.me/' + SHOP.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')),
                  '_blank', 'noopener');
    });
  }

  /* ── Product JSON-LD — only for items with a real printed rate ──────────── */
  function productSchema() {
    if (!$('#catalogue')) { return; }
    var items = PRODUCTS.filter(function (p) { return p.live !== false && p.pricePerKg != null && !p.verify; })
      .map(function (p) {
        return {
          '@context': 'https://schema.org', '@type': 'Product',
          name: p.name, description: p.desc, category: p.category,
          brand: { '@type': 'Brand', name: SHOP.name },
          offers: {
            '@type': 'Offer', priceCurrency: 'INR', price: p.pricePerKg,
            availability: 'https://schema.org/InStock',
            eligibleQuantity: { '@type': 'QuantitativeValue',
              value: 1, unitCode: p.unit === 'piece' ? 'H87' : 'KGM' },
            seller: { '@type': 'Bakery', name: SHOP.name }
          }
        };
      });
    if (!items.length) { return; }
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(items);
    document.head.appendChild(s);
  }

  function init() {
    nav(); fillShop(); season();
    renderCats(); renderBands(); renderHampers(); renderBoxes(); renderBest();
    renderRow('#row-dryfruit', ['kesar-katri','anjeer-sugarfree','dry-fruit-sandwich','khajur-sugarfree']);
    renderCatalogue(); renderFaq();
    corporateForm(); productSchema();
    cartLoad(); cartMount(); buyWire();
    motion();
  }
  var booted = false;
  function boot() { if (booted) { return; } booted = true; init(); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }   /* deferred scripts land here: DOM is parsed, nothing painted yet */

  /* ── MOTION ───────────────────────────────────────────────────────────────
     Scroll reveals, a scroll-progress bar and a back-to-top button.
     All of it is decorative. If the viewer has asked for reduced motion we
     mark everything visible at once and wire none of it up.               */
  function motion() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* which blocks reveal, and how */
    [['.sec > .wrap > *:not(#catalogue)', 'up'], ['.pgrid', 'rise'], ['.cats', 'up'], ['[data-bands]', 'up'],
     ['[data-hampers]', 'up'], ['[data-boxes]', 'up'], ['.trustbar', 'zoom'], ['.promo', 'up'],
     ['.rowhead', 'left'], ['.ladder', 'right'], ['.fresh', 'up']
    ].forEach(function (pair) {
      $$(pair[0]).forEach(function (el) {
        if (!el.hasAttribute('data-reveal')) { el.setAttribute('data-reveal', pair[1]); }
      });
    });
    $$('.pgrid, .cats, .trustbar, [data-hampers], [data-boxes]').forEach(function (el) {
      el.setAttribute('data-stagger', '');
    });

    var cHost = $('#catalogue');
    if (cHost) {
      cHost.removeAttribute('data-reveal');
      cHost.classList.add('in');
    }

    var targets = $$('[data-reveal], [data-stagger]');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      var b0 = $('.banner'); if (b0) { b0.classList.add('ready'); }
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {rootMargin: '0px 0px 50px 0px', threshold: 0.01});
    targets.forEach(function (el) { io.observe(el); });

    /* anything rendered by JS after this point still needs observing */
    window.__reveal = function (el) {
      if (!el) { return; }
      if (reduce) { el.classList.add('in'); return; }
      io.observe(el);
    };

    var banner = $('.banner');
    if (banner) { requestAnimationFrame(function () { banner.classList.add('ready'); }); }

    /* scroll progress + back to top */
    var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
    var top = document.createElement('button');
    top.className = 'totop'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top');
    top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/>' +
      '<path d="M5 12l7-7 7 7"/></svg>';
    top.addEventListener('click', function () { window.scrollTo({top: 0, behavior: 'smooth'}); });
    document.body.appendChild(top);

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
        top.classList.toggle('on', window.scrollY > 700);
        ticking = false;
      });
    }, {passive: true});
  }
})();
