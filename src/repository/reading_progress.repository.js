import UserReadingProgress from '../models/UserReadingProgress.js';

export const findProgressByUserIdAndDate = async (userId, startDate, endDate) => {
  return await UserReadingProgress.find({
    user_id: userId,
    completed_at: {
      $gte: startDate,
      $lt: endDate
    }
  }).select('drill_id');
};

export const createProgress = async (data) => {
  return await UserReadingProgress.create(data);
};
