import * as studentRepo from '../repository/student.repository.js';
import { supabaseAdmin } from '../config/supabase.js';
import Material from '../models/Material.js';
import Folder from '../models/Folder.js';

export const getStudents = async (user) => {
  // Melempar role agar difilter di level query repository
  return await studentRepo.getStudents(user.role, user.id);
};

export const getStudentById = async (id, user) => {
  const student = await studentRepo.getStudentById(id);
  if (!student) throw new Error('Student not found');

  if (user.role !== 'super_admin' && student.teacher_id !== user.id) {
    throw new Error('Forbidden: You can only view your assigned students');
  }

  return student;
};

export const createStudent = async (studentData, authData, packageId, user) => {
  if (user.role !== 'super_admin') {
    throw new Error('Forbidden: Only admins can create students');
  }

  let studentUserId = user.id; // Default ke admin's ID (offline student)

  // 1. Pembuatan Akun Auth (Opsional)
  if (authData?.createAccount && authData?.email && authData?.password) {
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: authData.email,
      password: authData.password,
      email_confirm: true,
      user_metadata: { full_name: studentData.full_name }
    });

    if (createUserError) throw new Error(`Failed to create account: ${createUserError.message}`);

    if (newUser.user) {
      studentUserId = newUser.user.id;
      // Buat profile di tabel profiles Supabase
      await supabaseAdmin.from('profiles').upsert({
        id: newUser.user.id,
        full_name: studentData.full_name,
        role: 'student',
        updated_at: new Date().toISOString()
      });
    }
  }

  // 2. Pembuatan Data Murid
  studentData.user_id = studentUserId;
  const newStudent = await studentRepo.createStudent(studentData);

  // 3. Menetapkan Paket/Subscription
  if (packageId && newStudent) {
    const { data: pkg } = await supabaseAdmin.from('packages').select('total_sessions').eq('id', packageId).single();
    if (pkg) {
      await supabaseAdmin.from('subscriptions').insert({
        user_id: studentUserId,
        student_id: newStudent.id,
        package_id: packageId,
        sessions_total: pkg.total_sessions,
        sessions_remaining: pkg.total_sessions,
        status: 'active'
      });
    }
  }

  return newStudent;
};

export const updateStudent = async (id, data, user) => {
  if (user.role !== 'super_admin') {
    throw new Error('Forbidden: Only admins can update students');
  }

  const existing = await studentRepo.getStudentById(id);
  if (!existing) throw new Error('Student not found');

  return await studentRepo.updateStudent(id, data);
};

export const deleteStudent = async (id, user) => {
  if (user.role !== 'super_admin') {
    throw new Error('Forbidden: Only admins can delete students');
  }

  const existing = await studentRepo.getStudentById(id);
  if (!existing) throw new Error('Student not found');

  // Gunakan user_id (UUID Auth Supabase) untuk membersihkan data MongoDB
  // Karena 'id' tabel students berbeda dengan 'user_id' Auth Supabase yang disimpan di MongoDB
  const mongoUserId = existing.user_id;

  // 1. Hapus semua Materials milik student di MongoDB
  const deletedMaterials = await Material.deleteMany({ user_id: mongoUserId });
  console.log(`[Cleanup] Deleted ${deletedMaterials.deletedCount} material(s) for user ${mongoUserId}`);

  // 2. Hapus semua Folders milik student di MongoDB
  const deletedFolders = await Folder.deleteMany({ user_id: mongoUserId });
  console.log(`[Cleanup] Deleted ${deletedFolders.deletedCount} folder(s) for user ${mongoUserId}`);

  // 3. Hapus student dari Supabase (termasuk sessions & subscriptions via repo)
  return await studentRepo.deleteStudent(id);
};
