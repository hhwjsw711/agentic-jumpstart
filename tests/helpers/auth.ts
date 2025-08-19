import { Page } from "@playwright/test";
import { testDatabase } from "./database";
import { users, sessions } from "~/db/schema";
import { generateSessionToken } from "~/utils/auth";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";

export async function createMockAdminSession(page: Page) {
  // Create a test admin user
  const [adminUser] = await testDatabase
    .select()
    .from(users)
    .where(eq(users.email, "admin@test.com"))
    .limit(1);

  // Generate session token
  const sessionToken = generateSessionToken();
  const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(sessionToken))
  );

  // Create session in database
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
  await testDatabase
    .insert(sessions)
    .values({
      id: sessionId,
      userId: adminUser.id,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: sessions.id,
      set: {
        userId: adminUser.id,
        expiresAt,
      },
    });

  // Set session cookie in browser
  await page.context().addCookies([
    {
      name: "session",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      expires: Math.floor(expiresAt.getTime() / 1000),
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  return { user: adminUser, sessionToken };
}

export async function createMockUserSession(page: Page) {
  const [regularUser] = await testDatabase
    .select()
    .from(users)
    .where(eq(users.email, "user@test.com"))
    .limit(1);

  // Generate session token
  const sessionToken = generateSessionToken();
  const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(sessionToken))
  );

  // Create session in database
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
  await testDatabase
    .insert(sessions)
    .values({
      id: sessionId,
      userId: regularUser.id,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: sessions.id,
      set: {
        userId: regularUser.id,
        expiresAt,
      },
    });

  // Set session cookie in browser
  await page.context().addCookies([
    {
      name: "session",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      expires: Math.floor(expiresAt.getTime() / 1000),
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  return { user: regularUser, sessionToken };
}

export async function clearSession(page: Page) {
  // Clear cookies
  await page.context().clearCookies();
}
