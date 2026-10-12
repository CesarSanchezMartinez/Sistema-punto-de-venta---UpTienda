console.log("Cesar Sanchez Martinez 24598 4C");

const PRODUCTS_KEY = 'uptienda_products_v1';
const SALES_KEY = 'uptienda_sales_v1';
const SUPPLIERS_KEY = 'uptienda_suppliers_v1';
const SESSION_START_KEY = 'uptienda_session_start_v1';

const normalizeProductText = (value) => (value || '').trim().toLowerCase();

const read = (key) => {
  if (typeof localStorage === 'undefined') return [];
  return JSON.parse(localStorage.getItem(key) || '[]');
};
const write = (key, data) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

function filterProducts(products, query) {
  const normalizedQuery = normalizeProductText(query);
  if (!normalizedQuery) return [];
  return products.filter((product) => normalizeProductText(product.name).includes(normalizedQuery));
}

function selectProductSuggestion(item, form, productInput, productMatches) {
  const name = item.dataset.name;
  const price = item.dataset.price;
  const priceInput = getFormField(form, 'price');
  productInput.value = name;
  if (priceInput) priceInput.value = price;
  productMatches.classList.remove('visible');
  productMatches.classList.add('hidden');
  productMatches.innerHTML = '';
}

function getFormField(form, name) {
  return form.elements?.[name] || form.querySelector(`[name="${name}"]`) || null;
}

