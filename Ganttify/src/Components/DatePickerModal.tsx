import React from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Modal.setAppElement('#root');

const DatePickerModal = ({ isOpen, onRequestClose, selectedDate, onDateChange, onClickOutside, minDate, maxDate }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Date Picker"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        onClickOutside={onClickOutside}
        dateFormat={'yyyy-MM-dd'}
        inline
        minDate={minDate}
        maxDate={maxDate}
      />
    </Modal>
  );
};

export default DatePickerModal;