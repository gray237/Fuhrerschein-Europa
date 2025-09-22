// /netlify/functions/login-user.js
import fetch from "node-fetch";
import bcrypt from "bcryptjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { email, password } = JSON.parse(event.body);

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { statusCode: 500, body: error };
    }

    const users = await response.json();

    if (users.length === 0) {
      return { statusCode: 401, body: "User not found" };
    }

    const user = users[0];

    // Compare hashed password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { statusCode: 401, body: "Invalid credentials" };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login successful", user }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error logging in" };
  }
}