function initInventario() {
  const form = document.getElementById('productForm');
  const supplierForm = document.getElementById('supplierForm');
  const supplierSelect = document.getElementById('supplierSelect');
  const filterSupplierSelect = document.getElementById('filterSupplier');
  const list = document.getElementById('productList');
  const searchInput = document.getElementById('searchInventory');
  const btnViewSuppliers = document.getElementById('btnViewSuppliers');

  const stockInputEl = getFormField(form, 'stock');
  if (stockInputEl) {
    stockInputEl.setAttribute('step', '1');
    stockInputEl.setAttribute('min', '0');
  }

  const countSuficienteEl = document.getElementById('countSuficiente');
  const countModeradoEl = document.getElementById('countModerado');
  const countBajoEl = document.getElementById('countBajo');
  const countAgotadoEl = document.getElementById('countAgotado');
  const clearFilterBtn = document.getElementById('clearStockFilter');

  let activeStockFilter = 'todos';
  let activeSupplierFilter = '';

  const filterStyles = {
    suficiente: { ring: 'ring-2', ringColor: 'ring-emerald-400', shadow: 'shadow-lg', shadowColor: 'shadow-emerald-500/20' },
    moderado:   { ring: 'ring-2', ringColor: 'ring-amber-400',   shadow: 'shadow-lg', shadowColor: 'shadow-amber-500/20' },
    bajo:       { ring: 'ring-2', ringColor: 'ring-rose-400',    shadow: 'shadow-lg', shadowColor: 'shadow-rose-500/20' },
    agotado:    { ring: 'ring-2', ringColor: 'ring-slate-400',   shadow: 'shadow-lg', shadowColor: 'shadow-slate-500/20' }
  };

  function loadSuppliers() {
    const suppliers = read(SUPPLIERS_KEY);
    suppliers.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    const optionsHtml = '<option value="" class="bg-[#0f172a]">Seleccione...</option>' + 
      suppliers.map(s => `<option value="${s.name}" class="bg-[#0f172a]">${s.name}</option>`).join('');
    
    const filterHtml = '<option value="" class="bg-[#0f172a]">Todos los proveedores</option>' + 
      suppliers.map(s => `<option value="${s.name}" class="bg-[#0f172a]">${s.name}</option>`).join('');

    if (supplierSelect) supplierSelect.innerHTML = optionsHtml;
    if (filterSupplierSelect) {
      filterSupplierSelect.innerHTML = filterHtml;
      filterSupplierSelect.value = activeSupplierFilter;
    }
  }

  if (supplierForm) {
    supplierForm.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const nameInput = getFormField(supplierForm, 'name');
      const phoneInput = getFormField(supplierForm, 'phone');
      const emailInput = getFormField(supplierForm, 'email');

      const name = nameInput?.value.trim() || '';
      const phone = phoneInput?.value.trim() || '';
      const email = emailInput?.value.trim() || '';

      if (!name) return alert('El nombre o empresa del proveedor es requerido');

      const suppliers = read(SUPPLIERS_KEY);
      const exists = suppliers.find(s => normalizeProductText(s.name) === normalizeProductText(name));

      if (exists) {
        alert('Este proveedor ya está registrado.');
      } else {
        suppliers.push({ name, phone, email });
        write(SUPPLIERS_KEY, suppliers);
        supplierForm.reset();
        loadSuppliers();
        alert('¡Proveedor registrado con éxito!');
      }
    });
  }

  if (btnViewSuppliers) {
    const renderSuppliersModalContent = () => {
      const suppliers = read(SUPPLIERS_KEY);
      suppliers.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
      
      const containerModal = document.getElementById('suppliersListContainer');
      const countLabel = document.getElementById('suppliersCountLabel');
      if (countLabel) {
        countLabel.textContent = `${suppliers.length} proveedor${suppliers.length === 1 ? '' : 'es'} registrado${suppliers.length === 1 ? '' : 's'}`;
      }

      if (!containerModal) return;

      if (suppliers.length === 0) {
        containerModal.innerHTML = `<div class="text-center py-8 text-slate-400">No hay proveedores registrados todavía.</div>`;
        return;
      }

      containerModal.innerHTML = suppliers.map((s, idx) => `
        <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] transition flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center justify-center">${idx + 1}</span>
              <h4 class="font-semibold text-white text-sm">${s.name}</h4>
            </div>
            <p class="text-xs text-slate-300 pl-7">📞 <span class="text-slate-400">Tel:</span> ${s.phone || 'No especificado'}</p>
            <p class="text-xs text-slate-300 pl-7">✉️ <span class="text-slate-400">Email:</span> ${s.email || 'No especificado'}</p>
          </div>
          <button type="button" data-supplier-name="${s.name}" class="delete-supplier text-slate-400 hover:text-rose-400 p-1.5 transition rounded-xl hover:bg-rose-500/10" title="Eliminar proveedor">
            ✕
          </button>
        </div>
      `).join('');
    };

    btnViewSuppliers.addEventListener('click', () => {
      const existingModal = document.getElementById('suppliersModalOverlay');
      if (existingModal) existingModal.remove();

      const overlay = document.createElement('div');
      overlay.id = 'suppliersModalOverlay';
      overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4';

      overlay.innerHTML = `
        <div class="w-full max-w-md rounded-3xl bg-[#0f172a] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
          <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">📋</div>
              <div>
                <h3 class="font-bold text-white text-base">Directorio de Proveedores</h3>
                <p id="suppliersCountLabel" class="text-xs text-slate-400">0 proveedores registrados</p>
              </div>
            </div>
            <button id="closeSuppliersModal" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition">✕</button>
          </div>

          <div id="suppliersListContainer" class="p-6 overflow-y-auto space-y-3 custom-scrollbar flex-1">
            <!-- Contenido dinámico -->
          </div>

          <div class="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
            <button id="closeSuppliersModalBtn" class="px-5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-500/20">Cerrar</button>
          </div>

          <!-- Sub-modal de confirmación interno estilo tarjeta -->
          <div id="customConfirmModal" class="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center p-6 hidden">
            <div class="bg-[#0f172a] border border-white/15 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
              <div class="w-16 h-16 rounded-full bg-rose-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
              <h4 class="text-white font-bold text-lg" id="confirmTitle">¿Eliminar proveedor?</h4>
              <p class="text-slate-300 text-xs" id="confirmMessage">¿Estás seguro de eliminar al proveedor?</p>
              <div class="flex gap-3 pt-2">
                <button id="confirmCancelBtn" class="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition">Cancelar</button>
                <button id="confirmOkBtn" class="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition shadow-lg shadow-rose-500/20">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      renderSuppliersModalContent();

      const closeModalFn = () => overlay.remove();
      overlay.querySelector('#closeSuppliersModal').addEventListener('click', closeModalFn);
      overlay.querySelector('#closeSuppliersModalBtn').addEventListener('click', closeModalFn);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModalFn();
      });

      const containerModal = overlay.querySelector('#suppliersListContainer');
      const confirmModal = overlay.querySelector('#customConfirmModal');
      const confirmMsg = overlay.querySelector('#confirmMessage');
      const confirmOkBtn = overlay.querySelector('#confirmOkBtn');
      const confirmCancelBtn = overlay.querySelector('#confirmCancelBtn');

      if (containerModal) {
        containerModal.addEventListener('click', (e) => {
          const deleteBtn = e.target.closest('.delete-supplier');
          if (!deleteBtn) return;
          
          e.preventDefault();
          e.stopPropagation();

          const supNameToDelete = deleteBtn.getAttribute('data-supplier-name');
          if (!supNameToDelete) return;

          confirmMsg.textContent = `¿Estás seguro de eliminar al proveedor "${supNameToDelete}"?`;
          confirmModal.classList.remove('hidden');

          const newOkBtn = confirmOkBtn.cloneNode(true);
          const newCancelBtn = confirmCancelBtn.cloneNode(true);
          confirmOkBtn.parentNode.replaceChild(newOkBtn, confirmOkBtn);
          confirmCancelBtn.parentNode.replaceChild(newCancelBtn, confirmCancelBtn);

          newCancelBtn.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
          });

          newOkBtn.addEventListener('click', () => {
            confirmModal.classList.add('hidden');

            let suppliersData = read(SUPPLIERS_KEY);
            suppliersData = suppliersData.filter(s => normalizeProductText(s.name) !== normalizeProductText(supNameToDelete));
            write(SUPPLIERS_KEY, suppliersData);
            loadSuppliers();
            renderSuppliersModalContent();
          });
        });
      }
    });
  }

  if (filterSupplierSelect) {
    filterSupplierSelect.addEventListener('change', (e) => {
      activeSupplierFilter = e.target.value;
      render(searchInput?.value || '');
    });
  }

  function updateCardSelectionStyles() {
    Object.keys(filterStyles).forEach(filter => {
      const cardEl = document.getElementById(`count${filter.charAt(0).toUpperCase() + filter.slice(1)}`)?.closest('.glass-card');
      if (cardEl) {
        const style = filterStyles[filter];
        const styleClasses = [style.ring, style.ringColor, style.shadow, style.shadowColor, 'scale-[1.02]', 'bg-white/10'];

        if (activeStockFilter === filter) {
          cardEl.classList.add(...styleClasses);
        } else {
          cardEl.classList.remove(...styleClasses);
        }
      }
    });

    if (clearFilterBtn) {
      if (activeStockFilter !== 'todos' || activeSupplierFilter !== '') {
        clearFilterBtn.classList.remove('hidden');
      } else {
        clearFilterBtn.classList.add('hidden');
      }
    }
  }

  function render(query = '') {
    if (!list) return;
    const allItems = read(PRODUCTS_KEY);

    let suficiente = 0, moderado = 0, bajo = 0, agotado = 0;
    allItems.forEach(p => {
      const stock = parseInt(p.stock, 10) || 0;
      if (stock >= 8) suficiente++;
      else if (stock >= 4) moderado++;
      else if (stock > 0) bajo++;
      else agotado++;
    });

    if (countSuficienteEl) countSuficienteEl.textContent = suficiente;
    if (countModeradoEl) countModeradoEl.textContent = moderado;
    if (countBajoEl) countBajoEl.textContent = bajo;
    if (countAgotadoEl) countAgotadoEl.textContent = agotado;

    let items = allItems;
    if (query) {
      const normQuery = normalizeProductText(query);
      items = items.filter(p => 
        normalizeProductText(p.name).includes(normQuery) || 
        normalizeProductText(p.supplier).includes(normQuery)
      );
    }

    if (activeSupplierFilter) {
      items = items.filter(p => normalizeProductText(p.supplier) === normalizeProductText(activeSupplierFilter));
    }

    if (activeStockFilter !== 'todos') {
      items = items.filter(p => {
        const stock = parseInt(p.stock, 10) || 0;
        if (activeStockFilter === 'suficiente') return stock >= 8;
        if (activeStockFilter === 'moderado') return stock >= 4 && stock <= 7;
        if (activeStockFilter === 'bajo') return stock >= 1 && stock <= 3;
        if (activeStockFilter === 'agotado') return stock === 0;
        return true;
      });
    }

    updateCardSelectionStyles();
    items.sort((a, b) => (parseInt(a.stock, 10) || 0) - (parseInt(b.stock, 10) || 0));

    if (items.length === 0) {
      list.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-[color:var(--muted)]">No se encontraron productos.</td></tr>`;
      return;
    }

    list.innerHTML = items.map((p) => {
      const stock = parseInt(p.stock, 10) || 0;
      const supplier = p.supplier || 'N/A';
      
      let unitText = 'N/A';
      if (p.unitValue && p.unitType) {
        unitText = `${p.unitValue} ${p.unitType}`;
      } else if (p.unitType) {
        unitText = p.unitType;
      }
      
      let stockBadge = '';
      if (stock >= 8) {
        stockBadge = `<span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">${stock} pzas (Suficiente)</span>`;
      } else if (stock >= 4) {
        stockBadge = `<span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">${stock} (Moderado)</span>`;
      } else if (stock > 0) {
        stockBadge = `<span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">${stock} (Bajo)</span>`;
      } else {
        stockBadge = `<span class="px-3 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-semibold">Agotado</span>`;
      }

      return `
      <tr class="border-t border-white/10 hover:bg-white/[0.02] transition">
        <td class="px-3 py-3 font-medium text-white">${p.name}</td>
        <td class="px-3 py-3 text-slate-400">${supplier}</td>
        <td class="px-3 py-3 text-slate-300">${unitText}</td>
        <td class="px-3 py-3 text-right text-[color:var(--accent-green)] font-semibold">$${parseFloat(p.price).toFixed(2)}</td>
        <td class="px-3 py-3 text-center">${stockBadge}</td>
        <td class="px-3 py-3 text-right space-x-2">
          <button data-product-name="${p.name}" class="edit px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 rounded-2xl text-xs font-semibold uppercase tracking-wider transition">Editar</button>
          <button data-product-name="${p.name}" class="del px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 rounded-2xl text-xs font-semibold uppercase tracking-wider transition">Eliminar</button>
        </td>
      </tr>`;
    }).join('');

    list.querySelectorAll('.del').forEach(b => b.addEventListener('click', (e) => {
      const targetName = e.currentTarget.dataset.productName;
      let data = read(PRODUCTS_KEY);
      data = data.filter(item => normalizeProductText(item.name) !== normalizeProductText(targetName));
      write(PRODUCTS_KEY, data);
      render(searchInput?.value || '');
    }));

    list.querySelectorAll('.edit').forEach(b => b.addEventListener('click', (e) => {
      const targetName = e.currentTarget.dataset.productName;
      const data = read(PRODUCTS_KEY);
      const realIndex = data.findIndex(item => normalizeProductText(item.name) === normalizeProductText(targetName));
      
      if (realIndex === -1) return;
      const p = data[realIndex];

      if (form) {
        if (getFormField(form, 'name')) getFormField(form, 'name').value = p.name;
        if (getFormField(form, 'supplier')) getFormField(form, 'supplier').value = p.supplier || '';
        if (getFormField(form, 'unitValue')) getFormField(form, 'unitValue').value = p.unitValue || '';
        if (getFormField(form, 'unitType')) getFormField(form, 'unitType').value = p.unitType || 'pza';
        if (getFormField(form, 'price')) getFormField(form, 'price').value = p.price;
        if (getFormField(form, 'stock')) getFormField(form, 'stock').value = parseInt(p.stock, 10) || 0;
        form.dataset.editIndex = realIndex;
      }
    }));
  }

  const setupCardFilter = (elementId, filterType) => {
    const cardEl = document.getElementById(elementId)?.closest('.glass-card');
    if (cardEl) {
      cardEl.classList.add('cursor-pointer', 'transition-all', 'duration-200');
      cardEl.addEventListener('click', () => {
        activeStockFilter = filterType;
        render(searchInput?.value || '');
      });
    }
  };

  setupCardFilter('countSuficiente', 'suficiente');
  setupCardFilter('countModerado', 'moderado');
  setupCardFilter('countBajo', 'bajo');
  setupCardFilter('countAgotado', 'agotado');

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', () => {
      activeStockFilter = 'todos';
      activeSupplierFilter = '';
      if (filterSupplierSelect) filterSupplierSelect.value = '';
      render(searchInput?.value || '');
    });
  }

  if (form) {
    const stockInput = getFormField(form, 'stock');
    if (stockInput) {
      stockInput.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val.includes('.') || val.includes(',')) {
          e.target.value = parseInt(val, 10) || '';
        }
      });
    }

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const nameInput = getFormField(form, 'name');
      const supplierInput = getFormField(form, 'supplier');
      const unitValueInput = getFormField(form, 'unitValue');
      const unitTypeInput = getFormField(form, 'unitType');
      const priceInput = getFormField(form, 'price');
      const stockInputEl = getFormField(form, 'stock');

      const name = nameInput?.value.trim() || '';
      const supplier = supplierInput?.value.trim() || '';
      const unitValue = unitValueInput?.value.trim() || '';
      const unitType = unitTypeInput?.value.trim() || 'pza';
      const price = parseFloat(priceInput?.value) || 0;
      const stock = Math.max(0, parseInt(stockInputEl?.value, 10) || 0);

      if (!name) return alert('Nombre requerido');
      
      const items = read(PRODUCTS_KEY);
      if (form.dataset.editIndex !== undefined && form.dataset.editIndex !== '') {
        items[form.dataset.editIndex] = { name, supplier, unitValue, unitType, price, stock };
        delete form.dataset.editIndex;
      } else {
        items.push({ name, supplier, unitValue, unitType, price, stock });
      }

      write(PRODUCTS_KEY, items);
      form.reset();
      render(searchInput?.value || '');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      render(e.target.value);
    });
  }

  loadSuppliers();
  render();
}

