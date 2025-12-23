// --- 1. VISUAL EFFECTS ---
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
const hoverTargets = document.querySelectorAll('.hover-target, a, button, .amt-btn, input, .story-img, .card-3d');

window.addEventListener('mousemove', function (e) {
    const posX = e.clientX; const posY = e.clientY;
    cursorDot.style.left = `${posX}px`; cursorDot.style.top = `${posY}px`;
    cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
});

hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// Theme Toggle
const themeBtn = document.getElementById('theme-btn');
const themeIcon = themeBtn.querySelector('i');
let isDark = false;
themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
});

// Scroll Reveal
window.addEventListener('scroll', reveal);
function reveal() {
    var reveals = document.querySelectorAll('.reveal');
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var revealTop = reveals[i].getBoundingClientRect().top;
        if (revealTop < windowHeight - 150) reveals[i].classList.add('active');
    }
}
reveal();

// Sticky Header & Back to Top
const header = document.querySelector('header');
const scrollTopBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 50);
    if (window.scrollY > 300) scrollTopBtn.classList.add('show');
    else scrollTopBtn.classList.remove('show');
});
scrollTopBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => { preloader.style.opacity = '0'; preloader.style.visibility = 'hidden'; }, 1000);
});

// Mobile Menu
const hamburger = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');
const closeMenu = document.querySelector('.close-menu');
const navLinksItems = document.querySelectorAll('.nav-links a');
if (hamburger) {
    hamburger.addEventListener('click', () => navMenu.classList.add('active'));
    closeMenu.addEventListener('click', () => navMenu.classList.remove('active'));
    navLinksItems.forEach(link => link.addEventListener('click', () => navMenu.classList.remove('active')));
}

// --- 2. PAYMENT LOGIC ---
const BANK_ID = "970436"; const ACCOUNT_NO = "1041228495"; const ACCOUNT_NAME = "Nguyen Ho Sy Phu"; const TEMPLATE = "compact2";
const GAS_URL = "https://script.google.com/macros/s/AKfycbzok19KmgsO1Nms0YHsiNWw0VHrr4ezrRtunXcoat-pIrK8dV3zNNHoQqK7VCiticcP/exec";
let currentAmount = 0;
const displayAmountEl = document.getElementById("display-amount");
const imgQrEl = document.getElementById("img-qr");
const placeholderEl = document.getElementById("qr-placeholder");
const customInput = document.getElementById("custom-amount");
const amtBtns = document.querySelectorAll('.amt-btn');

function formatPrice(value) { return new Intl.NumberFormat("vi-VN").format(value); }

