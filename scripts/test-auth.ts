#!/usr/bin/env bun

const baseUrl = "http://localhost:3000";

console.log("Testing authentication endpoints...\n");

// Test sign up
console.log("1. Testing sign up...");
const signupResponse = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "demo@example.com",
    password: "password123",
    name: "Demo User",
  }),
});

console.log(`   Status: ${signupResponse.status}`);
const signupData = await signupResponse.json();
console.log(`   Response:`, signupData);

if (signupData.user) {
  console.log("   ✓ Sign up successful!");
  console.log(`   User ID: ${signupData.user.id}`);
  console.log(`   Email: ${signupData.user.email}`);
}

// Test sign in
console.log("\n2. Testing sign in...");
const signinResponse = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "demo@example.com",
    password: "password123",
  }),
});

console.log(`   Status: ${signinResponse.status}`);
const signinData = await signinResponse.json();
console.log(`   Response:`, signinData);

if (signinData.user) {
  console.log("   ✓ Sign in successful!");

  // Extract session cookie
  const cookies = signinResponse.headers.get("set-cookie");
  console.log(`   Session cookie: ${cookies?.substring(0, 50)}...`);

  // Test get session
  console.log("\n3. Testing get session...");
  const sessionResponse = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { cookie: cookies || "" },
  });

  console.log(`   Status: ${sessionResponse.status}`);
  const sessionData = await sessionResponse.json();
  console.log(`   Response:`, sessionData);

  if (sessionData.user) {
    console.log("   ✓ Session retrieved successfully!");
  }
}
