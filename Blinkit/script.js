/* ==========================================================================
   BLINKIT GROCERY WEBSITE - JAVASCRIPT (script.js)
   Created for: 1st Year B.Tech Web Development Project
   Key Concepts Used:
   1. DOM Manipulation (document.getElementById, querySelector)
   2. Event Listeners (addEventListener, onclick, onsubmit)
   3. LocalStorage (Saving cart items so they persist across pages)
   4. Array Functions (find, filter, map, reduce)
   5. Conditional Statements (if/else) and Template Literals
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. GLOBAL CART MANAGEMENT USING LOCALSTORAGE
   LocalStorage stores data in the user's browser as a string.
   JSON.parse() converts the string back into a JavaScript array.
   JSON.stringify() converts the array into a string before saving.
   -------------------------------------------------------------------------- */

// Function to retrieve the current cart array from LocalStorage
function getCart() {
    // If 'groceryCart' exists in localStorage, parse it; otherwise return an empty array []
    const cartData = localStorage.getItem('groceryCart');
    return cartData ? JSON.parse(cartData) : [];
}

// Function to save the cart array back to LocalStorage
function saveCart(cart) {
    localStorage.setItem('groceryCart', JSON.stringify(cart));
    // Immediately update the badge count in the navigation bar
    updateCartBadge();
}

// Function to update the number shown on the cart button in the navbar
function updateCartBadge() {
    const cart = getCart();
    
    // Calculate total number of individual items in the cart
    let totalItems = 0;
    for (let i = 0; i < cart.length; i++) {
        totalItems += cart[i].quantity;
    }

    // Find all badge elements with class 'cart-badge' and update their text
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = totalItems;
    });
}

/* --------------------------------------------------------------------------
   2. ADD TO CART FUNCTIONALITY
   Called when the user clicks the "Add" or "Add to Cart" button on any product.
   -------------------------------------------------------------------------- */
function addToCart(productId, productName, productPrice, productImage, productUnit) {
    // 1. Get the current list of items from localStorage
    const cart = getCart();

    // 2. Check if this product is already in the cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // If it already exists, simply increase its quantity by 1
        existingItem.quantity += 1;
    } else {
        // If it's a new item, add an object with its details into the array
        cart.push({
            id: productId,
            name: productName,
            price: Number(productPrice),
            image: productImage,
            unit: productUnit,
            quantity: 1
        });
    }

    // 3. Save the updated cart array to localStorage
    saveCart(cart);

    // 4. Show a quick visual confirmation (feedback) to the user
    showNotification(`Added ${productName} to cart!`);
}

// Helper function to show a friendly floating notification message
function showNotification(message) {
    // Create a temporary div element
    const toast = document.createElement('div');
    toast.textContent = message;
    
    // Simple inline styles for notification badge
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#0c831f';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease';

    // Append to body
    document.body.appendChild(toast);

    // Automatically remove notification after 2 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

/* --------------------------------------------------------------------------
   3. CART PAGE LOGIC (cart.html)
   Displays added items, allows increasing/decreasing quantities, and computes bill.
   -------------------------------------------------------------------------- */
function renderCartPage() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummaryContainer = document.getElementById('cart-summary-container');
    const emptyCartView = document.getElementById('empty-cart-view');

    // If these elements do not exist on the current page, stop function
    if (!cartItemsContainer) return;

    const cart = getCart();

    // Check if the cart is completely empty
    if (cart.length === 0) {
        // Show empty cart illustration and hide the order summary
        if (emptyCartView) emptyCartView.style.display = 'block';
        if (cartItemsContainer) cartItemsContainer.style.display = 'none';
        if (cartSummaryContainer) cartSummaryContainer.style.display = 'none';
        return;
    }

    // If cart has items, hide empty state and show table
    if (emptyCartView) emptyCartView.style.display = 'none';
    if (cartItemsContainer) cartItemsContainer.style.display = 'block';
    if (cartSummaryContainer) cartSummaryContainer.style.display = 'block';

    // Build the HTML for each cart item
    let itemsHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        itemsHTML += `
            <div class="cart-item-card">
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div>
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-unit">${item.unit}</p>
                        <p class="cart-item-price">₹${item.price} each</p>
                    </div>
                </div>

                <!-- Quantity Control (+ and -) -->
                <div class="qty-control">
                    <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)" title="Decrease Quantity">-</button>
                    <span class="qty-number">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)" title="Increase Quantity">+</button>
                </div>

                <!-- Item Total & Delete -->
                <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="font-weight: 800; font-size: 16px;">₹${itemTotal}</span>
                    <button class="btn-remove" onclick="removeFromCart('${item.id}')" title="Remove item">🗑️</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = itemsHTML;

    // Delivery fee is free if subtotal is greater than ₹199, else ₹15
    const deliveryFee = subtotal >= 199 ? 0 : 15;
    const handlingFee = 2; // Fixed nominal handling fee
    const grandTotal = subtotal + deliveryFee + handlingFee;

    // Update the Bill Summary values in the DOM
    const subtotalEl = document.getElementById('bill-subtotal');
    const deliveryEl = document.getElementById('bill-delivery');
    const handlingEl = document.getElementById('bill-handling');
    const grandTotalEl = document.getElementById('bill-grand-total');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (deliveryEl) deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    if (handlingEl) handlingEl.textContent = `₹${handlingFee}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;
}

