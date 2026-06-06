// ==========================================
// CẤU HÌNH GIAO DIỆN SWEETALERT2 (TÔNG TỐI)
// ==========================================
const showAlert = (title, text, icon) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#E65100'
    });
};

const showConfirm = (title, text) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#475569',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    });
};

// ==========================================
// QUẢN LÝ SẢN PHẨM (TÌM KIẾM & PHÂN TRANG)
// ==========================================

let allProducts = []; 
let filteredProducts = []; 
let currentPage = 1;
const ITEMS_PER_PAGE = 50; 

function switchTab(tabId, element) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// Tải toàn bộ sản phẩm vào bộ nhớ đệm
async function loadAdminProductList() {
    const tbody = document.getElementById('admin-product-list');
    if (!tbody) return;

    const products = await API.getProducts();
    if (!products) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#94a3b8;">Lỗi tải dữ liệu hệ thống.</td></tr>`;
        return;
    }

    allProducts = products;
    filteredProducts = [...allProducts]; 
    currentPage = 1;

    renderProductTable();
}

// Tìm kiếm trực tiếp siêu tốc độ
function filterProducts() {
    const keyword = document.getElementById('searchProductInput').value.toLowerCase().trim();
    
    filteredProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.slug.toLowerCase().includes(keyword)
    );
    
    currentPage = 1; 
    renderProductTable();
}

// Render dữ liệu bảng sản phẩm & Chia phân trang
function renderProductTable() {
    const tbody = document.getElementById('admin-product-list');
    const paginationContainer = document.getElementById('productPagination');
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#94a3b8;">Không tìm thấy sản phẩm nào phù hợp.</td></tr>`;
        paginationContainer.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = filteredProducts.slice(startIndex, endIndex);

    let rowsHTML = '';
    pageData.forEach(prod => {
        const formattedPrice = new Number(prod.price).toLocaleString('vi-VN') + ' đ';
        rowsHTML += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); hover:background:rgba(255,255,255,0.01);">
                <td style="padding: 15px 20px;"><img src="${prod.image_url}" style="width:50px; height:50px; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.1);"></td>
                <td style="padding: 15px 20px; font-weight:600; color:#fff;">${prod.name}</td>
                <td style="padding: 15px 20px; color:#94a3b8; font-family:monospace;">${prod.slug}</td>
                <td style="padding: 15px 20px; color:var(--accent-glow); font-weight:700;">${formattedPrice}</td>
                <td style="padding: 15px 20px; text-align: right; white-space: nowrap;">
                    <button type="button" onclick="prepareEditProduct('${prod.slug}')" style="background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; margin-right:5px;">Sửa</button>
                    <button type="button" onclick="deleteProductAction('${prod.id}')" style="background:#7f1d1d; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">Xóa</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHTML;

    // Tính toán số nút chuyển trang
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let pageHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage ? 'background: var(--accent); font-weight: 800;' : 'background: rgba(255,255,255,0.08);';
        pageHTML += `<button onclick="goToPage(${i})" style="padding: 8px 14px; ${isActive} color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; transition: 0.2s;">${i}</button>`;
    }
    paginationContainer.innerHTML = pageHTML;
}

function goToPage(pageNumber) {
    currentPage = pageNumber;
    renderProductTable();
}

async function deleteProductAction(id) {
    const result = await showConfirm(
        "Xóa vĩnh viễn?", 
        "Sếp có chắc chắn muốn XÓA VĨNH VIỄN sản phẩm này không? Dữ liệu không thể khôi phục!"
    );
    if (!result.isConfirmed) return;
    
    const success = await API.deleteProduct(id);
    if (success) {
        Swal.fire({ title: "Đã xóa!", text: "Sản phẩm đã bị gỡ khỏi hệ thống thương mại.", icon: "success", background: '#1e293b', color: '#fff', timer: 2000, showConfirmButton: false });
        loadAdminProductList(); 
    } else {
        showAlert("Lỗi!", "Hệ thống không xóa được sản phẩm!", "error");
    }
}

// ==========================================
// CÁC HÀM CHO FORM ĐĂNG MỚI CHÍNH
// ==========================================

