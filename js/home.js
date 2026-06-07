// ==========================================================================
// BỘ NÃO ĐIỀU KHIỂN DỮ LIỆU & HIỆU ỨNG TRANG CHỦ (HOME LANDING PAGE)
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. CẢM BIẾN CUỘN TRANG (SCROLL REVEAL)
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // ======================================================
    // 2. NẠP ẢNH TỰ ĐỘNG CHO KHU VỰC "DẤU ẤN SẮC MÀU"
    // ======================================================
    try {
        const introDataStr = await API.getSettings('page_intro');
        if (introDataStr) {
            const introData = JSON.parse(introDataStr);
            if (introData.gallery && introData.gallery.length > 0) {
                const backImgEl = document.querySelector('.back-img');
                const frontImgEl = document.querySelector('.front-img');
                
                // Lấy ảnh đầu tiên làm ảnh chìm (Back)
                if (backImgEl) backImgEl.style.backgroundImage = `url('${introData.gallery[0]}')`;
                
                // Lấy ảnh thứ hai làm ảnh nổi (Front). Nếu chỉ có 1 ảnh thì xài chung
                if (frontImgEl) frontImgEl.style.backgroundImage = `url('${introData.gallery[1] || introData.gallery[0]}')`;
            }
        }
    } catch (e) {
        console.error("Lỗi kéo ảnh giới thiệu từ hệ thống:", e);
    }

   // ======================================================
    // 3. NẠP SẢN PHẨM: KHU VỰC HERO VÀ DỊCH VỤ CHỦ LỰC
    // ======================================================
    const products = await API.getProducts();
    
    // Lọc ra các sản phẩm sếp đã tick "Sản Phẩm Nổi Bật" (is_featured = true)
    const featuredProducts = products ? products.filter(p => p.is_featured === true) : [];

    // 3A. Nạp khu vực Hero (Lơ lửng ở đầu trang) -> Lấy tối đa 4 cái đầu tiên
    let heroProds = featuredProducts.slice(0, 4);
    if (heroProds.length === 0) heroProds = products ? products.slice(0, 4) : []; // Dự phòng nếu sếp chưa tick cái nào

    const listContainer = document.getElementById('hero-products-list');
    if (listContainer) {
        if (heroProds.length > 0) {
            let html = '';
            heroProds.forEach(p => {
                html += `
                    <div class="hero-prod-card" style="cursor:pointer;" onclick="animateAndNavigate(this, 'chi-tiet-san-pham.html?id=${p.slug}')">
                        <div class="hero-prod-img" style="background-image: url('${p.image_url}')"></div>
                        <div class="hero-prod-name">${p.name}</div>
                    </div>
                `;
            });
            listContainer.innerHTML = html;
        }
    }

    // 3B. Nạp khu vực Dịch Vụ Chủ Lực -> Lấy 3 cái tiếp theo (từ 5 đến 7)
    let serviceProds = featuredProducts.slice(4, 7);
    if (serviceProds.length === 0) serviceProds = products ? products.slice(4, 7) : []; // Dự phòng nếu sếp tick ít hơn 5 cái
    if (serviceProds.length === 0) serviceProds = products ? products.slice(0, 3) : []; // Dự phòng cấp 2

    const servicesGrid = document.getElementById('home-services-grid');
    if (servicesGrid && serviceProds.length > 0) {
        let sHtml = '';
        serviceProds.forEach(p => {
            const priceStr = Number(p.price).toLocaleString('vi-VN') + ' đ';
            sHtml += `
                <div class="glossy-card service-premium-card float-hover" onclick="animateAndNavigate(this, 'chi-tiet-san-pham.html?id=${p.slug}')" style="cursor: pointer;">
                    <div class="premium-img-wrapper">
                        <div class="prod-img-placeholder" style="background-image: url('${p.image_url}'); background-size: cover; background-position: center; width:100%; height:100%;"></div>
                    </div>
                    <div class="card-details-box">
                        <h4>${p.name}</h4>
                        
                        <div class="card-footer-action">
                            <span class="prod-price">${priceStr}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        servicesGrid.innerHTML = sHtml;
    }

    // 4. TẢI BÀI VIẾT BLOG MỚI NHẤT RA TRANG CHỦ
    const blogContainer = document.getElementById('home-blog-list');
    if (blogContainer) {
        const posts = await API.getPosts();
        if (posts && posts.length > 0) {
            let blogHTML = '';
            posts.slice(0, 6).forEach(post => {
                blogHTML += `
                    <div class="home-blog-card float-hover" style="cursor:pointer;" onclick="animateAndNavigate(this, 'chi-tiet-bai-viet.html?id=${post.slug}')">
                        <div class="home-blog-thumb" style="background-image: url('${post.image_url}')"></div>
                        <div class="home-blog-info">
                            <h4>${post.title}</h4>
                            <p>${post.excerpt}</p>
                            <span>Đọc tiếp →</span>
                        </div>
                    </div>
                `;
            });
            blogContainer.innerHTML = blogHTML;
        } else {
            blogContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#94a3b8;">Đang cập nhật các bài viết chuyên môn...</div>`;
        }
    }

    // 5. THIẾT LẬP LẮNG NGHE SỰ KIỆN KÍCH HOẠT POPUP MODAL YÊU CẦU BÁO GIÁ
    const triggerBtn = document.getElementById('hero-trigger-quote');
    const closeBtn = document.getElementById('close-quote-modal');
    const submitBtn = document.getElementById('submit-quote-btn');

    if (triggerBtn) triggerBtn.addEventListener('click', openOrderModal);
    if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);
    if (submitBtn) submitBtn.addEventListener('click', processFinalOrder);
});

