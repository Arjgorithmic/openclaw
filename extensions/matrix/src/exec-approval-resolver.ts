import { resolveApprovalOverGateway } from "kibo/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "kibo/plugin-sdk/approval-runtime";
import type { KiboConfig } from "kibo/plugin-sdk/config-runtime";
import { isApprovalNotFoundError } from "kibo/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveMatrixApproval(params: {
  cfg: KiboConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `Matrix approval (${params.senderId?.trim() || "unknown"})`,
  });
}
