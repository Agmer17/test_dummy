import { supabaseAdmin, createClientForUser } from './../config/supabase.js';
import crypto from 'crypto';

const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT;
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;

export const paymentService = {
  // ==========================================
  // USER SERVICES (Pake User Client + RLS)
  // ==========================================
  
  async createQrisPayment(token, userId, payload) {
    const { package_id, student_id, subscription_id, amount } = payload;
    
    // 1. Generate ID internal & order_id unik untuk Pakasir
    const paymentId = crypto.randomUUID();
    const orderId = `ECC-${paymentId.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 2. Tembak API Pakasir untuk mendapatkan string QRIS
    const response = await fetch('https://app.pakasir.com/api/transactioncreate/qris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: PAKASIR_PROJECT,
        order_id: orderId,
        amount: amount,
        api_key: PAKASIR_API_KEY
      })
    });

    const resData = await response.json();
    if (!response.ok || !resData.payment) {
      throw new Error(resData.message || 'Gagal membuat transaksi di Pakasir');
    }

    const pakasir = resData.payment;

    // 3. Simpan data transaksi ke Supabase pake User Client (Mematuhi RLS)
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        id: paymentId,
        user_id: userId,
        student_id: student_id || null,
        package_id: package_id,
        subscription_id: subscription_id || null,
        provider: 'pakasir',
        provider_project: PAKASIR_PROJECT,
        provider_order_id: orderId,
        amount: amount,
        fee: pakasir.fee,
        total_payment: pakasir.total_payment,
        currency: 'IDR',
        method: 'qris',
        payment_number: pakasir.payment_number,
        expires_at: pakasir.expired_at,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyPayments(token, userId) {
    const supabase = createClientForUser(token);
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async cancelMyPayment(token, userId, paymentId) {
    const supabase = createClientForUser(token);
    
    // Ambil detail data payment terlebih dahulu
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) throw new Error('Transaksi tidak ditemukan');
    if (payment.status !== 'pending') throw new Error('Hanya transaksi pending yang dapat dibatalkan');

    // Tembak API Cancel milik Pakasir
    const response = await fetch('https://app.pakasir.com/api/transactioncancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: payment.provider_project,
        order_id: payment.provider_order_id,
        amount: payment.amount,
        api_key: PAKASIR_API_KEY
      })
    });

    // Update status lokal di database via User Client
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==========================================
  // ADMIN SERVICES (Pake Admin Client / Service Role)
  // ==========================================
  
  // ==========================================
  // ADMIN SERVICES (Pake Admin Client / Service Role)
  // ==========================================
  
  async getAllPayments() {
    // 1. Tarik semua data payments terlebih dahulu
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    if (!payments || payments.length === 0) return [];

    // 2. Ambil semua unique user_id yang ada di list payments tersebut
    const userIds = [...new Set(payments.map(p => p.user_id))];

    // 3. Tarik data profiles yang match dengan list userIds tadi
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    if (profileError) throw profileError;

    // 4. Petakan (Map) profiles ke dalam object payment masing-masing via JavaScript
    const profileMap = new Map(profiles.map(prof => [prof.id, prof]));
    
    const hydratedPayments = payments.map(payment => ({
      ...payment,
      profiles: profileMap.get(payment.user_id) || null // Mengikuti format join '.select(*, profiles(...))'
    }));

    return hydratedPayments;
  },

  async getPaymentById(id) {
    // 1. Tarik detail data payment berdasarkan ID
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!payment) return null;

    // 2. Tarik data profile dari user yang bersangkutan
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', payment.user_id)
      .single();

    // Jika profile tidak ketemu/error, jangan gagalkan payload utamanya, set null saja
    payment.profiles = profile || null;
    
    return payment;
  },

  // ==========================================
  // WEBHOOK & PROCESSOR (Pake Admin Client)
  // ==========================================
  
  async handleIncomingWebhook(payload) {
    const { amount, order_id, project, status, completed_at } = payload;

    // Proteksi awal: Validasi kecocokan project slug
    if (project !== PAKASIR_PROJECT) {
      throw new Error('Unauthorized project webhook source');
    }

    // Cari datanya di DB pake Admin Client karena webhook tidak membawa token user
    const { data: payment, error: findError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('provider_order_id', order_id)
      .single();

    if (findError || !payment) {
      throw new Error(`Transaksi dengan order_id ${order_id} tidak ditemukan di sistem`);
    }

    // Rekomendasi Dokumentasi Pakasir: Validasi kecocokan nominal amount
    if (Number(payment.amount) !== Number(amount)) {
      throw new Error('Data nominal transaksi terdeteksi tidak valid / tidak cocok');
    }

    // Mapping status dari 'completed' ke 'success'
    let finalStatus = payment.status;
    let paidAt = payment.paid_at;

    if (status === 'completed') {
      finalStatus = 'success';
      paidAt = completed_at || new Date().toISOString();
    }

    // Update payment record
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        status: finalStatus,
        paid_at: paidAt,
        updated_at: new Date().toISOString()
      })
      .eq('provider_order_id', order_id)
      .select()
      .single();

    if (error) throw error;

    // > **Tips Tambahan:** Di sini kamu bisa trigger logic kelanjutan pas transaksi sukses.
    // > Contoh: update status tabel `subscriptions` jadi active, kirim email invoice, dll.

    return data;
  }
};