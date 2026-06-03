import * as progressRepository from '../repository/reading_progress.repository.js';

export const getDailyStatus = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const progress = await progressRepository.findProgressByUserIdAndDate(userId, today, tomorrow);
  
  const count = progress.length;
  const completedDrillIds = progress.map(p => p.drill_id);

  return {
    count,
    completedDrillIds,
    locked: count >= 3
  };
};

export const submitDrillResult = async (userId, drillId, wpm, success) => {
  const data = {
    user_id: userId,
    drill_id: drillId,
    wpm,
    success
  };
  
  await progressRepository.createProgress(data);
  return { success: true };
};
