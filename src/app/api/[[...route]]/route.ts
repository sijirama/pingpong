import { httpHandler } from "@/server"
export const runtime = "edge"
export const dynamic = "force-dynamic"  // Add this to ensure dynamic routing
export { httpHandler as GET, httpHandler as POST, httpHandler as PUT, httpHandler as DELETE }