function initVentas() {
  const form = document.getElementById('saleForm');
  const productInput = document.getElementById('productInput');
  const productMatches = document.getElementById('productMatches');
  const list = document.getElementById('salesList');
  const totalEl = document.getElementById('salesTotal');
  const finishBtn = document.getElementById('finishSaleBtn');
  const cashGivenInput = document.getElementById('cashGivenInput');
  const changeOutput = document.getElementById('changeOutput');

  const qtyInputEl = getFormField(form, 'qty');
  if (qtyInputEl) {
    qtyInputEl.setAttribute('step', '1');
    qtyInputEl.setAttribute('min', '1');
    qtyInputEl.addEventListener('input', (e) => {
      let val = e.target.value;
      if (val.includes('.') || val.includes(',')) {
        e.target.value = parseInt(val, 10) || '';
      }
    });
  }

  let currentCart = [];

  function calculateChange() {
    const total = currentCart.reduce((a, c) => a + c.qty * c.price, 0);
    const cashGiven = parseFloat(cashGivenInput?.value) || 0;
    if (!changeOutput) return;

    if (cashGiven <= 0 || cashGiven < total) {
      changeOutput.textContent = '$0.00';
      return;
    }

    const change = cashGiven - total;
    changeOutput.textContent = `$${change.toFixed(2)}`;
  }

  function renderCart() {
    if (!list) return;

    if (currentCart.length === 0) {
      list.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-[color:var(--muted)]">No hay productos agregados.</td></tr>`;
      if (totalEl) totalEl.textContent = '$0.00';
      calculateChange();
      return;
    }

    list.innerHTML = currentCart.map((s, index) => `
      <tr class="border-t border-white/10 hover:bg-white/[0.02] transition">
        <td class="px-3 py-3 text-left font-medium text-white">${s.product}</td>
        <td class="px-3 py-3 text-center text-slate-300">${s.qty}</td>
        <td class="px-3 py-3 text-right text-slate-300">$${s.price.toFixed(2)}</td>
        <td class="px-3 py-3 text-right text-[color:var(--accent-green)] font-semibold">$${(s.qty * s.price).toFixed(2)}</td>
        <td class="px-3 py-3 text-center">
          <select data-method-index="${index}" class="item-method-select bg-[#1e293b] border border-white/15 text-white text-xs rounded-xl px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-400 transition">
            <option value="Efectivo" ${s.method === 'Efectivo' ? 'selected' : ''}>Efectivo</option>
            <option value="Tarjeta" ${s.method === 'Tarjeta' ? 'selected' : ''}>Tarjeta</option>
          </select>
        </td>
        <td class="px-3 py-3 text-right">
          <button data-remove="${index}" class="remove-item text-slate-400 hover:text-rose-400 font-bold px-2 py-1 transition text-base" title="Quitar producto">
            ✕
          </button>
        </td>
      </tr>`).join('');
    
    const total = currentCart.reduce((a, c) => a + c.qty * c.price, 0);
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    calculateChange();

    list.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemIndex = parseInt(e.currentTarget.dataset.remove, 10);
        currentCart.splice(itemIndex, 1);
        renderCart();
      });
    });

    list.querySelectorAll('.item-method-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const itemIndex = parseInt(e.currentTarget.dataset.methodIndex, 10);
        if (currentCart[itemIndex]) {
          currentCart[itemIndex].method = e.currentTarget.value;
        }
      });
    });
  }

  if (cashGivenInput) {
    cashGivenInput.addEventListener('input', calculateChange);
  }

  function renderProductMatches(filter) {
    const products = read(PRODUCTS_KEY);
    const matches = filterProducts(products, filter);
    if (matches.length === 0) {
      productMatches.classList.remove('visible');
      productMatches.classList.add('hidden');
      productMatches.innerHTML = '';
      return;
    }

    productMatches.innerHTML = matches.map(p => `
      <div class="suggestion-item" data-name="${p.name}" data-price="${p.price}">${p.name} (Disponible: ${p.stock})</div>
    `).join('');
    productMatches.classList.remove('hidden');
    productMatches.classList.add('visible');
    productMatches.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('mousedown', (event) => {
        event.preventDefault();
        selectProductSuggestion(item, form, productInput, productMatches);
      });
    });
  }

  function fillPriceForProductName(name) {
    const products = read(PRODUCTS_KEY);
    const priceInput = getFormField(form, 'price');
    const found = products.find(p => normalizeProductText(p.name) === normalizeProductText(name));
    if (found) {
      if (priceInput) priceInput.value = found.price;
      return true;
    }
    if (priceInput) priceInput.value = '';
    return false;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const product = getFormField(form, 'product')?.value.trim() || '';
      const qty = parseInt(getFormField(form, 'qty')?.value, 10) || 1;
      const price = parseFloat(getFormField(form, 'price')?.value) || 0;
      
      if (!product || price <= 0) {
        return alert('Selecciona un producto válido y asegura un precio correcto.');
      }

      const products = read(PRODUCTS_KEY);
      const matchedProd = products.find(p => normalizeProductText(p.name) === normalizeProductText(product));

      const alreadyInCart = currentCart
        .filter(c => normalizeProductText(c.product) === normalizeProductText(product))
        .reduce((sum, item) => sum + item.qty, 0);

      if (matchedProd && (matchedProd.stock - alreadyInCart) < qty) {
        return alert(`Stock insuficiente. Quedan ${matchedProd.stock - alreadyInCart} unidades disponibles para este producto.`);
      }

      const currentMethodEl = getFormField(form, 'paymentMethod') || document.getElementById('paymentMethod') || document.querySelector('input[name="paymentMethod"]:checked');
      const selectedMethod = currentMethodEl ? (currentMethodEl.value || currentMethodEl.textContent) : 'Efectivo';

      currentCart.push({ product, qty, price, method: selectedMethod });
      
      if (productInput) productInput.value = '';
      const priceInput = getFormField(form, 'price');
      if (priceInput) priceInput.value = '';
      const qtyInput = getFormField(form, 'qty');
      if (qtyInput) qtyInput.value = '1';

      if (productMatches) {
        productMatches.classList.remove('visible');
        productMatches.classList.add('hidden');
        productMatches.innerHTML = '';
      }
      renderCart();
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      if (currentCart.length === 0) {
        return alert('El carrito está vacío.');
      }

      const total = currentCart.reduce((a, c) => a + c.qty * c.price, 0);
      const cashGiven = parseFloat(cashGivenInput?.value) || 0;
      const hasCashPayment = currentCart.some(item => item.method === 'Efectivo');

      if (hasCashPayment && cashGiven < total) {
        return alert('El efectivo ingresado es menor al total de la venta.');
      }

      const products = read(PRODUCTS_KEY);
      const now = new Date().toISOString();
      
      const salesToSave = currentCart.map(item => ({
        ...item,
        date: now
      }));

      currentCart.forEach(item => {
        const prodIndex = products.findIndex(p => normalizeProductText(p.name) === normalizeProductText(item.product));
        if (prodIndex !== -1) {
          products[prodIndex].stock = Math.max(0, parseInt(products[prodIndex].stock, 10) - item.qty);
        }
      });

      write(PRODUCTS_KEY, products);

      const salesHistory = read(SALES_KEY);
      const newTransactions = salesHistory.concat(salesToSave);
      write(SALES_KEY, newTransactions);

      const clickHistoryKey = 'uptienda_sale_clicks_v1';
      const saleClicks = read(clickHistoryKey);
      saleClicks.push({ date: now });
      write(clickHistoryKey, saleClicks);

      currentCart = [];
      if (cashGivenInput) cashGivenInput.value = '';
      renderCart();
      alert('¡Venta realizada con éxito! El inventario se ha actualizado.');
    });
  }

  if (productInput) {
    productInput.addEventListener('input', (e) => {
      const productName = e.target.value.trim();
      if (!productName) {
        const priceInput = getFormField(form, 'price');
        if (priceInput) priceInput.value = '';
        if (productMatches) {
          productMatches.classList.remove('visible');
          productMatches.classList.add('hidden');
          productMatches.innerHTML = '';
        }
        return;
      }
      fillPriceForProductName(productName);
      renderProductMatches(productName);
    });

    productInput.addEventListener('focus', (e) => {
      renderProductMatches(e.target.value.trim());
    });

    productInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (productMatches) {
          productMatches.classList.remove('visible');
          productMatches.classList.add('hidden');
        }
      }, 150);
    });
  }

  renderCart();
}

