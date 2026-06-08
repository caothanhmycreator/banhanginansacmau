// ==========================================
// BỘ NÃO QUẢN LÝ KHO MẪU (GOOGLE DRIVE GALLERIES)
// ==========================================

let allGalleries = [];

// Chạy tự động sau khi qua vòng bảo mật
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
        tbody.innerHTML = `<tr><td colspan="4" style="padding:20px; text-align:center; color:#94a3b8;">Chưa có kho mẫu nào được tạo.</td></tr>`;
        return;
    }

    let rowsHTML = '';
    allGalleries.forEach(gal => {
        rowsHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 15px 20px;">
                    <strong style="color:#fff; display:block; margin-bottom:5px;">${gal.title}</strong>
                </td>
                <td style="padding: 15px 20px; color:#94a3b8; font-family:monospace;">${gal.slug}</td>
                <td style="padding: 15px 20px; color:#4ade80; font-size: 12px; font-weight: bold;">
                    ✅ Đã kết nối Iframe
                </td>
                <td style="padding: 15px 20px; text-align: right; white-space: nowrap;">
                    <button type="button" onclick="prepareEditGallery('${gal.id}')" style="background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; margin-right:5px;">Sửa</button>
                    <button type="button" onclick="deleteGallery('${gal.id}')" style="background:#7f1d1d; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">Xóa</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHTML;
}

// Thuật toán tách mã ID từ Link Google Drive dài thòng lòng
function extractDriveId(url) {
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : url; // Nếu không bóc được thì giữ nguyên (đề phòng sếp nhập đúng ID rồi)
}

async function processSubmitGallery() {
    const btn = document.getElementById('submitBtn');
    const idObj = document.getElementById('galleryId');
    const currentId = idObj.value;
    
    const title = document.getElementById('galTitle').value.trim();
    const slug = document.getElementById('galSlug').value.trim().toLowerCase();
    const driveInput = document.getElementById('galDrive').value.trim();
    const desc = document.getElementById('galDesc').value.trim();

    if (!title || !slug || !driveInput || !desc) {
        showAlert("Thiếu thông tin", "Sếp vui lòng điền đầy đủ các mục nhé!", "warning");
        return;
    }

    // Tự động bóc tách Drive ID
    const driveId = extractDriveId(driveInput);

    btn.disabled = true;
    btn.innerText = "ĐANG LƯU DỮ LIỆU...";

    // Tránh trùng Slug
    const isDuplicate = allGalleries.some(g => g.slug === slug && g.id !== currentId);
    if (isDuplicate) {
        showAlert("Trùng Mã Link", "Mã Slug này đã tồn tại, sếp đổi mã khác nhé!", "error");
        btn.disabled = false;
        btn.innerText = currentId ? "CẬP NHẬT KHO MẪU" : "LƯU VÀ PHÁT HÀNH KHO MẪU";
        return;
    }

    if (currentId) {
        // Cập nhật
        const index = allGalleries.findIndex(g => g.id === currentId);
        if (index !== -1) {
            allGalleries[index] = { id: currentId, title, slug, driveId, desc };
        }
    } else {
        // Tạo mới
        const newGallery = {
            id: Date.now().toString(),
            title, slug, driveId, desc
        };
        allGalleries.push(newGallery);
    }

    const success = await API.updateSettings('template_galleries', JSON.stringify(allGalleries));
    
    if (success) {
        Swal.fire({ title: "Thành công!", text: "Kho mẫu đã được cập nhật!", icon: "success", background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100' });
        document.getElementById('galleryForm').reset();
        idObj.value = "";
        btn.innerText = "LƯU VÀ PHÁT HÀNH KHO MẪU";
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
    document.getElementById('galDrive').value = gal.driveId; // Trả lại ID cho sếp sửa
    document.getElementById('galDesc').value = gal.desc;

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