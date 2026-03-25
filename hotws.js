<<<<<<< HEAD
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
=======
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
        const PRODUCTS_DB = [
            /*
            {
                id: 51,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 52,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },*/
            {
                id: 47,
                name: "91 BMW M5",
                price: 2199,
                category: "limited", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/99gF8byG/m5.jpg",
                    // "",
                ],
                description: "91 BMW M5 – A classic muscle car with a powerful V8 engine and sleek design. 🏎️✨"
            },
            {
                id: 48,
                name: "mercedes benz e36 AMG",
                price: 2099,
                category: "limited", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/0yFxRDDW/e36.jpg",
                ],
                description: "Mercedes Benz E36 AMG – A luxury sports car with a powerful V8 engine and sleek design. 🏎️✨"
            },
            {
                id: 71,
                name: "TV Series Batmobile Batman",
                price: 599,
                category: "newarrival", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/qGV4Gt7/tsb.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "TV Series Batmobile Batman – The iconic crime-fighting machine from the classic TV series. 🦇🚗"
            },
            {
                id: 49,
                name: "2003 Dodge Viper SRT-10",
                price: 2099,
                category: "limited", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/r2YFfkWQ/dr.jpg",
                ],
                description: "2003 Dodge Viper SRT-10 – A powerful muscle car with a V10 engine and aggressive styling. 🏎️🔥"
            },
            {
                id: 44,
                name: "Aston Martin Vanquish",
                price: 1699,
                category: "limited", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/G30kKJWD/asc.jpg",
                    "https://i.ibb.co/BKvG4KmC/asv.jpg",
                ],
                description: "Aston Martin Vanquish – A luxury supercar with a powerful V12 engine and sleek design. 🏎️✨"
            },
            {
                id: 45,
                name: "Twin Mill Gen-E",
                price: 649,
                category: "rare", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/Sw9zhtf2/twe.jpg",
                    "https://i.ibb.co/7NNV9gWQ/tw.jpg",
                ],
                description: "Twin Mill Gen-E - A futuristic evolution of the iconic Twin Mill — electric power meets classic Hot Wheels style. ⚡🔥"
            },
            {
                id: 46,
                name: "Bentley Continental GT3",
                price: 2199,
                category: "limited", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/5x8XHWQQ/ben.jpg",
                    // ""
                ],
                description: "bentley continental gt3 - A racing legend in miniature form — Bentley’s GT3 car with sleek aerodynamics and track-ready performance. 🏁🚗"
            },
            {
                id: 50,
                name: "Max Steel",
                price: 599,
                category: "newarrival", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/3yPdqs7z/ms.jpg",
                ],
                description: "Max Steel – A high-tech, futuristic Hot Wheels car with a sleek design and advanced features. 🚀✨"
            },
            {
                id: 41,
                name: "Apline F1",
                price: 2100,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/5hNrFz38/f1.jpg",
                ],
                description: "f1 - The pinnacle of Formula 1 excellence — precision engineering and blistering speed in miniature form. 🏎️⚡"
            },
            {
                id: 43,
                name: "MoneyGram Haas F1",
                price: 2099,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/8DxTpWR4/f1w.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "moneygram haas f1 - The most sought-after Formula 1 car in the Hotwheels collection — a rare and highly collectible masterpiece. 🏎️🏆"
            },
            {
                id: 42,
                name: "Mclaren F1",
                price: 2149,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/DPTf7jpG/f1o.jpg",
                    // "",
                    // ""
                ],
                description: "mclaren f1 - The legendary supercar that defined an era — iconic design and blistering performance in one package. 🏎️👑"
            },
            {
                id: 66,
                name: "Lamborghini Hurucan Sterrato",
                price: 1099,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/d0LvvwVq/lamhs.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "Lamborghini Hurucan Sterrato – A rugged and powerful supercar designed for off-road adventures. 🏞️🏎️"
            },
            {
                id: 40,
                name: "Buggati veyron",
                price: 1499,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/bMkxvj2k/bv4.png",
                    "https://i.ibb.co/c7SnrFq/bv3.jpg",
                    "https://i.ibb.co/YFYrqtkX/bv2.jpg",
                    "https://i.ibb.co/JwHTj0PQ/bv1.png"
                ],
                description: "bugatti veyron - The ultimate hypercar experience — unparalleled speed and luxury in one package. 🚀👑"
            },
            {
                id: 67,
                name: "Ford Mustang GTD",
                price: 999,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/TxMsjLvf/fmg.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "Ford Mustang GTD – The epitome of American muscle with a modern twist. 🏁🔥"
            },
            {
                id: 68,
                name: "BMW M3 Wagon",
                price: 599,
                category: "newarrival", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/0Rmj4bm5/bm3.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "BMW M3 Wagon – A rare performance wagon that mixes practicality with pure M-power thrills. 🚙🏁"
            },
            {
                id: 69,
                name: "BMW 635 CSi",
                price: 849,
                category: "rare", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/DsGxWs7/m6c.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "BMW 635 CSi – Classic luxury meets sporty performance in this timeless beauty. 🏁🚗"
            },
            {
                id: 70,
                name: "67 Shelby GT500 Mustang",
                price: 749,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/LzNqJ6ms/shelg.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "67 Shelby GT500 Mustang – American muscle legend — raw power and iconic style in one beast. 🏁🔥"
            },
            {
                id: 36,
                name: "Lamborghini Sian FKP 37",
                price: 1299,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/m5v5zJVN/ls.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "Lamborghini Sian FKP 37 – Electrified Lambo fury — rare, sharp, and built for pure adrenaline. ⚡🐂"
            },
            {
                id: 37,
                name: "Mclaren P1",
                price: 1299,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/6RGTvSPQ/mcp1.jpg",
                    // "",
                    // "",
                ],
                description: "McLaren P1 – Hybrid hypercar icon — extreme speed wrapped in stunning futuristic design. 🚀👑"
            },
            {
                id: 38,
                name: "2016 BMW M2",
                price: 1119,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/rfwHLMR3/bmw2.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "2016 BMW M2 – Compact, aggressive, and insanely fun — the perfect modern driver’s machine. 🚗🔥"
            },
            {
                id: 39,
                name: "BMW M4",
                price: 1299,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/TBJr5gv7/bm4.jpg",
                    // "",
                    // "",
                    // ""
                ],
                description: "BMW M4 – Sharp, powerful, and built to dominate — the M4 delivers pure performance attitude. 🏁⚡"
            },
            {
                id: 10,
                name: "94 Audi Avant RS2",
                price: 699,
                category: "giftset", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/HTtsVK2m/dc.jpg",
                    "https://i.ibb.co/zhqDznzv/db.jpg",
                    "https://i.ibb.co/XrfpcR0V/da.jpg"
                ],
                description: "’94 Audi Avant RS2 – The sleeper wagon that rules the roads — power hidden in style. 🚙💥"
            },
            {
                id: 17,
                name: "15 Land Rover Defender Double Cab",
                price: 749,
                category: "bestseller", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/Y7jRvbYn/kb.webp",
                    "https://i.ibb.co/wZrR8Dhn/ka.jpg",
                    "https://i.ibb.co/s92KfyDn/kc.jpg"
                ],
                description: "15 Land Rover Defender Double Cab – Rugged, unstoppable, and adventure-ready on any terrain. 🌍🛻"
            },
            {
                id: 28,
                name: "BMW M3 Wagon",
                price: 699,
                category: "newarrival", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/1tPyBkdw/bmw-m.jpg",
                    "https://i.ibb.co/LX3Cmdj5/bm.webp",
                    "https://i.ibb.co/CN22FKR/bmw.jpg"
                ],
                description: "BMW M3 Wagon – Family practicality fused with racing spirit — rare and powerful. 🚙🏁"
            },
            {
                id: 1,
                name: "Formula E Gen3 Track Aces",
                price: 999,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/s9x2M8jP/A4.webp",
                    "https://i.ibb.co/k2vVfsyH/A1.jpg",
                    "https://i.ibb.co/zTz9Tmc5/A2.jpg",
                    "https://i.ibb.co/0pTjjvBv/A3.jpg"
                ],
                description: "Formula E Gen3 Track Aces – Future of racing in your hands, with electric speed and track-ready style. ⚡🏎️"
            },
            {
                id: 2,
                name: "Ford Mustang Dark Horse",
                price: 799,
                category: "rare", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/spyf9pzw/B3.webp ",
                    "https://i.ibb.co/WWLCZmt3/B1.jpg",
                    "https://i.ibb.co/yFGSzP0S/B2.jpg",
                    "https://i.ibb.co/60hmLq0F/B4.jpg"
                ],
                description: "Ford Mustang Dark Horse – Bold, aggressive, and built for dominance — a Mustang that owns the streets. 🐎🔥"
            },
            {
                id: 3,
                name: "67 Mustang Muscle Mania",
                price: 749,
                category: "rare", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/20XFr3rY/C1.jpg",                   
                    "https://i.ibb.co/yn7TXM5j/C2.jpg",
                    "https://i.ibb.co/60tSPYXg/C3.png",
                    "https://i.ibb.co/DfxVSPkB/C4.webp",
                ],
                description: "’67 Mustang Muscle Mania – Classic American muscle packed with raw power and vintage vibes. 💪🇺🇸"
            },
            {
                id: 4,
                name: "67 Shelby GT500 Mustang",
                price: 799,
                category: "bestseller", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/XZ2RsK24/D2.jpg",
                    "https://i.ibb.co/sdCHLrgz/D1.jpg",
                    "https://i.ibb.co/4wj5xxQc/D3.webp",
                    "https://i.ibb.co/3yMq8LhY/D4.webp"
                ],
                description: "’67 Shelby GT500 Mustang – Legendary heritage meets roaring performance — pure collector’s pride. 🐍🏁"
            },
            {
                id: 5,
                name: "Nissan Skyline GT-R(BCNR33)",
                price: 799,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/xKjvpKKn/E1.jpg",
                    "https://i.ibb.co/21k9n0kd/E2.jpg",
                    "https://i.ibb.co/dsxC7Szp/E3.webp",
                    "https://i.ibb.co/m5mTyXNQ/E4.png"
                ],
                description: "Nissan Skyline GT-R (BCNR33) – A JDM icon with turbocharged spirit, ready for drift or drag. 🇯🇵⚡"
            },
            {
                id: 6,
                name: "Mclaren P1 2015",
                price: 799,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/kjXVc1Q/az1.webp ",
                    "https://i.ibb.co/MyJcSm50/az2.png"
                ],
                description: "McLaren P1 2015 – Hypercar royalty — sleek design and insane speed in miniature perfection. 🏎️👑"
            },
            {
                id: 7,
                name: "Fast n Furious Nissan 240SX (S14)",
                price: 1499,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/vxX1hDg8/ad.jpg",
                    "https://i.ibb.co/vC3mrLXv/ab1.jpg",
                    "https://i.ibb.co/1G6wdYs9/ac.jpg"
                ],
                description: "Fast & Furious Nissan 240SX (S14) – Street-tuned legend straight from the Fast family — drift king vibes. 🎬🔥"
            },
            {
                id: 8,
                name: "92 Ford Mustang",
                price: 799,
                category: "bestseller", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/rRMGLtVg/bb.webp",
                    "https://i.ibb.co/r2vqrSk6/ba.jpg"
                ],
                description: "’92 Ford Mustang – Retro muscle with modern attitude, ready to burn rubber. 🚦💨"
            },
            {
                id: 9,
                name: "Jaguar MK1 Race Day",
                price: 699,
                category: "rare", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/JR6nbxWK/cb.jpg",
                    "https://i.ibb.co/TxQpqwmD/ca.jpg"
                ],
                description: "Jaguar MK1 Race Day – Vintage racer elegance with a fierce competitive edge. 🐆🏆"
            },
            {
                id: 11,
                name: "Czinger 21C",
                price: 699,
                category: "giftset", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/ksRP8bWK/eb.jpg",
                    "https://i.ibb.co/v4J8zLsp/ec.webp",
                    "https://i.ibb.co/4RkhGCHb/ea.jpg"
                ],
                description: "Czinger 21C – Future hypercar engineering — ultra-rare, ultra-fast, ultra-cool. 🚀⚡"
            },
            {
                id: 12,
                name: "Nissan Skyline 2000GTR LBWK",
                price: 499,
                category: "giftset", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/b5h2JB6D/fc.jpg",
                    "https://i.ibb.co/4RQd1QXB/fa.jpg",
                    "https://i.ibb.co/Kx5Wk3qQ/fb.jpg"
                ],
                description: "Nissan Skyline 2000GTR LBWK – Liberty Walk flair meets Skyline legend — wide-body beast mode. 🔥🇯🇵"
            },
            {
                id: 13,
                name: "69 Mercury Cyclone",
                price: 549,
                category: "giftset", // Change category here
                availability: "low-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/Xk7WFMk8/gc.webp",
                    "https://i.ibb.co/wF2w47Np/ga.jpg",
                    "https://i.ibb.co/3mv98DNY/gb.jpg"
                ],
                description: "’69 Mercury Cyclone – Pure muscle car thunder with a sleek, powerful stance. ⚡💪"
            },
            {
                id: 14,
                name: "Porsche 911 Carrera Clip",
                price: 499,
                category: "giftset", // Change category here
                availability: "low-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/hF2nzxfh/hb.jpg",
                    "https://i.ibb.co/5W2ZTNt6/ha.jpg"
                ],
                description: "Porsche 911 Carrera Clip – Minimal, functional, and stylish — the Porsche you can carry anywhere. 🏎️🔑"
            },
            {
                id: 15,
                name: "Cadillac Project GTP Hypercar",
                price: 659,
                category: "", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/TxSFrYnp/id.webp",
                    "https://i.ibb.co/67d9FzJw/ib.jpg",
                    "https://i.ibb.co/8n1tKbtG/ia.jpg"
                ],
                description: "Cadillac Project GTP Hypercar – Next-gen Cadillac performance — built to conquer the future of racing. 🏁🚀"
            },
            {
                id: 16,
                name: "Cadillac Project GTP Hyperca(Red)",
                price: 649,
                category: "", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/fY7txK3g/jc.jpg",
                    "https://i.ibb.co/PvvzLfLf/ja.jpg",
                    "https://i.ibb.co/0j5HG4vg/jb.jpg"
                ],
                description: "Cadillac Project GTP Hypercar Red – Next-gen Cadillac performance — built to conquer the future of racing. 🏁🚀"
            },
            {
                id: 18,
                name: "BMW 635 CSi",
                price: 1799,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/1frvzM93/635c.jpg",
                    "https://i.ibb.co/k6c2kLh9/cs635.png",
                    "https://i.ibb.co/rRG6zkCS/625.jpg"
                ],
                description: "BMW 635 CSi – A luxury coupe with racing DNA — classic BMW performance in style. 🏁🇩🇪"
            },
            {
                id: 19,
                name: "Land Rover Defender 90",
                price: 699,
                category: "giftset", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/LhdTNBNc/def.jpg",
                    "https://i.ibb.co/27z93Q7n/defe.png"
                ],
                description: "Land Rover Defender 90 – Compact, rugged, and unstoppable — built for every adventure. 🌍🛻"
            },
            {
                id: 32,
                name: "Mclaren Speedtail",
                price: 1399,
                category: "limited", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/wZZhbcTK/mc3.png",
                    "https://i.ibb.co/Xfkr9NCW/mc4.jpg",
                    "https://i.ibb.co/QFRfvScq/mc1.png",
                    "https://i.ibb.co/4g1GwcX8/mc2.jpg"
                ],
                description: "McLaren Speedtail – A futuristic hypercar masterpiece — ultra-sleek, lightning fast, and built for pure speed dominance. 🚀🏎️"
            },
            {
                id: 20,
                name: "Porsche 911 Rallye",
                price: 1200,
                category: "bestseller", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/Z6ZK0YRX/pors.jpg",
                    "https://i.ibb.co/4nznBPpW/por.jpg",
                    "https://i.ibb.co/7x1D9Xh0/porse.jpg"
                ],
                description: "Porsche 911 Rallye – Iconic Porsche engineered for dirt, drift, and domination. 🏎️🌪️"
            },
            {
                id: 21,
                name: "20 Jeep Gladiator",
                price: 749,
                category: "giftset", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/p6SGR3F7/jeep-g.jpg",
                    "https://i.ibb.co/SXhVxMqY/jee.jpg",
                    "https://i.ibb.co/3YcRH32k/jeep.jpg"
                ],
                description: "’20 Jeep Gladiator – Tough off-road beast with pickup power and Jeep attitude. 🚙💥"
            },
            {
                id: 22,
                name: "71 Dodge Challenger",
                price: 749,
                category: "bestseller", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/n8ctMzf1/dogc.jpg",
                    "https://i.ibb.co/dYRjH7g/dog.jpg",
                    "https://i.ibb.co/0yMLKxtG/do.jpg"
                ],
                description: "71 Dodge Challenger – Classic muscle, bold stripes, and roaring horsepower. ⚡🔥"
            },
            {
                id: 23,
                name: "Ford Model A Custom '31",
                price: 499,
                category: "giftset", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/HD3K2wbh/ford.jpg",
                    "https://i.ibb.co/Q3bhJzL1/fo.jpg",
                    "https://i.ibb.co/6cfyLX10/for.jpg"
                ],
                description: "Ford Model A Custom ’31 – Retro cool meets custom hot rod vibes — pure vintage fire. 🔥🛠️"
            },
            {
                id: 24,
                name: "Bugatti Bolide",
                price: 3699,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/S4LBDWkx/bug.jpg" 
                ],
                description: "Bugatti Bolide – The ultimate hypercar weapon — extreme speed and futuristic design. 🚀👑"
            },
            {
                id: 25,
                name: "Bugatti Chiron",
                price: 3499,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/qMCrzV1h/bugg.jpg"
                ],
                description: "Bugatti Chiron – Elegance and raw power — the king of hypercars in miniature form. 👑⚡"
            },
            {
                id: 26,
                name: "Batmobile",
                price: 999,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/40Hq2mp/ba.jpg"
                ],
                description: "Batmobile – Gotham’s most legendary ride — sleek, dark, and unstoppable. 🦇🚗"
            },
            {
                id: 27,
                name: "BMW 2002",
                price: 549,
                category: "giftset", // Change category here
                availability: "low-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/Fk3x8N0G/bm2.jpg",
                    "https://i.ibb.co/4Z6Nnz2G/b2.png",
                    "https://i.ibb.co/qLTt9xVD/bm2w.webp"
                ],
                description: "BMW 2002 – The classic that defined BMW sportiness — timeless driving icon. 🇩🇪✨"
            },
            {
                id: 29,
                name: "94 Bugatti EB110",
                price: 1499,
                category: "rare", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/6M0nVWQ/blbu.jpg",
                    "https://i.ibb.co/05MDfHn/bbug.jpg",
                    "https://i.ibb.co/7tTHdvWk/buq.jpg",
                    "https://i.ibb.co/39ZFY75T/blbug.jpg"
                ],
                description: "’94 Bugatti EB110 – The 90s hypercar revival — rare, fast, and legendary. 🏎️🔥"
            },
            {
                id: 30,
                name: "Custom 53 Cadillac Blue",
                price: 499,
                category: "", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/ksgVwHDx/cus.jpg",
                    "https://i.ibb.co/DDpw7c4B/cu.jpg"
                ],
                description: "Custom ’53 Cadillac Blue – Low, sleek, and dripping with custom style — a true street cruiser. 💎🚘"
            },
            {
                id: 31,
                name: "Ravenger S T",
                price: 599,
                category: "bestseller", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/q3nDyhFd/ra.webp",
                    "https://i.ibb.co/Rppn0P0x/rave.png",
                    "https://i.ibb.co/xqY5YMp0/rav.jpg"
                ],
                description: "Ravenger S T – Futuristic design with an aggressive edge — built to stand out. 🚀🔥"
            },
            {
                id: 33,
                name: "2013 SRT Viper",
                price: 649,
                category: "", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/YBS7thJJ/image.png",
                    "https://i.ibb.co/67Zv3WDJ/961.jpg",
                    "https://i.ibb.co/gbw6L9rX/96.jpg"
                ],
                description: "2013 SRT Viper (Dodge) – Aggressive, wild, and venomous — the modern muscle monster of speed. 🐍🔥"
            },
            {
                id: 34,
                name: "Datsun 240Z",
                price: 699,
                category: "mostwanted", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/sJdCsvhR/971.jpg",
                    "https://i.ibb.co/LX9dpRHc/97.jpg"
                ],
                description: "Datsun 240Z – The legend that started the JDM craze — sleek, lightweight, and built to thrill. 🇯🇵⚡"
            },
            {
                id: 35,
                name: "70 Dodge Hemi Challenger",
                price: 649,
                category: "", // Change category here
                availability: "sold-out", // "in-stock", "sold-out", "low-stock"
                images: [
                    "https://i.ibb.co/cXQ6BsPY/982.jpg",
                    "https://i.ibb.co/yx6qznZ/98.jpg",
                    "https://i.ibb.co/9k2qFJgs/981.webp"
                ],
                description: "’70 Dodge Hemi Challenger – Old-school muscle with a thunderous roar — pure American power unleashed."
            }
    /*
            
            {
                id: 53,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            }
                        {
                id: 54,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 55,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "in-stock", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 56,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            }
                        {
                id: 57,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 58,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 59,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            }
                        {
                id: 60,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 61,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 62,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            }
                        {
                id: 63,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 64,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            },
            {
                id: 65,
                name: "",
                price: ,
                category: "", // Change category here
                availability: "", // "in-stock", "sold-out", "low-stock"
                images: [
                    "",
                    "",
                    "",
                    ""
                ],
                description: ""
            }
                uncomment to add more products  */ 

        ];

        // TO ADD MORE PRODUCTS: Copy the template below and add to PRODUCTS_DB array
        /*
        {
            id: 7, // Increment ID
            name: "Your Product Name",
            price: 299, // Price without currency symbol
            category: "bestseller", // Choose: bestseller, mostwanted, limited, newarrival, rare, giftset
            availability: "in-stock", // Choose: in-stock, sold-out, low-stock
            images: [
                "https://your-image-url-1.jpg",
                "https://your-image-url-2.jpg",
                "https://your-image-url-3.jpg"
            ],
            description: "Your product description here."
            

        }
        */

        // =============================================================================
        // END OF EASY EDITING SECTION - CODE BELOW HANDLES FUNCTIONALITY
        // =============================================================================

        // Convert PRODUCTS_DB to legacy format for compatibility
        let allProducts = PRODUCTS_DB.map(product => ({
            ...product,
            price: `${STORE_CONFIG.currency}${product.price}`,
            priceValue: product.price
        }));

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
            renderProducts(allProducts);
            updateCartCount();
            updateCartDisplay();
            
            document.querySelectorAll('.quick-link').forEach((link, index) => {
                link.style.animationDelay = `${index * 0.1}s`;
                link.style.animation = 'fadeInUp 0.6s ease forwards';
            });
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
>>>>>>> 887d923d4fdfb55560cc2675e89ea0dfc92aced4
