// ==========================================
// BỘ NÃO QUẢN LÝ KHO MẪU (GOOGLE DRIVE GALLERIES)
// ==========================================

let allGalleries = [];

function initPageData() {
    loadGalleries();
}

async function loadGalleries() {
    const tbody = document.getElementById('admin-gallery-list');
    if (!tbody) return;

    const data = await API.getSettings('template_galleries');
    if (data) {
        allGalleries = JSON.parse(data);
    } else {
        allGalleries = [];
    }

    renderGalleryTable();
}

function renderGalleryTable() {
    const tbody = document.getElementById('admin-gallery-list');
    if (allGalleries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#94a3b8;">Chưa có kho mẫu nào được tạo.</td></tr>`;
        return;
    }

    let rowsHTML = '';
    allGalleries.forEach((gal, index) => {
        const isFirst = index === 0;
        const isLast = index === allGalleries.length - 1;

        // Render ảnh nhỏ trong bảng admin
        const imgHtml = gal.image_url 
            ? `<img src="${gal.image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">` 
            : `<div style="width: 50px; height: 50px; background: rgba(255,255,255,0.05); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🖼️</div>`;

        rowsHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 15px 20px;">${imgHtml}</td>
                <td style="padding: 15px 20px;">
                    <strong style="color:#fff; display:block; margin-bottom:5px;">${gal.title}</strong>
                </td>
                <td style="padding: 15px 20px; color:#94a3b8; font-family:monospace;">${gal.slug}</td>
                <td style="padding: 15px 20px; color:#4ade80; font-size: 12px; font-weight: bold;">
                    ✅ Đã kết nối Iframe
                </td>
                <td style="padding: 15px 20px; text-align: right; white-space: nowrap;">
                    ${!isFirst ? `<button type="button" onclick="moveGalleryUp('${gal.id}')" style="background:#334155; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; margin-right:5px;" title="Lên trên">▲</button>` : ''}
                    ${!isLast ? `<button type="button" onclick="moveGalleryDown('${gal.id}')" style="background:#334155; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; margin-right:5px;" title="Xuống dưới">▼</button>` : ''}
                    <button type="button" onclick="prepareEditGallery('${gal.id}')" style="background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; margin-right:5px;">Sửa</button>
                    <button type="button" onclick="deleteGallery('${gal.id}')" style="background:#7f1d1d; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">Xóa</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHTML;
}

// CÁC HÀM SẮP XẾP VỊ TRÍ
async function moveGalleryUp(id) {
    const index = allGalleries.findIndex(g => g.id === id);
    if (index > 0) {
        const temp = allGalleries[index];
        allGalleries[index] = allGalleries[index - 1];
        allGalleries[index - 1] = temp;
        await saveGalleryOrder();
    }
}

async function moveGalleryDown(id) {
    const index = allGalleries.findIndex(g => g.id === id);
    if (index !== -1 && index < allGalleries.length - 1) {
        const temp = allGalleries[index];
        allGalleries[index] = allGalleries[index + 1];
        allGalleries[index + 1] = temp;
        await saveGalleryOrder();
    }
}

async function saveGalleryOrder() {
    const success = await API.updateSettings('template_galleries', JSON.stringify(allGalleries));
    if (success) renderGalleryTable(); 
    else showAlert("Lỗi!", "Không thể lưu thứ tự!", "error");
}

function extractDriveId(url) {
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : url; 
}

// XỬ LÝ DATABASE (THÊM, SỬA, XÓA) CÓ ẢNH
async function processSubmitGallery() {
    const btn = document.getElementById('submitBtn');
    const idObj = document.getElementById('galleryId');
    const currentId = idObj.value;
    
    const title = document.getElementById('galTitle').value.trim();
    const slug = document.getElementById('galSlug').value.trim().toLowerCase();
    const driveInput = document.getElementById('galDrive').value.trim();
    const desc = document.getElementById('galDesc').value.trim();
    const imageFile = document.getElementById('galImage').files[0]; // Bắt file ảnh

    if (!title || !slug || !driveInput || !desc) {
        showAlert("Thiếu thông tin", "Sếp vui lòng điền đầy đủ các mục nhé!", "warning");
        return;
    }

    const driveId = extractDriveId(driveInput);

    btn.disabled = true;
    btn.innerText = "ĐANG LƯU DỮ LIỆU...";

    const isDuplicate = allGalleries.some(g => g.slug === slug && g.id !== currentId);
    if (isDuplicate) {
        showAlert("Trùng Mã Link", "Mã Slug này đã tồn tại, sếp đổi mã khác nhé!", "error");
        btn.disabled = false;
        btn.innerText = currentId ? "CẬP NHẬT KHO MẪU" : "LƯU VÀ PHÁT HÀNH KHO MẪU";
        return;
    }

    // Xử lý upload ảnh (nếu có)
    let imageUrl = null;
    if (imageFile) {
        btn.innerText = "ĐANG TẢI ẢNH LÊN...";
        imageUrl = await API.uploadImage(imageFile, 'galleries'); // Tái sử dụng hàm upload
    }

    if (currentId) {
        const index = allGalleries.findIndex(g => g.id === currentId);
        if (index !== -1) {
            const oldGallery = allGalleries[index];
            allGalleries[index] = { 
                id: currentId, title, slug, driveId, desc, 
                image_url: imageUrl || oldGallery.image_url // Giữ ảnh cũ nếu không up ảnh mới
            };
        }
    } else {
        const newGallery = {
            id: Date.now().toString(),
            title, slug, driveId, desc,
            image_url: imageUrl
        };
        allGalleries.push(newGallery);
    }

    const success = await API.updateSettings('template_galleries', JSON.stringify(allGalleries));
    
    if (success) {
        Swal.fire({ title: "Thành công!", text: "Kho mẫu đã được cập nhật!", icon: "success", background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100' });
        document.getElementById('galleryForm').reset();
        idObj.value = "";
        document.getElementById('galImage').value = ""; // Xóa bộ nhớ file
        btn.innerText = "LƯU VÀ PHÁT HÀNH KHO MẪU";
        btn.disabled = false; 
        loadGalleries();
    } else {
        showAlert("Lỗi!", "Có lỗi kết nối hệ thống!", "error");
        btn.disabled = false;
    }
}

function prepareEditGallery(id) {
    const gal = allGalleries.find(g => g.id === id);
    if (!gal) return;

    document.getElementById('galleryId').value = gal.id;
    document.getElementById('galTitle').value = gal.title;
    document.getElementById('galSlug').value = gal.slug;
    document.getElementById('galDrive').value = gal.driveId; 
    document.getElementById('galDesc').value = gal.desc;
    document.getElementById('galImage').value = ""; // Reset file

    document.getElementById('submitBtn').innerText = "CẬP NHẬT KHO MẪU";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteGallery(id) {
    const result = await showConfirm("Xóa Kho Mẫu?", "Sếp có chắc chắn muốn xóa kho mẫu này khỏi hệ thống không?");
    if (!result.isConfirmed) return;

    allGalleries = allGalleries.filter(g => g.id !== id);
    const success = await API.updateSettings('template_galleries', JSON.stringify(allGalleries));
    
    if (success) {
        Swal.fire({ title: "Đã xóa!", icon: "success", background: '#1e293b', color: '#fff', timer: 1500, showConfirmButton: false });
        loadGalleries();
    } else {
        showAlert("Lỗi!", "Không thể xóa kho mẫu lúc này!", "error");
    }
}