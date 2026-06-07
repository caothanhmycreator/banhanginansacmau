// ==========================================
// BỘ NÃO ĐIỀU KHIỂN RIÊNG TRANG ĐƠN HÀNG
// ==========================================

// Hàm này sẽ được gọi tự động bởi admin-auth.js sau khi đăng nhập thành công
function initPageData() {
    loadAdminOrderList();
}

async function loadAdminOrderList() {
    const tbody = document.getElementById('admin-order-list');
    if (!tbody) return;

    const orders = await API.getOrders();
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">Chưa có đơn hàng nào trong hệ thống.</td></tr>`;
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

// Chuyển đổi nhanh trạng thái Đã Xử Lý / Chờ Xử Lý
async function toggleOrderStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Đã xử lý' ? 'Chờ xử lý' : 'Đã xử lý';
    const result = await API.updateOrder(id, { status: newStatus });
    if (result.success) { 
        loadAdminOrderList(); 
    } else { 
        showAlert("Lỗi!", "Lỗi kết nối, chưa đổi được trạng thái!", "error"); 
    }
}

// Bốc dữ liệu lên form Popup
function prepareEditOrder(id, name, phone, adminNote) {
    document.getElementById('editOrderId').value = id;
    document.getElementById('editOrderName').value = name;
    document.getElementById('editOrderPhone').value = phone;
    document.getElementById('editOrderAdminNote').value = adminNote;
    document.getElementById('editOrderModal').style.display = 'flex';
}

// Cập nhật thông tin đơn hàng
async function processUpdateOrder() {
    const id = document.getElementById('editOrderId').value;
    const name = document.getElementById('editOrderName').value.trim();
    const phone = document.getElementById('editOrderPhone').value.trim();
    const adminNote = document.getElementById('editOrderAdminNote').value.trim();

    if (!name || !phone) { 
        showAlert("Thiếu thông tin", "Không để trống tên và số điện thoại sếp ơi!", "warning"); 
        return; 
    }

    const btn = document.querySelector('#editOrderModal .btn-submit');
    btn.innerText = "ĐANG LƯU..."; 
    btn.disabled = true;

    const result = await API.updateOrder(id, { customer_name: name, customer_phone: phone, admin_note: adminNote });

    if (result.success) {
        document.getElementById('editOrderModal').style.display = 'none';
        loadAdminOrderList(); 
    } else { 
        showAlert("Lỗi!", "Có lỗi xảy ra khi lưu thay đổi!", "error"); 
    }

    btn.innerText = "LƯU THAY ĐỔI"; 
    btn.disabled = false;
}

// Xóa vĩnh viễn đơn hàng
async function deleteOrderAction(id) {
    const result = await showConfirm("Xóa đơn hàng?", "⚠️ Sếp có chắc chắn muốn XÓA VĨNH VIỄN đơn đặt hàng này không?");
    if (!result.isConfirmed) return;
    
    const success = await API.deleteOrder(id);
    if (success) { 
        loadAdminOrderList(); 
    } else { 
        showAlert("Lỗi!", "Lỗi hệ thống khi xóa đơn hàng!", "error"); 
    }
}