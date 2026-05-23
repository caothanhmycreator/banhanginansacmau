document.addEventListener('DOMContentLoaded', async () => {
    // 1. Tải sản phẩm lên Hero
    const products = await API.getProducts();
    const list = document.getElementById('hero-products-list');
    if (products && products.length > 0) {
        let html = '';
        // Lấy 4 sản phẩm đầu tiên
        products.slice(0, 4).forEach(p => {
            html += `
                <div class="hero-prod-card">
                    <div class="hero-prod-img" style="background-image: url('${p.image_url}')"></div>
                    <div class="hero-prod-name">${p.name}</div>
                </div>
            `;
        });
        list.innerHTML = html;
    }
});

// Logic Modal (copy từ trang chi tiết)
function openOrderModal() { document.getElementById('orderModal').style.display = 'flex'; }
function closeOrderModal() { document.getElementById('orderModal').style.display = 'none'; }

async function processFinalOrder() {
    const name = document.getElementById('cusName').value;
    const phone = document.getElementById('cusPhone').value;
    const note = document.getElementById('orderNote').value;
    
    if(!name || !phone) { alert("Vui lòng nhập tên và SĐT!"); return; }
    
    const payload = {
        customer_name: name,
        customer_phone: phone,
        customer_note: note,
        product_name: 'Yêu cầu từ trang chủ',
        package_selected: 'N/A'
    };
    
    await API.submitOrder(payload);
    alert("Cảm ơn sếp! Đơn vị sẽ liên hệ ngay.");
    closeOrderModal();
}