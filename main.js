document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem('liore_cart')) || [];

    // --- ELEMENTS ---
    const cartToggle = document.getElementById('cart-toggle');
    const mobileCartToggle = document.getElementById('mobile-cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartBackdrop = document.getElementById('cart-backdrop');
    
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutBackdrop = document.getElementById('checkout-backdrop');
    const closeCheckout = document.getElementById('close-checkout');
    
    // --- OPEN / CLOSE UI ---
    function openSidebar() {
        if (!cartSidebar) return;
        cartSidebar.classList.remove('translate-x-full');
        cartBackdrop.classList.remove('hidden', 'opacity-0');
        cartBackdrop.classList.add('opacity-100');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!cartSidebar) return;
        cartSidebar.classList.add('translate-x-full');
        cartBackdrop.classList.remove('opacity-100');
        cartBackdrop.classList.add('opacity-0');
        setTimeout(() => cartBackdrop.classList.add('hidden'), 300);
        document.body.style.overflow = '';
    }

    if (cartToggle) cartToggle.addEventListener('click', openSidebar);
    if (mobileCartToggle) mobileCartToggle.addEventListener('click', openSidebar);
    if (closeCart) closeCart.addEventListener('click', closeSidebar);
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeSidebar);

    // --- CART LOGIC ---
    function saveCart() {
        localStorage.setItem('liore_cart', JSON.stringify(cart));
    }

    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
        const mobileCartCount = document.getElementById('mobile-cart-count');
        const totalPriceEl = document.getElementById('cart-total-price');
        const checkoutTotalEl = document.getElementById('checkout-total');

        if (!cartItemsContainer) return;

        // Update counts
        const totalItems = cart.length;
        if (cartCount) cartCount.textContent = totalItems;
        if (mobileCartCount) mobileCartCount.textContent = totalItems;

        // Render items
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Your cart is empty.</p>';
            if(checkoutBtn) checkoutBtn.disabled = true;
            if(checkoutBtn) checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            if(checkoutBtn) checkoutBtn.disabled = false;
            if(checkoutBtn) checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            cart.forEach((item, index) => {
                total += item.price;
                const html = `
                    <div class="flex gap-4 items-center bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                        <img src="${item.img}" class="w-16 h-16 object-cover rounded-md bg-gray-50 p-1">
                        <div class="flex-1">
                            <h4 class="font-bold text-[#0b2774] text-sm">${item.name}</h4>
                            <p class="text-gray-500 font-semibold">$${item.price.toFixed(2)}</p>
                        </div>
                        <button class="remove-item text-red-500 hover:text-red-700 text-sm font-bold p-2" data-index="${index}">✕</button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', html);
            });
        }

        // Bind Remove Buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                cart.splice(idx, 1);
                saveCart();
                renderCart();
            });
        });

        // Update Totals
        const formattedTotal = `$${total.toFixed(2)}`;
        if (totalPriceEl) totalPriceEl.textContent = formattedTotal;
        if (checkoutTotalEl) checkoutTotalEl.textContent = formattedTotal;
    }

    // Bind "Add to Cart" and "Buy Now"
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnEl = e.target;
            const item = {
                id: btnEl.getAttribute('data-id'),
                name: btnEl.getAttribute('data-name'),
                price: parseFloat(btnEl.getAttribute('data-price')),
                img: btnEl.getAttribute('data-img')
            };
            
            cart.push(item);
            saveCart();
            renderCart();
            
            // Give feedback
            const originalText = btnEl.textContent;
            btnEl.textContent = "Added!";
            btnEl.classList.add("bg-green-600");
            setTimeout(() => {
                btnEl.textContent = originalText;
                btnEl.classList.remove("bg-green-600");
            }, 1000);

            // Open sidebar if it was "Buy Now"
            if(originalText.includes("Buy Now")) {
                openSidebar();
            }
        });
    });

    // Initialize Cart
    renderCart();


    // --- CHECKOUT FLOW ---
    function openCheckout() {
        if (!checkoutModal) return;
        closeSidebar();
        checkoutBackdrop.classList.remove('hidden', 'opacity-0');
        checkoutBackdrop.classList.add('opacity-100');
        checkoutModal.classList.remove('scale-95');
        checkoutModal.classList.add('scale-100');
        document.body.style.overflow = 'hidden';
    }

    function closeCheckoutModal() {
        if (!checkoutModal) return;
        checkoutBackdrop.classList.remove('opacity-100');
        checkoutBackdrop.classList.add('opacity-0');
        checkoutModal.classList.remove('scale-100');
        checkoutModal.classList.add('scale-95');
        setTimeout(() => checkoutBackdrop.classList.add('hidden'), 300);
        document.body.style.overflow = '';
        
        // Reset form view after closing
        setTimeout(() => {
            document.getElementById('checkout-form-container').classList.remove('hidden');
            document.getElementById('order-success-container').classList.add('hidden');
        }, 500);
    }

    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
    if (closeCheckout) closeCheckout.addEventListener('click', closeCheckoutModal);

    // Cannot close on backdrop click by default for security look, but enabled here for UX
    if (checkoutBackdrop) {
        checkoutBackdrop.addEventListener('click', (e) => {
            if (e.target === checkoutBackdrop) closeCheckoutModal();
        });
    }

    // Payment Tabs
    const setPaymentMethod = (methodId) => {
        document.querySelectorAll('.pay-method').forEach(el => el.classList.add('hidden'));
        document.getElementById(methodId).classList.remove('hidden');
        
        document.querySelectorAll('.pay-tab').forEach(el => {
            el.classList.remove('bg-[#0b2774]', 'text-white');
            el.classList.add('bg-gray-50', 'text-gray-600');
        });
        
        const activeTab = document.querySelector(`[data-method="${methodId}"]`);
        if (activeTab) {
            activeTab.classList.remove('bg-gray-50', 'text-gray-600');
            activeTab.classList.add('bg-[#0b2774]', 'text-white');
        }
    };

    document.querySelectorAll('.pay-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            setPaymentMethod(e.target.getAttribute('data-method'));
        });
    });

    // Form Submittal
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Generate Order Details
            const orderId = `ORD-LR-${Math.floor(100000 + Math.random() * 900000)}`;
            document.getElementById('order-id-display').textContent = `Order Ref: #${orderId}`;

            // Build Bill Summary
            let billHtml = `<div class="font-bold text-[#0b2774] mb-3 pb-2 border-b border-gray-200">Digital Receipt</div>`;
            let total = 0;
            cart.forEach(item => {
                total += item.price;
                billHtml += `
                    <div class="flex justify-between text-gray-600 mb-2">
                        <span>${item.name}</span>
                        <span class="font-semibold">$${item.price.toFixed(2)}</span>
                    </div>
                `;
            });
            billHtml += `
                <div class="flex justify-between font-bold text-gray-800 mt-4 pt-3 border-t border-gray-200">
                    <span>Total Paid</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            `;
            
            document.getElementById('order-bill-details').innerHTML = billHtml;

            // Transition UI
            document.getElementById('checkout-form-container').classList.add('hidden');
            document.getElementById('order-success-container').classList.remove('hidden');

            // Clear Cart
            cart = [];
            saveCart();
            renderCart();
        });
    }

    const continueShopping = document.getElementById('continue-shopping');
    if (continueShopping) continueShopping.addEventListener('click', closeCheckoutModal);

});
