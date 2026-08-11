const API_URL = "http://127.0.0.1:8000";

export async function sendCommand(command: string) {
  const response = await fetch(`${API_URL}/command`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      command: command,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect to ZIVO backend");
  }

  return await response.json();
}