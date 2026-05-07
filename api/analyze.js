import { analyzeBrief } from "../lib/briefbench.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const result = await analyzeBrief(request.body || {});
    response.status(200).json(result);
  } catch (error) {
    response.status(error.statusCode || 500).json({ error: error.message });
  }
}