function renderSalesChart(sales) {
  const ctx = document.getElementById('salesChart')?.getContext('2d');
  if (!ctx) return;

  const hoursLabels = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
  const hourlyData = [0, 0, 0, 0, 0, 0, 0, 0];
  const now = new Date();

  sales.forEach(sale => {
    const saleDate = sale.date ? new Date(sale.date) : new Date();
    if (saleDate.toDateString() === now.toDateString()) {
      const hour = saleDate.getHours();
      const subtotal = (parseInt(sale.qty, 10) || 0) * (Number(sale.price) || 0);

      if (hour < 9) hourlyData[0] += subtotal;
      else if (hour < 11) hourlyData[1] += subtotal;
      else if (hour < 13) hourlyData[2] += subtotal;
      else if (hour < 15) hourlyData[3] += subtotal;
      else if (hour < 17) hourlyData[4] += subtotal;
      else if (hour < 19) hourlyData[5] += subtotal;
      else if (hour < 21) hourlyData[6] += subtotal;
      else hourlyData[7] += subtotal;
    }
  });

  if (window.mySalesChart) {
    window.mySalesChart.destroy();
  }

  window.mySalesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hoursLabels,
      datasets: [{
        label: 'Ventas ($)',
        data: hourlyData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', callback: (value) => '$' + value }
        }
      }
    }
  });
}

