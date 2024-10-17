import { Notification } from "./Notification";
import { User } from "./User";

export interface UserHasNotification {
    userId:string,
    notificationId:string,
    seen:boolean,
    createdAt:Date,
    updatedAt:Date,
    user:User,
    notification:Notification
}