// ==========================================================================
// HÀM HIỆU ỨNG: CLICK VÀO SẢN PHẨM/BÀI VIẾT BỊ HÚT VÀO TRONG TRƯỚC KHI CHUYỂN TRANG
// ==========================================================================
function animateAndNavigate(element, url) {
    // Gắn class css có chứa animation
    element.classList.add('clicked-animate');
    
    // Đợi 350ms cho hiệu ứng co rút và mờ dần hoàn tất rồi mới chuyển URL
    setTimeout(() => {
        window.location.href = url;
    }, 350); 
}

// --- CÁC HÀM XỬ LÝ KHUNG MODAL BÁO GIÁ ---

function openOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'flex';
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

async function processFinalOrder() {
    const btn = document.getElementById('submit-quote-btn');
    const nameInput = document.getElementById('cusName');
    const phoneInput = document.getElementById('cusPhone');
    const noteInput = document.getElementById('orderNote');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const note = noteInput ? noteInput.value.trim() : '';

    if (!name || !phone) {
        Swal.fire({
            title: "Thiếu thông tin!",
            text: "Anh/Chị vui lòng nhập Tên và Số điện thoại/Zalo để xưởng tiện liên hệ nhé!",
            icon: "warning",
            background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100'
        });
        return;
    }

    if (btn) {
        btn.innerText = "ĐANG GỬI YÊU CẦU VÀO HỆ THỐNG...";
        btn.disabled = true;
    }

    const payload = {
        product_slug: 'yeu-cau-trang-chu',
        product_name: 'Yêu cầu tư vấn tổng hợp từ Trang Chủ',
        package_selected: 'Khách yêu cầu báo giá riêng',
        custom_quantity: 'Tùy chỉnh theo tư vấn',
        design_status: 'Cần hỗ trợ quy cách xưởng',
        customer_note: note || 'Khách bấm nút nhận báo giá nhanh ngoài trang chủ',
        customer_name: name,
        customer_phone: phone
    };

    const result = await API.submitOrder(payload);

    if (result.success) {
        Swal.fire({
            title: "Gửi thành công! 🎉",
            text: "Đội ngũ Sắc Màu đã ghi nhận dữ liệu và sẽ liên hệ trực tiếp qua Zalo của Anh/Chị ngay lập tức.",
            icon: "success",
            background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100'
        });
        
        closeOrderModal();
        
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (noteInput) noteInput.value = '';
    } else {
        Swal.fire({
            title: "Lỗi kết nối!",
            text: "Hệ thống đang bận, Anh/Chị vui lòng chat Zalo trực tiếp qua số Hotline xưởng nhé!",
            icon: "error",
            background: '#1e293b', color: '#fff', confirmButtonColor: '#dc2626'
        });
    }

    if (btn) {
        btn.innerText = "GỬI YÊU CẦU CHO XƯỞNG";
        btn.disabled = false;
    }
}