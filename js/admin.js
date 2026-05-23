// 1. Hàm điều khiển chuyển đổi Tabs mượt mà trên Sidebar
function switchTab(tabId, element) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// 2. Logic thêm dòng Thông số kỹ thuật động
function addSpecRow() {
    const container = document.getElementById('specs-container');
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.innerHTML = `
        <input type="text" class="spec-key" placeholder="Tên (VD: Kích thước)">
        <input type="text" class="spec-val" placeholder="Giá trị (VD: 21x30cm)">
        <button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>
    `;
    container.appendChild(div);
}

// 3. Logic thêm dòng Gói giá động
function addTierRow() {
    const container = document.getElementById('tiers-container');
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.innerHTML = `
        <input type="text" class="tier-label" placeholder="Gói (VD: In 500 cái)">
        <input type="number" class="tier-price" placeholder="Giá lẻ từng cái">
        <button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>
    `;
    container.appendChild(div);
}

// Hàm tải danh sách sản phẩm hiển thị lên bảng quản trị
async function loadAdminProductList() {
    const tbody = document.getElementById('admin-product-list');
    if (!tbody) return;

    const products = await API.getProducts();
    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#94a3b8;">Chưa có sản phẩm nào trong hệ thống.</td></tr>`;
        return;
    }

    let rowsHTML = '';
    products.forEach(prod => {
        const formattedPrice = new Number(prod.price).toLocaleString('vi-VN') + ' đ';
        rowsHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); hover:background:rgba(255,255,255,0.01);">
                <td style="padding: 15px 20px;"><img src="${prod.image_url}" style="width:50px; height:50px; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.1);"></td>
                <td style="padding: 15px 20px; font-weight:600; color:#fff;">${prod.name}</td>
                <td style="padding: 15px 20px; color:#94a3b8; font-family:monospace;">${prod.slug}</td>
                <td style="padding: 15px 20px; color:var(--accent-glow); font-weight:700;">${formattedPrice}</td>
                <td style="padding: 15px 20px; text-align: right;">
                    <button type="button" onclick="prepareEditProduct('${prod.slug}')" style="background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">Sửa</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHTML;
}

