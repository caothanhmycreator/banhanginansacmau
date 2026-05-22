// Khởi tạo Supabase Client (Sếp thay URL và Key của sếp vào đây)
const SUPABASE_URL = 'https://tngrpulkrdvlijougzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ3JwdWxrcmR2bGlqb3VnemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDg5NzMsImV4cCI6MjA5NTAyNDk3M30.w35WQJRd9lMb6mVsF0Ikwysyp1iZGHZMEwLoK7GBEtM';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const API = {
    // 1. QUẢN LÝ CẤU HÌNH (Menu & Banners)
    async getSettings(key) {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', key)
            .single();
        return data?.value || null;
    },

    async updateSettings(key, value) {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key, value, updated_at: new Date() });
        return !error;
    },

    // 2. QUẢN LÝ SẢN PHẨM
    async getProducts() {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        return data;
    },

    async saveProduct(product) {
        const { data, error } = await supabase.from('products').upsert(product);
        return { data, error };
    }
};

