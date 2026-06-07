// 1. Khung sườn Cây Menu ban đầu (Chờ JS bơm dữ liệu động vào)
const MENU_DATA = [
    { label: 'Trang Chủ', url: 'index.html' },
    { label: 'Giới Thiệu', url: 'gioi-thieu.html' },
    { 
        label: 'Sản Phẩm', 
        url: 'san-pham.html',
        children: [] // Sẽ được tự động nạp từ Supabase
    },
    { 
        label: 'Bài Viết', 
        url: 'bai-viet.html',
        children: [] // Sẽ được tự động nạp từ Supabase
    },
    { label: 'Liên Hệ', url: 'lien-he.html' }
];

// 2. Hàm tự động vẽ Menu ra giao diện
function buildNavigation() {
    const headerNode = document.getElementById('dynamic-header');
    if (!headerNode) return;

    let menuHTML = `<nav><div class="logo">SẮC MÀU<span>.</span></div><ul class="menu-tree">`;

    MENU_DATA.forEach(l1 => {
        const hasL2 = l1.children && l1.children.length > 0;
        menuHTML += `<li class="menu-item-l1 ${hasL2 ? 'has-children' : ''}"><a href="${l1.url}">${l1.label}</a>`;
        
        if (hasL2) {
            menuHTML += `<ul class="dropdown-l2">`;
            l1.children.forEach(l2 => {
                const hasL3 = l2.children && l2.children.length > 0;
                menuHTML += `<li class="menu-item-l2 ${hasL3 ? 'has-children' : ''}"><a href="${l2.url}">${l2.label}</a>`;
                
                if (hasL3) {
                    menuHTML += `<ul class="flyout-l3">`;
                    l2.children.forEach(l3 => {
                        menuHTML += `<li class="menu-item-l3"><a href="${l3.url}">${l3.label}</a></li>`;
                    });
                    menuHTML += `</ul>`;
                }
                menuHTML += `</li>`;
            });
            menuHTML += `</ul>`;
        }
        menuHTML += `</li>`;
    });

    menuHTML += `</ul></nav>`;
    headerNode.innerHTML = menuHTML;
}

// 3. Hàm tự động vẽ Footer ra giao diện
function buildFooter() {
    const footerNode = document.getElementById('dynamic-footer');
    if (!footerNode) return;

    footerNode.innerHTML = `
        <div class="footer-content">
            <div class="footer-about">
                <h3>IN ẤN SẮC MÀU<span>.</span></h3>
                <p>Xưởng in ấn và thiết kế quảng cáo chuyên nghiệp tại TP. Cao Lãnh, Đồng Tháp. Đồng hành định hình và củng cố sức mạnh thương hiệu từ năm 2017.</p>
            </div>
            <div class="footer-links">
                <h4>Dịch Vụ Nổi Bật</h4>
                <ul>
                    <li><a href="san-pham.html">Tất cả sản phẩm</a></li>
                    <li><a href="bai-viet.html">Kiến thức ngành in</a></li>
                    <li><a href="gioi-thieu.html">Về chúng tôi</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h4>Liên Hệ Đặt Hàng</h4>
                <ul>
                    <li><a href="#">Địa chỉ: Nguyễn Văn Cừ, P.4, Cao Lãnh</a></li>
                    <li><a href="#">Hotline 1: 0337.663.113 (Mrs Ly)</a></li>
                    <li><a href="#">Hotline 2: 0399.221.753 (Mrs Ngọc)</a></li>
                </ul>
            </div>
        </div>
        <div class="copyright">&copy; 2026 Hộ Kinh Doanh Sắc Màu Đồng Tháp. All rights reserved.</div>
    `;
}

// Kích hoạt khi trang web tải xong và lấy Menu Động
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (typeof API !== 'undefined') {
            // Nạp Danh mục Bài viết vào Menu
            const blogData = await API.getSettings('blog_categories');
            if (blogData) {
                const parsedBlogCats = JSON.parse(blogData);
                const blogMenuIndex = MENU_DATA.findIndex(m => m.url === 'bai-viet.html');
                if (blogMenuIndex !== -1) {
                    MENU_DATA[blogMenuIndex].children = parsedBlogCats.map(c => ({
                        label: c.name,
                        url: `bai-viet.html?cat=${c.id}`
                    }));
                }
            }

            // Nạp Danh mục Sản phẩm vào Menu
            const prodData = await API.getSettings('product_categories');
            if (prodData) {
                const parsedProdCats = JSON.parse(prodData);
                const prodMenuIndex = MENU_DATA.findIndex(m => m.url === 'san-pham.html');
                if (prodMenuIndex !== -1) {
                    MENU_DATA[prodMenuIndex].children = parsedProdCats.map(c => ({
                        label: c.name,
                        url: `san-pham.html?sub=${c.id}`
                    }));
                }
            }
        }
    } catch (e) {
        console.error("Lỗi tải menu:", e);
    }

    buildNavigation();
    buildFooter();
});