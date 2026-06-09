// ==========================================
// BỘ NÃO ĐIỀU PHỐI TRANG KHO MẪU (GOOGLE DRIVE)
// ==========================================

let currentGallery = null; // Biến lưu kho mẫu đang xem

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Đọc mã ID (slug) từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('id');

    const loadingObj = document.getElementById('loading');
    const mainContent = document.getElementById('main-content');
    const allGalleriesWrapper = document.getElementById('all-galleries-wrapper');

    try {
        // 2. Kéo toàn bộ danh sách kho mẫu từ Database
        const data = await API.getSettings('template_galleries');
        let galleries = [];
        if (data) {
            galleries = JSON.parse(data);
        }

        // TÌNH HUỐNG 1: KHÔNG CÓ ID -> HIỂN THỊ DANH SÁCH TẤT CẢ KHO MẪU
        if (!slug) {
            loadingObj.style.display = 'none';
            
            if (galleries.length === 0) {
                loadingObj.innerHTML = "Hiện tại xưởng chưa có kho mẫu nào.";
                loadingObj.style.display = 'block';
                return;
            }

            document.title = "Khám Phá Kho Mẫu - In Ấn Sắc Màu";
            const grid = document.getElementById('galleries-grid');
            let gridHTML = '';
            
            // Vẽ danh sách thẻ (CÓ HÌNH ẢNH HOẶC ICON)
            galleries.forEach(g => {
                let visualHtml = '';
                
                if (g.image_url) {
                    // Nếu Sếp có up ảnh, hiển thị khối ảnh tràn viền phía trên
                    visualHtml = `
                        <div class="gallery-img-wrapper">
                            <div class="gallery-thumb" style="background-image: url('${g.image_url}')"></div>
                        </div>
                    `;
                } else {
                    // Nếu không có ảnh, dùng lại Icon cũ
                    const galleryIcon = `<svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="transition: 0.4s;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
                    visualHtml = `<div class="gallery-icon" style="margin-top: 15px;">${galleryIcon}</div>`;
                }

                gridHTML += `
                    <a href="kho-mau.html?id=${g.slug}" class="gallery-card">
                        ${visualHtml}
                        <div class="gallery-content">
                            <h3>${g.title}</h3>
                            <p>${g.desc || 'Xem trọn bộ sưu tập đầy đủ...'}</p>
                        </div>
                    </a>
                `;
            });
            
            grid.innerHTML = gridHTML;
            if(allGalleriesWrapper) allGalleriesWrapper.style.display = 'block';
            return;
        }

        // TÌNH HUỐNG 2: CÓ ID -> HIỂN THỊ CHI TIẾT 1 KHO MẪU
        currentGallery = galleries.find(g => g.slug === slug);

        // Nếu khách gõ sai link hoặc kho mẫu bị xóa
        if (!currentGallery) {
            loadingObj.innerHTML = "Kho mẫu này không tồn tại hoặc đã bị gỡ khỏi hệ thống!";
            return;
        }

        // 3. Bơm dữ liệu ra giao diện web
        document.title = `Bộ Sưu Tập: ${currentGallery.title} - In Ấn Sắc Màu`;
        
        const titleElement = document.getElementById('gal-title');
        titleElement.innerHTML = `BỘ SƯU TẬP <span>${currentGallery.title.toUpperCase()}</span>`;
        
        document.getElementById('gal-desc').innerText = currentGallery.desc;

        // Bơm Iframe trực tiếp từ Google Drive
        const iframeContainer = document.getElementById('iframe-container');
        iframeContainer.innerHTML = `<iframe src="https://drive.google.com/embeddedfolderview?id=${currentGallery.driveId}#grid" width="100%" height="100%" frameborder="0" scrolling="yes" style="border: none;"></iframe>`;

        // Ẩn hiệu ứng loading, hiện giao diện chính
        loadingObj.style.display = 'none';
        mainContent.style.display = 'block';

    } catch (error) {
        console.error("Lỗi tải kho mẫu:", error);
        loadingObj.innerHTML = "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau!";
    }
});

// ==========================================
// CÁC HÀM XỬ LÝ FORM ĐẶT HÀNG
// ==========================================

function openOrderModal() { 
    const modal = document.getElementById('orderModal');
    if(modal) modal.style.display = 'flex'; 
}

function closeOrderModal() { 
    const modal = document.getElementById('orderModal');
    if(modal) modal.style.display = 'none'; 
}

async function processFinalOrder() {
    const btn = document.getElementById('btnSubmitFinalOrder');
    
    // Thu thập dữ liệu form
    const tierObj = document.getElementById('orderTier');
    const qtyObj = document.getElementById('orderQty');
    const designObj = document.getElementById('orderDesign');
    const noteObj = document.getElementById('orderNote');
    const cusNameObj = document.getElementById('cusName');
    const cusPhoneObj = document.getElementById('cusPhone');
    
    const tier = tierObj ? tierObj.value.trim() : '';
    const qty = qtyObj ? qtyObj.value.trim() : '';
    const design = designObj ? designObj.value : '';
    const note = noteObj ? noteObj.value.trim() : '';
    const cusName = cusNameObj ? cusNameObj.value.trim() : '';
    const cusPhone = cusPhoneObj ? cusPhoneObj.value.trim() : '';

    // Bắt lỗi rỗng
    if (!cusName || !cusPhone) {
        Swal.fire({
            title: "Thiếu thông tin!", 
            text: "Vui lòng nhập Tên và Số điện thoại/Zalo để xưởng Sắc Màu liên hệ lại!", 
            icon: "warning", 
            background: '#1e293b', 
            color: '#fff',
            confirmButtonColor: '#E65100'
        });
        return;
    }

    if(btn) {
        btn.innerText = "ĐANG XỬ LÝ...";
        btn.disabled = true;
    }

    // Tạo sẵn đường link kho mẫu hiện tại để gửi về cho Admin
    const currentGalleryUrl = currentGallery ? `kho-mau.html?id=${currentGallery.slug}` : 'Chưa rõ';

    // Đóng gói thông tin chuẩn form gửi lên Supabase
    const payload = {
        // Đặt rỗng slug để trang Admin KHÔNG tự động tạo link chi-tiet-san-pham.html bị sai nữa
        product_slug: '', 
        product_name: `[KHO MẪU] ${currentGallery ? currentGallery.title : 'Nguồn Drive'}`,
        package_selected: `Mẫu khách gửi: ${tier || 'Chưa chốt mẫu, cần tư vấn'}`,
        custom_quantity: qty || 'Chưa rõ',
        design_status: design,
        customer_note: `(Link bộ sưu tập: ${currentGalleryUrl}) - Ghi chú thêm: ${note}`,
        customer_name: cusName,
        customer_phone: cusPhone
    };

    const result = await API.submitOrder(payload);

    if (result.success) {
        Swal.fire({
            title: "Gửi Thành Công! 🎉", 
            text: "Đội ngũ thiết kế của xưởng Sắc Màu đã nhận được thông tin và sẽ nhắn tin Zalo cho sếp ngay!", 
            icon: "success", 
            background: '#1e293b', 
            color: '#fff',
            confirmButtonColor: '#E65100'
        });
        closeOrderModal();
        
        // Dọn dẹp form sau khi gửi
        if(cusNameObj) cusNameObj.value = '';
        if(cusPhoneObj) cusPhoneObj.value = '';
        if(qtyObj) qtyObj.value = '';
        if(noteObj) noteObj.value = '';
        if(tierObj) tierObj.value = '';
    } else {
        Swal.fire({
            title: "Lỗi kết nối!", 
            text: "Có lỗi mạng xảy ra, vui lòng thử lại sau.", 
            icon: "error", 
            background: '#1e293b', 
            color: '#fff',
            confirmButtonColor: '#dc2626'
        });
    }

    if(btn) {
        btn.innerText = "XÁC NHẬN GỬI";
        btn.disabled = false;
    }
}