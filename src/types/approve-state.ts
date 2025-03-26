export const ApprovalState = {
    UNKNOWN: "UNKNOWN",
    NOT_APPROVED: "NOT_APPROVED",
    PENDING: "PENDING",
    APPROVED: "APPROVED",
};

export type ApprovalStateType = (typeof ApprovalState)[keyof typeof ApprovalState];
