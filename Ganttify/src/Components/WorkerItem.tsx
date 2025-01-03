import React, { useState } from 'react';
import { Worker } from '../Model/Worker.tsx';
import '../styles/WorkerList.css';

interface WorkerItemProps {
  worker: Worker;
  currency: string;
  onDelete: (worker_id: string) => void;
  onModify: (worker: Worker) => void;
}

const WorkerItem: React.FC<WorkerItemProps> = ({ worker, currency, onDelete, onModify }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorker, setEditedWorker] = useState(worker);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedWorker({ ...editedWorker, [name]: value });
  };

  const handleSave = () => {
    onModify(editedWorker);
    setIsEditing(false);
  };

  return (
    <div className="worker-item">
      {isEditing ? (
        <>
          <input name="name" value={editedWorker.name} onChange={handleChange} />
          <input name="surname" value={editedWorker.surname} onChange={handleChange} />
          <input name="job_name" value={editedWorker.job_name} onChange={handleChange} />
          <input name="pay_per_hour" type="number" value={editedWorker.pay_per_hour} onChange={handleChange} />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
        <span>{worker.worker_id}</span>
          <span>{worker.name}</span>
          <span>{worker.surname}</span>
          <span>{worker.job_name}</span>
          <span>{worker.pay_per_hour + currency}</span>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(worker.worker_id)}>Delete</button>
        </>
      )}
    </div>
  );
};

export default WorkerItem;