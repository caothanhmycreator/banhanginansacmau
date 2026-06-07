// ==========================================
// BỘ NÃO ĐIỀU PHỐI HIỂN THỊ TRANG SẢN PHẨM (PHÂN MỤC TỰ ĐỘNG)
// ==========================================

// Từ khóa chuẩn hóa được ánh xạ trực tiếp từ Cây Menu
const MENU_CATEGORIES = [
    { id: 'thiep', name: 'THIỆP SỰ KIỆN' },
    { id: 'name-card', name: 'DANH THIẾP (NAME CARD)' },
    { id: 'bia-folder', name: 'BÌA FOLDER KẸP FILE' },
    { id: 'to-roi', name: 'TỜ RƠI QUẢNG CÁO' },
    { id: 'hoa-don', name: 'HÓA ĐƠN & BIỂU MẪU' },
    { id: 'ao', name: 'IN ÁO ĐỒNG PHỤC' },
    { id: 'tem', name: 'TEM NHÃN DECAL' },
    { id: 'menu', name: 'IN MENU THỰC ĐƠN' },
    { id: 'bang-ten', name: 'BẢNG TÊN NHÂN VIÊN' },
    { id: 'logo', name: 'THIẾT KẾ LOGO' },
    { id: 'bo-nhan-dien', name: 'BỘ NHẬN DIỆN THƯƠNG HIỆU' }
];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Đọc tham số phân loại từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const subCategory = urlParams.get('sub');
    const catCategory = urlParams.get('cat'); 

    const titleElement = document.getElementById('page-title');
    const descElement = document.getElementById('page-desc');
    const container = document.getElementById('all-products-container');
    const loading = document.getElementById('loading');
    
    const heroSection = document.getElementById('product-hero-section');

    let products = [];
    const filterKeyword = subCategory || catCategory;

    // 2. Kích hoạt logic lấy dữ liệu từ hệ thống lưu trữ
    if (filterKeyword) {
        // Biến mã slug thành tiêu đề tiếng Việt chuẩn
        const prettyTitle = filterKeyword.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        titleElement.innerHTML = `DANH MỤC: <span>${prettyTitle}</span>`;
        descElement.innerText = `Khám phá các sản phẩm ${prettyTitle.toLowerCase()} ấn tượng nhất tại Sắc Màu.`;
        
        products = await API.getProductsByKeyword(filterKeyword);
    } else {
        // Trang hiển thị toàn bộ
        titleElement.innerHTML = `TẤT CẢ <span>SẢN PHẨM</span>`;
        products = await API.getProducts();
    }

    loading.style.display = 'none';

    // 3. Xử lý trường hợp không tìm thấy sản phẩm
    if (!products || products.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #94a3b8; font-size: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
            Hiện tại chưa có sản phẩm nào trong danh mục này. Anh/Chị quay lại sau nhé!
        </div>`;
        return;
    }

    // 4. PHÂN LUỒNG LOGIC RENDER SẢN PHẨM
    if (filterKeyword) {
        // Nếu khách đang xem cụ thể một phân loại (Menu con): Chỉ hiển thị lưới đơn giản
        if (heroSection) heroSection.style.display = 'none';
        container.innerHTML = `<div class="products-grid">${generateGridHTML(products)}</div>`;
    } else {
        // Nếu xem TẤT CẢ SẢN PHẨM: Bơm Sản phẩm Đinh (Top 1, 2, 3) vào khối Hero
        if (heroSection) heroSection.style.display = 'flex';

        const top1 = products[0];
        const top1Container = document.getElementById('prod-top1');
        if (top1Container && top1) {
            const priceStr = Number(top1.price).toLocaleString('vi-VN') + ' đ';
            top1Container.innerHTML = `
                <div class="main-img-box" style="background-image: url('${top1.image_url}')" onclick="goToProductDetail('${top1.slug}')"></div>
                <h1 onclick="goToProductDetail('${top1.slug}')">${top1.name}</h1>
                <div class="hero-price">${priceStr}</div>
                <p>${top1.description || 'Sản phẩm in ấn thiết kế độc quyền từ xưởng In Ấn Sắc Màu Đồng Tháp.'}</p>
            `;
        }

        const sideContainer = document.getElementById('prod-side-container');
        if (sideContainer) {
            let sideHTML = '';
            const sideProducts = products.slice(1, 3);
            sideProducts.forEach(p => {
                const priceStr = Number(p.price).toLocaleString('vi-VN') + ' đ';
                sideHTML += `
                    <div class="side-prod-card" onclick="goToProductDetail('${p.slug}')">
                        <div class="side-img" style="background-image: url('${p.image_url}')"></div>
                        <div class="side-info">
                            <h3>${p.name}</h3>
                            <div class="side-price">${priceStr}</div>
                        </div>
                    </div>
                `;
            });
            sideContainer.innerHTML = sideHTML;
        }

        // --- TỰ ĐỘNG CHIA CÁC SẢN PHẨM CÒN LẠI THÀNH CÁC LƯỚI THEO NHÓM CHUYÊN MỤC ---
        const regularProducts = products.slice(3);
        if(regularProducts.length > 0) {
            let containerHTML = '';
            let usedProductIds = new Set();

            // Vòng lặp duyệt qua từng chuyên mục chuẩn
            MENU_CATEGORIES.forEach(cat => {
                // Gom những sản phẩm có chứa từ khóa category vào 1 lưới
                const groupProds = regularProducts.filter(p => p.slug.includes(cat.id));
                
                if (groupProds.length > 0) {
                    groupProds.forEach(p => usedProductIds.add(p.id));
                    containerHTML += `
                        <div class="category-divider">
                            <h2>SẢN PHẨM <span>${cat.name}</span></h2>
                            <div class="line"></div>
                        </div>
                        <div class="products-grid" style="margin-bottom: 60px;">
                            ${generateGridHTML(groupProds)}
                        </div>
                    `;
                }
            });

            // Những sản phẩm còn "cô đơn" (Slug không chứa từ khóa menu nào)
            const otherProds = regularProducts.filter(p => !usedProductIds.has(p.id));
            if (otherProds.length > 0) {
                containerHTML += `
                    <div class="category-divider">
                        <h2>SẢN PHẨM <span>KHÁC</span></h2>
                        <div class="line"></div>
                    </div>
                    <div class="products-grid" style="margin-bottom: 60px;">
                        ${generateGridHTML(otherProds)}
                    </div>
                `;
            }

            container.innerHTML = containerHTML;
        }
    }
});

// Hàm hỗ trợ: Render tự động các Thẻ (Cards) sản phẩm trong lưới
function generateGridHTML(prods) {
    let html = '';
    prods.forEach(p => {
        const formattedPrice = Number(p.price).toLocaleString('vi-VN') + ' đ';
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
    return html;
}

function goToProductDetail(slug) {
    window.location.href = `chi-tiet-san-pham.html?id=${slug}`;
}