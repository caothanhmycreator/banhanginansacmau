// ==========================================
// BỘ NÃO ĐIỀU PHỐI TRANG KHO MẪU (GOOGLE DRIVE)
// ==========================================

let currentGallery = null; // Biến lưu kho mẫu đang xem

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    // Nhận diện 3 loại tham số đồng bộ toàn hệ thống
    const slug = urlParams.get('id');
    const cat = urlParams.get('cat');
    const sub = urlParams.get('sub');

    const loadingObj = document.getElementById('loading');
    const mainContent = document.getElementById('main-content');
    const allGalleriesWrapper = document.getElementById('all-galleries-wrapper');

    try {
        // MỚI: Kéo cả dữ liệu Kho mẫu VÀ Danh mục sản phẩm (để lấy tên Tiếng Việt chuẩn)
        const [data, catData] = await Promise.all([
            API.getSettings('template_galleries'),
            API.getSettings('product_categories')
        ]);
        
        let galleries = data ? JSON.parse(data) : [];
        let prodCategories = catData ? JSON.parse(catData) : [];

        // TÌNH HUỐNG 1: TRANG LƯỚI (CÓ HOẶC KHÔNG CÓ BỘ LỌC CAT/SUB)
        if (!slug) {
            loadingObj.style.display = 'none';
            
            // Xử lý logic lọc danh mục
            let keyword = cat || sub || '';
            let filteredGalleries = galleries;
            let displayKeyword = ''; // Biến lưu tên tiếng Việt
            
            if (keyword) {
                // Lọc danh sách kho mẫu
                filteredGalleries = galleries.filter(g => g.slug.includes(keyword.toLowerCase()));
                
                // Dò tìm tên Tiếng Việt chuẩn từ danh mục sản phẩm
                const matchedCat = prodCategories.find(c => c.id === keyword.toLowerCase());
                if (matchedCat) {
                    displayKeyword = matchedCat.name; // Lấy đúng tên tiếng Việt (VD: Thiệp cưới)
                } else {
                    displayKeyword = keyword.replace(/-/g, ' '); // Phương án dự phòng
                }
            }

            if (filteredGalleries.length === 0) {
                loadingObj.innerHTML = "Hiện tại chưa có kho mẫu nào thuộc danh mục này.";
                loadingObj.style.display = 'block';
                return;
            }

            // Tự động đổi Tiêu đề và Mô tả chuẩn Tiếng Việt
            let pageTitle = "KHÁM PHÁ KHO MẪU";
            let pageDesc = "Tổng hợp các bộ sưu tập mẫu thiết kế ấn tượng nhất tại In Ấn Sắc Màu.";
            
            if (keyword) {
                pageTitle = `KHO MẪU <span style="color: var(--accent-glow);">${displayKeyword.toUpperCase()}</span>`;
                pageDesc = `Khám phá các bộ sưu tập mẫu ${displayKeyword.toLowerCase()} ấn tượng nhất tại In Ấn Sắc Màu.`;
            }

            document.title = keyword ? `Kho Mẫu ${displayKeyword} - In Ấn Sắc Màu` : "Khám Phá Kho Mẫu - In Ấn Sắc Màu";
            
            const grid = document.getElementById('galleries-grid');
            let gridHTML = '';
            
            // Vẽ danh sách thẻ
            filteredGalleries.forEach(g => {
                let visualHtml = '';
                if (g.image_url) {
                    visualHtml = `
                        <div class="gallery-img-wrapper">
                            <div class="gallery-thumb" style="background-image: url('${g.image_url}')"></div>
                        </div>
                    `;
                } else {
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
            
            const wrapper = document.getElementById('all-galleries-wrapper');
            if (wrapper) {
                wrapper.querySelector('h1').innerHTML = pageTitle; // Thay đổi thẻ H1
                wrapper.querySelector('p').innerHTML = pageDesc;   // Thay đổi dòng mô tả
                wrapper.style.display = 'block';
            }
            grid.innerHTML = gridHTML;
            return;
        }

        // TÌNH HUỐNG 2: XEM CHI TIẾT 1 KHO MẪU QUA ID
        currentGallery = galleries.find(g => g.slug === slug);

        if (!currentGallery) {
            loadingObj.innerHTML = "Kho mẫu này không tồn tại hoặc đã bị gỡ khỏi hệ thống!";
            return;
        }

        document.title = `Bộ Sưu Tập: ${currentGallery.title} - In Ấn Sắc Màu`;
        
        const titleElement = document.getElementById('gal-title');
        titleElement.innerHTML = `BỘ SƯU TẬP <span>${currentGallery.title.toUpperCase()}</span>`;
        
        document.getElementById('gal-desc').innerText = currentGallery.desc;

        const iframeContainer = document.getElementById('iframe-container');
        iframeContainer.innerHTML = `<iframe src="https://drive.google.com/embeddedfolderview?id=${currentGallery.driveId}#grid" width="100%" height="100%" frameborder="0" scrolling="yes" style="border: none;"></iframe>`;

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

    const currentGalleryUrl = currentGallery ? `kho-mau.html?id=${currentGallery.slug}` : 'Chưa rõ';

    const payload = {
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