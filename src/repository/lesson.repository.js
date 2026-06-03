import CurriculumLesson from '../models/CurriculumLesson.js';

export const findAll = async () => {
  return await CurriculumLesson.find();
};

export const findById = async (id) => {
  return await CurriculumLesson.findById(id);
};

export const create = async (data) => {
  return await CurriculumLesson.create(data);
};

export const updateById = async (id, data) => {
  return await CurriculumLesson.findByIdAndUpdate(id, data, { new: true });
};

export const deleteById = async (id) => {
  return await CurriculumLesson.findByIdAndDelete(id);
};
