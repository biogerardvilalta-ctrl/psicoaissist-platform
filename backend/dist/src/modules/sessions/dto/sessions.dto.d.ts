export declare enum SessionStatus {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare enum SessionType {
    INDIVIDUAL = "INDIVIDUAL",
    GROUP = "GROUP",
    COUPLE = "COUPLE",
    FAMILY = "FAMILY"
}
export declare class CreateSessionDto {
    clientId: string;
    startTime: string;
    endTime?: string;
    sessionType: SessionType;
    notes?: string;
}
export declare class UpdateSessionDto {
    startTime?: string;
    endTime?: string;
    status?: SessionStatus;
    notes?: string;
}
export declare class SessionResponseDto {
    id: string;
    clientId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    status: SessionStatus;
    sessionType: SessionType;
    notes?: string;
    clientName?: string;
}
