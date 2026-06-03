import * as folderRepo from '../repository/folder.repository.js';

export const getFolders = async (parentId, userId) => {
  return await folderRepo.getFolders(parentId, userId);
};

export const createFolder = async (name, parentId, user) => {
  const isAdmin = user.role === 'admin';
  
  const folderData = {
    name,
    parent_id: parentId || null,
    user_id: user.id,
    is_shared: isAdmin // Admin created folders are shared
  };

  return await folderRepo.createFolder(folderData);
};

export const updateFolder = async (id, name, user) => {
  const isAdmin = user.role === 'admin';
  const folder = await folderRepo.findFolderById(id);

  if (!folder) throw new Error('Folder not found');

  if (folder.user_id !== user.id && !isAdmin) {
    throw new Error('You do not have permission to edit this folder');
  }

  if (folder.is_shared && !isAdmin) {
    throw new Error('Only admins can edit shared folders');
  }

  return await folderRepo.updateFolder(id, { name });
};

export const deleteFolder = async (id, user) => {
  const isAdmin = user.role === 'admin';
  const folder = await folderRepo.findFolderById(id);

  if (!folder) throw new Error('Folder not found');

  if (folder.user_id !== user.id && !isAdmin) {
    throw new Error('You do not have permission to delete this folder');
  }

  if (folder.is_shared && !isAdmin) {
    throw new Error('Only admins can delete shared folders');
  }

  await folderRepo.deleteFolder(id);
  return true;
};