// Function to increase or decrease item quantity from the Cart Page
function changeQuantity(productId, changeAmount) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (item) {
        item.quantity += changeAmount;

        // If quantity reaches 0, remove the item entirely
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        saveCart(cart);
        renderCartPage(); // Re-render the cart items and update bill
    }
}

// Function to remove an item completely from the Cart
function removeFromCart(productId) {
    let cart = getCart();
    // Keep only the items whose ID does NOT match productId
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartPage(); // Re-render page
}

// Function to handle Checkout / Order Placement
function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty! Please add items before checking out.");
        return;
    }

    // Show friendly success confirmation alert
    alert("🎉 Order placed successfully! Thank you for shopping with us.");

    // Clear cart in LocalStorage
    localStorage.removeItem('groceryCart');

    // Update UI
    updateCartBadge();
    renderCartPage();
}

/* --------------------------------------------------------------------------
   4. CONTACT FORM SUBMISSION (contact.html)
   Prevents default reload and shows "Thank you for contacting us!" alert.
   -------------------------------------------------------------------------- */
function handleContactForm(event) {
    // 1. Prevent default form submission which would reload the webpage
    event.preventDefault();

    // 2. Read user input values
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    // 3. Simple validation check
    if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        alert("Please fill in all the fields.");
        return;
    }

    // 4. Show the required alert as requested
    alert("Thank you for contacting us!");

    // 5. Reset form inputs back to blank
    document.getElementById('contact-form').reset();
}

/* --------------------------------------------------------------------------
   5. PRODUCT CATEGORY FILTER (products.html)
   Allows user to filter cards by clicking category pills (Fruits, Dairy, etc.)
   -------------------------------------------------------------------------- */
function filterCategory(categoryName, clickedBtn) {
    // 1. Update active styling on filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    // 2. Show or hide product cards according to category
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (categoryName === 'all' || cardCategory === categoryName) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Check if a category query parameter was passed in the URL (e.g., products.html?cat=fruits)
function checkURLCategoryFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        // Find corresponding button
        const targetBtn = document.querySelector(`.filter-btn[data-target="${categoryParam}"]`);
        if (targetBtn) {
            filterCategory(categoryParam, targetBtn);
        }
    }
}

/* --------------------------------------------------------------------------
   6. SIMPLE SEARCH BAR FILTER
   Filters products on the products page as the user types in the search bar.
   -------------------------------------------------------------------------- */
function setupSearchFilter() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function(e) {
            const query = e.target.value.toLowerCase().trim();
            
            // If on products page, filter visible cards
            const productCards = document.querySelectorAll('.product-card');
            if (productCards.length > 0) {
                productCards.forEach(card => {
                    const title = card.querySelector('.product-name').textContent.toLowerCase();
                    if (title.includes(query)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            } else if (e.key === 'Enter' && query.length > 0) {
                // If on home page and pressed enter, redirect to products page
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });
    });
}

/* --------------------------------------------------------------------------
   7. INITIALIZATION ON PAGE LOAD
   Executes when the HTML document has fully loaded.
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Update the cart item count badge across all pages
    updateCartBadge();

    // 2. If on the cart page, render items and bill details
    renderCartPage();

    // 3. If on the products page, check URL category filters
    checkURLCategoryFilter();

    // 4. Setup search input listeners
    setupSearchFilter();

    // 5. Attach event listener to Contact Form if present
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});
