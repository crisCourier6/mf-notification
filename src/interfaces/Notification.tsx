import { UserHasNotification } from "./UserHasNotification";

export interface Notification {
    id:string,
    title:string,
    content:string,
    isGlobal: boolean,
    createdAt:Date,
    updatedAt:Date,
    lastSentAt: Date,
    userHasNotification:UserHasNotification[],
    isActive: boolean
}