import type { Request, Response } from "express";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  removeUser,
  listUsers,
} from "../services/authService.js";

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await registerUser(email, password);

  res.status(201).json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const {
    user,
    accessToken,
    refreshToken,
  } = await loginUser(email, password);

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  const {
    accessToken,
    refreshToken: newRefreshToken,
  } = await refreshAccessToken(refreshToken);

  res.json({
    accessToken,
    refreshToken: newRefreshToken,
  });
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;

  await logoutUser(refreshToken);

  res.status(204).send();
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);

  await removeUser(id);

  res.status(204).send();
}

export async function getUsers(
  req: Request,
  res: Response,
) {
  const users = await listUsers();

  res.json(users);
}