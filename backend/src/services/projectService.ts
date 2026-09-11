import {
  createProject,
  getProjectsByOwner,
  getProjectById,
} from "../repositories/projectRepository.js";

export async function addProject(
  name: string,
  description: string | undefined,
  ownerId: number,
) {
  return await createProject({
    name,
    description,
    ownerId,
  });
}

export async function listProjects(
  ownerId: number,
) {
  return await getProjectsByOwner(ownerId);
}

export async function findProject(
  id: number,
  ownerId: number,
) {
  return await getProjectById(id, ownerId);
}