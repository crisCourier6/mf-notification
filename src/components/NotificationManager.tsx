import React, { useEffect, useState } from "react";
import { Button, Box, Alert, Grid, Dialog, DialogContent, DialogActions, TextField, Snackbar, 
    IconButton, Typography, DialogTitle, Tooltip, Checkbox} from '@mui/material';
import api from "../api";
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridToolbar, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from "@mui/x-data-grid"
import { esES } from '@mui/x-data-grid/locales';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CancelScheduleSendRoundedIcon from '@mui/icons-material/CancelScheduleSendRounded';
import CloseIcon from '@mui/icons-material/Close';
import { Notification } from "../interfaces/Notification";
import dayjs from "dayjs";
import NavigateBack from "./NavigateBack";

const NotificationManager: React.FC<{isAppBarVisible:boolean}> = ({ isAppBarVisible }) => {
    const notificationsURL = "/notification"
    const userHasNotificationURL = "/userhasnotification"
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
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
    const [showInactive, setShowInactive] = useState(true);
    const [allDone, setAllDone] = useState(false)
    
    useEffect(()=>{
        document.title = "Administrador de notificaciones - EF Admin";
        let queryParams = "?wu=true&og=true"
        api.get(`${notificationsURL}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
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
            setFilteredNotifications(transformedNotif)
        })
        .catch(error => console.log(error.response))
        .finally(()=>{
            setAllDone(true)
        })
    },[])

    useEffect(()=>{
        if (showInactive){
            setFilteredNotifications(notifications)
        }
        else{
            setFilteredNotifications(notifications.filter((row:Notification) => row.isActive))
        }
    }, [showInactive, notifications])

    const columns: GridColDef[] = [
        {field: "updatedAt", headerName: "Modificada el", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date"
        },
        {field: "createdAt", headerName: "Creada el", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date"
        },
        {field: "lastSentAt", headerName: "Envíada el", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date",
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleDateString() : "Nunca";
            },
        },
        {field: "title", headerName: "Título", flex: 1.5, headerClassName: "header-colors", headerAlign: "center"},
        {field: "content", headerName: "Contenido", flex: 2.5, headerClassName: "header-colors", headerAlign: "center",
            renderCell: (params) => (
                <Box
                    key={params.row.id}
                  sx={{
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {params.value}
                </Box>
              ),
        },
        
        {
            field: 'actions',
            headerName: 'Acciones',
            flex: 1,
            headerClassName: "header-colors",
            headerAlign: "center", 
            type: "actions",
            renderCell: (params: GridRenderCellParams) => (
                <Box  key={params.row.id} sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    height: '100%',
                }}>
                    {
                        params.row.isActive 
                            ?   <>
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
                                    <Tooltip title="Eliminar" key="delete" placement="right" arrow>
                                        <IconButton color="error" onClick={() => {
                                            setSelectedNotification(params.row);
                                            setOpenDeleteDialog(true);}}>
                                            <DeleteForeverRoundedIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            :   <>
                                     <Tooltip title="Eliminar" key="delete" placement="right" arrow>
                                        <IconButton color="error" onClick={() => {
                                            setSelectedNotification(params.row);
                                            setOpenDeleteDialog(true);}}>
                                            <DeleteForeverRoundedIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                    }
                    
                    
                    
                </Box>
            )
        }
    ]

      const handleDelete = async () => {
        try {
            await api.delete(`${notificationsURL}/byid/${selectedNotification?.id}`, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + token
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
                    Authorization: "Bearer " + token
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
            setFilteredNotifications((prevNotifs) => 
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
                    Authorization: "Bearer " + token
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
            setFilteredNotifications((prevNotifs) => [newNotif, ...prevNotifs])   
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
                    Authorization: "Bearer " + token
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
                isActive: false
            }
            setNotifications((prevNotifs) => 
                prevNotifs.map((notif) =>
                    notif.id===newNotif.id ? newNotif : notif
                )
            )
            setFilteredNotifications((prevNotifs) => 
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
        api.patch(`${notificationsURL}/byid/${selectedNotification?.id}`,
            {
                isActive: false
            },
            {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        )
        .then(res => {
            setSnackbarMsg("Notificación desactivada con éxito")
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

    const CustomToolbar: React.FC = () => (
        <GridToolbarContainer
        sx={{
            border: "2px solid",
            borderColor: 'primary.dark', // Change the background color
        }}>
            <GridToolbarColumnsButton/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarExport />
            <Tooltip
                title={showInactive ? "Ocultar Inactivos" : "Mostrar Inactivos"}
                key="toggle"
                placement="bottom"
                >
                <Button
                    onClick={() => setShowInactive((prev) => !prev)}
                    sx={{ fontSize: 13, gap:1 }}
                >
                    {showInactive ? <VisibilityOff/> : <Visibility/>}
                    {showInactive ? <>Ocultar enviadas</> : <>Mostrar enviadas</>}
                </Button>
            </Tooltip>
            <Tooltip title="Crear notificación" key="create" placement="bottom">
                <Button
                    onClick={handleOpenCreateNotif}
                    sx={{fontSize: 13}}
                >
                    <AddIcon/>
                    Crear
                </Button>
            </Tooltip>
        </GridToolbarContainer>
    );

    return ( 
        allDone && <Grid container 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        sx={{width: "100vw", maxWidth:"1000px", gap:"10px"}}>
            <Box 
            sx={{
                display: "flex",
                flexDirection: "row",
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
                color: "primary.contrastText",
                boxSizing: "border-box"
            }}
            >
                <Box sx={{display: "flex", flex: 1}}>
                    <NavigateBack/>
                </Box>
                <Box sx={{display: "flex", flex: 4}}>
                    <Typography variant='h5' width="100%"  color="primary.contrastText" sx={{py:1}}>
                        Notificaciones
                    </Typography>
                </Box>
                <Box sx={{display: "flex", flex: 1}}/>
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
                    rows={filteredNotifications}
                    columns={columns}
                    autoHeight
                    getRowHeight={() => "auto"} // Dynamically adjust row height
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                        columns: {
                            columnVisibilityModel: {
                                updatedAt: false
                            },
                        },
                    }}
                    getRowClassName={(params) =>
                        !params.row.isActive ? "inactive-row" : ""
                    }
                    slots={{ toolbar: CustomToolbar }}
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
                            backgroundColor: 'secondary.light', // White for even rows
                            fontFamily: "Montserrat"
                        },
                        "& .MuiDataGrid-row.inactive-row": {
                            backgroundColor: "#dedede", // Light gray background for inactive rows
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
                        <DialogContent sx={{display:"flex", flexDirection: "column", gap:2}}>
                            <Typography variant="subtitle1" sx={{mt:2}}>
                                <strong>Notificación: {selectedNotification?.title}</strong>
                            </Typography>
                            <Typography variant="subtitle1">
                                ¿Seguro que desea borrar esta notificación?
                            </Typography>
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
                            <Box sx={{display:"flex", justifyContent: "space-between", width: "100%"}}>
                                Editar Notificación
                                <IconButton
                                color="inherit"
                                onClick={handleCloseEditDialog}
                                sx={{p:0}}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
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
                        justifyContent: "space-between", 
                        bgcolor: "primary.dark", 
                        color: "primary.contrastText"
                        }}>
                            <Box sx={{display:"flex", justifyContent: "space-between", width: "100%"}}>
                                Crear Notificación
                                <IconButton
                                color="inherit"
                                onClick={handleCloseCreateNotif}
                                sx={{p:0}}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                           
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
                        </DialogActions>
                    </Dialog>
                    
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        message={snackbarMsg}
                    >
                        <Alert variant="filled" onClose={handleCloseSnackbar} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                            {snackbarMsg}
                        </Alert>
                    </Snackbar>
                    
                    
            </Box>
        </Grid>
    )

}

export default NotificationManager