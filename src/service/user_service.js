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

  async deleteUserFull(userId) {
    // 1. Hapus data dependen duluan biar aman dari Foreign Key constraint error
    // (Persis kayak script Next.js lu)
    
    // Hapus Subscriptions
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);
    if (subError) console.error('Subscription deletion warning:', subError);

    // Hapus Sessions
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('user_id', userId);
    if (sessionError) console.error('Session deletion warning:', sessionError);

    // Hapus Students
    const { error: studentError } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('user_id', userId);
    if (studentError) console.error('Student deletion warning:', studentError);

    // Hapus Profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileError) console.error('Profile deletion warning:', profileError);

    // 2. Terakhir, hapus user dari Supabase Auth secara permanen
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return { success: true };
  }
};