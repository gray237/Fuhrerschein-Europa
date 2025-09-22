// /netlify/functions/register-user.js
import fetch from "node-fetch";
import bcrypt from "bcryptjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  try {
    // Hash the password securely
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Prepare payload to match Supabase schema
    const userPayload = {
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      email: data.email,
      username: data.username,
      password: hashedPassword,
      phone: data.phone || null,
      dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : null, // store as DATE
      street: data.street || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      courses: Array.isArray(data.courses) ? data.courses : [], // ensure array
      marketing: Boolean(data.marketing),
    };

    // Insert into Supabase via REST API
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(userPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      return { statusCode: response.status, body: error };
    }

    const newUser = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User registered", user: newUser }),
    };

  } catch (err) {
    console.error("Registration error:", err);
    return { statusCode: 500, body: "Error registering user" };
  }
}
