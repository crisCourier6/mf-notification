import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Card, CardContent, Grid, IconButton, Typography, Button, Dialog, DialogActions, 
    DialogContent, Snackbar, SnackbarCloseReason, CardActions, Tooltip, Alert, DialogTitle, CircularProgress } from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { UserHasNotification } from '../interfaces/UserHasNotification';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBack from './NavigateBack';

const UserNotifications: React.FC<{ isAppBarVisible: boolean }> = ({ isAppBarVisible }) => {
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") || window.localStorage.getItem("id")
    const userNotificationsURL = "/userhasnotification"
    const [notifications, setNotifications] = useState<UserHasNotification[]>([])
    const [notificationsFiltered, setNotificationsFiltered] = useState<UserHasNotification[]>([])
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [allDone, setAllDone] = useState(false)
    const [openNotification, setOpenNotification] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState<UserHasNotification | null>(null)
    const queryParams = "?wn=true"
    

    useEffect(() => {
        document.title = `Notificaciones - EyesFood`
        api.get(`${userNotificationsURL}/byuser/${currentUserId}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setNotifications(res.data)
            setNotificationsFiltered(res.data)
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            setAllDone(true); // Set the flag after both requests have completed
        });
    }, []);

    
    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }
    const handleOpenNotification = (notification: UserHasNotification) => {
        setSelectedNotification(notification);
        setOpenNotification(true);
        if (!notification.seen){
            api.patch(`${userNotificationsURL}/byuser/${currentUserId}`,
                {
                    notificationId: notification.notificationId,
                    seen: true
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            )
            .then(res =>{
                setNotifications((prevNotifs)=>
                    prevNotifs.map((notif) =>
                        notif.notificationId === res.data.notificationId ? res.data : notif)
                )
                setNotificationsFiltered((prevNotifs)=>
                    prevNotifs.map((notif) =>
                        notif.notificationId === res.data.notificationId ? res.data : notif)
                )
                setSelectedNotification(res.data)
            })
            .catch(error =>{
                console.log(error)
            })
        }   
    };

    const handleCloseNotification = () => {
        setOpenNotification(false);
    };

    const handleDeleteNotification = (notification: UserHasNotification) => {
        api.delete(`${userNotificationsURL}/byuserandnotif/${notification.userId}/${notification.notificationId}`,
            {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        )
        .then(res => {
            setNotifications(notifications.filter((notif:UserHasNotification) => notif.notificationId !== notification.notificationId))
            setNotificationsFiltered(notifications.filter((notif:UserHasNotification) => notif.notificationId !== notification.notificationId))
            setSnackbarMsg("Notificación eliminada")
        })
        .catch(error => {
            setSnackbarMsg(error.response.data.message)
        })
        .finally(()=> {
            setSnackbarOpen(true)
        })
    }

    return ( allDone?
        <Grid container display="flex" 
        flexDirection="column" 
        justifyContent="center"
        alignItems="center"
        sx={{width: "100vw", maxWidth:"500px", gap:2, flexWrap: "wrap", pb: 7}}
        >   
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMsg}
            >
                <Alert variant="filled" onClose={handleSnackbarClose} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
            <Box 
                sx={{
                    position: 'sticky',
                    top: isAppBarVisible?"50px":"0px",
                    width:"100%",
                    maxWidth: "500px",
                    transition: "top 0.1s",
                    backgroundColor: 'primary.dark', // Ensure visibility over content
                    zIndex: 100,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "5px solid",
                    borderLeft: "5px solid",
                    borderRight: "5px solid",
                    color: "primary.contrastText",
                    borderColor: "secondary.main",
                    boxSizing: "border-box"
                  }}
            >
                <Box sx={{display: "flex", flex: 1}}>
                    <NavigateBack/>
                </Box>
                <Box sx={{display: "flex", flex: 4}}>
                    <Typography variant='h6' width="100%" sx={{py:1, color: "inherit"}}>
                        Mis notificaciones
                    </Typography>
                </Box>
                <Box sx={{display: "flex", flex: 1}}>
                </Box>
            </Box> 

            { notificationsFiltered.length==0
            ?   <Typography variant='subtitle1'>
                    No tienes notificaciones
                </Typography>
            :   notificationsFiltered.map((notif)=>{
                return (
                <Card key={notif.notificationId} sx={{
                border: "4px solid", 
                borderColor: notif.seen?"primary.dark":"secondary.main", 
                bgcolor: "primary.contrastText",
                width:"90%", 
                height: "15vh",
                maxHeight: "90px", 
                minHeight: "30px",
                display:"flex",
                flexDirection: "column"
                }}>
                    <CardContent sx={{
                    width:"100%",
                    height: "70%", 
                    display:"flex", 
                    flexDirection: "column", 
                    justifyContent: "center",
                    alignItems: "center",
                    padding:0,
                    }}>
                        <Box sx={{
                            width:"100%", 
                            height: "100%",
                            display:"flex", 
                            flexDirection: "column",
                            justifyContent: "flex-start",
                        }}>
                            <Typography 
                                variant="subtitle1" 
                                color={notif.seen?"primary.contrastText":"secondary.contrastText"}
                                width="100%" 
                                sx={{textAlign: "left",
                                    borderBottom: "2px solid", 
                                    borderColor: notif.seen?"primary.dark":"secondary.main", 
                                    bgcolor: notif.seen?"primary.dark":"secondary.main"}}
                                >
                                 {dayjs(notif.createdAt).format("DD/MM/YYYY")}
                            </Typography>
                            <Typography 
                            variant='subtitle1' 
                            color= "primary.dark" 
                            width={"100%"}
                            height={"100%"}
                            sx={{
                                textAlign:"center", 
                                ml:1, 
                                alignItems: "center", 
                                justifyContent: "center", 
                                display: "flex", 
                                gap:1
                            }}>
                                {notif.notification.title}
                            </Typography>          
                        </Box>
                    </CardContent>
                    <CardActions sx={{padding:0, width:"100%", height: "30%"}}>
                        <Box sx={{
                        width:"100%", 
                        display:"flex", 
                        height: "100%",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: notif.seen?"primary.dark":"secondary.light",
                        }}>
                            <Box sx={{display:"flex", flex:1}}></Box>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex:2 }}>
                                <Button onClick={() => handleOpenNotification(notif)}
                                    variant="text"
                                    sx={{ color: notif.seen ? "primary.contrastText" : "secondary.contrastText", fontSize: 15, padding: 0 }}>
                                    Ver más
                                </Button>
                            </Box>
                            <Box sx={{display:"flex", flex:1, justifyContent: "right"}}>
                                <Tooltip title="Eliminar notificación" key="delete" placement="right" arrow={true}>
                                    <IconButton onClick={() => handleDeleteNotification(notif)}>
                                        <DeleteForeverRoundedIcon
                                            sx={{
                                                color: "error.main",
                                                fontSize: {
                                                    xs: 18, // font size for extra small screens
                                                    sm: 24, // font size for larger screens
                                                }
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            
                        </Box>
                    </CardActions>
                </Card> 
            )}
        )}
            <Dialog 
                open={openNotification} 
                onClose={()=>setOpenNotification(false)} 
                PaperProps={{
                    sx: {
                        maxHeight: '80vh', 
                        width: "95vw",
                        maxWidth: "500px"
                    }
                }}>
                    
                <DialogTitle>
                    <Box sx={{display:"flex", justifyContent: "space-between"}}>
                        {selectedNotification?.notification.title}
                            <IconButton
                            color="inherit"
                            onClick={handleCloseNotification}
                            sx={{p:0}}
                            >
                                <CloseIcon />
                            </IconButton>
                    </Box>
                    
                </DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1">
                        {selectedNotification?.notification.content}
                    </Typography>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </Grid>
        
        :<CircularProgress/>   
    )
}

export default UserNotifications;