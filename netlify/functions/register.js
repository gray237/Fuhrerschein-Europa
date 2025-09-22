import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      return { statusCode: 500, body: error };
    }

    const user = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User registered", user }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error saving user" };
  }
}
