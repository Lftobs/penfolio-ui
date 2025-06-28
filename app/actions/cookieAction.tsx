'use server'; 

import { cookies } from 'next/headers';

/**
 * A Server Action to read a cookie's value on the server.
 * This can read HttpOnly cookies.
 * It is inherently async.
 */
export async function getServerCookie(name: string): Promise<string | undefined> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(name);
  // console.log(`Cookie "${name}" value:`, cookieStore); // Debugging log
  
  // It's better to return just the value for simplicity
  return cookie?.value;
}

/**
 * A Server Action to log out a user by removing authentication cookies.
 * This will clear the specified cookies by setting their expiration dates in the past.
 */
export async function logout(): Promise<void> {
  const cookieStore = cookies();
  // Replace 'authToken' and 'refreshToken' with your actual cookie names
  cookieStore.delete('accessToken');
  cookieStore.delete('user');
}