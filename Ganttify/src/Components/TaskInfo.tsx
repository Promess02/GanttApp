import React from 'react';
import { Box, Typography } from '@mui/material';
import { Row } from '../Model/Row.tsx';

interface TaskInfoProps {
    task: Row;
}

const TaskInfo: React.FC<TaskInfoProps> = ({ task }) => {
    return (
        <Box 
            p={2} 
            border={1} 
            borderRadius={4} 
            boxShadow={1}
            bgcolor="background.paper" 
            sx={{ 
                borderRadius: '8px', 
                padding: '16px', 
                margin: '8px', 
                color: 'text.primary',
                backgroundColor: 'background.paper',
                textAlign: 'left' 
            }}
        >
            <Typography variant="h6" gutterBottom>
                {task.name}
            </Typography>
            <Typography variant="body2" gutterBottom>
                Duration: {task.duration}
            </Typography>
            <Typography variant="body2" gutterBottom>
                Start Date: {task.start_date}
            </Typography>
            <Typography variant="body2">
                Hours: {task.hours}
            </Typography>
        </Box>
    );
};

export default TaskInfo;