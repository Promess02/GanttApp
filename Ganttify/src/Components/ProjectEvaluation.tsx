import { Row } from "../Model/Row.tsx";
import React from "react";
import { calculateEndDate, calculateStartDate, calculateTotalCost, calculateTotalHours, filterWorkersOnProject } from "../Util/UtilFunctions.tsx";
import { Worker } from "../Model/Worker.tsx";
import Draggable from 'react-draggable';
import { IconButton, Box, Typography, List, ListItem, ListItemText, ListItemIcon} from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloseIcon from "@mui/icons-material/Close";

interface EvaluationProps {
    isOpen: boolean;
    rows: Row[];
    workers: Worker[];
    onRequestClose: () => void;
};

const ProjectEvaluation: React.FC<EvaluationProps> = ({ isOpen, rows, workers, onRequestClose }) => {
    if (!isOpen) {
        return null;
    }
    const startDate = calculateStartDate(rows);
    const endDate = calculateEndDate(rows);
    const totalHours = calculateTotalHours(rows);
    const workersOnProject = filterWorkersOnProject(rows, workers);
    const totalCost = calculateTotalCost(rows, workers);

    return (
            <Draggable defaultClassName="evaluation-draggable">
                <Box sx={{ position: 'relative', padding: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 5 }}>
                    <IconButton className="close-button" onClick={onRequestClose} sx={{ position: 'absolute', top: 10, right: 10 }}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Project Evaluation
                    </Typography>
                    <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body1"><strong>Start Date:</strong> {startDate.toDateString()}</Typography>
                    </Box>
                    <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body1"><strong>End Date:</strong> {endDate.toDateString()}</Typography>
                    </Box>
                    <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body1"><strong>Total Hours:</strong> {totalHours}</Typography>
                    </Box>
                    <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body1"><strong>Total Cost:</strong> ${totalCost.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body1"><strong>Workers:</strong></Typography>
                        <List>
                            {workersOnProject.map(worker => (
                                <ListItem key={worker.worker_id}>
                                <ListItemIcon>
                                    <FiberManualRecordIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={`${worker.name} ${worker.surname}`} />
                            </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            </Draggable>
    );
};

export default ProjectEvaluation;
