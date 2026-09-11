export interface JwtPayload {
  userId: number;
  role: "admin" | "member";
}

export interface RefreshTokenPayload {
  userId: number;
  jti: string;
}