import { supabaseAdmin } from './../config/supabase.js';

// Helper function untuk join data profile ke satu objek package (Single Hydration)
async function hydratePackageProfile(pkg) {
  if (!pkg) return null;
  if (!pkg.user_id) {
    pkg.profiles = null;
    return pkg;
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', pkg.user_id)
    .single();

  pkg.profiles = profile || null;
  return pkg;
}

export const packageService = {
  // ==========================================
  // USER SERVICES (Sudah Otomatis Join Profile)
  // ==========================================
  
  async getMyPackages(userId) {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    if (!packages || packages.length === 0) return [];

    // Join profiles secara massal (In-Memory)
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', userId);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return packages.map(pkg => ({
      ...pkg,
      profiles: profileMap.get(pkg.user_id) || null
    }));
  },

  async createMyPackage(userId, packageData) {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .insert({
        name: packageData.name,
        total_sessions: packageData.total_sessions,
        price: packageData.price || 0,
        description: packageData.description || null,
        privileges: packageData.privileges || {},
        is_promo: packageData.is_promo || false,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    // Langsung join profile pembuatnya sebelum dilempar ke Next.js
    return await hydratePackageProfile(data);
  },

  async updateMyPackage(packageId, userId, updates) {
    const { data, error } = await supabaseAdmin
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
      .eq('user_id', userId) 
      .select()
      .single();

    if (error) throw error;
    
    // Langsung join profile setelah update sukses
    return await hydratePackageProfile(data);
  },

  async deleteMyPackage(packageId, userId) {
    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', packageId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },

  // ==========================================
  // ADMIN SERVICES (Sudah Otomatis Join Profile)
  // ==========================================
  
  async getAllPackages() {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    if (!packages || packages.length === 0) return [];

    const userIds = [...new Set(packages.map(p => p.user_id).filter(Boolean))];

    let profileMap = new Map();
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profileError) throw profileError;
      profileMap = new Map(profiles.map(prof => [prof.id, prof]));
    }

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
    return await hydratePackageProfile(pkg);
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
        user_id: packageData.user_id || null
      })
      .select()
      .single();

    if (error) throw error;
    return await hydratePackageProfile(data);
  },

  async updatePackageByAdmin(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return await hydratePackageProfile(data);
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