function addSpecRow() {
    const container = document.getElementById('specs-container');
    const div = document.createElement('div'); div.className = 'dynamic-row';
    div.innerHTML = `<input type="text" class="spec-key" placeholder="Tên (VD: Kích thước)"><input type="text" class="spec-val" placeholder="Giá trị (VD: 21x30cm)"><button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>`;
    container.appendChild(div);
}

function addTierRow() {
    const container = document.getElementById('tiers-container');
    const div = document.createElement('div'); div.className = 'dynamic-row';
    div.innerHTML = `<input type="text" class="tier-label" placeholder="Gói (VD: In 500 cái)"><input type="number" class="tier-price" placeholder="Giá lẻ từng cái"><button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>`;
    container.appendChild(div);
}

async function processSubmitProduct() {
    const btn = document.getElementById('submitBtn');
    const name = document.getElementById('prodName').value.trim();
    const slug = document.getElementById('prodSlug').value.trim().toLowerCase(); 
    const price = document.getElementById('prodPrice').value;
    const desc = document.getElementById('prodDesc').value.trim();
    const content = document.getElementById('prodContent').value.trim();
    const imageFile = document.getElementById('prodImage').files[0];
    const galleryFiles = document.getElementById('prodGallery').files; 

    if (!name || !slug || !price || !desc) {
        showAlert("Thiếu thông tin", "Vui lòng điền đầy đủ các mục bắt buộc nhé!", "warning"); return;
    }
    if (!imageFile) {
        showAlert("Thiếu ảnh", "Vui lòng chọn ảnh đại diện cho sản phẩm mới nhé!", "warning"); return;
    }

    btn.disabled = true;

    try {
        btn.innerText = "ĐANG KIỂM TRA MÃ SLUG...";
        const { data: existingProd } = await supabaseClient.from('products').select('id').eq('slug', slug).maybeSingle();

        if (existingProd) {
            showAlert("Trùng mã ID", `❌ Mã ID "${slug}" này đã được dùng. Vui lòng đặt mã khác nhé sếp!`, "error");
            btn.innerText = "LƯU VÀ PHÁT HÀNH SẢN PHẨM"; btn.disabled = false; return;
        }

        btn.innerText = "ĐANG TẢI ẢNH ĐẠI DIỆN MỚI...";
        const imageUrl = await API.uploadImage(imageFile, 'products');
        if (!imageUrl) throw new Error("Không tải được ảnh đại diện.");

        let galleryUrls = [];
        if (galleryFiles.length > 0) {
            for (let i = 0; i < galleryFiles.length; i++) {
                btn.innerText = `ĐANG TẢI THƯ VIỆN ẢNH (${i+1}/${galleryFiles.length})...`;
                const url = await API.uploadImage(galleryFiles[i], 'products/gallery'); 
                if (url) galleryUrls.push(url);
            }
        }

        const specsObj = {};
        document.querySelectorAll('#specs-container .dynamic-row').forEach(row => {
            const k = row.querySelector('.spec-key').value.trim();
            const v = row.querySelector('.spec-val').value.trim();
            if (k && v) specsObj[k] = v;
        });

        const tiersArr = [];
        document.querySelectorAll('#tiers-container .dynamic-row').forEach(row => {
            const l = row.querySelector('.tier-label').value.trim();
            const p = parseFloat(row.querySelector('.tier-price').value);
            if (l && !isNaN(p)) tiersArr.push({ label: l, price: p });
        });

        const finalPayload = {
            name: name, slug: slug, price: parseFloat(price), description: desc, content: content,
            specs: Object.keys(specsObj).length > 0 ? specsObj : null,
            price_tiers: tiersArr.length > 0 ? tiersArr : null,
            image_url: imageUrl,
            gallery: galleryUrls.length > 0 ? galleryUrls : null
        };

        btn.innerText = "ĐANG GHI DỮ LIỆU VÀO HỆ THỐNG...";
        const { error } = await API.saveProduct(finalPayload);

        if (error) { showAlert("Lỗi hệ thống", error.message, "error"); } 
        else {
            Swal.fire({ title: "Thành công!", text: "Phát hành sản phẩm mới thành công!", icon: "success", background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100' });
            document.getElementById('productForm').reset();
            loadAdminProductList(); 
        }
    } catch (err) {
        console.error(err); showAlert("Lỗi!", "Có lỗi phát sinh trong quá trình xử lý!", "error");
    }
    btn.innerText = "LƯU VÀ PHÁT HÀNH SẢN PHẨM"; btn.disabled = false;
}

// ==========================================
// CÁC HÀM CHO POPUP CHỈNH SỬA SẢN PHẨM
// ==========================================

function addEditSpecRow() {
    const container = document.getElementById('edit-specs-container');
    const div = document.createElement('div'); div.className = 'dynamic-row';
    div.innerHTML = `<input type="text" class="edit-spec-key" placeholder="Tên (VD: Kích thước)"><input type="text" class="edit-spec-val" placeholder="Giá trị (VD: 21x30cm)"><button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>`;
    container.appendChild(div);
}

function addEditTierRow() {
    const container = document.getElementById('edit-tiers-container');
    const div = document.createElement('div'); div.className = 'dynamic-row';
    div.innerHTML = `<input type="text" class="edit-tier-label" placeholder="Gói (VD: In 500 cái)"><input type="number" class="edit-tier-price" placeholder="Giá lẻ từng cái"><button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>`;
    container.appendChild(div);
}

// Đẩy ngược dữ liệu lên POPUP lớn để Sửa
async function prepareEditProduct(slug) {
    const product = await API.getProductBySlug(slug);
    if (!product) { showAlert("Lỗi!", "Không tìm thấy dữ liệu sản phẩm!", "error"); return; }

    document.getElementById('editProdId').value = product.id;
    document.getElementById('editProdName').value = product.name;
    document.getElementById('editProdSlug').value = product.slug; // Mở khóa cho sửa
    document.getElementById('editProdPrice').value = product.price;
    document.getElementById('editProdDesc').value = product.description;
    document.getElementById('editProdContent').value = product.content || '';

    const specsContainer = document.getElementById('edit-specs-container');
    specsContainer.innerHTML = '';
    if (product.specs && Object.keys(product.specs).length > 0) {
        for (const [key, value] of Object.entries(product.specs)) {
            const div = document.createElement('div'); div.className = 'dynamic-row';
            div.innerHTML = `<input type="text" class="edit-spec-key" value="${key}"><input type="text" class="edit-spec-val" value="${value}"><button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>`;
            specsContainer.appendChild(div);
        }
    } else {
        specsContainer.innerHTML = '<div class="dynamic-row"><input type="text" class="edit-spec-key" placeholder="Chất liệu"><input type="text" class="edit-spec-val" placeholder="Giấy C300"></div>';
    }

    const tiersContainer = document.getElementById('edit-tiers-container');
    tiersContainer.innerHTML = '';
    if (product.price_tiers && product.price_tiers.length > 0) {
        product.price_tiers.forEach(tier => {
            const div = document.createElement('div'); div.className = 'dynamic-row';
            div.innerHTML = `<input type="text" class="edit-tier-label" value="${tier.label}"><input type="number" class="edit-tier-price" value="${tier.price}"><button type="button" class="btn-del" onclick="this.parentElement.remove()">Xóa</button>`;
            tiersContainer.appendChild(div);
        });
    } else {
        tiersContainer.innerHTML = '<div class="dynamic-row"><input type="text" class="edit-tier-label" placeholder="In 200 cái"><input type="number" class="edit-tier-price" placeholder="15000"></div>';
    }

    document.getElementById('editProdImage').value = ""; 
    document.getElementById('editProdGallery').value = "";
    document.getElementById('editProductModal').style.display = 'flex'; 
}

// Lưu thay đổi từ Popup (Hỗ trợ đổi cả Mã ID/Slug)
async function processUpdateProduct() {
    const btn = document.getElementById('btnUpdateProduct');
    const id = document.getElementById('editProdId').value; 
    const name = document.getElementById('editProdName').value.trim();
    const slug = document.getElementById('editProdSlug').value.trim().toLowerCase(); 
    const price = document.getElementById('editProdPrice').value;
    const desc = document.getElementById('editProdDesc').value.trim();
    const content = document.getElementById('editProdContent').value.trim();
    const imageFile = document.getElementById('editProdImage').files[0];
    const galleryFiles = document.getElementById('editProdGallery').files; 

    if (!name || !slug || !price || !desc) {
        showAlert("Thiếu thông tin", "Vui lòng điền đầy đủ Tên, Mã ID, Giá và Mô tả!", "warning"); return;
    }

    btn.disabled = true;
    btn.innerText = "ĐANG XỬ LÝ...";

    try {
        // NÂNG CẤP: Kiểm tra chống trùng mã Slug với các sản phẩm KHÁC trong DB
        btn.innerText = "ĐANG KIỂM TRA MÃ ID...";
        const { data: existingProd } = await supabaseClient
            .from('products')
            .select('id')
            .eq('slug', slug)
            .neq('id', id) // Ngoại trừ chính sản phẩm đang sửa
            .maybeSingle();

        if (existingProd) {
            showAlert("Trùng mã ID", `❌ Mã ID "${slug}" này đã được dùng cho sản phẩm khác rồi. Vui lòng đặt mã khác!`, "error");
            btn.innerText = "LƯU THAY ĐỔI"; btn.disabled = false; return;
        }

        let imageUrl = null;
        if (imageFile) {
            btn.innerText = "ĐANG TẢI ẢNH ĐẠI DIỆN MỚI...";
            imageUrl = await API.uploadImage(imageFile, 'products');
        }

        let galleryUrls = [];
        if (galleryFiles.length > 0) {
            for (let i = 0; i < galleryFiles.length; i++) {
                btn.innerText = `ĐANG TẢI ẢNH PHỤ (${i+1}/${galleryFiles.length})...`;
                const url = await API.uploadImage(galleryFiles[i], 'products/gallery'); 
                if (url) galleryUrls.push(url);
            }
        }

        const specsObj = {};
        document.querySelectorAll('#edit-specs-container .dynamic-row').forEach(row => {
            const k = row.querySelector('.edit-spec-key').value.trim();
            const v = row.querySelector('.edit-spec-val').value.trim();
            if (k && v) specsObj[k] = v;
        });

        const tiersArr = [];
        document.querySelectorAll('#edit-tiers-container .dynamic-row').forEach(row => {
            const l = row.querySelector('.edit-tier-label').value.trim();
            const p = parseFloat(row.querySelector('.edit-tier-price').value);
            if (l && !isNaN(p)) tiersArr.push({ label: l, price: p });
        });

        const finalPayload = {
            id: id, name: name, slug: slug, price: parseFloat(price), description: desc, content: content,
            specs: Object.keys(specsObj).length > 0 ? specsObj : null,
            price_tiers: tiersArr.length > 0 ? tiersArr : null
        };
        if (imageUrl) finalPayload.image_url = imageUrl;
        if (galleryUrls.length > 0) finalPayload.gallery = galleryUrls; 

        btn.innerText = "ĐANG GHI DỮ LIỆU...";
        const { error } = await API.saveProduct(finalPayload);

        if (error) {
            showAlert("Lỗi hệ thống", error.message, "error");
        } else {
            Swal.fire({ title: "Thành công!", text: "Cập nhật thông tin sản phẩm xong sếp ơi!", icon: "success", background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100' });
            document.getElementById('editProductModal').style.display = 'none';
            loadAdminProductList(); 
        }
    } catch (err) {
        console.error(err); showAlert("Lỗi!", "Có lỗi phát sinh!", "error");
    }
    btn.innerText = "LƯU THAY ĐỔI"; btn.disabled = false;
}

// ==========================================
// BỘ NÃO QUẢN LÝ ĐƠN HÀNG
// ==========================================

async function loadAdminOrderList() {
    const tbody = document.getElementById('admin-order-list');
    if (!tbody) return;

    const orders = await API.getOrders();
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Chưa có đơn hàng nào.</td></tr>`;
        return;
    }

    let rowsHTML = '';
    orders.forEach(order => {
        const dateObj = new Date(order.created_at);
        const formattedDate = dateObj.toLocaleDateString('vi-VN') + ' - ' + dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
                    <button type="button" onclick="prepareEditOrder('${order.id}', '${order.customer_name.replace(/'/g, "\\'")}', '${order.customer_phone.replace(/'/g, "\\'")}', '${adminNote.replace(/'/g, "\\'")}')" style="background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; margin-bottom: 8px; width: 100%; transition: 0.2s;">Sửa</button>
                    <button type="button" onclick="deleteOrderAction('${order.id}')" style="background:#7f1d1d; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px; width: 100%; transition: 0.2s;">Xóa</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHTML;
}

async function toggleOrderStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Đã xử lý' ? 'Chờ xử lý' : 'Đã xử lý';
    const result = await API.updateOrder(id, { status: newStatus });
    if (result.success) { loadAdminOrderList(); } 
    else { showAlert("Lỗi!", "Lỗi kết nối, chưa đổi được trạng thái!", "error"); }
}

function prepareEditOrder(id, name, phone, adminNote) {
    document.getElementById('editOrderId').value = id;
    document.getElementById('editOrderName').value = name;
    document.getElementById('editOrderPhone').value = phone;
    document.getElementById('editOrderAdminNote').value = adminNote;
    document.getElementById('editOrderModal').style.display = 'flex';
}

async function processUpdateOrder() {
    const id = document.getElementById('editOrderId').value;
    const name = document.getElementById('editOrderName').value.trim();
    const phone = document.getElementById('editOrderPhone').value.trim();
    const adminNote = document.getElementById('editOrderAdminNote').value.trim();

    if (!name || !phone) { showAlert("Thiếu thông tin", "Không để trống tên và SĐT sếp ơi!", "warning"); return; }

    const btn = document.querySelector('#editOrderModal .btn-submit');
    btn.innerText = "ĐANG LƯU..."; btn.disabled = true;

    const result = await API.updateOrder(id, { customer_name: name, customer_phone: phone, admin_note: adminNote });

    if (result.success) {
        document.getElementById('editOrderModal').style.display = 'none';
        loadAdminOrderList(); 
    } else { showAlert("Lỗi!", "Có lỗi xảy ra khi lưu thay đổi!", "error"); }

    btn.innerText = "LƯU THAY ĐỔI"; btn.disabled = false;
}

async function deleteOrderAction(id) {
    const result = await showConfirm("Xóa đơn hàng?", "⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn đặt hàng này không?");
    if (!result.isConfirmed) return;
    
    const success = await API.deleteOrder(id);
    if (success) { loadAdminOrderList(); } 
    else { showAlert("Lỗi!", "Lỗi hệ thống khi xóa đơn hàng!", "error"); }
}

// ==========================================
// BỘ NÃO QUẢN LÝ TRANG GIỚI THIỆU
// ==========================================

let existingIntroGallery = []; 

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
        } catch (e) { console.error("Lỗi đọc dữ liệu Intro:", e); }
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
    btn.innerText = "ĐANG XỬ LÝ DỮ LIỆU..."; btn.disabled = true;

    try {
        const files = document.getElementById('introGallery').files;
        let newUrls = [];
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                btn.innerText = `ĐANG TẢI ẢNH SLIDE (${i+1}/${files.length})...`;
                const url = await API.uploadImage(files[i], 'intro');
                if (url) newUrls.push(url);
            }
        }

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
            Swal.fire({ title: "Thành công!", text: "Đã lưu cấu hình trang Giới Thiệu thành công!", icon: "success", background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100' });
            existingIntroGallery = finalGallery;
            renderIntroGalleryPreview();
            document.getElementById('introGallery').value = ""; 
        } else { showAlert("Lỗi!", "Lỗi kết nối khi lưu dữ liệu!", "error"); }
    } catch (err) {
        console.error(err); showAlert("Lỗi!", "Lỗi phát sinh trong quá trình lưu!", "error");
    }

    btn.innerText = "LƯU CẤU HÌNH TRANG GIỚI THIỆU"; btn.disabled = false;
}

// Khởi động đồng bộ hệ thống quản trị
document.addEventListener('DOMContentLoaded', () => {
    loadAdminProductList();
    loadAdminOrderList(); 
    loadIntroData(); 
});