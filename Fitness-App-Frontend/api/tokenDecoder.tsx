import { jwtDecode } from "jwt-decode";
import { GetToken } from "./AxiosInstance";

type DecodedToken = {
  sub: string; 
  email?: string; 
  name?: string; 
  exp?: number; 
  iat?: number; 
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
