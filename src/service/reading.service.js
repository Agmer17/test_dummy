import * as readingRepository from '../repository/reading.repository.js';

// --- Master Data CRUD Services ---

export const getAllDrills = async () => {
  return await readingRepository.findAll();
};

export const getDrillById = async (id) => {
  return await readingRepository.findById(id);
};

export const createDrill = async (data) => {
  return await readingRepository.create(data);
};

export const updateDrill = async (id, data) => {
  return await readingRepository.updateById(id, data);
};

export const deleteDrill = async (id) => {
  return await readingRepository.deleteById(id);
};


// --- Daily Game Logic Services ---

const getDayIndex = () => {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const start = new Date(Date.UTC(2025, 0, 1)); // Anchor date
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / oneDay);
};

export const getDailyDrills = async () => {
  const dayIndex = getDayIndex();
  const cycleLength = 10;
  const dayInCycle = dayIndex % cycleLength;

  const easyDrills = await readingRepository.findByLevel('Easy');
  const mediumDrills = await readingRepository.findByLevel('Medium');

  if (!easyDrills.length || !mediumDrills.length) {
    throw new Error("Drill data is not sufficient to generate daily drills");
  }

  // Select 1 Easy
  const selectedEasy = easyDrills[dayInCycle % easyDrills.length];

  // Select 2 Medium
  const mediumIndex1 = (dayInCycle * 2) % mediumDrills.length;
  const mediumIndex2 = (dayInCycle * 2 + 1) % mediumDrills.length;

  const selectedMedium1 = mediumDrills[mediumIndex1];
  const selectedMedium2 = mediumDrills[mediumIndex2];

  return [selectedEasy, selectedMedium1, selectedMedium2];
};
