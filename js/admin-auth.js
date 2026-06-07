// ==========================================
// BỘ NÃO BẢO MẬT & TIỆN ÍCH DÙNG CHUNG
// ==========================================

const ADMIN_PASSWORD = "123"; // SẾP ĐỔI MẬT KHẨU Ở ĐÂY NHÉ!

// Kiểm tra đăng nhập khi vừa mở web
document.addEventListener('DOMContentLoaded', () => {
    const isLogged = sessionStorage.getItem('admin_logged');
    if (isLogged === 'true') {
        // Đã đăng nhập -> Tắt màn hình khóa
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.style.display = 'none';
        
        // Gọi hàm nạp dữ liệu riêng của từng trang (nếu có)
        if (typeof initPageData === 'function') {
            initPageData();
        }
    }
});

// Xử lý nút Đăng Nhập
function checkAdminLogin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_logged', 'true');
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.style.display = 'none';
        
        // Kích hoạt tải dữ liệu
        if (typeof initPageData === 'function') {
            initPageData();
        }
    } else {
        showAlert("Sai mật khẩu!", "Mật khẩu quản trị không chính xác.", "error");
    }
}

// Xử lý nút Đăng Xuất
function adminLogout() {
    sessionStorage.removeItem('admin_logged');
    window.location.href = 'quan-tri.html'; // Đẩy về trang tổng quan bảo mật
}

// ==========================================
// CẤU HÌNH GIAO DIỆN SWEETALERT2 (TÔNG TỐI)
// ==========================================
const showAlert = (title, text, icon) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#E65100'
    });
};

const showConfirm = (title, text) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#dc2626', // Màu đỏ cảnh báo xóa
        cancelButtonColor: '#475569',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    });
};