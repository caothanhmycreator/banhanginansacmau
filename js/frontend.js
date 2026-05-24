// --- BỘ NÃO XỬ LÝ TRANG CHI TIẾT SẢN PHẨM ---

// Biến toàn cục để lưu Tên, Slug sản phẩm, Gói giá đang chọn và Bộ đếm slide
let currentProductSlug = '';
let currentProductName = '';
let currentSelectedTier = 'Không chọn gói có sẵn';
let autoSlideTimer; 

// 1. TẢI DỮ LIỆU KHI MỞ TRANG
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const wrapper = document.getElementById('product-wrapper');
    const loading = document.getElementById('loading');

    if (!productId) { loading.innerText = "Lỗi: Không tìm thấy mã sản phẩm!"; return; }

    // Gọi API lấy dữ liệu từ Database
    const product = await API.getProductBySlug(productId);

    if (!product) { loading.innerText = "Sản phẩm không tồn tại hoặc đã bị xóa!"; return; }

    // Lưu thông tin để tí gửi đơn hàng
    currentProductSlug = product.slug;
    currentProductName = product.name;

    // Ẩn loading, hiện giao diện
    loading.style.display = 'none';
    if(wrapper) wrapper.style.display = 'block';

    // Bơm dữ liệu cơ bản
    document.title = product.name + " - In Ấn Sắc Màu";
    if(document.getElementById('sp-name')) document.getElementById('sp-name').innerText = product.name;
    if(document.getElementById('sp-price')) document.getElementById('sp-price').innerText = new Number(product.price).toLocaleString('vi-VN') + ' đ';
    
    // MỚI: Bơm Mô tả ngắn vào khối nổi bật
    if(document.getElementById('sp-short-desc')) document.getElementById('sp-short-desc').innerText = product.description || 'Đang cập nhật mô tả chi tiết...';
    
    // Bơm bài viết dài
    if(document.getElementById('sp-content')) document.getElementById('sp-content').innerHTML = product.content || '<p>Đang cập nhật thông tin...</p>';

    // Xử lý Ảnh chính và Thư viện ảnh (Gallery Slider)
    if(document.getElementById('sp-image')) document.getElementById('sp-image').style.backgroundImage = `url('${product.image_url}')`;
    
    const galleryContainer = document.getElementById('sp-gallery-thumbs');
    if (galleryContainer) {
        let galleryHTML = `<div class="thumb-img active" style="background-image: url('${product.image_url}')" onclick="changeMainImage('${product.image_url}', this)"></div>`;
        if (product.gallery && product.gallery.length > 0) {
            product.gallery.forEach(imgUrl => {
                galleryHTML += `<div class="thumb-img" style="background-image: url('${imgUrl}')" onclick="changeMainImage('${imgUrl}', this)"></div>`;
            });
        }
        galleryContainer.innerHTML = galleryHTML;
    }
    
    // Xử lý Thông số kỹ thuật
    const specsList = document.getElementById('sp-specs');
    if (specsList) {
        if (product.specs && Object.keys(product.specs).length > 0) {
            let specsHTML = '';
            for (const [key, value] of Object.entries(product.specs)) {
                specsHTML += `<li><strong>${key}:</strong> ${value}</li>`;
            }
            specsList.innerHTML = specsHTML;
        } else {
            specsList.innerHTML = `<li><strong>Trạng thái:</strong> Đang cập nhật</li>`;
        }
    }

    // Xử lý Phân loại giá 
    const tiersBox = document.getElementById('sp-tiers');
    if (tiersBox) {
        if (product.price_tiers && product.price_tiers.length > 0) {
            let tiersHTML = '';
            product.price_tiers.forEach((tier, index) => {
                const formattedTierPrice = new Number(tier.price).toLocaleString('vi-VN') + ' đ';
                if (index === 0) currentSelectedTier = tier.label;
                tiersHTML += `<button class="tier-btn ${index === 0 ? 'active' : ''}" onclick="changePrice('${formattedTierPrice}', this, '${tier.label}')">${tier.label}</button>`;
            });
            tiersBox.innerHTML = tiersHTML;
        } else {
            const tiersContainer = document.getElementById('sp-tiers-container');
            if (tiersContainer) tiersContainer.style.display = 'none';
        }
    }

    // Kích hoạt hệ thống Auto-slide hình ảnh sau khi DOM render xong
    setTimeout(resetAutoSlide, 500);

    // Tạm dừng slide khi khách di chuột vào khu vực ảnh
    const gallerySection = document.querySelector('.product-gallery');
    if (gallerySection) {
        gallerySection.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
        gallerySection.addEventListener('mouseleave', resetAutoSlide);
    }
});


