export const updateRowData = (rowIdx, columnKey, date, rows, setRows) => {
    const updatedRows = rows.map((row, index) => {
      if (index === rowIdx) {
        return { ...row, [columnKey]: date };
      }
      return row;
    });
    setRows(updatedRows);
  };