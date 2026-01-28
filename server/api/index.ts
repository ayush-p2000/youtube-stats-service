import app from '../src/server.js';

// Export the Express app directly as the default handler.
// Vercel's Node.js runtime will call this function with
// the standard Node request/response objects, which Express understands.
export default app;

