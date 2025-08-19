import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  return json({
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:5173"
  });
}