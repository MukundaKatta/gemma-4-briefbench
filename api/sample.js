import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sample = await readFile(join(process.cwd(), "samples", "civic-tech-note.md"), "utf8");
  response.status(200).json({ sample });
}
