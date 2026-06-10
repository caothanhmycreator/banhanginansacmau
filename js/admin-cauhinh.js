// ==========================================
// BỘ NÃO ĐIỀU KHIỂN CẤU HÌNH MENU ĐỘNG (CÓ SẮP XẾP)
// ==========================================

let menuData = [];
let globalProdCats = [];
let globalBlogCats = [];
let globalGalleries = []; 

function initPageData() {
    loadMenuData();
}

async function loadMenuData() {
    const pData = await API.getSettings('product_categories');
    if (pData) globalProdCats = JSON.parse(pData);

    const bData = await API.getSettings('blog_categories');
    if (bData) globalBlogCats = JSON.parse(bData);

    const gData = await API.getSettings('template_galleries');
    if (gData) globalGalleries = JSON.parse(gData);

    const data = await API.getSettings('site_menu');
    if (data) {
        menuData = JSON.parse(data);
    } else {
        menuData = [];
    }
    renderMenuTree();
}

function renderMenuTree() {
    const container = document.getElementById('menu-tree-editor');
    if (!container) return;

    if (menuData.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 40px;">Chưa có Menu nào. Hãy bấm "Thêm Menu Cấp 1" ở góc trên.</div>`;
        return;
    }

    container.innerHTML = generateTreeHTML(menuData, 1);
}

function generateTreeHTML(items, level) {
    let html = `<ul class="menu-editor-list ${level === 1 ? 'root-list' : ''}">`;
    items.forEach((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        html += `
        <li class="menu-editor-item">
            <div class="menu-row">
                <div class="menu-info">
                    <strong>${item.label}</strong> 
                    <small>(${item.url || '#'})</small>
                </div>
                <div class="menu-actions">
                    ${!isFirst ? `<button onclick="moveNodeUp('${item.id}')" title="Di chuyển lên trên">▲</button>` : ''}
                    ${!isLast ? `<button onclick="moveNodeDown('${item.id}')" title="Di chuyển xuống dưới">▼</button>` : ''}
                    ${level < 3 ? `<button onclick="addNode('${item.id}')">+ Thêm menu con</button>` : ''}
                    <button onclick="editNode('${item.id}')">Sửa</button>
                    <button class="btn-del" onclick="deleteNode('${item.id}')">Xóa</button>
                </div>
            </div>
            ${item.children && item.children.length > 0 ? generateTreeHTML(item.children, level + 1) : ''}
        </li>`;
    });
    html += '</ul>';
    return html;
}

function findNodeAndParent(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) return { node: nodes[i], parentArray: nodes, index: i };
        if (nodes[i].children) {
            const result = findNodeAndParent(nodes[i].children, id);
            if (result) return result;
        }
    }
    return null;
}

function moveNodeUp(id) {
    const found = findNodeAndParent(menuData, id);
    if (found && found.index > 0) {
        const temp = found.parentArray[found.index];
        found.parentArray[found.index] = found.parentArray[found.index - 1];
        found.parentArray[found.index - 1] = temp;
        renderMenuTree(); 
    }
}

function moveNodeDown(id) {
    const found = findNodeAndParent(menuData, id);
    if (found && found.index < found.parentArray.length - 1) {
        const temp = found.parentArray[found.index];
        found.parentArray[found.index] = found.parentArray[found.index + 1];
        found.parentArray[found.index + 1] = temp;
        renderMenuTree(); 
    }
}

