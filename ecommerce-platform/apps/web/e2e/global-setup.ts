import { request } from "@playwright/test";

const E2E_API = "http://localhost:3001";

async function globalSetup() {
  const ctx = await request.newContext({ baseURL: E2E_API });

  // Create the shared E2E test user. 409 = already exists, which is fine.
  const res = await ctx.post("/api/auth/register", {
    data: {
      email: "e2e@example.com",
      password: "E2eTestPass1",
      first_name: "E2E",
      last_name: "Test",
    },
  });

  if (!res.ok() && res.status() !== 409) {
    const body = await res.text();
    throw new Error(`E2E user setup failed (${res.status()}): ${body}`);
  }

  await ctx.dispose();
}

export default globalSetup;
