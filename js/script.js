/**
 * ============================================================================
 * LITTLE ROSES FOUNDATION - MAIN JAVASCRIPT
 * ============================================================================
 * 
 * @description Main JavaScript file for Little Roses Foundation website
 * @version 2.0.0
 * @author Little Roses Development Team
 * 
 * Table of Contents:
 * 1. Utility Functions
 * 2. Visual Effects (Cursor, Theme, Animations)
 * 3. Navigation & Scroll
 * 4. Payment System
 * 5. Modal System
 */

// ============================================================================
// 1. UTILITY FUNCTIONS
// ============================================================================

/**
 * Debounce function to limit function execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Request Animation Frame throttle for smooth 60fps animations
 * @param {Function} callback - Callback function to throttle
 * @returns {Function} Throttled function
 */
function rafThrottle(callback) {
    let requestId = null;
    return function (...args) {
        if (requestId === null) {
            requestId = requestAnimationFrame(() => {
                requestId = null;
                callback.apply(this, args);
            });
        }
    };
}

/**
 * Format number as Vietnamese currency
 * @param {number} value - Number to format
 * @returns {string} Formatted currency string
 */
function formatPrice(value) {
    return new Intl.NumberFormat("vi-VN").format(value);
}

/**
 * Safely query DOM element with error handling
 * @param {string} selector - CSS selector
 * @param {boolean} multiple - Whether to query all elements
 * @returns {Element|NodeList|null} DOM element(s) or null
 */
function safeQuery(selector, multiple = false) {
    try {
        return multiple
            ? document.querySelectorAll(selector)
            : document.querySelector(selector);
    } catch (error) {
        console.warn(`Failed to query selector: ${selector}`, error);
        return multiple ? [] : null;
    }
}

// ============================================================================
// 2. VISUAL EFFECTS
// ============================================================================

/**
 * Initialize custom cursor for desktop devices
 */
function initCustomCursor() {
    const MOBILE_BREAKPOINT = 768;

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        return; // Skip cursor on mobile
    }

    const cursorDot = safeQuery('[data-cursor-dot]');
    const cursorOutline = safeQuery('[data-cursor-outline]');

    if (!cursorDot || !cursorOutline) {
        console.warn('Cursor elements not found');
        return;
    }

    const hoverTargets = safeQuery('.hover-target, a, button, .amt-btn, input, .story-img, .card-3d', true);

    // Use RAF throttle for smooth cursor movement
    const updateCursor = rafThrottle((e) => {
        const { clientX: posX, clientY: posY } = e;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate(
            { left: `${posX}px`, top: `${posY}px` },
            { duration: 500, fill: "forwards" }
        );
    });

    window.addEventListener('mousemove', updateCursor, { passive: true });

    // Add hover effects
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'), { passive: true });
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'), { passive: true });
    });
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeBtn = safeQuery('#theme-btn');
    if (!themeBtn) return;

    const themeIcon = themeBtn.querySelector('i');
    let isDark = false;

    themeBtn.addEventListener('click', () => {
        isDark = !isDark;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';

        // Save preference to localStorage
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (e) {
            console.warn('Failed to save theme preference', e);
        }
    });

    // Load saved theme preference
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            themeBtn.click();
        }
    } catch (e) {
        console.warn('Failed to load theme preference', e);
    }
}

/**
 * Initialize scroll reveal animations using IntersectionObserver
 */