function renderQR() {
    displayAmountEl.innerText = formatPrice(currentAmount);
    if (currentAmount > 0) {
        placeholderEl.style.display = 'none'; imgQrEl.style.display = 'block';
        imgQrEl.src = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${currentAmount}&accountName=${encodeURIComponent(ACCOUNT_NAME)}&addInfo=Ung ho quy`;
    } else {
        placeholderEl.style.display = 'block'; imgQrEl.style.display = 'none'; imgQrEl.src = "";
    }
}

amtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        customInput.value = "";
        amtBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
        currentAmount = parseInt(btn.getAttribute('data-amount')); renderQR();
    });
});

customInput.addEventListener('input', (e) => {
    amtBtns.forEach(b => b.classList.remove('active'));
    const val = parseInt(e.target.value);
    currentAmount = (!isNaN(val) && val > 0) ? val : 0;
    renderQR();
});

async function verifyPayment(event) {
    event.preventDefault();
    if (currentAmount <= 0) { alert("Vui lòng chọn hoặc nhập số tiền!"); return; }
    const statusEl = document.getElementById("payment-status");
    const btnEl = document.getElementById("btn-confirm");
    statusEl.innerText = "Đang kết nối ngân hàng..."; statusEl.className = "status-text loading";
    btnEl.disabled = true; btnEl.innerText = "Đang kiểm tra..."; btnEl.style.opacity = "0.7";

    let attempts = 0; let isPaid = false;
    try {
        while (attempts < 5 && !isPaid) {
            const res = await fetch(`${GAS_URL}?t=${Date.now()}`);
            const data = await res.json();
            if (data.data.find(tx => parseInt(tx.SoTien || tx.amount || 0) === currentAmount)) isPaid = true;
            if (isPaid) break;
            attempts++; if (attempts < 5) await new Promise(r => setTimeout(r, 2000));
        }
        if (isPaid) {
            statusEl.innerText = `Thành công! Cảm ơn bạn đã ủng hộ ${formatPrice(currentAmount)} đ.`;
            statusEl.className = "status-text success"; btnEl.innerText = "Đã hoàn thành";
        } else {
            statusEl.innerText = "Chưa nhận được tiền. Vui lòng kiểm tra lại.";
            statusEl.className = "status-text error"; btnEl.disabled = false; btnEl.innerText = "Xác Nhận Lại"; btnEl.style.opacity = "1";
        }
    } catch (err) {
        statusEl.innerText = "Lỗi kết nối."; statusEl.className = "status-text error"; btnEl.disabled = false; btnEl.style.opacity = "1";
    }
}
document.getElementById('donate-form').addEventListener('submit', verifyPayment);

// --- 3. MODAL LOGIC (UPDATED) ---
const modal = document.getElementById('story-modal');
const closeModal = document.querySelector('.close-modal');

// Dữ liệu cho Dự án
const projectContent = {
    "Xây Trường Vùng Cao": {
        img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
        tag: "Giáo dục",
        desc: "Dự án trọng điểm năm 2025 nhằm xóa bỏ những lớp học tạm bợ, tranh tre nứa lá tại huyện Mèo Vạc, Hà Giang. <br><br><strong>Mục tiêu:</strong><br>- Xây dựng 5 phòng học kiên cố.<br>- Trang bị bàn ghế, bảng chống lóa và đèn chiếu sáng đạt chuẩn.<br>- Xây dựng khu vệ sinh và bể chứa nước sạch cho học sinh.<br><br>Tổng kinh phí dự kiến: 1 tỷ VND. Hiện đã quyên góp được 75%."
    },
    "Trái Tim Cho Em": {
        img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
        tag: "Y tế",
        desc: "Chương trình hỗ trợ chi phí phẫu thuật tim bẩm sinh cho trẻ em nghèo dưới 16 tuổi. <br><br>Với chi phí trung bình 50-70 triệu đồng/ca, đây là gánh nặng quá lớn với các gia đình khó khăn. Quỹ cam kết tài trợ 100% chi phí phẫu thuật và hồi sức sau mổ, giúp các em có một trái tim khỏe mạnh để đến trường."
    },
    "Bữa Ăn 0đ": {
        img: "https://images.unsplash.com/photo-1594708767767-4f037890453c?q=80&w=800&auto=format&fit=crop",
        tag: "Bác ái xã hội",
        desc: "Cung cấp các suất ăn dinh dưỡng miễn phí cho bệnh nhi ung thư và người nhà tại các bệnh viện lớn. <br><br>Mỗi suất ăn trị giá 30.000đ bao gồm đầy đủ cơm, canh, món mặn và trái cây tráng miệng, đảm bảo vệ sinh an toàn thực phẩm."
    },
    "Học Bổng": {
        img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
        tag: "Giáo dục",
        desc: "Trao tặng học bổng 'Tiếp Sức Đến Trường' cho học sinh nghèo vượt khó học giỏi. <br><br>Mỗi suất học bổng bao gồm: Tiền mặt (2 triệu đồng), Balo, Sách giáo khoa và Dụng cụ học tập. Chúng tôi tin rằng giáo dục là con đường ngắn nhất để thoát nghèo."
    }
};

// Dữ liệu cho Tin tức
const storyContent = {
    "Hành trình tìm lại nụ cười của bé An": { img: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=600&auto=format&fit=crop", desc: "Bé An sinh ra với dị tật hở hàm ếch. Nhờ sự hỗ trợ của Quỹ và bác sĩ tình nguyện, ca phẫu thuật đã thành công.", tag: "Y tế" },
    "Lớp học \"trên mây\" tại Hà Giang": { img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop", desc: "Dự án mang internet vệ tinh và máy tính bảng đến điểm trường Mèo Vạc, giúp các em tiếp cận tri thức.", tag: "Giáo dục" }
};

function openModal(title, data) {
    if (data) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-img').src = data.img;
        document.getElementById('modal-desc').innerHTML = `<p>${data.desc}</p>`;
        document.getElementById('modal-tag').innerText = data.tag;
        modal.classList.add('show'); document.body.style.overflow = 'hidden';
    }
}

function hideModal() { modal.classList.remove('show'); document.body.style.overflow = 'auto'; }

// Event Listeners for Modal
const readMoreBtns = document.querySelectorAll('.read-more');
readMoreBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click from firing
        const title = btn.closest('.story-card').querySelector('h4').innerText;
        openModal(title, storyContent[title]);
    });
});

// Add Click for Story Images
const storyImages = document.querySelectorAll('.story-img');
storyImages.forEach(imgContainer => {
    imgContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click from firing
        const title = imgContainer.closest('.story-card').querySelector('h4').innerText;
        openModal(title, storyContent[title]);
    });
});

// Add Click for Entire Story Card (NEW)
const storyCards = document.querySelectorAll('.story-card');
storyCards.forEach(card => {
    card.addEventListener('click', function () {
        const title = this.querySelector('h4').innerText;
        openModal(title, storyContent[title]);
    });
});

const projectCards = document.querySelectorAll('.card-3d');
projectCards.forEach(card => {
    card.addEventListener('click', function () {
        const title = this.querySelector('h3').innerText;
        openModal(title, projectContent[title]);
    });
});

closeModal.addEventListener('click', hideModal);
window.addEventListener('click', (e) => { if (e.target == modal) hideModal(); });

// Escape Key to Close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        hideModal();
    }
});