// 2. CÁC HÀM TIỆN ÍCH (Chuyển giá, Đổi ảnh, Slide)

// Hàm nhảy giá và lưu lại tên Gói
function changePrice(newPrice, buttonElement, tierLabel) {
    if(document.getElementById('sp-price')) document.getElementById('sp-price').innerText = newPrice;
    document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    currentSelectedTier = tierLabel;
}

// Hàm đổi ảnh chính khi bấm vào ảnh thu nhỏ
function changeMainImage(url, thumbElement) {
    const mainImg = document.getElementById('sp-image');
    if(mainImg) mainImg.style.backgroundImage = `url('${url}')`;
    
    document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
    if(thumbElement) thumbElement.classList.add('active');
    
    // Khởi động lại bộ đếm giờ nếu khách vừa bấm
    resetAutoSlide();
}

// Logic đếm giờ trượt ảnh
function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
        const thumbs = Array.from(document.querySelectorAll('.thumb-img'));
        if (thumbs.length > 1) {
            let activeIdx = thumbs.findIndex(t => t.classList.contains('active'));
            let nextIdx = (activeIdx + 1) % thumbs.length;
            
            let nextBg = thumbs[nextIdx].style.backgroundImage;
            let url = nextBg.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); 
            
            changeMainImage(url, thumbs[nextIdx]);
        }
    }, 3000); // 3000ms = 3 giây đổi ảnh 1 lần
}


// 3. LOGIC GỬI YÊU CẦU ĐẶT HÀNG / BÁO GIÁ

function openOrderModal() { 
    const modal = document.getElementById('orderModal');
    if(modal) modal.style.display = 'flex'; 
}

function closeOrderModal() { 
    const modal = document.getElementById('orderModal');
    if(modal) modal.style.display = 'none'; 
}

async function processFinalOrder() {
    const btn = document.getElementById('btnSubmitFinalOrder');
    
    // Thu thập dữ liệu
    const qtyObj = document.getElementById('orderQty');
    const designObj = document.getElementById('orderDesign');
    const noteObj = document.getElementById('orderNote');
    const cusNameObj = document.getElementById('cusName');
    const cusPhoneObj = document.getElementById('cusPhone');
    
    const qty = qtyObj ? qtyObj.value.trim() : '';
    const design = designObj ? designObj.value : '';
    const note = noteObj ? noteObj.value.trim() : '';
    const cusName = cusNameObj ? cusNameObj.value.trim() : '';
    const cusPhone = cusPhoneObj ? cusPhoneObj.value.trim() : '';

    if (!cusName || !cusPhone) {
        alert("Anh/Chị vui lòng nhập Tên và Số điện thoại/Zalo để xưởng liên hệ nhé!");
        return;
    }

    if(btn) {
        btn.innerText = "ĐANG GỬI YÊU CẦU...";
        btn.disabled = true;
    }

    const payload = {
        product_slug: currentProductSlug,
        product_name: currentProductName,
        package_selected: currentSelectedTier,
        custom_quantity: qty || 'Dùng gói mặc định',
        design_status: design,
        customer_note: note,
        customer_name: cusName,
        customer_phone: cusPhone
    };

    const result = await API.submitOrder(payload);

    if (result.success) {
        alert("🎉 Gửi yêu cầu thành công! Đội ngũ Sắc Màu sẽ liên hệ với Anh/Chị qua Zalo ngay lập tức.");
        closeOrderModal();
        // Reset nội dung
        if(cusNameObj) cusNameObj.value = '';
        if(cusPhoneObj) cusPhoneObj.value = '';
        if(qtyObj) qtyObj.value = '';
        if(noteObj) noteObj.value = '';
    } else {
        alert("Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ Zalo trực tiếp.");
    }

    if(btn) {
        btn.innerText = "Xác Nhận Gửi Yêu Cầu";
        btn.disabled = false;
    }
}