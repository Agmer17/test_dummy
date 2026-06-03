import { supabaseAdmin, createClientForUser } from '../config/supabase.js';

export const reviewService = {
  // Ambil semua review (Bisa difilter berdasarkan tutor_id)
  // Pakai Admin client aja buat read, karena review biasanya public
  async getReviews(tutorId) {
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        *,
        profiles!reviews_tutor_id_fkey(full_name, avatar_url) 
      `)
      .order('created_at', { ascending: false });

    // Kalau di-passing tutorId, filter datanya
    if (tutorId) {
      query = query.eq('tutor_id', tutorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Bikin review baru (Pakai user token buat mastiin dia beneran user terdaftar)
  async createReview(token, payload) {
    const supabase = createClientForUser(token);
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        tutor_id: payload.tutor_id,
        student_name: payload.student_name,
        rating: payload.rating,
        comment: payload.comment || null,
        testimoni: payload.testimoni || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin Only: Hapus review
  async deleteReviewByAdmin(id) {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};