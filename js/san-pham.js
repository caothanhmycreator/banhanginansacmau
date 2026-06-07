// ==========================================
// BỘ NÃO ĐIỀU PHỐI HIỂN THỊ TRANG SẢN PHẨM (PHÂN MỤC TỰ ĐỘNG)
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Đọc tham số phân loại từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const filterKeyword = urlParams.get('sub') || urlParams.get('cat'); 

    const titleElement = document.getElementById('page-title');
    const descElement = document.getElementById('page-desc');
    const container = document.getElementById('all-products-container');
    const loading = document.getElementById('loading');
    const heroSection = document.getElementById('product-hero-section');

    // 2. Kéo kho từ khóa chuyên mục động từ Supabase
    const catData = await API.getSettings('product_categories');
    let productCategories = catData ? JSON.parse(catData) : [];

    // Tải toàn bộ sản phẩm
    let products = await API.getProducts();

    loading.style.display = 'none';

    // Xử lý trường hợp xưởng trống sản phẩm
    if (!products || products.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #94a3b8; font-size: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
            Hiện tại chưa có sản phẩm nào trong hệ thống. Anh/Chị quay lại sau nhé!
        </div>`;
        return;
    }

    // 3. PHÂN LUỒNG LOGIC RENDER SẢN PHẨM
    if (filterKeyword) {
        // NẾU KHÁCH ĐANG XEM 1 CHUYÊN MỤC CỤ THỂ
        const catObj = productCategories.find(c => c.id === filterKeyword);
        let prettyTitle = catObj ? catObj.name : filterKeyword.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        titleElement.innerHTML = `DANH MỤC: <span>${prettyTitle}</span>`;
        descElement.innerText = `Khám phá các sản phẩm ${prettyTitle.toLowerCase()} ấn tượng nhất tại Sắc Màu.`;

        // Lọc sản phẩm (Tìm theo cột Category, nếu sản phẩm cũ chưa có thì tìm fallback vào Slug)
        const filteredProds = products.filter(p => p.category === filterKeyword || (!p.category && p.slug.includes(filterKeyword)));

        if (heroSection) heroSection.style.display = 'none';

        if (filteredProds.length === 0) {
            container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #94a3b8; font-size: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                Hiện tại chưa có sản phẩm nào trong chuyên mục này.
            </div>`;
        } else {
            container.innerHTML = `<div class="products-grid">${generateGridHTML(filteredProds)}</div>`;
        }

    } else {
        // NẾU XEM TRANG TỔNG "TẤT CẢ SẢN PHẨM"
        titleElement.innerHTML = `TẤT CẢ <span>SẢN PHẨM</span>`;
        if (heroSection) heroSection.style.display = 'flex';

        // Bơm Sản phẩm Đinh (Top 1)
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

        // Bơm 2 Sản phẩm phụ (Top 2 & 3)
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

        // Tự động gom nhóm rải lưới các sản phẩm còn lại
        const regularProducts = products.slice(3);
        if(regularProducts.length > 0) {
            let containerHTML = '';
            let usedProductIds = new Set();

            productCategories.forEach(cat => {
                const groupProds = regularProducts.filter(p => p.category === cat.id || (!p.category && p.slug.includes(cat.id)));
                
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

// Hàm hỗ trợ: Render tự động các Thẻ (Cards) sản phẩm
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