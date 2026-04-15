export type McpLoopbackRuntime = {
  port: number;
  token: string;
};

let activeRuntime: McpLoopbackRuntime | undefined;

export function getActiveMcpLoopbackRuntime(): McpLoopbackRuntime | undefined {
  return activeRuntime ? { ...activeRuntime } : undefined;
}

export function setActiveMcpLoopbackRuntime(runtime: McpLoopbackRuntime): void {
  activeRuntime = { ...runtime };
}

export function clearActiveMcpLoopbackRuntime(token: string): void {
  if (activeRuntime?.token === token) {
    activeRuntime = undefined;
  }
}

export function createMcpLoopbackServerConfig(port: number) {
  return {
    mcpServers: {
      kibo: {
        type: "http",
        url: `http://127.0.0.1:${port}/mcp`,
        headers: {
          Authorization: "Bearer ${KIBO_MCP_TOKEN}",
          "x-session-key": "${KIBO_MCP_SESSION_KEY}",
          "x-kibo-agent-id": "${KIBO_MCP_AGENT_ID}",
          "x-kibo-account-id": "${KIBO_MCP_ACCOUNT_ID}",
          "x-kibo-message-channel": "${KIBO_MCP_MESSAGE_CHANNEL}",
        },
      },
    },
  };
}