function initScrollReveal() {
    const revealElements = safeQuery('.reveal', true);
    if (!revealElements.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve after reveal for better performance
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
}

// ============================================================================
// 3. NAVIGATION & SCROLL
// ============================================================================

/**
 * Initialize sticky header and back-to-top button
 */
function initStickyHeader() {
    const header = safeQuery('header');
    const scrollTopBtn = safeQuery('#scroll-top');

    if (!header || !scrollTopBtn) return;

    const SCROLL_THRESHOLD = 50;
    const SHOW_BTN_THRESHOLD = 300;

    const handleScroll = rafThrottle(() => {
        const scrollY = window.scrollY;
        header.classList.toggle('scrolled', scrollY > SCROLL_THRESHOLD);
        scrollTopBtn.classList.toggle('show', scrollY > SHOW_BTN_THRESHOLD);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Initialize logo click to scroll to top
 */
function initLogoScroll() {
    const logoLink = safeQuery('#logo-link');
    if (!logoLink) return;

    logoLink.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Initialize preloader
 */
function initPreloader() {
    window.addEventListener('load', () => {
        const preloader = safeQuery('#preloader');
        if (!preloader) return;

        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 1000);
    });
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const hamburger = safeQuery('#hamburger-btn');
    const navMenu = safeQuery('#nav-menu');
    const closeMenu = safeQuery('.close-menu');
    const navLinksItems = safeQuery('.nav-links a', true);

    if (!hamburger || !navMenu || !closeMenu) return;

    hamburger.addEventListener('click', () => navMenu.classList.add('active'));
    closeMenu.addEventListener('click', () => navMenu.classList.remove('active'));

    navLinksItems.forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('active'));
    });
}

/**
 * Initialize smooth scroll with section highlight
 */
function initSmoothScroll() {
    const navLinksItems = safeQuery('.nav-links a', true);
    const HIGHLIGHT_DURATION = 1500;

    navLinksItems.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Only handle internal links (starting with #)
            if (!href || !href.startsWith('#')) return;

            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = safeQuery(`#${targetId}`);

            if (targetSection) {
                // Smooth scroll to section
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Add highlight effect
                targetSection.classList.add('section-highlight');

                // Remove highlight class after animation completes
                setTimeout(() => {
                    targetSection.classList.remove('section-highlight');
                }, HIGHLIGHT_DURATION);
            }
        });
    });
}

// ============================================================================
// 4. PAYMENT SYSTEM
// ============================================================================

/**
 * Payment configuration constants
 */
const PAYMENT_CONFIG = {
    BANK_ID: "970436",
    ACCOUNT_NO: "1041228495",
    ACCOUNT_NAME: "Nguyen Ho Sy Phu",
    TEMPLATE: "compact2",
    GAS_URL: "https://script.google.com/macros/s/AKfycbzok19KmgsO1Nms0YHsiNWw0VHrr4ezrRtunXcoat-pIrK8dV3zNNHoQqK7VCiticcP/exec",
    MAX_ATTEMPTS: 5,
    RETRY_DELAY: 2000
};

/**
 * Payment state
 */
let currentAmount = 0;

/**
 * Render QR code based on current amount
 */
function renderQR() {
    const displayAmountEl = safeQuery("#display-amount");
    const imgQrEl = safeQuery("#img-qr");
    const placeholderEl = safeQuery("#qr-placeholder");

    if (!displayAmountEl || !imgQrEl || !placeholderEl) return;

    displayAmountEl.innerText = formatPrice(currentAmount);

    if (currentAmount > 0) {
        placeholderEl.style.display = 'none';
        imgQrEl.style.display = 'block';

        const qrUrl = new URL(`https://img.vietqr.io/image/${PAYMENT_CONFIG.BANK_ID}-${PAYMENT_CONFIG.ACCOUNT_NO}-${PAYMENT_CONFIG.TEMPLATE}.png`);
        qrUrl.searchParams.set('amount', currentAmount);
        qrUrl.searchParams.set('accountName', PAYMENT_CONFIG.ACCOUNT_NAME);
        qrUrl.searchParams.set('addInfo', 'Ung ho quy');

        imgQrEl.src = qrUrl.toString();
    } else {
        placeholderEl.style.display = 'block';
        imgQrEl.style.display = 'none';
        imgQrEl.src = "";
    }
}

/**
 * Initialize payment amount selection
 */
function initPaymentAmount() {
    const customInput = safeQuery("#custom-amount");
    const amtBtns = safeQuery('.amt-btn', true);

    if (!customInput || !amtBtns.length) return;

    // Preset amount buttons
    amtBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            customInput.value = "";
            amtBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const amount = parseInt(btn.getAttribute('data-amount'));
            if (!isNaN(amount) && amount > 0) {
                currentAmount = amount;
                renderQR();
            }
        });
    });

    // Custom amount input
    customInput.addEventListener('input', (e) => {
        amtBtns.forEach(b => b.classList.remove('active'));

        const val = parseInt(e.target.value);
        currentAmount = (!isNaN(val) && val > 0) ? val : 0;
        renderQR();
    });
}

/**
 * Verify payment with bank API
 * @param {Event} event - Form submit event
 */
