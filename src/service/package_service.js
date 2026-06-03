import { supabaseAdmin, createClientForUser } from './../config/supabase.js';

export const packageService = {
  // ==========================================
  // USER SERVICES (Pake User Client + RLS)
  // ==========================================
  
  async getMyPackages(token) {
    const supabase = createClientForUser(token);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createMyPackage(token, userId, packageData) {
    const supabase = createClientForUser(token);
    const { data, error } = await supabase
      .from('packages')
      .insert({
        name: packageData.name,
        total_sessions: packageData.total_sessions,
        price: packageData.price || 0,
        description: packageData.description || null,
        privileges: packageData.privileges || {},
        is_promo: packageData.is_promo || false,
        user_id: userId // RLS memastikan harus sesuai auth.uid()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMyPackage(token, packageId, updates) {
    const supabase = createClientForUser(token);
    const { data, error } = await supabase
      .from('packages')
      .update({
        name: updates.name,
        total_sessions: updates.total_sessions,
        price: updates.price,
        description: updates.description,
        privileges: updates.privileges,
        is_promo: updates.is_promo
      })
      .eq('id', packageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMyPackage(token, packageId) {
    const supabase = createClientForUser(token);
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageId);

    if (error) throw error;
    return { success: true };
  },

  // ==========================================
  // ADMIN SERVICES (Pake Admin Client + In-Memory Hydration)
  // ==========================================
  
  async getAllPackages() {
    // 1. Tarik semua data packages dari seluruh user
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    if (!packages || packages.length === 0) return [];

    // 2. Ambil semua unique user_id dari list packages
    const userIds = [...new Set(packages.map(p => p.user_id).filter(Boolean))];

    // 3. Tarik data profiles penyertanya jika ada owner-nya
    let profileMap = new Map();
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profileError) throw profileError;
      profileMap = new Map(profiles.map(prof => [prof.id, prof]));
    }

    // 4. Gabungkan datanya (Hydrate)
    return packages.map(pkg => ({
      ...pkg,
      profiles: profileMap.get(pkg.user_id) || null
    }));
  },

  async getPackageById(id) {
    const { data: pkg, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!pkg) return null;

    if (pkg.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', pkg.user_id)
        .single();
      pkg.profiles = profile || null;
    } else {
      pkg.profiles = null;
    }
    
    return pkg;
  },

  async createPackageByAdmin(packageData) {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .insert({
        name: packageData.name,
        total_sessions: packageData.total_sessions,
        price: packageData.price || 0,
        description: packageData.description || null,
        privileges: packageData.privileges || {},
        is_promo: packageData.is_promo || false,
        user_id: packageData.user_id || null // Admin bisa membuatkan paket atas nama user lain / sistem global
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePackageByAdmin(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePackageByAdmin(id) {
    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};