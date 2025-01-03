import React, { useState} from 'react';
import { Box, List, ListItem, ListItemText, Typography, Divider, IconButton, Dialog, DialogTitle, DialogContent,DialogActions, Button, DialogContentText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000';

interface Project {
    project_id: number;
    project_name: string;
}

interface ProjectPickerProps {
    projects: Project[];
    handleCloseDrawer: () => void;
    onProjectSelect: (projectId: number, tasks: any[], workers: any[]) => void;
    onCreateNewProject: () => void;
    onDeleteProject: (projectId: number, err: string) => void;
}

const ProjectPicker: React.FC<ProjectPickerProps> = ({ projects, handleCloseDrawer, onProjectSelect, onCreateNewProject, onDeleteProject }) => {
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    const handleProjectClick = async (projectId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const responseTasks = await axios.get(`/projects/${projectId}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const responseWorkers = await axios.get(`/projects/${projectId}/workers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            onProjectSelect(projectId, responseTasks.data, responseWorkers.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCreateNewProject = () => {
        handleCloseDrawer();
        onCreateNewProject();
    };

    const handleDeleteProject = (projectId: number) => {
        setSelectedProjectId(projectId);
        setOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedProjectId !== null) {
            try {
                const response = await axios.delete(`/projects/${selectedProjectId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
    
                if (response.status !== 200) {
                    throw new Error('Failed to delete project');
                }
    
                console.log(response.data.message);
                const err = '';
                onDeleteProject(selectedProjectId, err);
            } catch (error) {
                console.error('Error deleting project:', error);
                onDeleteProject(selectedProjectId, error.message);
            }
        }
        setOpen(false);
    };

    const handleCancelDelete = () => {
        setOpen(false);
        setSelectedProjectId(null);
    };


    return (
        <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto', mt: 4 }}>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <List>
                {projects.map((project) => (
                    <React.Fragment key={project.project_id}>
                        <ListItem button onClick={() => handleProjectClick(project.project_id)} sx={{ borderBottom: '1px solid #ccc' }}>
                            <ListItemText 
                                primary={project.project_name} 
                                primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#007bff' }} 
                            />
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteProject(project.project_id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            <ListItem button onClick={handleCreateNewProject} sx={{ borderBottom: '1px solid #ccc' }}>
                <ListItemText primary="Create a new project" primaryTypographyProps={{ fontSize: '1rem', fontWeight: 'bold' }} />
            </ListItem>
            </List>

            <Dialog open={open} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this project and all its resources?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectPicker;