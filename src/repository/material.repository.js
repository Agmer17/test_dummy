import Material from '../models/Material.js';

export const getMaterials = async (folderId, userId) => {
  // Ambil materi milik user sendiri ATAU yang berstatus shared
  const query = {
    $or: [
      { user_id: userId },
      { is_shared: true }
    ],
    folder_id: folderId || null
  };
  return await Material.find(query).sort({ createdAt: -1 });
};

export const createMaterial = async (data) => {
  return await Material.create(data);
};

export const findMaterialById = async (id) => {
  return await Material.findById(id);
};

export const updateMaterial = async (id, updateData) => {
  return await Material.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteMaterial = async (id) => {
  return await Material.findByIdAndDelete(id);
};
