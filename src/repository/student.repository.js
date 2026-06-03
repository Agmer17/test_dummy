import { supabaseAdmin } from '../config/supabase.js';

export const getStudents = async (role, userId) => {
  let query = supabaseAdmin
    .from('students')
    .select(`
      id, full_name, nickname, zoom_link, phone, job, age, schedule_preference, created_at, teacher_id, user_id,
      subscriptions ( status, packages (name) )
    `)
    .order('created_at', { ascending: false });

  // Jika bukan admin (berarti teacher), hanya ambil murid yang diassign ke dia
  if (role !== 'super_admin') {
    query = query.eq('teacher_id', userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  
  // Flatten package name agar mudah dibaca frontend
  return (data || []).map(student => {
    const activeSub = student.subscriptions?.find(sub => sub.status === 'active');
    return {
      ...student,
      activePackage: activeSub?.packages?.name || null
    };
  });
};

export const getStudentById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message); // PGRST116 = not found
  return data;
};

export const createStudent = async (data) => {
  const { data: student, error } = await supabaseAdmin
    .from('students')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return student;
};

export const updateStudent = async (id, data) => {
  const { data: student, error } = await supabaseAdmin
    .from('students')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return student;
};

export const deleteStudent = async (id) => {
  // Hapus relasi sesi & subscription dulu untuk menghindari foreign key error jika tidak cascade
  await supabaseAdmin.from('sessions').delete().eq('student_id', id);
  await supabaseAdmin.from('subscriptions').delete().eq('student_id', id);
  
  const { error } = await supabaseAdmin
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
};
