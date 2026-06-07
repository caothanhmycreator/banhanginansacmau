// ==========================================
// BỘ NÃO ĐIỀU KHIỂN RIÊNG TRANG SẢN PHẨM
// ==========================================

let allProducts = []; 
let filteredProducts = []; 
let currentPage = 1;
const ITEMS_PER_PAGE = 50; 

// Hàm này sẽ được gọi tự động bởi admin-auth.js sau khi nhập đúng mật khẩu
function initPageData() {
    loadAdminProductList();
}

// ------------------------------------------
// PHẦN 1: NẠP & TÌM KIẾM DỮ LIỆU
// ------------------------------------------
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

function filterProducts() {
    const keyword = document.getElementById('searchProductInput').value.toLowerCase().trim();
    filteredProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.slug.toLowerCase().includes(keyword)
    );
    currentPage = 1; 
    renderProductTable();
}

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

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) { paginationContainer.innerHTML = ''; return; }

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

// ------------------------------------------
// PHẦN 2: THÊM DÒNG THÔNG SỐ & GÓI GIÁ
// ------------------------------------------
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

// ------------------------------------------
// PHẦN 3: XỬ LÝ DATABASE (THÊM, SỬA, XÓA)
// ------------------------------------------
async function deleteProductAction(id) {
    const result = await showConfirm("Xóa vĩnh viễn?", "Sếp có chắc chắn muốn XÓA VĨNH VIỄN sản phẩm này không?");
    if (!result.isConfirmed) return;
    
    const success = await API.deleteProduct(id);
    if (success) {
        Swal.fire({ title: "Đã xóa!", text: "Sản phẩm đã bị gỡ khỏi hệ thống.", icon: "success", background: '#1e293b', color: '#fff', timer: 2000, showConfirmButton: false });
        loadAdminProductList(); 
    } else {
        showAlert("Lỗi!", "Hệ thống không xóa được sản phẩm!", "error");
    }
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

// Gọi Popup Sửa
async function prepareEditProduct(slug) {
    const product = await API.getProductBySlug(slug);
    if (!product) { showAlert("Lỗi!", "Không tìm thấy dữ liệu sản phẩm!", "error"); return; }

    document.getElementById('editProdId').value = product.id;
    document.getElementById('editProdName').value = product.name;
    document.getElementById('editProdSlug').value = product.slug; 
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

// Lưu Sửa
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
        btn.innerText = "ĐANG KIỂM TRA MÃ ID...";
        const { data: existingProd } = await supabaseClient
            .from('products')
            .select('id')
            .eq('slug', slug)
            .neq('id', id) 
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