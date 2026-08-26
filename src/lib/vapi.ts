import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY!;
const VAPI_WORKFLOW_ID = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!;

export const vapi = new Vapi(VAPI_PUBLIC_KEY);
export const vapiWorkflowId = VAPI_WORKFLOW_ID;