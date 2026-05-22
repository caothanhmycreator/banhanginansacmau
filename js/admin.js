async function submitProduct() {
    const btn = document.getElementById('submitBtn');
    const statusMsg = document.getElementById('status-message');
    
    // Lấy dữ liệu từ các ô nhập
    const name = document.getElementById('prodName').value;
    const price = document.getElementById('prodPrice').value;
    const desc = document.getElementById('prodDesc').value;
    const imageFile = document.getElementById('prodImage').files[0];

    // Kiểm tra xem đã điền đủ chưa
    if (!name || !price || !desc || !imageFile) {
        alert("Sếp vui lòng điền đủ thông tin và chọn ảnh nhé!");
        return;
    }

    // Đổi trạng thái nút bấm
    btn.innerText = "ĐANG TẢI LÊN...";
    btn.disabled = true;

    try {
        // 1. Đẩy ảnh lên Supabase Storage trước
        const imageUrl = await API.uploadImage(imageFile, 'products');
        
        if (!imageUrl) {
            alert("Lỗi tải ảnh lên! Sếp kiểm tra lại Storage bucket nhé.");
            btn.innerText = "LƯU SẢN PHẨM";
            btn.disabled = false;
            return;
        }

        // 2. Gom dữ liệu lại
        const productData = {
            name: name,
            price: parseFloat(price),
            description: desc,
            image_url: imageUrl
        };

        // 3. Lưu vào Database
        const { error } = await API.saveProduct(productData);

        if (error) {
            console.error(error);
            alert("Lỗi lưu dữ liệu: " + error.message);
        } else {
            statusMsg.innerText = "🎉 Lưu sản phẩm thành công!";
            document.getElementById('productForm').reset(); // Xóa trắng form để nhập cái mới
        }
    } catch (err) {
        console.error(err);
        alert("Có lỗi bất ngờ xảy ra!");
    }

    // Trả lại trạng thái nút bấm
    btn.innerText = "LƯU SẢN PHẨM";
    btn.disabled = false;
}