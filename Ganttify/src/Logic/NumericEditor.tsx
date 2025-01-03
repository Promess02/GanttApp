import React from 'react';

const NumericEditor = ({ row, column, onRowChange }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      onRowChange({ ...row, [column.key]: value });
    }
  };

  return (
    <input
      type="text"
      value={row[column.key]}
      onChange={handleChange}
      style={{ width: '100%' }}
    />
  );
};

export default NumericEditor;