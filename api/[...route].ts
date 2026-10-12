/**
 * API function entry — /api/<segment> (single depth). All routing lives in
 * server/routes/dispatch.ts; this file only exists so Vercel mounts a
 * Serverless Function for this URL class.
 */
export { default } from "../server/routes/dispatch.js";
