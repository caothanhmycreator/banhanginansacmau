// ==========================================
// COMPONENT: SIDEBAR MENU DÙNG CHUNG
// ==========================================

function renderAdminSidebar() {
    // 1. Cấu hình danh sách Menu ở đây (Sau này muốn thêm/sửa menu chỉ cần sửa mảng này)
    const menuItems = [
        { url: 'quan-tri.html', text: 'Tổng Quan' },
        { url: 'admin-sanpham.html', text: 'Sản Phẩm' },
        { url: 'admin-donhang.html', text: 'Quản Lý Đơn Hàng' },
        { url: 'admin-baiviet.html', text: 'Bài Viết (Blog)' },
        { url: 'admin-gioithieu.html', text: 'Sửa Giới Thiệu' },
        { url: 'admin-cauhinh.html', text: 'Cấu Hình Menu' },
        { url: 'admin-lienhe.html', text: 'Thông Tin Liên Hệ' }
    ];

    // 2. Tự động nhận diện trang hiện tại để bôi sáng Menu
    const currentPath = window.location.pathname;
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'quan-tri.html';

    // 3. Lắp ráp HTML cho các thẻ li
    let menuHTML = '';
    menuItems.forEach(item => {
        // Nếu URL của item trùng với trang hiện tại, thêm class 'active'
        const isActive = currentPage === item.url ? 'active' : '';
        menuHTML += `<a href="${item.url}" style="text-decoration: none;"><li class="nav-item ${isActive}">${item.text}</li></a>`;
    });

    // 4. Lắp ráp toàn bộ khung Aside
    const asideHTML = `
        <aside>
            <h2>SẮC MÀU <span>CMS</span></h2>
            <ul class="nav-menu">
                ${menuHTML}
            </ul>
            <div style="margin-top: auto; text-align: center;">
                <button onclick="adminLogout()" style="background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: 0.2s;">Đăng Xuất</button>
            </div>
        </aside>
    `;

    // 5. Tìm "mỏ neo" trên trang HTML và đổ code vào
    const container = document.getElementById('admin-sidebar-container');
    if (container) {
        container.innerHTML = asideHTML;
        
        // Gỡ bỏ thẻ div container bọc ngoài cùng (để cấu trúc HTML sạch sẽ, giữ nguyên CSS cũ của bạn)
        const asideElement = container.firstElementChild;
        container.parentNode.replaceChild(asideElement, container);
    }
}

// Chạy hàm ngay khi HTML vừa load xong
document.addEventListener('DOMContentLoaded', renderAdminSidebar);