// ==========================================
// BỘ NÃO ĐIỀU KHIỂN TRANG BÀI VIẾT (DYNAMIC CATEGORY)
// ==========================================

let allPosts = [];
let blogCategories = [];

async function initPageData() {
    await loadCategories(); // Nạp chuyên mục từ CSDL trước
    initRichTextEditor();
    loadAdminPostList();
}

// KHỐI QUẢN LÝ CHUYÊN MỤC ĐỘNG
async function loadCategories() {
    const catData = await API.getSettings('blog_categories');
    if (catData) {
        blogCategories = JSON.parse(catData);
    } else {
        // Tạo mặc định lần đầu nếu chưa có gì
        blogCategories = [
            { id: 'kien-thuc', name: 'Kiến thức in ấn' },
            { id: 'ky-nang', name: 'Kỹ năng thiết kế' }
        ];
        await API.updateSettings('blog_categories', JSON.stringify(blogCategories));
    }
    renderCategorySelect();
}

function renderCategorySelect() {
    const select = document.getElementById('postCategory');
    if (!select) return;
    select.innerHTML = '';
    blogCategories.forEach(cat => {
        select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

async function addNewCategory() {
    const { value: catName } = await Swal.fire({
        title: 'Thêm Chuyên Mục Mới',
        input: 'text',
        inputPlaceholder: 'Ví dụ: Tin tức xưởng',
        showCancelButton: true,
        background: '#1e293b', color: '#fff',
        confirmButtonColor: '#E65100',
        confirmButtonText: 'Lưu Chuyên Mục',
        cancelButtonText: 'Hủy'
    });

    if (catName && catName.trim() !== '') {
        const cleanName = catName.trim();
        // Tự động tạo mã không dấu (Slug) từ tên chuyên mục
        const catId = cleanName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        
        if (blogCategories.find(c => c.id === catId)) {
            showAlert("Lỗi", "Chuyên mục này đã tồn tại rồi sếp ơi!", "error");
            return;
        }

        blogCategories.push({ id: catId, name: cleanName });
        const success = await API.updateSettings('blog_categories', JSON.stringify(blogCategories));
        
        if (success) {
            renderCategorySelect();
            document.getElementById('postCategory').value = catId; // Tự động chọn mục vừa tạo
            Swal.fire({title: "Thành công!", text: "Đã thêm chuyên mục mới.", icon: "success", background: '#1e293b', color: '#fff', timer: 1500, showConfirmButton: false});
        } else {
            showAlert("Lỗi", "Không thể lưu vào hệ thống!", "error");
        }
    }
}

// 1. KHỞI TẠO TRÌNH SOẠN THẢO TINYMCE
function initRichTextEditor() {
    tinymce.init({
        selector: '#postContent',
        height: 500,
        skin: 'oxide-dark',
        content_css: 'dark',
        plugins: 'image media link lists align colorpicker fontfamily fontsize code preview',
        toolbar: 'undo redo | fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | link image media | code preview',
        font_size_formats: '8px 10px 12px 14px 16px 18px 24px 36px 48px',
        font_family_formats: 'Montserrat=Montserrat,sans-serif; Arial=arial,helvetica,sans-serif; Tahoma=tahoma,arial,helvetica,sans-serif; Times New Roman=times new roman,times;',
        images_upload_handler: async (blobInfo, progress) => {
            try {
                const file = blobInfo.blob();
                const url = await API.uploadImage(file, 'posts/images');
                if (url) return url;
                else throw new Error('Upload ảnh thất bại!');
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
    });
}

// 2. NẠP DANH SÁCH BÀI VIẾT TỪ DATABASE
async function loadAdminPostList() {
    const tbody = document.getElementById('admin-post-list');
    if (!tbody) return;

    const posts = await API.getPosts();
    if (!posts || posts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="padding:20px; text-align:center; color:#94a3b8;">Chưa có bài viết nào.</td></tr>`;
        return;
    }

    allPosts = posts;
    let rowsHTML = '';
    posts.forEach(post => {
        const dateObj = new Date(post.created_at);
        const formattedDate = dateObj.toLocaleDateString('vi-VN');
        
        // Nhận diện tên chuyên mục động
        const catObj = blogCategories.find(c => c.id === post.category);
        const catName = catObj ? catObj.name : 'Chưa phân loại';
        
        rowsHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 15px 20px;">
                    <div style="width:60px; height:40px; background-image:url('${post.image_url || ''}'); background-size:cover; background-position:center; border-radius:6px; border:1px solid rgba(255,255,255,0.1);"></div>
                </td>
                <td style="padding: 15px 20px;">
                    <strong style="color:#fff; display:block; margin-bottom:5px;">${post.title}</strong>
                    <span style="color:var(--accent-glow); font-size:12px; font-weight:600; margin-right:15px;">📁 ${catName}</span>
                    <span style="color:#94a3b8; font-size:12px; font-family:monospace;">${post.slug}</span>
                </td>
                <td style="padding: 15px 20px; color:#cbd5e1; font-size: 13px;">${formattedDate}</td>
                <td style="padding: 15px 20px; text-align: right;">
                    <button onclick="prepareEditPost('${post.slug}')" style="background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; margin-right:5px;">Sửa</button>
                    <button onclick="deletePostAction('${post.id}')" style="background:#7f1d1d; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">Xóa</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHTML;
}

// 3. THÊM / CẬP NHẬT BÀI VIẾT
async function processSubmitPost() {
    const btn = document.getElementById('submitPostBtn');
    const id = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value.trim();
    const slug = document.getElementById('postSlug').value.trim().toLowerCase();
    const category = document.getElementById('postCategory').value;
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const content = tinymce.get('postContent').getContent();
    const imageFile = document.getElementById('postImage').files[0];

    if (!title || !slug || !excerpt || !content) {
        showAlert("Thiếu thông tin", "Sếp điền đầy đủ Tiêu đề, Slug, Trích dẫn và Nội dung nhé!", "warning");
        return;
    }

    if (!id && !imageFile) {
        showAlert("Thiếu ảnh bìa", "Bài viết mới cần có ảnh bìa (Thumbnail) để hiển thị ngoài web!", "warning");
        return;
    }

    btn.innerText = "ĐANG XỬ LÝ..."; 
    btn.disabled = true;

    try {
        if (!id || (id && allPosts.find(p => p.id === id).slug !== slug)) {
            const existingPost = await API.getPostBySlug(slug);
            if (existingPost) {
                showAlert("Trùng mã Link", "Mã Slug này đã tồn tại, sếp đổi mã khác nhé!", "error");
                btn.innerText = "LƯU VÀ XUẤT BẢN BÀI VIẾT"; btn.disabled = false;
                return;
            }
        }

        let imageUrl = null;
        if (imageFile) {
            btn.innerText = "ĐANG TẢI ẢNH BÌA...";
            imageUrl = await API.uploadImage(imageFile, 'posts');
        }

        const payload = {
            title: title,
            slug: slug,
            category: category,
            excerpt: excerpt,
            content: content
        };
        
        if (imageUrl) payload.image_url = imageUrl;
        if (id) payload.id = id;

        btn.innerText = "ĐANG GHI DỮ LIỆU VÀO DATABASE...";
        const { error } = await API.savePost(payload);

        if (error) {
            showAlert("Lỗi hệ thống", error.message, "error");
        } else {
            Swal.fire({ title: "Thành công!", text: "Đã lưu bài viết!", icon: "success", background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100' });
            
            document.getElementById('postForm').reset();
            document.getElementById('postId').value = '';
            tinymce.get('postContent').setContent('');
            
            window.scrollTo(0, 0);
            loadAdminPostList();
        }
    } catch (err) {
        console.error(err);
        showAlert("Lỗi!", "Có lỗi xảy ra khi lưu bài viết!", "error");
    }

    btn.innerText = "LƯU VÀ XUẤT BẢN BÀI VIẾT"; 
    btn.disabled = false;
}

// 4. BỐC DỮ LIỆU LÊN FORM ĐỂ SỬA
async function prepareEditPost(slug) {
    const post = allPosts.find(p => p.slug === slug);
    if (!post) return;

    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postSlug').value = post.slug;
    
    // Đẩy chuyên mục về form
    document.getElementById('postCategory').value = post.category || (blogCategories[0] ? blogCategories[0].id : '');
    document.getElementById('postExcerpt').value = post.excerpt;
    
    tinymce.get('postContent').setContent(post.content || '');
    document.getElementById('postImage').value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('submitPostBtn').innerText = "CẬP NHẬT BÀI VIẾT NÀY";
}

// 5. XÓA BÀI VIẾT
async function deletePostAction(id) {
    const result = await showConfirm("Xóa bài viết?", "Sếp có chắc chắn muốn XÓA VĨNH VIỄN bài viết này?");
    if (!result.isConfirmed) return;
    
    const success = await API.deletePost(id);
    if (success) {
        Swal.fire({ title: "Đã xóa!", icon: "success", background: '#1e293b', color: '#fff', timer: 1500, showConfirmButton: false });
        loadAdminPostList();
    } else {
        showAlert("Lỗi!", "Không thể xóa bài viết này!", "error");
    }
}