function initFinanzas() {
  const finTodayEl = document.getElementById('finToday');
  const finPaymentBreakdownEl = document.getElementById('finPaymentBreakdown');
  const finAvgTicketEl = document.getElementById('finAvgTicket');
  const finUnitsTodayEl = document.getElementById('finUnitsToday');
  const topProductsList = document.getElementById('topProductsList');
  const financesList = document.getElementById('financesList');
  const closeBoxBtn = document.getElementById('closeBoxBtn');
  const exportReportBtn = document.getElementById('exportReportBtn');

  const sales = read(SALES_KEY);
  const now = new Date();

  let todayTotal = 0;
  let todayUnits = 0;
  let cashTotal = 0;
  let cardTotal = 0;
  let todaySalesCount = 0;
  const productTotals = {};

  sales.forEach(sale => {
    const saleDate = sale.date ? new Date(sale.date) : new Date();
    const qty = parseInt(sale.qty, 10) || 0;
    const subtotal = qty * (Number(sale.price) || 0);

    const isToday = saleDate.toDateString() === now.toDateString();

    if (isToday) {
      todayTotal += subtotal;
      todayUnits += qty;
      todaySalesCount++;

      if (sale.method === 'Tarjeta') {
        cardTotal += subtotal;
      } else {
        cashTotal += subtotal;
      }
    }

    const prodName = sale.product || 'Producto';
    productTotals[prodName] = (productTotals[prodName] || 0) + qty;
  });

  const avgTicket = todaySalesCount > 0 ? (todayTotal / todaySalesCount) : 0;

  if (finTodayEl) finTodayEl.textContent = `$${todayTotal.toFixed(2)}`;
  if (finPaymentBreakdownEl) finPaymentBreakdownEl.textContent = `$${cashTotal.toFixed(2)} / $${cardTotal.toFixed(2)}`;
  if (finAvgTicketEl) finAvgTicketEl.textContent = `$${avgTicket.toFixed(2)}`;
  if (finUnitsTodayEl) finUnitsTodayEl.textContent = `${todayUnits} pzas`;

  if (topProductsList) {
    const sortedProducts = Object.entries(productTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedProducts.length === 0) {
      topProductsList.innerHTML = `<p class="text-sm text-slate-400">No hay ventas registradas aún.</p>`;
    } else {
      topProductsList.innerHTML = sortedProducts.map(([name, qty], index) => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center">#${index + 1}</span>
            <span class="font-medium text-white text-sm">${name}</span>
          </div>
          <span class="text-xs font-semibold px-3 py-1 rounded-full bg-sky-500/20 text-sky-300">${qty} pzas</span>
        </div>
      `).join('');
    }
  }

  if (financesList) {
    if (sales.length === 0) {
      financesList.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">No hay transacciones registradas.</td></tr>`;
    } else {
      financesList.innerHTML = sales.slice().reverse().map(sale => {
        const saleDate = sale.date ? new Date(sale.date).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : 'Hoy';
        const qty = parseInt(sale.qty, 10) || 0;
        const subtotal = qty * (Number(sale.price) || 0);

        return `
          <tr class="border-b border-white/5 hover:bg-white/[0.02] transition">
            <td class="py-3 text-slate-400 text-xs">${saleDate}</td>
            <td class="py-3 font-medium text-white">${sale.product}</td>
            <td class="py-3 text-center text-slate-300">${qty}</td>
            <td class="py-3 text-center text-slate-400 text-xs">${sale.method || 'Efectivo'}</td>
            <td class="py-3 text-right text-slate-300">$${Number(sale.price).toFixed(2)}</td>
            <td class="py-3 text-right text-emerald-400 font-semibold">$${subtotal.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }
  }

  renderSalesChart(sales);

  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (closeBoxBtn) {
    closeBoxBtn.addEventListener('click', () => {
      let existingModal = document.getElementById('boxConfirmModalOverlay');
      if (existingModal) existingModal.remove();

      const overlay = document.createElement('div');
      overlay.id = 'boxConfirmModalOverlay';
      overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4';

      overlay.innerHTML = `
        <div class="w-full max-w-sm rounded-3xl bg-[#0f172a] border border-white/15 shadow-2xl p-6 text-center relative space-y-4">
          <div class="w-16 h-16 rounded-full bg-rose-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
          <h3 class="font-bold text-white text-lg">¿Realizar corte de caja?</h3>
          <p class="text-slate-300 text-xs leading-relaxed">¿Estás seguro de efectuar el corte de caja? Esto reiniciará a cero todas las métricas y el historial de ventas del día actual.</p>
          <div class="flex gap-3 pt-2">
            <button id="boxCancelBtn" class="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition">Cancelar</button>
            <button id="boxConfirmBtn" class="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition shadow-lg shadow-rose-500/20">Continuar</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const closeOverlay = () => overlay.remove();

      overlay.querySelector('#boxCancelBtn').addEventListener('click', closeOverlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
      });

      overlay.querySelector('#boxConfirmBtn').addEventListener('click', () => {
        closeOverlay();
        write(SALES_KEY, []);
        write('uptienda_sale_clicks_v1', []);
        initFinanzas();
        alert('Corte de caja realizado correctamente. El módulo se ha reiniciado.');
      });
    });
  }
}

function initLogin() {
  const form = document.getElementById('loginForm');
  
  if (form) {
    localStorage.removeItem(SESSION_START_KEY);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = form.username.value.trim();
      if (!user) return alert('Ingrese usuario');
      localStorage.setItem('uptienda_user', user);
      
      const loginTime = new Date().toISOString();
      localStorage.setItem(SESSION_START_KEY, loginTime);

      window.location.href = 'index.html';
    });
  }

  const logoutCard = document.getElementById('logoutCard');
  if (logoutCard) {
    logoutCard.addEventListener('click', () => {
      localStorage.removeItem(SESSION_START_KEY);
    });
  }
}

