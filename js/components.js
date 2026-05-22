// 1. Cấu hình cây Menu 3 cấp khoa học (Dễ dàng thêm bớt sau này)
const MENU_DATA = [
    { label: 'Trang Chủ', url: 'index.html' },
    { label: 'Giới Thiệu', url: 'gioi-thieu.html' },
    { 
        label: 'Sản Phẩm', 
        url: 'san-pham.html',
        children: [
            { 
                label: 'In Ấn', 
                url: 'san-pham.html?cat=in-an',
                children: [
                    { label: 'Thiệp cưới', url: 'san-pham.html?sub=thiep-cuoi' },
                    { label: 'Name card', url: 'san-pham.html?sub=name-card' },
                    { label: 'Bìa folder', url: 'san-pham.html?sub=bia-folder' },
                    { label: 'Tờ rơi', url: 'san-pham.html?sub=to-roi' }
                ]
            },
            { 
                label: 'Thiết Kế', 
                url: 'san-pham.html?cat=thiet-ke',
                children: [
                    { label: 'Logo', url: 'san-pham.html?sub=logo' },
                    { label: 'Bộ nhận diện thương hiệu', url: 'san-pham.html?sub=bo-nhan-dien' },
                    { label: 'Dịch vụ thiết kế', url: 'san-pham.html?sub=dich-vu-thiet-ke' }
                ]
            },
            { label: 'Dịch Vụ Khác', url: 'san-pham.html?cat=dich-vu' }
        ]
    },
    { 
        label: 'Bài Viết', 
        url: 'bai-viet.html',
        children: [
            { label: 'Kiến thức in ấn', url: 'bai-viet.html?cat=kien-thuc' },
            { label: 'Kỹ năng thiết kế', url: 'bai-viet.html?cat=ky-nang' }
        ]
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
                    <li><a href="san-pham.html?cat=in-an">In ấn phẩm quảng cáo</a></li>
                    <li><a href="san-pham.html?sub=name-card">In danh thiếp cao cấp</a></li>
                    <li><a href="san-pham.html?cat=thiet-ke">Thiết kế bộ nhận diện</a></li>
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

// Kích hoạt khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
    buildNavigation();
    buildFooter();
});