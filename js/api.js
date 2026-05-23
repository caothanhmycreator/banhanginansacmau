// Khởi tạo Supabase Client
const SUPABASE_URL = 'https://tngrpulkrdvlijougzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ3JwdWxrcmR2bGlqb3VnemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDg5NzMsImV4cCI6MjA5NTAyNDk3M30.w35WQJRd9lMb6mVsF0Ikwysyp1iZGHZMEwLoK7GBEtM';

// ĐỔI TÊN BIẾN THÀNH supabaseClient ĐỂ KHÔNG XUNG ĐỘT VỚI THƯ VIỆN GỐC
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const API = {
    // 1. QUẢN LÝ CẤU HÌNH (Menu & Banners)
    async getSettings(key) {
        const { data, error } = await supabaseClient
            .from('app_settings')
            .select('value')
            .eq('key', key)
            .single();
        return data?.value || null;
    },

    async updateSettings(key, value) {
        const { error } = await supabaseClient
            .from('app_settings')
            .upsert({ key, value, updated_at: new Date() });
        return !error;
    },

    // 2. QUẢN LÝ SẢN PHẨM
    async getProducts() {
        const { data } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
        return data;
    },

    async saveProduct(product) {
        const { data, error } = await supabaseClient.from('products').upsert(product);
        return { data, error };
    },

    // 3. QUẢN LÝ UPLOAD ẢNH
    async uploadImage(file, folder = 'products') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabaseClient.storage
            .from('public-images')
            .upload(filePath, file);

        if (error) {
            console.error('Lỗi upload:', error);
            return null;
        }
        
        const { data } = supabaseClient.storage
            .from('public-images')
            .getPublicUrl(filePath);
            
        return data.publicUrl;
    },
    
    // Lấy chi tiết 1 sản phẩm dựa vào SLUG
    async getProductBySlug(slug) {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('slug', slug) // Tìm chính xác theo cột slug
            .single(); // Lệnh single() đảm bảo chỉ lấy đúng 1 dòng
            
        if (error) {
            console.error('Lỗi lấy sản phẩm:', error);
            return null;
        }
        return data;
    }
};