async function verifyPayment(event) {
    event.preventDefault();

    // Validation
    if (currentAmount <= 0) {
        alert("Vui lòng chọn hoặc nhập số tiền!");
        return;
    }

    const statusEl = safeQuery("#payment-status");
    const btnEl = safeQuery("#btn-confirm");

    if (!statusEl || !btnEl) return;

    // Update UI to loading state
    statusEl.innerText = "Đang kết nối ngân hàng...";
    statusEl.className = "status-text loading";
    btnEl.disabled = true;
    btnEl.innerText = "Đang kiểm tra...";
    btnEl.style.opacity = "0.7";

    let attempts = 0;
    let isPaid = false;

    try {
        while (attempts < PAYMENT_CONFIG.MAX_ATTEMPTS && !isPaid) {
            const response = await fetch(`${PAYMENT_CONFIG.GAS_URL}?t=${Date.now()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check if payment exists
            const transaction = data.data?.find(tx => {
                const txAmount = parseInt(tx.SoTien || tx.amount || 0);
                return txAmount === currentAmount;
            });

            if (transaction) {
                isPaid = true;
                break;
            }

            attempts++;

            // Wait before retry (except on last attempt)
            if (attempts < PAYMENT_CONFIG.MAX_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, PAYMENT_CONFIG.RETRY_DELAY));
            }
        }

        // Update UI based on result
        if (isPaid) {
            statusEl.innerText = `Thành công! Cảm ơn bạn đã ủng hộ ${formatPrice(currentAmount)} đ.`;
            statusEl.className = "status-text success";
            btnEl.innerText = "Đã hoàn thành";
        } else {
            statusEl.innerText = "Chưa nhận được tiền. Vui lòng kiểm tra lại.";
            statusEl.className = "status-text error";
            btnEl.disabled = false;
            btnEl.innerText = "Xác Nhận Lại";
            btnEl.style.opacity = "1";
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        statusEl.innerText = "Lỗi kết nối. Vui lòng thử lại sau.";
        statusEl.className = "status-text error";
        btnEl.disabled = false;
        btnEl.style.opacity = "1";
    }
}

/**
 * Initialize payment form
 */
function initPaymentForm() {
    const donateForm = safeQuery('#donate-form');
    if (!donateForm) return;

    donateForm.addEventListener('submit', verifyPayment);
}

// ============================================================================
// 5. MODAL SYSTEM
// ============================================================================

/**
 * Project content data
 */
const PROJECT_CONTENT = {
    "Xây Trường Vùng Cao": {
        img: "https://ofnews.vn/stores/news_dataimages/anhvu/052019/31/11/2837_YYi_diYn_QuY_Toyota_trao_tYng_cac_phYn_qua_cho_cac_em_hYc_sinh.jpg",
        tag: "Giáo dục",
        desc: "Dự án trọng điểm năm 2025 nhằm xóa bỏ những lớp học tạm bợ, tranh tre nứa lá tại huyện Mèo Vạc, Hà Giang. <br><br><strong>Mục tiêu:</strong><br>- Xây dựng 5 phòng học kiên cố.<br>- Trang bị bàn ghế, bảng chống lóa và đèn chiếu sáng đạt chuẩn.<br>- Xây dựng khu vệ sinh và bể chứa nước sạch cho học sinh.<br><br>Tổng kinh phí dự kiến: 1 tỷ VND. Hiện đã quyên góp được 75%."
    },
    "Trái Tim Cho Em": {
        img: "https://vtv.gov.vn/uploads/ketnoi/422/vtvnet/2023/thang-11/trai-tim-cho-em-3.jpg",
        tag: "Y tế",
        desc: "Chương trình hỗ trợ chi phí phẫu thuật tim bẩm sinh cho trẻ em nghèo dưới 16 tuổi. <br><br>Với chi phí trung bình 50-70 triệu đồng/ca, đây là gánh nặng quá lớn với các gia đình khó khăn. Quỹ cam kết tài trợ 100% chi phí phẫu thuật và hồi sức sau mổ, giúp các em có một trái tim khỏe mạnh để đến trường."
    },
    "Bữa Ăn 0đ": {
        img: "https://cafebiz.cafebizcdn.vn/162123310254002176/2023/1/12/photo-1-1673443725338666300654-1673446626126-1673446626292119356559-1673498005415-16734980058361059814615.jpg",
        tag: "Bác ái xã hội",
        desc: "Cung cấp các suất ăn dinh dưỡng miễn phí cho bệnh nhi ung thư và người nhà tại các bệnh viện lớn. <br><br>Mỗi suất ăn trị giá 30.000đ bao gồm đầy đủ cơm, canh, món mặn và trái cây tráng miệng, đảm bảo vệ sinh an toàn thực phẩm."
    },
    "Học Bổng": {
        img: "https://images.baodantoc.vn/uploads/2021/Th%C3%A1ng_12/Ng%C3%A0y%203/TRUNG/T%E1%BA%B7ng%20qu%C3%A0/A1%20-%20OK.jpg",
        tag: "Giáo dục",
        desc: "Trao tặng học bổng 'Tiếp Sức Đến Trường' cho học sinh nghèo vượt khó học giỏi. <br><br>Mỗi suất học bổng bao gồm: Tiền mặt (2 triệu đồng), Balo, Sách giáo khoa và Dụng cụ học tập. Chúng tôi tin rằng giáo dục là con đường ngắn nhất để thoát nghèo."
    }
};

/**
 * Story content data
 */
const STORY_CONTENT = {
    "Hành trình tìm lại nụ cười của bé An": {
        img: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=600&auto=format&fit=crop",
        desc: "Bé An sinh ra với dị tật hở hàm ếch. Nhờ sự hỗ trợ của Quỹ và bác sĩ tình nguyện, ca phẫu thuật đã thành công.",
        tag: "Y tế"
    },
    "Lớp học \"trên mây\" tại Hà Giang": {
        img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop",
        desc: "Dự án mang internet vệ tinh và máy tính bảng đến điểm trường Mèo Vạc, giúp các em tiếp cận tri thức.",
        tag: "Giáo dục"
    }
};

/**
 * Open modal with content
 * @param {string} title - Modal title
 * @param {Object} data - Content data
 */
function openModal(title, data) {
    if (!data) {
        console.warn('No data provided for modal');
        return;
    }

    const modal = safeQuery('#story-modal');
    const modalTitle = safeQuery('#modal-title');
    const modalImg = safeQuery('#modal-img');
    const modalDesc = safeQuery('#modal-desc');
    const modalTag = safeQuery('#modal-tag');

    if (!modal || !modalTitle || !modalImg || !modalDesc || !modalTag) {
        console.warn('Modal elements not found');
        return;
    }

    modalTitle.innerText = title;
    modalImg.src = data.img;
    modalDesc.innerHTML = `<p>${data.desc}</p>`;
    modalTag.innerText = data.tag;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function hideModal() {
    const modal = safeQuery('#story-modal');
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

/**
 * Initialize modal system
 */
function initModal() {
    const modal = safeQuery('#story-modal');
    const closeModalBtn = safeQuery('.close-modal');

    if (!modal || !closeModalBtn) return;

    // Close button
    closeModalBtn.addEventListener('click', hideModal);

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            hideModal();
        }
    });

    // Story card clicks
    const storyCards = safeQuery('.story-card', true);
    storyCards.forEach(card => {
        card.addEventListener('click', function () {
            const title = this.querySelector('h4')?.innerText;
            if (title && STORY_CONTENT[title]) {
                openModal(title, STORY_CONTENT[title]);
            }
        });
    });

    // Project card clicks
    const projectCards = safeQuery('.card-3d', true);
    projectCards.forEach(card => {
        card.addEventListener('click', function () {
            const title = this.querySelector('h3')?.innerText;
            if (title && PROJECT_CONTENT[title]) {
                openModal(title, PROJECT_CONTENT[title]);
            }
        });
    });

    // Read more button clicks
    const readMoreBtns = safeQuery('.read-more', true);
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = btn.closest('.story-card');
            const title = card?.querySelector('h4')?.innerText;

            if (title && STORY_CONTENT[title]) {
                openModal(title, STORY_CONTENT[title]);
            }
        });
    });

    // Story image clicks
    const storyImages = safeQuery('.story-img', true);
    storyImages.forEach(imgContainer => {
        imgContainer.addEventListener('click', (e) => {
            e.stopPropagation();

            const card = imgContainer.closest('.story-card');
            const title = card?.querySelector('h4')?.innerText;

            if (title && STORY_CONTENT[title]) {
                openModal(title, STORY_CONTENT[title]);
            }
        });
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all modules when DOM is ready
 */
function init() {
    try {
        // Visual Effects
        initCustomCursor();
        initThemeToggle();
        initScrollReveal();

        // Navigation & Scroll
        initStickyHeader();
        initLogoScroll();
        initPreloader();
        initMobileMenu();
        initSmoothScroll();

        // Payment System
        initPaymentAmount();
        initPaymentForm();

        // Modal System
        initModal();

        console.log('✅ Little Roses Foundation initialized successfully');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}