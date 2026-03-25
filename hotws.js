        // =============================================================================
        // EASY PRODUCT EDITING SECTION - MODIFY THESE VALUES TO CHANGE PRODUCTS
        // =============================================================================
        
        // Your WhatsApp number (without + sign)
        const WHATSAPP_NUMBER = "7208579784";
        
        // Store configuration
        const STORE_CONFIG = {
            name: "RP Hotwheels 7",
            greeting: "Hello! I'm interested in ordering from RP Hotwheels 7:",
            currency: "₹"
        };

        // Product categories for filtering
        const CATEGORIES = {
            all: "All Cars",
            bestseller: "Best Sellers", 
            mostwanted: "Most Wanted",
            limited: "Limited Edition",
            newarrival: "New Arrivals",
            rare: "Rare Finds",
            giftset: "Gift Sets"
        };

        // PRODUCTS DATABASE - Easy to edit and add new products
        // const PRODUCTS_DB = [];

// =============================================================================
// PRODUCTS DATABASE - NOW LOADED FROM JSON
// =============================================================================

let allProducts = [];

// Load products from JSON
function loadProducts() {
    fetch("./products.json")
        .then(response => response.json())
        .then(data => {
            const PRODUCTS_DB = data.products;

            allProducts = PRODUCTS_DB.map(product => ({
                ...product,
                price: `${STORE_CONFIG.currency}${product.price}`,
                priceValue: product.price
            }));

            // render after loading
            renderProducts(allProducts);
            updateCartCount();
            updateCartDisplay();
        })
        .catch(error => {
            console.error("Error loading products:", error);
        });
}



        let currentProduct = null;
        let currentSlideIndex = 0;
        let autoSlideInterval;
        let currentFilter = 'all';

        // Shopping Cart System
        let cart = []; // In production, replace with localStorage

        // Cart DOM elements
        const cartIcon = document.getElementById('cartIcon');
        const cartCount = document.getElementById('cartCount');
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartClose = document.getElementById('cartClose');
        const cartContent = document.getElementById('cartContent');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotalPrice = document.getElementById('cartTotalPrice');
        const cartCheckout = document.getElementById('cartCheckout');

        // Modal elements
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');
        const carouselSlides = document.getElementById('carouselSlides');
        const carouselDots = document.getElementById('carouselDots');
        const productDescription = document.getElementById('productDescription');
        const modalAddToCart = document.getElementById('modalAddToCart');
        const modalQuickShop = document.getElementById('modalQuickShop');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        // WhatsApp Functions
        function generateWhatsAppMessage(items, isCart = true) {
            let message = `${STORE_CONFIG.greeting}%0A%0A`;
            
            if (isCart) {
                message += `🛒 *Cart Summary:*%0A`;
                items.forEach((item, index) => {
                    message += `${index + 1}. ${item.name} - ${item.price}%0A`;
                });
                const total = items.reduce((sum, item) => sum + item.priceValue, 0);
                message += `%0A💰 *Total: ${STORE_CONFIG.currency}${total}*%0A%0A`;
            } else {
                // Single product
                message += `🏎️ *Product Inquiry:*%0A`;
                message += `${items.name} - ${items.price}%0A%0A`;
            }
            
            message += `*Delivery Charges are excluded*.%0A%0A Please confirm availability and delivery details. Thank you!`;
            return message;
        }

        function redirectToWhatsApp(message) {
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
            window.open(whatsappUrl, '_blank');
        }

        // Category Filtering Functions
        function filterProducts(category) {
            currentFilter = category;
            
            // Update active button
            document.querySelectorAll('.quick-link').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                }
            });

            // Filter and render products
            let filteredProducts = category === 'all' 
                ? allProducts 
                : allProducts.filter(product => product.category === category);
            
            renderProducts(filteredProducts);
        }

        // Cart Functions
        function updateCartCount() {
            const totalItems = cart.length;
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
        }

        function calculateCartTotal() {
            return cart.reduce((total, item) => total + item.priceValue, 0);
        }

        function formatPrice(price) {
            return `${STORE_CONFIG.currency}${price}`;
        }

        function addToCart(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (product && product.availability !== 'sold-out') {
                const cartItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    priceValue: product.priceValue,
                    image: product.images[0]
                };
                
                cart.push(cartItem);
                updateCartCount();
                updateCartDisplay();
                showCartNotification(`${product.name} added to cart!`);
            }
        }

        function removeFromCart(index) {
            const removedItem = cart.splice(index, 1)[0];
            updateCartCount();
            updateCartDisplay();
            showCartNotification(`${removedItem.name} removed from cart`, true);
        }

        function updateCartDisplay() {
            if (cart.length === 0) {
                cartEmpty.style.display = 'block';
                cartFooter.style.display = 'none';
                cartContent.innerHTML = cartEmpty.outerHTML;
            } else {
                cartEmpty.style.display = 'none';
                cartFooter.style.display = 'block';
                
                const cartItemsHTML = cart.map((item, index) => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${item.price}</div>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
                    </div>
                `).join('');
                
                cartContent.innerHTML = cartItemsHTML;
                cartTotalPrice.textContent = formatPrice(calculateCartTotal());
            }
        }

        function showCartNotification(message, isRemoval = false) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${isRemoval ? '#e74c3c' : '#27ae60'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 10001;
                font-weight: bold;
                max-width: 300px;
                transform: translateX(350px);
                transition: transform 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => notification.style.transform = 'translateX(0)', 100);
            setTimeout(() => {
                notification.style.transform = 'translateX(350px)';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }

        function openCart() {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeCart() {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        }

        // Cart Event Listeners
        cartIcon.addEventListener('click', openCart);
        cartClose.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);

        cartCheckout.addEventListener('click', () => {
            if (cart.length > 0) {
                const message = generateWhatsAppMessage(cart, true);
                redirectToWhatsApp(message);
            }
        });

        // Function to get availability class and text
        function getAvailabilityInfo(availability) {
            switch(availability) {
                case 'in-stock':
                    return { class: 'in-stock', text: 'In Stock' };
                case 'sold-out':
                    return { class: 'sold-out', text: 'Sold Out' };
                case 'low-stock':
                    return { class: 'low-stock', text: 'Low Stock' };
                default:
                    return { class: 'in-stock', text: 'Available' };
            }
        }

        // Function to open modal with product details
        function openProductModal(productId) {
            currentProduct = allProducts.find(p => p.id === productId);
            if (!currentProduct) return;

            modalTitle.textContent = currentProduct.name;
            modalPrice.textContent = currentProduct.price;
            productDescription.textContent = currentProduct.description;

            setupCarousel(currentProduct.images);

            modalAddToCart.onclick = () => addToCart(currentProduct.id);
            modalAddToCart.disabled = currentProduct.availability === 'sold-out';
            modalAddToCart.textContent = currentProduct.availability === 'sold-out' ? 'Sold Out' : 'Add to Cart';

            modalQuickShop.onclick = () => {
                const message = generateWhatsAppMessage(currentProduct, false);
                redirectToWhatsApp(message);
            };

            modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            startAutoSlide();
        }

        // Carousel Functions
        function setupCarousel(images) {
            currentSlideIndex = 0;
            
            carouselSlides.innerHTML = images.map(image => 
                `<div class="carousel-slide"><img src="${image}" alt="${currentProduct.name}" loading="lazy"></div>`
            ).join('');

            carouselDots.innerHTML = images.map((_, index) => 
                `<div class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>`
            ).join('');

            carouselSlides.style.transform = 'translateX(0%)';
        }

        function showSlide(index) {
            const slideCount = carouselSlides.children.length;
            if (index >= slideCount) index = 0;
            if (index < 0) index = slideCount - 1;
            
            carouselSlides.style.transform = `translateX(-${index * 100}%)`;
            currentSlideIndex = index;

            document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        function goToSlide(index) {
            showSlide(index);
            resetAutoSlide();
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(() => showSlide(currentSlideIndex + 1), 4000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        // Modal event listeners
        closeModalBtn.onclick = closeModal;
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) closeModal();
        };

        function closeModal() {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
            stopAutoSlide();
        }

        prevBtn.onclick = () => {
            showSlide(currentSlideIndex - 1);
            resetAutoSlide();
        };

        nextBtn.onclick = () => {
            showSlide(currentSlideIndex + 1);
            resetAutoSlide();
        };

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modalOverlay.style.display === 'flex') {
                switch(e.key) {
                    case 'Escape':
                        closeModal();
                        break;
                    case 'ArrowLeft':
                        showSlide(currentSlideIndex - 1);
                        resetAutoSlide();
                        break;
                    case 'ArrowRight':
                        showSlide(currentSlideIndex + 1);
                        resetAutoSlide();
                        break;
                }
            }
            if (cartSidebar.classList.contains('open') && e.key === 'Escape') {
                closeCart();
            }
        });

        // Function to render products
        function renderProducts(productsToRender) {
            const productsGrid = document.getElementById('productsGrid');
            const noResults = document.getElementById('noResults');

            if (productsToRender.length === 0) {
                productsGrid.innerHTML = '';
                noResults.style.display = 'block';
                return;
            }

            noResults.style.display = 'none';
            
            productsGrid.innerHTML = productsToRender.map((product, index) => {
                const availabilityInfo = getAvailabilityInfo(product.availability);
                const isDisabled = product.availability === 'sold-out';
                
                return `
                    <div class="product-card" style="animation-delay: ${index * 0.1}s" data-category="${product.category}">
                        <div class="product-image" onclick="openProductModal(${product.id})">
                            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                            <div class="availability ${availabilityInfo.class}">
                                ${availabilityInfo.text}
                            </div>
                            <div class="image-overlay">
                                <button class="view-gallery-btn">View More</button>
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">${product.price}</div>
                            <div class="product-actions">
                                <button class="btn btn-secondary" onclick="quickShopProduct(${product.id})">
                                    📱 WhatsApp
                                </button>
                                <button class="btn btn-primary" ${isDisabled ? 'disabled' : ''} onclick="addToCart(${product.id})">
                                    ${isDisabled ? 'Sold Out' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Quick shop function for individual products
        function quickShopProduct(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                const message = generateWhatsAppMessage(product, false);
                redirectToWhatsApp(message);
            }
        }

        // Search functionality
        function searchProducts() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            
            if (searchTerm === '') {
                filterProducts(currentFilter);
                return;
            }

            const filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) &&
                (currentFilter === 'all' || product.category === currentFilter)
            );
            
            renderProducts(filteredProducts);
        }

        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });

        document.getElementById('searchInput').addEventListener('input', function() {
            setTimeout(searchProducts, 300);
        });

        // Category filter event listeners
        document.querySelectorAll('.quick-link').forEach(link => {
            link.addEventListener('click', function() {
                const category = this.dataset.category;
                filterProducts(category);
            });
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            loadProducts(); // ✅ load from JSON instead
        
            document.querySelectorAll('.quick-link').forEach((link, index) => {
                link.style.animationDelay = `${index * 0.1}s`;
                link.style.animation = 'fadeInUp 0.6s ease forwards';
            });
        });
            document.querySelectorAll('.quick-link').forEach((link, index) => {
                link.style.animationDelay = `${index * 0.1}s`;
                link.style.animation = 'fadeInUp 0.6s ease forwards';
            });
       

        // Touch/swipe support for mobile carousel
        let startX = 0;
        let endX = 0;

        carouselSlides.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });

        carouselSlides.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const threshold = 50;
            const diff = startX - endX;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    showSlide(currentSlideIndex + 1);
                } else {
                    showSlide(currentSlideIndex - 1);
                }
                resetAutoSlide();
            }
        }
