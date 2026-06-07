// ==========================================
// ĐIỀU PHỐI DỮ LIỆU TRANG TIN TỨC & CHUYÊN MỤC
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const wrapper = document.getElementById('blog-wrapper');
    
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');

    // Nạp thư viện danh sách chuyên mục từ hệ thống
    let blogCategories = [];
    const catData = await API.getSettings('blog_categories');
    if (catData) blogCategories = JSON.parse(catData);

    let posts = await API.getPosts();

    if (!posts || posts.length === 0) {
        loading.innerText = "Xưởng in Sắc Màu đang chuẩn bị các nội dung kiến thức chuyên ngành sếp ơi!";
        return;
    }

    loading.style.display = 'none';
    if (wrapper) wrapper.style.display = 'block';

    const heroSection = document.querySelector('.magazine-hero');
    const dividerTitle = document.querySelector('.blog-section-divider h2');
    const gridContainer = document.getElementById('regular-posts-grid');

    if (catParam) {
        posts = posts.filter(p => p.category === catParam);
        
        if(heroSection) heroSection.style.display = 'none';
        
        // Truy xuất tự động tên chuyên mục để in ra tiêu đề trang
        const catObj = blogCategories.find(c => c.id === catParam);
        const prettyCatName = catObj ? catObj.name.toUpperCase() : 'CHUYÊN MỤC';
        if(dividerTitle) dividerTitle.innerHTML = `CHUYÊN MỤC: <span>${prettyCatName}</span>`;

        if (posts.length === 0) {
            if(gridContainer) gridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #94a3b8; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">Hiện tại chưa có bài viết nào thuộc mục này. Sếp cập nhật thêm nhé!</div>`;
            return;
        }

        let gridHTML = '';
        posts.forEach(p => {
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
        if(gridContainer) gridContainer.innerHTML = gridHTML;

    } else {
        if(heroSection) heroSection.style.display = 'flex';
        if(dividerTitle) dividerTitle.innerHTML = `BÀI VIẾT <span>MỚI CẬP NHẬT</span>`;

        const top1 = posts[0];
        const top1Container = document.getElementById('post-top1');
        if (top1Container && top1) {
            top1Container.innerHTML = `
                <div class="main-img-box" style="background-image: url('${top1.image_url}')" onclick="goToPostDetail('${top1.slug}')"></div>
                <h1 onclick="goToPostDetail('${top1.slug}')">${top1.title}</h1>
                <p>${top1.excerpt}</p>
            `;
        }

        const sideContainer = document.getElementById('post-side-container');
        if (sideContainer) {
            let sideHTML = '';
            const sidePosts = posts.slice(1, 3);
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

        if (gridContainer) {
            const regularPosts = posts.slice(3);
            if (regularPosts.length === 0) {
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
    }
});

function goToPostDetail(slug) {
    window.location.href = `chi-tiet-bai-viet.html?id=${slug}`;
}