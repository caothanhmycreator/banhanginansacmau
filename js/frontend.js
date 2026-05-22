document.addEventListener('DOMContentLoaded', async () => {
    // 1. Lấy mã ID trên thanh địa chỉ (VD: ?id=abc-123)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const wrapper = document.getElementById('product-wrapper');
    const loading = document.getElementById('loading');

    // Nếu không có ID trên link, báo lỗi
    if (!productId) {
        loading.innerText = "Lỗi: Không tìm thấy mã sản phẩm!";
        return;
    }

    // 2. Gọi API lấy dữ liệu từ Supabase
    const product = await API.getProductById(productId);

    if (!product) {
        loading.innerText = "Sản phẩm không tồn tại hoặc đã bị xóa!";
        return;
    }

    // 3. Ẩn cục Loading, hiện Khuôn đúc lên
    loading.style.display = 'none';
    wrapper.style.display = 'block';

    // 4. Bơm dữ liệu cơ bản vào HTML
    document.title = product.name + " - In Ấn Sắc Màu";
    document.getElementById('sp-name').innerText = product.name;
    document.getElementById('sp-image').style.backgroundImage = `url('${product.image_url}')`;
    document.getElementById('sp-price').innerText = new Number(product.price).toLocaleString('vi-VN') + ' đ';
    
    // Nếu có bài viết dài, nếu không lấy mô tả ngắn
    document.getElementById('sp-content').innerHTML = product.content || product.description || 'Đang cập nhật thông tin chi tiết...';

    // 5. Xử lý Thông số kỹ thuật (Dạng JSON)
    const specsList = document.getElementById('sp-specs');
    if (product.specs) {
        let specsHTML = '';
        // product.specs là 1 object { "Chất liệu": "Giấy C300", "Kích thước": "A5" }
        for (const [key, value] of Object.entries(product.specs)) {
            specsHTML += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        specsList.innerHTML = specsHTML;
    } else {
        specsList.innerHTML = `<li><strong>Trạng thái:</strong> Đang cập nhật</li>`;
    }

    // 6. Xử lý Phân loại giá (Dạng JSON)
    const tiersBox = document.getElementById('sp-tiers');
    if (product.price_tiers && product.price_tiers.length > 0) {
        let tiersHTML = '<h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 10px;">Chọn gói in:</h3>';
        // product.price_tiers là 1 mảng [ { label: "100 cái", price: 150000 }, ... ]
        product.price_tiers.forEach((tier, index) => {
            const formattedTierPrice = new Number(tier.price).toLocaleString('vi-VN') + ' đ';
            tiersHTML += `<button class="tier-btn ${index === 0 ? 'active' : ''}" onclick="changePrice('${formattedTierPrice}', this)">${tier.label}</button>`;
        });
        tiersBox.innerHTML = tiersHTML;
    } else {
        tiersBox.style.display = 'none'; // Ẩn đi nếu không có gói nào
    }
});

// Hàm nhảy giá tiền khi khách bấm chọn Gói in
function changePrice(newPrice, buttonElement) {
    document.getElementById('sp-price').innerText = newPrice;
    // Đổi màu nút được chọn
    document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
}