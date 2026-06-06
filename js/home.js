// --- BỘ NÃO ĐIỀU KHIỂN DỮ LIỆU TRANG CHỦ (HOME LANDING PAGE) ---

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. TẢI DỮ LIỆU SẢN PHẨM NỔI BẬT LÊN KHU VỰC HERO VISUAL
    const listContainer = document.getElementById('hero-products-list');
    if (listContainer) {
        const products = await API.getProducts();
        
        if (products && products.length > 0) {
            let html = '';
            // Tách trích xuất tối đa 4 sản phẩm mới nhất làm đại diện nổi bật
            products.slice(0, 4).forEach(p => {
                html += `
                    <div class="hero-prod-card">
                        <div class="hero-prod-img" style="background-image: url('${p.image_url}')"></div>
                        <div class="hero-prod-name">${p.name}</div>
                    </div>
                `;
            });
            listContainer.innerHTML = html;
        } else {
            listContainer.innerHTML = `<p style="grid-column: 1/-1; color:#94a3b8;">Xưởng đang chuẩn bị phát hành các gói sản phẩm mới.</p>`;
        }
    }

    // 2. THIẾT LẬP LẮNG NGHE SỰ KIỆN KÍCH HOẠT POPUP MODAL YÊU CẦU BÁO GIÁ
    const triggerBtn = document.getElementById('hero-trigger-quote');
    const closeBtn = document.getElementById('close-quote-modal');
    const submitBtn = document.getElementById('submit-quote-btn');

    if (triggerBtn) triggerBtn.addEventListener('click', openOrderModal);
    if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);
    if (submitBtn) submitBtn.addEventListener('click', processFinalOrder);
});

// Hàm mở Modal
function openOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'flex';
}

// Hàm đóng Modal
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

// Xử lý gửi yêu cầu báo giá tổng hợp lên cơ sở dữ liệu Supabase thông qua SweetAlert2
async function processFinalOrder() {
    const btn = document.getElementById('submit-quote-btn');
    const nameInput = document.getElementById('cusName');
    const phoneInput = document.getElementById('cusPhone');
    const noteInput = document.getElementById('orderNote');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const note = noteInput ? noteInput.value.trim() : '';

    if (!name || !phone) {
        Swal.fire({
            title: "Thiếu thông tin!",
            text: "Anh/Chị vui lòng nhập Tên và Số điện thoại/Zalo để xưởng tiện liên hệ nhé!",
            icon: "warning",
            background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100'
        });
        return;
    }

    if (btn) {
        btn.innerText = "ĐANG GỬI YÊU CẦU VÀO HỆ THỐNG...";
        btn.disabled = true;
    }

    // Đóng gói cấu trúc payload lưu trữ đơn hàng tổng hợp từ trang chủ
    const payload = {
        product_slug: 'yeu-cau-trang-chu',
        product_name: 'Yêu cầu tư vấn tổng hợp từ Trang Chủ',
        package_selected: 'Khách yêu cầu báo giá riêng',
        custom_quantity: 'Tùy chỉnh theo tư vấn',
        design_status: 'Cần hỗ trợ quy cách xưởng',
        customer_note: note || 'Khách bấm nút nhận báo giá nhanh ngoài trang chủ',
        customer_name: name,
        customer_phone: phone
    };

    const result = await API.submitOrder(payload);

    if (result.success) {
        Swal.fire({
            title: "Gửi thành công! 🎉",
            text: "Đội ngũ Sắc Màu đã ghi nhận dữ liệu và sẽ liên hệ trực tiếp qua Zalo của Anh/Chị ngay lập tức.",
            icon: "success",
            background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100'
        });
        
        closeOrderModal();
        
        // Reset dọn dẹp form trống sạch sẽ
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (noteInput) noteInput.value = '';
    } else {
        Swal.fire({
            title: "Lỗi kết nối!",
            text: "Hệ thống đang bận, Anh/Chị vui lòng chat Zalo trực tiếp qua số Hotline xưởng nhé!",
            icon: "error",
            background: '#1e293b', color: '#fff', confirmButtonColor: '#dc2626'
        });
    }

    if (btn) {
        btn.innerText = "GỬI YÊU CẦU CHO XƯỞNG";
        btn.disabled = false;
    }
}