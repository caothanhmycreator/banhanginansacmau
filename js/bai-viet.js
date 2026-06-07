// ==========================================
// ĐIỀU PHỐI DỮ LIỆU TRANG TIN TỨC (FRONTEND)
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const wrapper = document.getElementById('blog-wrapper');
    
    // 1. Triệu hồi danh sách bài viết từ kho lưu trữ (Mặc định đã được xếp mới nhất lên đầu)
    const posts = await API.getPosts();

    if (!posts || posts.length === 0) {
        loading.innerText = "Xưởng in Sắc Màu đang chuẩn bị các nội dung kiến thức chuyên ngành sếp ơi!";
        return;
    }

    // Tắt màn hình chờ, mở giao diện chính
    loading.style.display = 'none';
    if (wrapper) wrapper.style.display = 'block';

    // 2. PHÂN PHỐI BÀI VIẾT THEO PHONG CÁCH TÒA SOẠN BÁO

    // --- Vị trí 1: Bài viết Tiêu điểm đinh (Top 1 mới nhất) ---
    const top1 = posts[0];
    const top1Container = document.getElementById('post-top1');
    if (top1Container && top1) {
        top1Container.innerHTML = `
            <div class="main-img-box" style="background-image: url('${top1.image_url}')" onclick="goToPostDetail('${top1.slug}')"></div>
            <h1 onclick="goToPostDetail('${top1.slug}')">${top1.title}</h1>
            <p>${top1.excerpt}</p>
        `;
    }

    // --- Vị trí 2: Hai bài viết phụ tiêu điểm kề cạnh (Top 2 & Top 3) ---
    const sideContainer = document.getElementById('post-side-container');
    if (sideContainer) {
        let sideHTML = '';
        const sidePosts = posts.slice(1, 3); // Cắt lấy bài vị trí thứ 2 và thứ 3
        
        sidePosts.forEach(p => {
            const dateStr = new Date(p.created_at).toLocaleDateString('vi-VN');
            sideHTML += `
                <div class="side-post-card" onclick="goToPostDetail('${p.slug}')">
                    <div class="side-img" style="background-image: url('${p.image_url}')"></div>
                    <div class="side-info">
                        <h3>${p.title}</h3>
                        <span>📅 ${dateStr}</span>
                    </div>
                </div>
            `;
        });
        sideContainer.innerHTML = sideHTML;
    }

    // --- Vị trí 3: Dòng chảy các bài viết còn lại phía dưới dạng lưới ---
    const gridContainer = document.getElementById('regular-posts-grid');
    if (gridContainer) {
        const regularPosts = posts.slice(3); // Lấy toàn bộ bài viết từ vị trí thứ 4 trở đi
        
        if (regularPosts.length === 0) {
            // Nếu hệ thống chỉ có dưới 3 bài viết, ẩn dòng chữ tiêu đề lưới
            document.querySelector('.blog-section-divider').style.display = 'none';
            return;
        }

        let gridHTML = '';
        regularPosts.forEach(p => {
            const dateStr = new Date(p.created_at).toLocaleDateString('vi-VN');
            gridHTML += `
                <div class="glossy-card grid-post-card">
                    <div class="post-thumb" style="background-image: url('${p.image_url}')"></div>
                    <div class="post-body">
                        <h4>${p.title}</h4>
                        <p>${p.excerpt}</p>
                        <div class="post-date">📅 Cập nhật: ${dateStr}</div>
                        <a href="chi-tiet-bai-viet.html?id=${p.slug}" class="btn-view" style="margin-top: 15px;">Đọc bài viết</a>
                    </div>
                </div>
            `;
        });
        gridContainer.innerHTML = gridHTML;
    }
});

// Hàm chuyển hướng nhanh khi click vào bài viết ngoài trang báo
function goToPostDetail(slug) {
    window.location.href = `chi-tiet-bai-viet.html?id=${slug}`;
}