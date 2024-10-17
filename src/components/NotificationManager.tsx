import React from "react";
import { Button, Box, Alert, Grid, Dialog, DialogContent, DialogActions, TextField, Snackbar, 
    IconButton, Typography, DialogTitle, Tooltip, Checkbox} from '@mui/material';
import api from "../api";
import { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid"
import { esES } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CancelScheduleSendRoundedIcon from '@mui/icons-material/CancelScheduleSendRounded';
import { Notification } from "../interfaces/Notification";
import dayjs from "dayjs";

const NotificationManager: React.FC<{isAppBarVisible:boolean}> = ({ isAppBarVisible }) => {
    const notificationsURL = "/notification"
    const userHasNotificationURL = "/userhasnotification"
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [newTitle, setNewTitle] = useState("")
    const [newContent, setNewContent] = useState("")
    const [sendAll, setSendAll] = useState(false)
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openSendDialog, setOpenSendDialog] = useState(false);
    const [openDisableDialog, setOpenDisableDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({items: [] });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [allDone, setAllDone] = useState(false)
    
    useEffect(()=>{
        document.title = "Administrador de notificaciones - EF Admin";
        let queryParams = "?wu=true&og=true"
        api.get(`${notificationsURL}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(res => {
            const transformedNotif = res.data.map((notif: any) => (
                {
                ...notif,
                createdAt: new Date(notif.createdAt), // Convert `createdAt` to a Date object
                lastSentAt: notif.lastSentAt? new Date(notif.lastSentAt):null,
                updatedAt: new Date(notif.updatedAt),
            }));
            setNotifications(transformedNotif)
        })
        .catch(error => console.log(error.response))
        .finally(()=>{
            setAllDone(true)
        })
    },[])

    const columns: GridColDef[] = [
        {field: "updatedAt", headerName: "Fecha creación", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date"
        },
        {field: "createdAt", headerName: "Fecha modificación", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date"
        },
        {field: "lastSentAt", headerName: "Envíado", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date",
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleDateString() : "Nunca";
            },
        },
        {field: "title", headerName: "Título", flex: 1.5, headerClassName: "header-colors", headerAlign: "center"},
        {field: "content", headerName: "Contenido", flex: 2, headerClassName: "header-colors", headerAlign: "center"},
        
        {
            field: 'actions',
            headerName: 'Acciones',
            flex: 1.5,
            headerClassName: "header-colors",
            headerAlign: "center", 
            type: "actions",
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    height: '100%',
                }}>
                    <Tooltip title="Editar" key="edit" placement="left" arrow={true}>
                        <IconButton color="primary" onClick={() => {
                            setSelectedNotification(params.row);
                            setNewTitle(params.row.title)
                            setNewContent(params.row.content)
                            setOpenEditDialog(true);}}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Enviar" key="send" placement="top" arrow>
                        <IconButton color="primary" onClick={() => {
                            setSelectedNotification(params.row);
                            setOpenSendDialog(true);}}>
                            <SendRoundedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Deshabilitar" key="disable" placement="top" arrow={true}>
                        <IconButton color="warning" onClick={() => {
                            setSelectedNotification(params.row);
                            setOpenDisableDialog(true);}}>
                            <CancelScheduleSendRoundedIcon />
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar" key="delete" placement="right" arrow>
                        <IconButton color="error" onClick={() => {
                            setSelectedNotification(params.row);
                            setOpenDeleteDialog(true);}}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    
                    
                </Box>
            )
        }
    ]

      const handleDelete = async () => {
        try {
            await api.delete(`${notificationsURL}/byid/${selectedNotification?.id}`, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            });
            setNotifications(notifications.filter(notif => notif.id !== selectedNotification?.id));
            setSnackbarMsg('Notificación eliminada.');
        } catch (error) {
            console.log(error);
            setSnackbarMsg('Error al intentar eliminar notificación');
        } finally {
            setOpenDeleteDialog(false);
            setSnackbarOpen(true);
            setSelectedNotification(null)
        }
    };

    const handleEdit = () => {
        api.patch(`${notificationsURL}/byid/${selectedNotification?.id}`,
            {
                title: newTitle,
                content: newContent
            },
            {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            }
        )
        .then(res => {
            setSnackbarMsg("Notificación modificada con éxito")
            let newNotif = {
                ...res.data,
                createdAt: new Date(res.data.createdAt), // Convert `createdAt` to a Date object
                lastSentAt: res.data.lastSentAt? new Date(res.data.lastSentAt):null,
                updatedAt: new Date(res.data.updatedAt),
            }
            setNotifications((prevNotifs) => 
                prevNotifs.map((notif) =>
                    notif.id===newNotif.id ? newNotif : notif
                )
            )
           
        })
        .catch(error=>{
            setSnackbarMsg("Error al modificar notificación")
        })
        .finally(()=>{
            setSnackbarOpen(true);
            handleCloseEditDialog()
        })
    };

    const handleCreate = () => {
        api.post(`${notificationsURL}`,
            {
                title: newTitle,
                content: newContent,
                isGlobal: true,
                sendIt: sendAll
            },
            {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            }
        )
        .then(res => {
            if (sendAll){
                setSnackbarMsg("Notificación creada y enviada con éxito")
            }
            else{
                setSnackbarMsg("Notificación creada con éxito")
            }
            let newNotif = {
                ...res.data,
                createdAt: new Date(res.data.createdAt), // Convert `createdAt` to a Date object
                lastSentAt: res.data.lastSentAt? new Date(res.data.lastSentAt):null,
                updatedAt: new Date(res.data.updatedAt),
            }
            setNotifications((prevNotifs) => [newNotif, ...prevNotifs])    
        })
        .catch(error=>{
            setSnackbarMsg("Error al crear notificación")
        })
        .finally(()=>{
            setSnackbarOpen(true);
            handleCloseCreateNotif()
        })
    };

    const handleSend = () => {
        api.get(`${notificationsURL}/byid/${selectedNotification?.id}/sendAll`,
            {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            }
        )
        .then(res => {
            setSnackbarMsg("Notificación envíada con éxito")
            let newNotif = {
                ...res.data,
                createdAt: new Date(res.data.createdAt), // Convert `createdAt` to a Date object
                lastSentAt: res.data.lastSentAt? new Date(res.data.lastSentAt):null,
                updatedAt: new Date(res.data.updatedAt),
            }
            setNotifications((prevNotifs) => 
                prevNotifs.map((notif) =>
                    notif.id===newNotif.id ? newNotif : notif
                )
            )
        })
        .catch(error=>{
            setSnackbarMsg("Error al enviar notificación")
        })
        .finally(()=>{
            setSnackbarOpen(true);
            handleCloseSendDialog()
        })
    }

    const handleDisable = () => {
        api.delete(`${userHasNotificationURL}/bynotif/${selectedNotification?.id}`,
            {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            }
        )
        .then(res => {
            setSnackbarMsg(res.data.message)
        })
        .catch(error=>{
            console.log(error)
            setSnackbarMsg(error.response.data.message)
        })
        .finally(()=>{
            setSnackbarOpen(true);
            handleCloseDisableDialog()
        })
    }

    const handleCloseEditDialog = () => {
        setSelectedNotification(null)
        setNewContent("")
        setNewTitle("")
        setOpenEditDialog(false);
    };

    const handleCloseSendDialog = () => {
        setSelectedNotification(null)
        setOpenSendDialog(false)
    }

    const handleCloseDisableDialog = () => {
        setSelectedNotification(null)
        setOpenDisableDialog(false)
    }

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleOpenCreateNotif = () => {
        setNewContent("")
        setNewTitle("")
        setOpenCreateDialog(true)
    }

    const handleCloseCreateNotif = () => {
        setNewContent("")
        setNewTitle("")
        setOpenCreateDialog(false)
    }

    return ( 
        <Grid container 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        sx={{width: "100vw", maxWidth:"1000px", gap:"10px"}}>
            <Box 
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                maxWidth: "500px",
                position: 'fixed',
                top: isAppBarVisible?"50px":"0px",
                width:"100%",
                transition: "top 0.3s",
                backgroundColor: 'primary.dark', // Ensure visibility over content
                zIndex: 100,
                boxShadow: 3,
                overflow: "hidden", 
                borderBottom: "5px solid",
                borderLeft: "5px solid",
                borderRight: "5px solid",
                borderColor: "secondary.main",
                boxSizing: "border-box"
            }}
            >
                <Typography variant='h5' width="100%" sx={{py:0.5}} color= "primary.contrastText">
                    Notificaciones
                </Typography>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width:"90vw",
                maxWidth: "1000px",
                overflow: "auto",
                marginTop: "60px",
                
            }}>
                <DataGrid 
                    rows={notifications}
                    columns={columns}
                    rowHeight={32}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    slots={{ toolbar: GridToolbar }}
                    pageSizeOptions={[5, 10]}
                    filterModel={filterModel}
                    onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Apply locale directly
                    sx={{
                        
                        width: "100%", 
                        minWidth: 0,
                        '& .MuiDataGrid-row:nth-of-type(odd)': {
                            backgroundColor: 'secondary.light', // Light grey for odd rows
                            fontFamily: "Montserrat"
                        },
                        '& .MuiDataGrid-row:nth-of-type(even)': {
                            backgroundColor: '#ffffff', // White for even rows
                            fontFamily: "Montserrat"
                        },
                        '& .MuiDataGrid-sortIcon': {
                            color: 'primary.contrastText', // Change sort icon color
                        },
                        '& .MuiDataGrid-menuIconButton': {
                            color: 'primary.contrastText', // Change column menu icon color
                        },
                        '& .header-colors': {
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: "bold",
                            fontFamily: "Righteous",
                            whiteSpace: "normal"
                        },
                        
                    }}
                    />
                    
                    <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}
                    PaperProps={{
                        sx: { 
                            width: "90vw", 
                            maxWidth: "500px", 
                            margin: "auto"
                        }
                        }}
                    >
                        <DialogTitle sx={{display: "flex", 
                        justifyContent: "center", 
                        bgcolor: "primary.dark", 
                        color: "primary.contrastText"
                        }}
                        >
                            Borrar notificación
                        </DialogTitle>
                        <DialogContent>
                            ¿Seguro que desea borrar esta notificación? 
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                                No
                            </Button>
                            <Button onClick={handleDelete} variant="contained" color="primary">
                                Sí
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openSendDialog} onClose={() => setOpenSendDialog(false)}
                        PaperProps={{
                            sx: { 
                              width: "90vw", 
                              maxWidth: "500px", 
                              margin: "auto"
                            }
                        }}    
                    >
                        <DialogTitle sx={{display: "flex", 
                        justifyContent: "center", 
                        bgcolor: "primary.dark", 
                        color: "primary.contrastText"
                        }}>
                            Enviar notificación
                        </DialogTitle>
                        <DialogContent sx={{display:"flex", flexDirection: "column", gap:2}}>
                            <Typography variant="subtitle1" sx={{mt:2}}>
                                <strong>Notificación: {selectedNotification?.title}</strong>
                            </Typography>
                            <Typography variant="subtitle1">
                                ¿Seguro que desea enviar esta notificación a todos los usuarios?
                                {selectedNotification?.lastSentAt
                                    ?<> Esta notificación fue envíada por última vez el {dayjs(selectedNotification.lastSentAt).format("DD/MM/YYYY")}</>
                                    :<> Esta notificación no ha sido envíada anteriormente</>} 
                            </Typography>
                            
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenSendDialog(false)} color="primary">
                                No
                            </Button>
                            <Button onClick={handleSend} variant="contained" color="primary">
                                Sí
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openDisableDialog} onClose={() => setOpenDisableDialog(false)}
                        PaperProps={{
                            sx: { 
                              width: "90vw", 
                              maxWidth: "500px", 
                              margin: "auto"
                            }
                        }}    
                    >
                        <DialogTitle sx={{display: "flex", 
                        justifyContent: "center", 
                        bgcolor: "primary.dark", 
                        color: "primary.contrastText"
                        }}>
                            Cancelar notificación
                        </DialogTitle>
                        <DialogContent sx={{display:"flex", flexDirection: "column", gap:2}}>
                            <Typography variant="subtitle1" sx={{mt:2}}>
                                <strong>Notificación: {selectedNotification?.title}</strong>
                            </Typography>
                            <Typography variant="subtitle1">
                                ¿Seguro que desea deshabilitar esta notificación? La notificación en sí 
                                no será eliminada, pero será eliminada de la lista de notificaciones de cada usuario.
                            </Typography>
                            
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDisableDialog(false)} color="primary">
                                No
                            </Button>
                            <Button onClick={handleDisable} variant="contained" color="primary">
                                Sí
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog}
                    PaperProps={{
                        sx: { 
                          width: "90vw", 
                          maxWidth: "500px", 
                          margin: "auto"
                        }
                      }}>
                        <DialogTitle 
                        sx={{display: "flex", 
                        justifyContent: "center", 
                        bgcolor: "primary.dark", 
                        color: "primary.contrastText"
                        }}>
                            Editar notificación 
                        </DialogTitle>
                        <DialogContent sx={{
                            padding:0.5,
                            flex: 1, 
                            overflowY: 'auto'
                        }}>
                            <TextField
                                sx={{my:2}}
                                label="Título"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                fullWidth    
                            />
                            <TextField
                                multiline
                                rows={3}
                                maxRows={3}
                                label="Contenido"
                                value={newContent}
                                fullWidth
                                onChange={(e) => setNewContent(e.target.value)}
                               />
                        </DialogContent>
                        <DialogActions>
                            <Button 
                            variant="contained" 
                            onClick={handleEdit} 
                            disabled={newTitle==="" || newContent==="" 
                                || newTitle === selectedNotification?.title 
                                && newContent === selectedNotification?.content
                            } 
                            color="primary">
                                Guardar
                            </Button>
                            <Button variant="contained" onClick={handleCloseEditDialog} color="primary">
                                Salir
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openCreateDialog} onClose={handleCloseCreateNotif}
                    PaperProps={{
                        sx: { 
                          width: "90vw", 
                          maxWidth: "500px", 
                          margin: "auto"
                        }
                      }}>
                        <DialogTitle 
                        sx={{display: "flex", 
                        justifyContent: "center", 
                        bgcolor: "primary.dark", 
                        color: "primary.contrastText"
                        }}>
                            Crear notificación 
                        </DialogTitle>
                        <DialogContent sx={{
                            padding:0.5,
                            flex: 1, 
                            overflowY: 'auto'
                        }}>
                            <TextField
                                sx={{my:2}}
                                label="Título"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                fullWidth    
                            />
                            <TextField
                                multiline
                                rows={3}
                                maxRows={3}
                                label="Contenido"
                                value={newContent}
                                fullWidth
                                onChange={(e) => setNewContent(e.target.value)}
                            />
                            <Typography variant="subtitle1">
                                <Checkbox 
                                    checked={sendAll}
                                    onChange={() => setSendAll(!sendAll)}
                                />
                                Envíar a todos de inmediato
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button 
                            variant="contained" 
                            onClick={handleCreate} 
                            disabled={newTitle==="" || newContent==="" } 
                            color="primary">
                                Guardar
                            </Button>
                            <Button variant="contained" onClick={handleCloseCreateNotif} color="primary">
                                Salir
                            </Button>
                        </DialogActions>
                    </Dialog>
                    
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        message={snackbarMsg}
                    >
                        <Alert onClose={handleCloseSnackbar} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                            {snackbarMsg}
                        </Alert>
                    </Snackbar>
                    <Button onClick={handleOpenCreateNotif}
                        variant="dark" 
                        sx={{
                            display: "flex",
                            position: 'fixed',
                            bottom: 0, // 16px from the bottom
                            zIndex: 100, // High zIndex to ensure it's on top of everything
                            height: "48px",
                            width: "50%",
                            maxWidth: "500px"
                        }}
                    >
                        <AddIcon sx={{fontSize: 40}}></AddIcon>
                        <Typography variant='subtitle1' color={"inherit"}>
                            Crear notificación
                        </Typography>
                        
                    </Button>
                    
            </Box>
        </Grid>
    )

}

export default NotificationManager