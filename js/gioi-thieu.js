document.addEventListener('DOMContentLoaded', async () => {
    const wrapper = document.getElementById('intro-wrapper');
    const loading = document.getElementById('loading');

    // 1. Tải dữ liệu từ database
    const dataString = await API.getSettings('page_intro');
    
    if (!dataString) {
        loading.innerText = "Chưa có dữ liệu trang giới thiệu. Admin vui lòng cập nhật nội dung!";
        return;
    }

    try {
        const data = JSON.parse(dataString);

        // 2. Ẩn loading, nạp dữ liệu
        loading.style.display = 'none';
        wrapper.style.display = 'block';

        // Bơm Tiêu đề
        if (data.title) {
            document.title = data.title + " - In Ấn Sắc Màu";
            document.getElementById('intro-title').innerText = data.title;
        }

        // Bơm Bài viết
        document.getElementById('intro-content').innerHTML = data.content || "Nội dung đang cập nhật...";
        
        // Bơm Thông tin liên hệ
        document.getElementById('intro-contact').innerText = data.contact || "Đang cập nhật...";

        // Bơm Iframe Bản đồ
        if (data.map) {
            document.getElementById('intro-map').innerHTML = data.map;
        } else {
            document.getElementById('intro-map').innerHTML = "<p style='color:#94a3b8; text-align:center;'>Chưa có bản đồ</p>";
        }

        // 3. Xử lý Thư viện ảnh (Slider)
        const sliderContainer = document.getElementById('intro-slider');
        if (data.gallery && data.gallery.length > 0) {
            let sliderHTML = '';
            data.gallery.forEach(url => {
                sliderHTML += `<div class="intro-slide-img" style="background-image: url('${url}')"></div>`;
            });
            sliderContainer.innerHTML = sliderHTML;

            // Kích hoạt logic Auto-slide nếu có nhiều hơn 1 ảnh
            if (data.gallery.length > 1) {
                startIntroAutoSlide(data.gallery.length);
            }
        } else {
            sliderContainer.innerHTML = `<div class="intro-slide-img" style="background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; color:#94a3b8;">Chưa có hình ảnh giới thiệu</div>`;
        }

    } catch (e) {
        console.error("Lỗi parse dữ liệu Intro:", e);
        loading.innerText = "Đã xảy ra lỗi khi đọc dữ liệu!";
    }
});

// LOGIC AUTO SLIDE TRƯỢT NGANG
function startIntroAutoSlide(totalSlides) {
    let currentIndex = 0;
    const slider = document.getElementById('intro-slider');
    
    setInterval(() => {
        currentIndex++;
        // Nếu chạy tới ảnh cuối cùng thì quay lại ảnh đầu
        if (currentIndex >= totalSlides) {
            currentIndex = 0;
        }
        // Trượt CSS sang trái: -100%, -200%...
        const translateX = -(currentIndex * 100);
        slider.style.transform = `translateX(${translateX}%)`;
    }, 3500); // 3.5 giây trượt 1 lần
}