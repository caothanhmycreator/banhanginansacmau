// Biến toàn cục để lưu Tên và Slug sản phẩm, cùng Gói giá đang được chọn
let currentProductSlug = '';
let currentProductName = '';
let currentSelectedTier = 'Không chọn gói có sẵn';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const wrapper = document.getElementById('product-wrapper');
    const loading = document.getElementById('loading');

    if (!productId) { loading.innerText = "Lỗi: Không tìm thấy mã sản phẩm!"; return; }

    const product = await API.getProductBySlug(productId);

    if (!product) { loading.innerText = "Sản phẩm không tồn tại hoặc đã bị xóa!"; return; }

    // Lưu thông tin để tí gửi Database
    currentProductSlug = product.slug;
    currentProductName = product.name;

    loading.style.display = 'none';
    wrapper.style.display = 'block';

    document.title = product.name + " - In Ấn Sắc Màu";
    document.getElementById('sp-name').innerText = product.name;
    document.getElementById('sp-price').innerText = new Number(product.price).toLocaleString('vi-VN') + ' đ';
    
    // Ảnh chính và Gallery
    document.getElementById('sp-image').style.backgroundImage = `url('${product.image_url}')`;
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
    
    document.getElementById('sp-content').innerHTML = product.content || product.description || 'Đang cập nhật thông tin chi tiết...';

    // Thông số
    const specsList = document.getElementById('sp-specs');
    if (product.specs) {
        let specsHTML = '';
        for (const [key, value] of Object.entries(product.specs)) {
            specsHTML += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        specsList.innerHTML = specsHTML;
    } else {
        specsList.innerHTML = `<li><strong>Trạng thái:</strong> Đang cập nhật</li>`;
    }

    // Phân loại giá (Bắt sự kiện lưu Gói được chọn)
    const tiersBox = document.getElementById('sp-tiers');
    if (product.price_tiers && product.price_tiers.length > 0) {
        let tiersHTML = '';
        product.price_tiers.forEach((tier, index) => {
            const formattedTierPrice = new Number(tier.price).toLocaleString('vi-VN') + ' đ';
            // Cài đặt gói mặc định là gói đầu tiên
            if (index === 0) currentSelectedTier = tier.label;
            
            // Truyền thêm tier.label vào hàm changePrice
            tiersHTML += `<button class="tier-btn ${index === 0 ? 'active' : ''}" onclick="changePrice('${formattedTierPrice}', this, '${tier.label}')">${tier.label}</button>`;
        });
        tiersBox.innerHTML = tiersHTML;
    } else {
        const tiersContainer = document.getElementById('sp-tiers-container');
        if (tiersContainer) tiersContainer.style.display = 'none';
    }
});

// Hàm nhảy giá và lưu lại tên Gói
function changePrice(newPrice, buttonElement, tierLabel) {
    document.getElementById('sp-price').innerText = newPrice;
    document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    // Lưu lại cái gói mà khách vừa bấm
    currentSelectedTier = tierLabel;
}

// MỚI: Xử lý Đẩy dữ liệu đơn hàng lên Supabase
async function processFinalOrder() {
    const btn = document.getElementById('btnSubmitFinalOrder');
    
    // Thu thập dữ liệu từ Form
    const qty = document.getElementById('orderQty').value.trim();
    const design = document.getElementById('orderDesign').value;
    const note = document.getElementById('orderNote').value.trim();
    
    // Thu thập dữ liệu khách hàng từ Modal
    const cusName = document.getElementById('cusName').value.trim();
    const cusPhone = document.getElementById('cusPhone').value.trim();

    if (!cusName || !cusPhone) {
        alert("Anh/Chị vui lòng nhập Tên và Số điện thoại/Zalo để xưởng liên hệ nhé!");
        return;
    }

    btn.innerText = "ĐANG GỬI YÊU CẦU...";
    btn.disabled = true;

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
        document.getElementById('cusName').value = '';
        document.getElementById('cusPhone').value = '';
        document.getElementById('orderQty').value = '';
        document.getElementById('orderNote').value = '';
    } else {
        alert("Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ Zalo trực tiếp.");
    }

    btn.innerText = "Xác Nhận Gửi Yêu Cầu";
    btn.disabled = false;
}