// Hàm bốc dữ liệu sản phẩm đổ ngược lại vào Form để sửa
async function prepareEditProduct(slug) {
    const product = await API.getProductBySlug(slug);
    if (!product) {
        alert("Không tìm thấy dữ liệu sản phẩm!");
        return;
    }

    document.getElementById('prodId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodSlug').value = product.slug;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodDesc').value = product.description;
    document.getElementById('prodContent').value = product.content || '';

    const specsContainer = document.getElementById('specs-container');
    specsContainer.innerHTML = '';
    if (product.specs && Object.keys(product.specs).length > 0) {
        for (const [key, value] of Object.entries(product.specs)) {
            const div = document.createElement('div');
            div.className = 'dynamic-row';
            div.innerHTML = `
                <input type="text" class="spec-key" value="${key}" placeholder="Tên (VD: Kích thước)">
                <input type="text" class="spec-val" value="${value}" placeholder="Giá trị (VD: 21x30cm)">
                <button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>
            `;
            specsContainer.appendChild(div);
        }
    } else {
        specsContainer.innerHTML = '<div class="dynamic-row"><input type="text" class="spec-key" placeholder="Tên (VD: Chất liệu)"><input type="text" class="spec-val" placeholder="Giá trị (VD: Giấy C300)"></div>';
    }

    const tiersContainer = document.getElementById('tiers-container');
    tiersContainer.innerHTML = '';
    if (product.price_tiers && product.price_tiers.length > 0) {
        product.price_tiers.forEach(tier => {
            const div = document.createElement('div');
            div.className = 'dynamic-row';
            div.innerHTML = `
                <input type="text" class="tier-label" value="${tier.label}" placeholder="Gói (VD: In 200 cái)">
                <input type="number" class="tier-price" value="${tier.price}" placeholder="Giá tiền lẻ từng cái">
                <button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>
            `;
            tiersContainer.appendChild(div);
        });
    } else {
        tiersContainer.innerHTML = '<div class="dynamic-row"><input type="text" class="tier-label" placeholder="Gói (VD: In 200 cái)"><input type="number" class="tier-price" placeholder="Giá tiền lẻ từng cái"></div>';
    }

    document.getElementById('prodImage').required = false;
    document.getElementById('submitBtn').innerText = "CẬP NHẬT SẢN PHẨM";
    document.getElementById('cancelEditBtn').style.display = 'block';
    
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

// Hàm thoát khỏi chế độ sửa, đưa form về trạng thái đăng mới
function exitEditMode() {
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodImage').required = true;
    document.getElementById('submitBtn').innerText = "LƯU VÀ PHÁT HÀNH SẢN PHẨM";
    document.getElementById('cancelEditBtn').style.display = 'none';

    document.getElementById('specs-container').innerHTML = '<div class="dynamic-row"><input type="text" class="spec-key" placeholder="Tên (VD: Chất liệu)"><input type="text" class="spec-val" placeholder="Giá trị (VD: Giấy C300)"></div>';
    document.getElementById('tiers-container').innerHTML = '<div class="dynamic-row"><input type="text" class="tier-label" placeholder="Gói (VD: In 200 cái)"><input type="number" class="tier-price" placeholder="Giá tiền lẻ từng cái"></div>';
}

// 4. HÀM TỔNG QUẢN XỬ LÝ LƯU SẢN PHẨM 
async function processSubmitProduct() {
    const btn = document.getElementById('submitBtn');
    
    const id = document.getElementById('prodId').value; 
    const name = document.getElementById('prodName').value.trim();
    const slug = document.getElementById('prodSlug').value.trim().toLowerCase(); 
    const price = document.getElementById('prodPrice').value;
    const desc = document.getElementById('prodDesc').value.trim();
    const content = document.getElementById('prodContent').value.trim();
    const imageFile = document.getElementById('prodImage').files[0];
    const galleryFiles = document.getElementById('prodGallery').files; 

    if (!name || !slug || !price || !desc) {
        alert("Sếp ơi, vui lòng điền đầy đủ các mục bắt buộc nhé!");
        return;
    }

    if (!id && !imageFile) {
        alert("Sếp vui lòng chọn ảnh đại diện cho sản phẩm mới nhé!");
        return;
    }

    btn.disabled = true;

    try {
        if (!id) {
            btn.innerText = "ĐANG KIỂM TRA MÃ SLUG COI TRÙNG KHÔNG...";
            const { data: existingProd } = await supabaseClient
                .from('products')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (existingProd) {
                alert(`❌ Lỗi rồi sếp ơi! Mã ID "${slug}" này đã được dùng cho sản phẩm khác rồi. Sếp vui lòng đặt tên mã khác nhé!`);
                btn.innerText = "LƯU VÀ PHÁT HÀNH SẢN PHẨM";
                btn.disabled = false;
                return;
            }
        }

        let imageUrl = null;
        if (imageFile) {
            btn.innerText = "ĐANG TẢI ẢNH ĐẠI DIỆN MỚI...";
            imageUrl = await API.uploadImage(imageFile, 'products');
            if (!imageUrl) { throw new Error("Không tải được ảnh đại diện lên kho."); }
        }

        let galleryUrls = [];
        if (galleryFiles.length > 0) {
            for (let i = 0; i < galleryFiles.length; i++) {
                btn.innerText = `ĐANG TẢI THƯ VIỆN ẢNH (${i+1}/${galleryFiles.length})...`;
                const url = await API.uploadImage(galleryFiles[i], 'products/gallery'); 
                if (url) {
                    galleryUrls.push(url);
                }
            }
        }

        const specsObj = {};
        const specKeys = document.querySelectorAll('.spec-key');
        const specVals = document.querySelectorAll('.spec-val');
        specKeys.forEach((keyInput, i) => {
            const k = keyInput.value.trim();
            const v = specVals[i].value.trim();
            if (k && v) specsObj[k] = v;
        });

        const tiersArr = [];
        const tierLabels = document.querySelectorAll('.tier-label');
        const tierPrices = document.querySelectorAll('.tier-price');
        tierLabels.forEach((labelInput, i) => {
            const l = labelInput.value.trim();
            const p = parseFloat(tierPrices[i].value);
            if (l && !isNaN(p)) {
                tiersArr.push({ label: l, price: p });
            }
        });

        const finalPayload = {
            name: name,
            slug: slug,
            price: parseFloat(price),
            description: desc,
            content: content,
            specs: Object.keys(specsObj).length > 0 ? specsObj : null,
            price_tiers: tiersArr.length > 0 ? tiersArr : null
        };

        if (id) finalPayload.id = id;
        if (imageUrl) finalPayload.image_url = imageUrl;
        if (galleryUrls.length > 0) finalPayload.gallery = galleryUrls;

        btn.innerText = "ĐANG GHI DỮ LIỆU VÀO HỆ THỐNG...";
        const { error } = await API.saveProduct(finalPayload);

        if (error) {
            alert("Lỗi hệ thống: " + error.message);
        } else {
            alert(id ? "🎉 Cập nhật thông tin sản phẩm thành công!" : "🎉 Phát hành sản phẩm mới thành công!");
            exitEditMode(); 
            loadAdminProductList(); 
        }

    } catch (err) {
        console.error(err);
        alert("Có lỗi phát sinh trong quá trình xử lý!");
    }

    btn.disabled = false;
};

// ==========================================
// MỚI NÂNG CẤP: BỘ NÃO QUẢN LÝ ĐƠN HÀNG
// ==========================================

// Tải danh sách đơn hàng đổ vào bảng
async function loadAdminOrderList() {
    const tbody = document.getElementById('admin-order-list');
    if (!tbody) return;

    const orders = await API.getOrders();
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Chưa có đơn hàng nào. Gửi link cho khách vào test thử thôi sếp ơi!</td></tr>`;
        return;
    }

    let rowsHTML = '';
    orders.forEach(order => {
        // Xử lý ngày giờ
        const dateObj = new Date(order.created_at);
        const formattedDate = dateObj.toLocaleDateString('vi-VN') + ' - ' + dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        // Xử lý trạng thái hiển thị
        const status = order.status || 'Chờ xử lý'; 
        const statusColor = status === 'Đã xử lý' ? '#4ade80' : '#facc15';
        const adminNote = order.admin_note || '';

        rowsHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                <td style="padding: 15px 20px; color: #94a3b8; font-size: 13px;">${formattedDate}</td>
                <td style="padding: 15px 20px;">
                    <strong style="color:#fff; display:block; margin-bottom:5px; font-size: 15px;">${order.customer_name}</strong>
                    <span style="color:#38bdf8; font-weight: bold;">${order.customer_phone}</span>
                </td>
                <td style="padding: 15px 20px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                    <div><strong style="color:var(--accent-glow);">SP:</strong> <a href="/chi-tiet-san-pham.html?id=${order.product_slug}" target="_blank" style="color:#fff; text-decoration:none;">${order.product_name}</a></div>
                    <div><strong style="color:#fff;">Quy cách:</strong> ${order.package_selected !== 'Không chọn gói có sẵn' ? order.package_selected : order.custom_quantity}</div>
                    <div><strong style="color:#fff;">Tình trạng file:</strong> ${order.design_status}</div>
                    ${order.customer_note ? `<div style="color:#94a3b8; margin-top: 5px; font-style: italic;">" ${order.customer_note} "</div>` : ''}
                    ${adminNote ? `<div style="margin-top: 8px; padding: 8px 12px; background: rgba(0,0,0,0.3); border-left: 3px solid var(--accent); color: var(--accent-glow); border-radius: 4px; font-size: 13px;">Ghi chú nội bộ: ${adminNote}</div>` : ''}
                </td>
                <td style="padding: 15px 20px; text-align: center;">
                    <span style="background: rgba(255,255,255,0.05); border: 1px solid ${statusColor}; color: ${statusColor}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; display: inline-block;" onclick="toggleOrderStatus('${order.id}', '${status}')" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        ${status === 'Chờ xử lý' ? '⏳ Chờ xử lý' : '✅ Đã xử lý'}
                    </span>
                </td>
                <td style="padding: 15px 20px; text-align: right;">
                    <button type="button" onclick="prepareEditOrder('${order.id}', '${order.customer_name.replace(/'/g, "\\'")}', '${order.customer_phone.replace(/'/g, "\\'")}', '${adminNote.replace(/'/g, "\\'")}')" style="background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; margin-bottom: 8px; width: 100%; transition: 0.2s;">Sửa thông tin</button>
                    <button type="button" onclick="deleteOrderAction('${order.id}')" style="background:#7f1d1d; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; width: 100%; transition: 0.2s;">Xóa Đơn</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHTML;
}

// Bấm vào nút Trạng thái để đổi nhanh từ Chờ -> Đã xử lý
async function toggleOrderStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Đã xử lý' ? 'Chờ xử lý' : 'Đã xử lý';
    const result = await API.updateOrder(id, { status: newStatus });
    if (result.success) {
        loadAdminOrderList(); // Tải lại bảng để thấy màu đổi ngay
    } else {
        alert("Lỗi kết nối, chưa đổi được trạng thái!");
    }
}

// Bốc dữ liệu lên form Popup để Admin sửa
function prepareEditOrder(id, name, phone, adminNote) {
    document.getElementById('editOrderId').value = id;
    document.getElementById('editOrderName').value = name;
    document.getElementById('editOrderPhone').value = phone;
    document.getElementById('editOrderAdminNote').value = adminNote;
    
    document.getElementById('editOrderModal').style.display = 'flex';
}

// Ghi dữ liệu sửa đổi xuống Database
async function processUpdateOrder() {
    const id = document.getElementById('editOrderId').value;
    const name = document.getElementById('editOrderName').value.trim();
    const phone = document.getElementById('editOrderPhone').value.trim();
    const adminNote = document.getElementById('editOrderAdminNote').value.trim();

    if (!name || !phone) {
        alert("Không được để trống tên và số điện thoại khách hàng sếp ơi!");
        return;
    }

    const btn = document.querySelector('#editOrderModal .btn-submit');
    btn.innerText = "ĐANG LƯU...";
    btn.disabled = true;

    const result = await API.updateOrder(id, {
        customer_name: name,
        customer_phone: phone,
        admin_note: adminNote
    });

    if (result.success) {
        document.getElementById('editOrderModal').style.display = 'none';
        loadAdminOrderList(); 
    } else {
        alert("Có lỗi xảy ra khi lưu thay đổi!");
    }

    btn.innerText = "LƯU THAY ĐỔI";
    btn.disabled = false;
}

// Xóa vĩnh viễn đơn hàng
async function deleteOrderAction(id) {
    if (!confirm("⚠️ Sếp có chắc chắn muốn XÓA VĨNH VIỄN đơn đặt hàng này không? Dữ liệu sẽ không thể khôi phục!")) return;
    
    const success = await API.deleteOrder(id);
    if (success) {
        loadAdminOrderList();
    } else {
        alert("Lỗi hệ thống khi xóa đơn hàng!");
    }
}


// Tự động kích hoạt nạp danh sách Sản Phẩm VÀ Đơn Hàng ngay khi mở trang quản trị
document.addEventListener('DOMContentLoaded', () => {
    loadAdminProductList();
    loadAdminOrderList(); 
});