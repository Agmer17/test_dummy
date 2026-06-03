import Folder from '../models/Folder.js';

export const getFolders = async (parentId, userId) => {
  // Ambil folder milik user sendiri ATAU yang berstatus shared (milik admin)
  const query = {
    $or: [
      { user_id: userId },
      { is_shared: true }
    ],
    parent_id: parentId || null
  };
  return await Folder.find(query).sort({ name: 1 });
};

export const createFolder = async (data) => {
  return await Folder.create(data);
};

export const findFolderById = async (id) => {
  return await Folder.findById(id);
};

export const updateFolder = async (id, updateData) => {
  return await Folder.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteFolder = async (id) => {
  return await Folder.findByIdAndDelete(id);
};
