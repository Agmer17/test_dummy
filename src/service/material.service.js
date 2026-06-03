import * as materialRepo from '../repository/material.repository.js';
import * as folderRepo from '../repository/folder.repository.js';

export const getMaterials = async (folderId, userId) => {
  return await materialRepo.getMaterials(folderId, userId);
};

export const createMaterial = async (folderId, title, type, url, user) => {
  const isAdmin = user.role === 'admin';
  let isShared = isAdmin; // Default for admin is shared

  if (folderId) {
    const folder = await folderRepo.findFolderById(folderId);
    if (folder) {
      if (folder.is_shared && !isAdmin) {
        throw new Error('Only admins can add materials to shared folders');
      }
      // Mewarisi status is_shared dari folder induknya
      isShared = folder.is_shared;
    } else {
      throw new Error('Folder not found');
    }
  }

  const materialData = {
    folder_id: folderId || null,
    title,
    type,
    url,
    user_id: user.id,
    is_shared: isShared
  };

  return await materialRepo.createMaterial(materialData);
};

export const updateMaterial = async (id, title, url, type, user) => {
  const isAdmin = user.role === 'admin';
  const material = await materialRepo.findMaterialById(id);

  if (!material) throw new Error('Material not found');

  if (material.user_id !== user.id && !isAdmin) {
    throw new Error('You do not have permission to edit this material');
  }

  if (material.is_shared && !isAdmin) {
    throw new Error('Only admins can edit shared materials');
  }

  return await materialRepo.updateMaterial(id, { title, url, type });
};

export const deleteMaterial = async (id, user) => {
  const isAdmin = user.role === 'admin';
  const material = await materialRepo.findMaterialById(id);

  if (!material) throw new Error('Material not found');

  if (material.user_id !== user.id && !isAdmin) {
    throw new Error('You do not have permission to delete this material');
  }

  if (material.is_shared && !isAdmin) {
    throw new Error('Only admins can delete shared materials');
  }

  await materialRepo.deleteMaterial(id);
  return true;
};
