import * as sessionRepo from '../repository/session.repository.js';

export const getSessions = async (user) => {
  return await sessionRepo.getSessions(user.role, user.id);
};

export const createSession = async (data, user) => {
  if (user.role !== 'super_admin') {
    throw new Error('Forbidden: Only admins can create sessions');
  }
  return await sessionRepo.createSession(data);
};

export const updateSession = async (id, data, user) => {
  const session = await sessionRepo.getSessionById(id);
  if (!session) throw new Error('Session not found');

  // Teacher hanya boleh mengupdate sesi miliknya
  if (user.role !== 'super_admin' && session.user_id !== user.id) {
    throw new Error('Forbidden: You can only update your assigned sessions');
  }

  return await sessionRepo.updateSession(id, data);
};

export const deleteSession = async (id, user) => {
  if (user.role !== 'super_admin') {
    throw new Error('Forbidden: Only admins can delete sessions');
  }

  const session = await sessionRepo.getSessionById(id);
  if (!session) throw new Error('Session not found');

  return await sessionRepo.deleteSession(id);
};
