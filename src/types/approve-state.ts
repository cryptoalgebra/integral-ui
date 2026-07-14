export const ApprovalState = {
    UNKNOWN: "UNKNOWN",
    NOT_APPROVED: "NOT_APPROVED",
    RESET_REQUIRED: "RESET_REQUIRED",
    PENDING: "PENDING",
    APPROVED: "APPROVED",
};

export type ApprovalStateType = (typeof ApprovalState)[keyof typeof ApprovalState];
