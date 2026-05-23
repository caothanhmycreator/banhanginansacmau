// 1. Hàm điều khiển chuyển đổi Tabs mượt mà trên Sidebar
function switchTab(tabId, element) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// 2. Logic thêm dòng Thông số kỹ thuật động
function addSpecRow() {
    const container = document.getElementById('specs-container');
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.innerHTML = `
        <input type="text" class="spec-key" placeholder="Tên (VD: Kích thước)">
        <input type="text" class="spec-val" placeholder="Giá trị (VD: 21x30cm)">
        <button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>
    `;
    container.appendChild(div);
}

// 3. Logic thêm dòng Gói giá động
function addTierRow() {
    const container = document.getElementById('tiers-container');
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.innerHTML = `
        <input type="text" class="tier-label" placeholder="Gói (VD: In 500 cái)">
        <input type="number" class="tier-price" placeholder="Giá lẻ từng cái">
        <button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>
    `;
    container.appendChild(div);
}

// 4. HÀM TỔNG QUẢN XỬ LÝ LƯU SẢN PHẨM
async function processSubmitProduct() {
    const btn = document.getElementById('submitBtn');
    
    const name = document.getElementById('prodName').value.trim();
    const slug = document.getElementById('prodSlug').value.trim().toLowerCase(); // Tự động ép về chữ thường
    const price = document.getElementById('prodPrice').value;
    const desc = document.getElementById('prodDesc').value.trim();
    const content = document.getElementById('prodContent').value.trim();
    const imageFile = document.getElementById('prodImage').files[0];

    // --- MỚI NÂNG CẤP: Lấy danh sách file từ input thư viện ảnh ---
    const galleryInput = document.getElementById('prodGallery');
    const galleryFiles = galleryInput ? galleryInput.files : [];

    if (!name || !slug || !price || !desc || !imageFile) {
        alert("Sếp ơi, vui lòng điền đầy đủ các mục bắt buộc và chọn ảnh đại diện nhé!");
        return;
    }

    btn.innerText = "ĐANG KIỂM TRA MÃ SLUG COI TRÙNG KHÔNG...";
    btn.disabled = true;

    try {
        // KIỂM TRA CHỐNG TRÙNG MÃ SLUG TRÊN DATABASE
        const { data: existingProd } = await supabaseClient
            .from('products')
            .select('id')
            .eq('slug', slug)
            .maybeSingle(); // Nếu có trả về dữ liệu, nghĩa là đã bị trùng

        if (existingProd) {
            alert(`❌ Lỗi rồi sếp ơi! Mã ID "${slug}" này đã được dùng cho sản phẩm khác rồi. Sếp vui lòng đặt tên mã khác nhé!`);
            btn.innerText = "Lưu và phát hành sản phẩm";
            btn.disabled = false;
            return;
        }

        btn.innerText = "MÃ NGON! ĐANG TẢI ẢNH LÊN KHO...";
        // 1. Tải ảnh lên Storage
        const imageUrl = await API.uploadImage(imageFile, 'products');
        if (!imageUrl) { throw new Error("Không tải được ảnh lên kho."); }

        // --- MỚI NÂNG CẤP: UPLOAD NHIỀU ẢNH THƯ VIỆN ---
        let galleryUrls = [];
        if (galleryFiles.length > 0) {
            for (let i = 0; i < galleryFiles.length; i++) {
                btn.innerText = `ĐANG TẢI THƯ VIỆN ẢNH (${i+1}/${galleryFiles.length})...`;
                // Tận dụng hàm uploadImage, lưu vào thư mục con products/gallery
                const url = await API.uploadImage(galleryFiles[i], 'products/gallery'); 
                if (url) {
                    galleryUrls.push(url);
                }
            }
        }
        // -----------------------------------------------

        // 2. Gom cụm dữ liệu Thông số kỹ thuật thành Object JSON
        const specsObj = {};
        const specKeys = document.querySelectorAll('.spec-key');
        const specVals = document.querySelectorAll('.spec-val');
        specKeys.forEach((keyInput, i) => {
            const k = keyInput.value.trim();
            const v = specVals[i].value.trim();
            if (k && v) specsObj[k] = v;
        });

        // 3. Gom cụm dữ liệu Gói Giá thành Mảng JSON Array
        const tiersArr = [];
        const tierLabels = document.querySelectorAll('.tier-label');
        const tierPrices = document.querySelectorAll('.tier-price');
        tierLabels.forEach((labelInput, i) => {
            const l = labelInput.value.trim();