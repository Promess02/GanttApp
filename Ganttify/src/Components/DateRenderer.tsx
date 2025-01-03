import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDateToYYYYMMDD } from '../Util/UtilFunctions.tsx';
import { FaCalendarAlt } from 'react-icons/fa';
import DatePickerModal from './DatePickerModal.tsx';

const DateCellRenderer = ({ row, isHighlighted, column, updateRowData }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const givenDate = new Date(row[column.key]);
    const initialDate = isNaN(new Date(row[column.key]?.toString()).getTime()) ? new Date() : givenDate;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [minDate, setMinDate] = useState<Date | null>(null);
    const [maxDate, setMaxDate] = useState<Date | null>(null);

  const handleButtonClick = () => {
    setShowDatePicker(true);
    setIsModalOpen(true);
    if (column.key === 'start_date') {
      setMaxDate(new Date(row.end_date));
      setMinDate(null);
    } else if (column.key === 'end_date') {
      setMinDate(new Date(row.start_date));
      setMaxDate(null);
    }
  };
  
  const handleDateChange = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
    const formattedDate = formatDateToYYYYMMDD(date);
    setSelectedDate(date);
    setIsModalOpen(false);
    setShowDatePicker(false);
    updateRowData(row.idx, column.key, formattedDate);
    } else {
      const currentDate = new Date();
      const formattedDate = formatDateToYYYYMMDD(currentDate);
      updateRowData(row.idx, column.key, formattedDate);
    }
  };

  const cellStyle = { 
    fontWeight: isHighlighted ? 'bold' : 'normal', 
    color: isHighlighted ? '#0056b3' : 'inherit', 
    fontSize: '14px',
    marginRight: '2px'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={cellStyle}>{formatDateToYYYYMMDD(selectedDate)}</span>
      <button onClick={handleButtonClick} style={{ marginLeft: '2px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <FaCalendarAlt style={{ fontSize: '16px', color: '#0056b3' }} />
      </button>
      {showDatePicker && (
        <DatePickerModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onClickOutside={() => setShowDatePicker(false)}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
    </div>
  );
};

export default DateCellRenderer;