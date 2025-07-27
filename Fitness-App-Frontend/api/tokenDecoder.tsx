import { jwtDecode } from "jwt-decode";
import { GetToken } from "./axiosInstance";

type DecodedToken = {
  sub: string; // userId as string
  email?: string; // email as string
  name?: string; // name as string
  exp?: number; // expiration time as number
  iat?: number; // issued at time as number
};

export async function getUserIdFromToken(): Promise<string | null> {
  const token = await GetToken();
  if (!token) {
    console.log("Token is null, redirecting to Login");
    return null;
  }
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.sub;
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
}

export async function getEmailFromToken(): Promise<string | null> {
  const token = await GetToken();
  if (!token) {
    console.log("Token is null, redirecting to Login");
    return null;
  }


  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.email || null;
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
}

export async function getNameFromToken(): Promise<string | null> {
  const token = await GetToken();
  if (!token) {
    console.log("Token is null, redirecting to Login");
    return null;
  }
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.name || null;
  } catch (error) {
    console.error("Invalid JWT:", error);
    console.log("Token is invalid, redirecting to Login");
    return null;
  }
}
