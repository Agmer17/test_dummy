import { supabaseAdmin, createClientForUser } from '../config/supabase.js';

export const subscriptionService = {

  // ==================================
  // USER METHODS (Menggunakan Token User)
  // ==================================

  // Ambil semua langganan miliknya
  async getSubscriptionsByUser(token) {
    const supabase = createClientForUser(token);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        packages:package_id (name, price),
        students:student_id (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Ambil detail satu langganan miliknya
  async getSubscriptionById(token, id) {
    const supabase = createClientForUser(token);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        packages:package_id (name, price, description),
        students:student_id (full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // User buat langganan baru (atau di-trigger dari backend setelah bayar)
  async createSubscription(token, payload) {
    const supabase = createClientForUser(token);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: payload.user_id,
        student_id: payload.student_id,
        package_id: payload.package_id,
        sessions_total: payload.sessions_total,
        sessions_remaining: payload.sessions_remaining,
        status: payload.status
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==================================
  // ADMIN METHODS (Menggunakan supabaseAdmin)
  // ==================================

  // Admin ambil semua data langganan tanpa terhalang RLS
  async getAllSubscriptionsByAdmin() {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        packages:package_id (name),
        students:student_id (full_name)
      `) // <-- Hapus baris profiles:user_id di sini
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin update kuota sesi / ubah status menjadi completed / cancelled
  async updateSubscriptionByAdmin(id, payload) {
    // Filter payload supaya nggak update field yang nggak perlu
    const updates = {};
    if (payload.sessions_remaining !== undefined) updates.sessions_remaining = payload.sessions_remaining;
    if (payload.status !== undefined) updates.status = payload.status;

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin hapus data secara permanen
  async deleteSubscriptionByAdmin(id) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
};