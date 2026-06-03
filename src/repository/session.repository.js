import { supabaseAdmin } from '../config/supabase.js';

export const getSessions = async (role, userId) => {
  let query = supabaseAdmin
    .from('sessions')
    .select(`
      id, start_time, end_time, notes, status, zoom_link, user_id, student_id, package_id,
      students (full_name), packages (name)
    `)
    .order('start_time', { ascending: true });

  if (role !== 'super_admin') {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getSessionById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

export const createSession = async (data) => {
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return session;
};

export const updateSession = async (id, data) => {
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return session;
};

export const deleteSession = async (id) => {
  const { error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
};
