import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Modal from 'react-modal';
import '../styles/modals.css';

interface TaskDescriptionWindowProps {
    isModalOpen: boolean;
    initialDescription: string;
    task_id: string | undefined;
    onSave: (task_id: string, newDescription: string) => void;
    onCancel: () => void;
}

const TaskDescriptionWindow: React.FC<TaskDescriptionWindowProps> = ({isModalOpen, initialDescription, task_id, onSave, onCancel }) => {
    const [description, setDescription] = useState(initialDescription);

    const handleSave = () => {
        if (task_id === undefined) {
            return;
        }
        onSave(task_id, description);
        onCancel();
    };

    if (task_id === undefined) {
        return null;
    }

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={onCancel}
            contentLabel="Task Description"
            ariaHideApp={false}
            className="task-description-modal"
            overlayClassName="task-description-overlay"
        >
            <div className="task-description-window">
                <ReactQuill value={description} onChange={setDescription} />
                <div className="buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </Modal>
    );
};

export default TaskDescriptionWindow;