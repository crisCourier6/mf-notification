import React, { useEffect, useState } from 'react';
import api from '../api';
import { Badge } from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';

const UserNotificationCount: React.FC = () => {
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") || window.localStorage.getItem("id")
    const [notificationCount, setNotificationCount] = useState(0)
    const userNotificationsURL = "/userhasnotification"
    const queryParams = "?c=true"
    
    useEffect(() => {
        if (currentUserId){
            api.get(`${userNotificationsURL}/byuser/${currentUserId}${queryParams}`, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            .then(res => {
                console.log(res.data)
                setNotificationCount(res.data.count)
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            })
        }
        
    }, []);

    return ( 
        <Badge
            badgeContent={notificationCount}
            color={notificationCount > 0 ? "error" : "default"} // red if count > 0, grey otherwise
            overlap="circular"
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
        >
            <NotificationsNoneRoundedIcon />
        </Badge> 
    )
}

export default UserNotificationCount;