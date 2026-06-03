import * as lessonRepository from '../repository/lesson.repository.js';

export const getAllLessons = async () => {
  return await lessonRepository.findAll();
};

export const getLessonById = async (id) => {
  return await lessonRepository.findById(id);
};

export const createLesson = async (data) => {
  return await lessonRepository.create(data);
};

export const updateLesson = async (id, data) => {
  return await lessonRepository.updateById(id, data);
};

export const deleteLesson = async (id) => {
  return await lessonRepository.deleteById(id);
};
