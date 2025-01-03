import React from 'react';
import Modal from 'react-modal';
import { Worker } from '../Model/Worker.tsx';
import '../styles/WorkerList.css';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

Modal.setAppElement('#root');

interface LinkResourcePickerProps {
    isOpen: boolean;
    onRequestClose: () => void;
    workers: Worker[];
    onPickWorker(worker_id: string): void;
    selectedWorkerId: string | null;
  }

const LinkResourcePicker: React.FC<LinkResourcePickerProps> = ({ isOpen, onRequestClose, workers, onPickWorker, selectedWorkerId}) => {
    const handlePickWorker = (worker_id: string) => {
        onPickWorker(worker_id);
        onRequestClose();
      };
    
      return (
        <Modal
          isOpen={isOpen}
          onRequestClose={onRequestClose}
          contentLabel="Link Resource Picker"
          className="worker-list-modal"
          overlayClassName="worker-list-overlay"
        >
          <IconButton className="close-button" onClick={onRequestClose} style={{ position: 'absolute', top: 10, right: 10 }}>
            <CloseIcon />
          </IconButton>
          <div className="worker-list">
            <h2>Pick a Worker</h2>
            <ul>
              {workers.map(worker => (
                <li
                key={worker.worker_id}
                onClick={() => handlePickWorker(worker.worker_id)}
                className={worker.worker_id === selectedWorkerId ? 'selected-worker' : 'worker'}
              >
                {worker.name} {worker.surname} - {worker.job_name}
              </li>
              ))}
            </ul>
          </div>
        </Modal>
      );
};

export default LinkResourcePicker;