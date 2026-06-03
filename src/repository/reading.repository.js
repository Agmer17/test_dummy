import ReadingDrill from '../models/ReadingDrill.js';

export const findAll = async () => {
  return await ReadingDrill.find().sort({ content: 1 });
};

export const findById = async (id) => {
  return await ReadingDrill.findById(id);
};

export const findByLevel = async (level) => {
  return await ReadingDrill.find({ level }).sort({ content: 1 });
};

export const create = async (data) => {
  return await ReadingDrill.create(data);
};

export const updateById = async (id, data) => {
  return await ReadingDrill.findByIdAndUpdate(id, data, { new: true });
};

export const deleteById = async (id) => {
  return await ReadingDrill.findByIdAndDelete(id);
};
