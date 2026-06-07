// ==========================================
// TRÍ TUỆ NHÂN BẢN TRANG CHI TIẾT BÀI VIẾT
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Đọc đuôi tham số trên thanh địa chỉ URL (?id=ma-slug-bai-viet)
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('id');

    const loading = document.getElementById('loading');
    const wrapper = document.getElementById('post-detail-wrapper');

    if (!postSlug) {
        loading.innerText = "Lỗi nghiêm trọng: Không tìm thấy định danh bài viết!";
        return;
    }

    // 2. Kích hoạt API liên lạc database Supabase để lấy dữ liệu bài viết theo Slug
    const post = await API.getPostBySlug(postSlug);

    if (!post) {
        loading.innerText = "Bài viết này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống Sắc Màu!";
        return;
    }

    // Tắt hiệu ứng chờ, giải phóng giao diện chính
    loading.style.display = 'none';
    if (wrapper) wrapper.style.display = 'block';

    // 3. ĐỔ DỮ LIỆU ĐÃ TRÍCH XUẤT LÊN CÁC KHUNG GIAO DIỆN HTML
    
    // Đổi tiêu đề thẻ tab trình duyệt chuẩn SEO
    document.title = post.title + " - In Ấn Sắc Màu";
    
    // Bơm tiêu đề bài viết và ngày tháng khởi tạo bài viết
    if (document.getElementById('post-title')) {
        document.getElementById('post-title').innerText = post.title;
    }
    
    if (document.getElementById('post-date')) {
        const dateObj = new Date(post.created_at);
        document.getElementById('post-date').innerText = dateObj.toLocaleDateString('vi-VN');
    }

    // Cập nhật Banner ảnh bìa bài viết
    if (document.getElementById('post-banner-img')) {
        document.getElementById('post-banner-img').style.backgroundImage = `url('${post.image_url}')`;
    }

    // Bơm mã HTML nội dung bài viết chi tiết (Chứa toàn bộ định dạng, ảnh chèn, link youtube...)
    if (document.getElementById('post-main-content')) {
        document.getElementById('post-main-content').innerHTML = post.content || "<p>Nội dung bài viết đang được cập nhật...</p>";
    }
});