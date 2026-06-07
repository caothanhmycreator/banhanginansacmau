// ==========================================
// BỘ NÃO ĐIỀU KHIỂN RIÊNG TRANG GIỚI THIỆU
// ==========================================

let existingIntroGallery = []; 

// Hàm này tự động kích hoạt bởi admin-auth.js khi qua cửa bảo vệ
function initPageData() {
    loadIntroData();
}

async function loadIntroData() {
    const data = await API.getSettings('page_intro');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            document.getElementById('introTitle').value = parsed.title || '';
            document.getElementById('introContent').value = parsed.content || '';
            document.getElementById('introContact').value = parsed.contact || '';
            document.getElementById('introMap').value = parsed.map || '';
            
            existingIntroGallery = parsed.gallery || [];
            renderIntroGalleryPreview();
        } catch (e) {
            console.error("Lỗi đọc dữ liệu Intro:", e);
        }
    }
}

function renderIntroGalleryPreview() {
    const container = document.getElementById('intro-gallery-preview');
    if(!container) return;
    
    container.innerHTML = '';
    existingIntroGallery.forEach((url, index) => {
        container.innerHTML += `
            <div style="position:relative; width:90px; height:90px;">
                <img src="${url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; border:1px solid #475569;">
                <span onclick="removeIntroImage(${index})" style="position:absolute; top:-8px; right:-8px; background:#7f1d1d; color:white; border-radius:50%; width:24px; height:24px; text-align:center; line-height:22px; cursor:pointer; font-weight:bold; font-size:12px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">x</span>
            </div>
        `;
    });
}

function removeIntroImage(index) {
    existingIntroGallery.splice(index, 1);
    renderIntroGalleryPreview();
}

async function saveIntroData() {
    const btn = document.getElementById('btnSaveIntro');
    btn.innerText = "ĐANG XỬ LÝ DỮ LIỆU..."; 
    btn.disabled = true;

    try {
        const files = document.getElementById('introGallery').files;
        let newUrls = [];
        
        // Tải ảnh mới lên (nếu có)
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                btn.innerText = `ĐANG TẢI ẢNH SLIDE (${i+1}/${files.length})...`;
                const url = await API.uploadImage(files[i], 'intro');
                if (url) newUrls.push(url);
            }
        }

        // Hợp nhất ảnh cũ và ảnh mới
        const finalGallery = [...existingIntroGallery, ...newUrls];
        const payload = {
            title: document.getElementById('introTitle').value.trim(),
            content: document.getElementById('introContent').value.trim(),
            contact: document.getElementById('introContact').value.trim(),
            map: document.getElementById('introMap').value.trim(),
            gallery: finalGallery
        };

        btn.innerText = "ĐANG GHI VÀO CƠ SỞ DỮ LIỆU...";
        const success = await API.updateSettings('page_intro', JSON.stringify(payload));

        if (success) {
            Swal.fire({ 
                title: "Thành công!", 
                text: "Đã lưu cấu hình trang Giới Thiệu thành công!", 
                icon: "success", 
                background: '#1e293b', 
                color: '#fff', 
                confirmButtonColor: '#E65100' 
            });
            existingIntroGallery = finalGallery;
            renderIntroGalleryPreview();
            document.getElementById('introGallery').value = ""; // Xóa trắng ô chọn file
        } else {
            showAlert("Lỗi!", "Lỗi kết nối khi lưu dữ liệu!", "error");
        }
    } catch (err) {
        console.error(err); 
        showAlert("Lỗi!", "Lỗi phát sinh trong quá trình lưu!", "error");
    }

    btn.innerText = "LƯU CẤU HÌNH TRANG GIỚI THIỆU"; 
    btn.disabled = false;
}