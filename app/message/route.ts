import { createServerResponseAdapter } from "@/lib/server-response-adapter";
import { mcpHandler } from "../mcp";

export const maxDuration = 800;

export async function POST(req: Request) {
  return createServerResponseAdapter(req.signal, (res) => {
    mcpHandler(req, res);
  });
}
