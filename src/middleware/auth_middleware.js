import { supabaseAdmin } from '../utils/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verifikasi token ke Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error(authError?.message || 'Invalid token');
    }

    // 2. Ambil role dari tabel profiles menggunakan Service Role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Gagal mengambil role user');
    }

    // 3. Simpan data ke req object agar bisa dipakai di controller
    req.user = user;
    req.role = profile?.role || 'student'; 
    req.token = token; 

    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({ error: 'Unauthorized', details: error.message });
  }
};

// Middleware tambahan untuk membatasi endpoint khusus admin
export const requireAdmin = (req, res, next) => {
  // Berdasarkan skema SQL, role tertingginya adalah 'super_admin'
  if (req.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: Butuh akses super_admin' });
  }
  next();
};