function initDashboard() {
  const headerClock = document.getElementById('headerClock');
  const headerDate = document.getElementById('headerDate');
  const onlineStatus = document.getElementById('onlineStatus');
  const onlineText = document.getElementById('onlineText');

  const userNameEl = document.getElementById('userName');
  const userShiftEl = document.getElementById('userShift');
  const userAvatarEl = document.getElementById('userAvatar');
  const sessionStartTimeEl = document.getElementById('sessionStartTime');
  const sessionOperatorEl = document.getElementById('sessionOperator');

  const cardVentasCount = document.getElementById('cardVentasCount');
  const cardProductsCount = document.getElementById('cardProductsCount');
  const cardTotalStockCount = document.getElementById('cardTotalStockCount');
  const cardFinancesToday = document.getElementById('cardFinancesToday');

  let sessionTimeStr = localStorage.getItem(SESSION_START_KEY);
  if (!sessionTimeStr) {
    sessionTimeStr = new Date().toISOString();
    localStorage.setItem(SESSION_START_KEY, sessionTimeStr);
  }

  const renderHeader = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'p. m.' : 'a. m.';
    const displayHour = ((hours + 11) % 12) + 1;

    if (headerClock) headerClock.textContent = `${displayHour}:${minutes} ${period}`;
    if (headerDate) {
      const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      headerDate.textContent = now.toLocaleDateString('es-MX', opciones)
        .replace(/(^\w)/, (c) => c.toUpperCase());
    }

    if (onlineStatus && onlineText) {
      onlineStatus.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
      onlineText.textContent = 'En línea';
      onlineText.className = "text-[color:var(--accent-green)]";
    }

    const currentUser = localStorage.getItem('uptienda_user') || 'Admin';
    if (userNameEl) userNameEl.textContent = currentUser;
    if (userAvatarEl) userAvatarEl.textContent = currentUser.charAt(0).toUpperCase();
    if (sessionOperatorEl) sessionOperatorEl.textContent = currentUser;

    let turnoText = '';
    if (hours >= 6 && hours < 14) {
      turnoText = 'Turno mañana';
    } else if (hours >= 14 && hours < 22) {
      turnoText = 'Turno tarde';
    } else {
      turnoText = 'Turno noche';
    }
    if (userShiftEl) userShiftEl.textContent = turnoText;

    if (sessionStartTimeEl) {
      const sessionDate = new Date(sessionTimeStr);
      const sHours = sessionDate.getHours();
      const sMinutes = sessionDate.getMinutes().toString().padStart(2, '0');
      const sPeriod = sHours >= 12 ? 'PM' : 'AM';
      const sDisplayHour = ((sHours + 11) % 12) + 1;
      sessionStartTimeEl.textContent = `${sDisplayHour}:${sMinutes} ${sPeriod}`;
    }

    const products = read(PRODUCTS_KEY);
    const sales = read(SALES_KEY);
    const saleClicks = read('uptienda_sale_clicks_v1');

    if (cardVentasCount) {
      const todayClicks = saleClicks.filter(c => new Date(c.date).toDateString() === now.toDateString()).length;
      cardVentasCount.textContent = todayClicks;
    }

    if (cardProductsCount) {
      cardProductsCount.textContent = products.length;
    }

    if (cardTotalStockCount) {
      const totalStockSum = products.reduce((acc, p) => acc + (parseInt(p.stock, 10) || 0), 0);
      cardTotalStockCount.textContent = totalStockSum;
    }

    if (cardFinancesToday) {
      let todayTotal = 0;
      sales.forEach(sale => {
        const saleDate = sale.date ? new Date(sale.date) : new Date();
        if (saleDate.toDateString() === now.toDateString()) {
          const qty = parseInt(sale.qty, 10) || 0;
          const subtotal = qty * (Number(sale.price) || 0);
          todayTotal += subtotal;
        }
      });
      cardFinancesToday.textContent = `$${todayTotal.toFixed(2)}`;
    }
  };

  renderHeader();
  setInterval(renderHeader, 1000);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('inventarioApp')) initInventario();
    if (document.getElementById('ventasApp')) initVentas();
    if (document.getElementById('financesList') || document.getElementById('finanzasApp')) initFinanzas();
    if (document.getElementById('dashboardApp')) initDashboard();
    initLogin();
  });
}

export {};