document.addEventListener('DOMContentLoaded', async () => {
    // 1. Đọc đuôi URL (VD: ?sub=bia-folder)
    const urlParams = new URLSearchParams(window.location.search);
    const subCategory = urlParams.get('sub');

    const titleElement = document.getElementById('page-title');
    const descElement = document.getElementById('page-desc');
    const grid = document.getElementById('products-grid');
    const loading = document.getElementById('loading');

    let products = [];

    // 2. Kích hoạt logic lọc dữ liệu
    if (subCategory) {
        // Biến chữ 'bia-folder' thành 'Bia Folder' để hiển thị lên tiêu đề cho đẹp
        const prettyTitle = subCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        titleElement.innerHTML = `SẢN PHẨM: <span>${prettyTitle}</span>`;
        descElement.innerText = `Khám phá các mẫu ${prettyTitle.toLowerCase()} ấn tượng nhất tại Sắc Màu.`;
        
        // Gọi API lọc theo từ khóa
        products = await API.getProductsByKeyword(subCategory);
    } else {
        // Nếu không có ?sub trên link, tải toàn bộ sản phẩm
        titleElement.innerHTML = `TẤT CẢ <span>SẢN PHẨM</span>`;
        products = await API.getProducts();
    }

    loading.style.display = 'none';

    // 3. Xử lý trường hợp không có sản phẩm nào
    if (!products || products.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #94a3b8; font-size: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
            Hiện tại chưa có sản phẩm nào trong danh mục này. Anh/Chị quay lại sau nhé!
        </div>`;
        return;
    }

    // 4. Bơm dữ liệu vào lưới HTML
    let html = '';
    products.forEach(p => {
        const formattedPrice = new Number(p.price).toLocaleString('vi-VN') + ' đ';
        
        html += `
            <div class="product-card">
                <div class="card-img" style="background-image: url('${p.image_url}')"></div>
                <div class="card-body">
                    <h3 class="card-title">${p.name}</h3>
                    <div class="card-price">${formattedPrice}</div>
                    <a href="chi-tiet-san-pham.html?id=${p.slug}" class="btn-view">Xem Chi Tiết</a>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
});