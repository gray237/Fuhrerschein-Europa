// /netlify/functions/register-user.js
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userPayload = {
      ...data,
      password: hashedPassword,
    };

    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(userPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      return { statusCode: 500, body: error };
    }

    const newUser = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User registered", user: newUser }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error registering user" };
  }
};