// MỚI: BỔ SUNG NHÓM OPTION ĐỒNG BỘ CẤP 2, CẤP 3 CHO KHO MẪU
function getMenuFormHTML(defaultLabel = '', defaultUrl = '') {
    let prodCatOptions = globalProdCats.map(c => `<option value="san-pham.html?sub=${c.id}">Sản phẩm: ${c.name}</option>`).join('');
    let blogCatOptions = globalBlogCats.map(c => `<option value="bai-viet.html?cat=${c.id}">Bài viết: ${c.name}</option>`).join('');
    let galleryDetailOptions = globalGalleries.map(g => `<option value="kho-mau.html?id=${g.slug}">Chi tiết: ${g.title}</option>`).join('');
    
    return `
        <div style="text-align:left; margin-bottom: 5px; font-size:13px; color:#94a3b8; font-weight:bold; text-transform: uppercase;">Tên hiển thị trên Menu:</div>
        <input id="swal-label" class="swal2-input" style="margin-top:0; width:100%; box-sizing:border-box;" value="${defaultLabel}" placeholder="VD: Khuyến Mãi">
        
        <div style="text-align:left; margin-top: 20px; margin-bottom: 5px; font-size:13px; color:#94a3b8; font-weight:bold; text-transform: uppercase;">Chọn nhanh Link hệ thống:</div>
        <select id="swal-url-select" class="swal2-input" style="margin-top:0; width:100%; box-sizing:border-box; background: rgba(0,0,0,0.3); color:#fff; cursor: pointer;" onchange="document.getElementById('swal-url').value = this.value === 'custom' ? '' : this.value;">
            <option value="custom">-- Chọn trang web / Chọn danh mục --</option>
            <optgroup label="TRANG TĨNH CƠ BẢN" style="background:#0f172a; color: #38bdf8;">
                <option value="index.html">Trang Chủ</option>
                <option value="kho-mau.html">Tất cả Kho Mẫu (Cấp 1)</option>
                <option value="san-pham.html">Tất cả Sản phẩm</option>
                <option value="bai-viet.html">Tất cả Bài viết</option>
                <option value="gioi-thieu.html">Giới thiệu</option>
                <option value="lien-he.html">Liên hệ</option>
            </optgroup>
            
            <optgroup label="DANH MỤC KHO MẪU (CẤP 2 & 3)" style="background:#0f172a; color: #a78bfa;">
                <option value="kho-mau.html?cat=thiep">📁 Cấp 2: Các loại Thiệp</option>
                <option value="kho-mau.html?cat=name-card">📁 Cấp 2: Name Card</option>
                <option value="kho-mau.html?cat=folder">📁 Cấp 2: Folder</option>
                <option value="kho-mau.html?sub=thiep-cuoi">↳ Cấp 3: Thiệp cưới</option>
                <option value="kho-mau.html?sub=thiep-sinh-nhat">↳ Cấp 3: Thiệp sinh nhật</option>
                <option value="kho-mau.html?sub=thiep-tan-gia">↳ Cấp 3: Thiệp tân gia</option>
            </optgroup>

            <optgroup label="CHI TIẾT TỪNG KHO MẪU" style="background:#0f172a; color: #f472b6;">
                ${galleryDetailOptions}
            </optgroup>

            <optgroup label="DANH MỤC SẢN PHẨM" style="background:#0f172a; color: #4ade80;">
                ${prodCatOptions}
            </optgroup>
            <optgroup label="CHUYÊN MỤC BÀI VIẾT" style="background:#0f172a; color: #facc15;">
                ${blogCatOptions}
            </optgroup>
        </select>
        
        <div style="text-align:left; margin-top: 20px; margin-bottom: 5px; font-size:13px; color:#94a3b8; font-weight:bold; text-transform: uppercase;">Hoặc tự nhập Link URL tùy chỉnh:</div>
        <input id="swal-url" class="swal2-input" style="margin-top:0; width:100%; box-sizing:border-box;" value="${defaultUrl}" placeholder="Ví dụ: https://zalo.me/0123456789">
    `;
}

async function addNode(parentId) {
    const { value: formValues } = await Swal.fire({
        title: parentId ? 'Thêm Menu Con' : 'Thêm Menu Cấp 1',
        html: getMenuFormHTML(),
        focusConfirm: false,
        background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100',
        preConfirm: () => {
            return {
                label: document.getElementById('swal-label').value,
                url: document.getElementById('swal-url').value
            }
        }
    });

    if (formValues && formValues.label) {
        const newNode = {
            id: Date.now().toString(),
            label: formValues.label,
            url: formValues.url || '#',
            children: []
        };

        if (parentId === null) {
            menuData.push(newNode);
        } else {
            const found = findNodeAndParent(menuData, parentId);
            if (found && found.node) {
                if (!found.node.children) found.node.children = [];
                found.node.children.push(newNode);
            }
        }
        renderMenuTree();
    }
}

async function editNode(id) {
    const found = findNodeAndParent(menuData, id);
    if (!found) return;

    const { value: formValues } = await Swal.fire({
        title: 'Sửa Menu',
        html: getMenuFormHTML(found.node.label, found.node.url),
        focusConfirm: false,
        background: '#1e293b', color: '#fff', confirmButtonColor: '#3b82f6', confirmButtonText: 'Cập Nhật',
        preConfirm: () => {
            return {
                label: document.getElementById('swal-label').value,
                url: document.getElementById('swal-url').value
            }
        }
    });

    if (formValues && formValues.label) {
        found.node.label = formValues.label;
        found.node.url = formValues.url || '#';
        renderMenuTree();
    }
}

async function deleteNode(id) {
    const result = await showConfirm("Xóa Menu?", "Sếp chắc chắn muốn xóa menu này (sẽ xóa luôn các menu con của nó)?");
    if (!result.isConfirmed) return;

    const found = findNodeAndParent(menuData, id);
    if (found) {
        found.parentArray.splice(found.index, 1);
        renderMenuTree();
    }
}

async function saveMenuToDatabase() {
    const btn = document.querySelector('.btn-submit');
    btn.innerText = "ĐANG LƯU DỮ LIỆU...";
    btn.disabled = true;

    const success = await API.updateSettings('site_menu', JSON.stringify(menuData));
    if (success) {
        Swal.fire({ title: "Thành công!", text: "Cấu trúc Menu đã được cập nhật ra ngoài trang chủ!", icon: "success", background: '#1e293b', color: '#fff', confirmButtonColor: '#E65100' });
    } else {
        showAlert("Lỗi!", "Có lỗi kết nối mạng, vui lòng thử lại!", "error");
    }

    btn.innerText = "LƯU LẠI TOÀN BỘ CẤU TRÚC MENU";
    btn.disabled = false;
}