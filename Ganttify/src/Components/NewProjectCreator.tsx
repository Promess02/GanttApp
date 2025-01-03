import React, { useState } from 'react';
import '../styles/NewProject.css';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Modal from 'react-modal';

interface NewProjectCreatorProps {
    onCreateProject: (projectName: string, projectDescription: string, projectStartDate: string) => void;
    isOpen: boolean;
    onRequestClose: () => void;
};

const NewProjectCreator: React.FC<NewProjectCreatorProps> = ({ onCreateProject, isOpen, onRequestClose }) => {
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectStartDate, setProjectStartDate] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onCreateProject(projectName, projectStartDate, projectDescription);
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="new-project-modal"
            overlayClassName="new-project-overlay">
            <IconButton className="close-button" onClick={onRequestClose} style={{ position: 'absolute', top: 10, right: 10 }}>
                <CloseIcon />
            </IconButton>
            <div className="new-project-creator">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Project Name:</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Project Description:</label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Project Start Date:</label>
                        <input
                            type="date"
                            value={projectStartDate}
                            onChange={(e) => setProjectStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Create Project</button>
                </form>
            </div>
        </Modal>
    );
};

export default NewProjectCreator;