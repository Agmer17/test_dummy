import { supabaseAdmin, createClientForUser } from './../config/supabase.js';

export const userService = {
  // ==========================================
  // USER SERVICES (Pake User Client + RLS)
  // ==========================================
  
  async getMyProfile(token, userId) {
    const supabase = createClientForUser(token);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role, updated_at') // Jangan select google_refresh_token buat user biasa
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateMyProfile(token, userId, updates) {
    // Hindari user ngubah role-nya sendiri
    const allowedUpdates = {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      updated_at: new Date().toISOString()
    };

    const supabase = createClientForUser(token);
    const { data, error } = await supabase
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==========================================
  // ADMIN SERVICES (Pake Admin Client / Service Role)
  // ==========================================
  
  async getAllProfiles() {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*');
      
    if (error) throw error;
    return data;
  },

  async getProfileById(id) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateProfileByAdmin(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUserFull(id) {
    // PENTING: Karena di migrasi lu ada 'references auth.users on delete cascade',
    // cara paling bener buat hapus user adalah hapus dari auth bawaan Supabase.
    // Otomatis row di tabel profiles bakal ikut kehapus.
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (error) throw error;
    return data;
  }
};