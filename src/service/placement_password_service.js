import { supabaseAdmin, createClientForUser } from '../config/supabase.js';

export const placementPasswordService = {
  // Ambil semua data password
  async getPasswords() {
    const { data, error } = await supabaseAdmin
      .from('placement_passwords')
      .select('*') // <-- Cukup select '*' aja, hapus bagian relasi ke created_by
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Bikin password baru (Pakai user token buat mastiin dia beneran admin sesuai RLS)
  async createPassword(token, payload) {
    const supabase = createClientForUser(token);
    
    const { data, error } = await supabase
      .from('placement_passwords')
      .insert({
        password: payload.password,
        password_hash: payload.password_hash,
        expires_at: payload.expires_at,
        created_by: payload.created_by,
        is_active: true // default sesuai skema
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Hapus password
  async deletePassword(id) {
    const { data, error } = await supabaseAdmin
      .from('placement_passwords')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};