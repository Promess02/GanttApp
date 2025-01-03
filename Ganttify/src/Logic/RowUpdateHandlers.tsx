import { Row } from "../Model/Row";
import { findRowIndexByIdx, getDiffTime, getParentTaskId, sumParentHours } from '../Util/UtilFunctions.tsx';

export const updateHours = (rowIdx: string, updatedRows: Row[]) => {
  let parentIndex = findRowIndexByIdx(updatedRows, getParentTaskId(rowIdx));
  if (parentIndex !== -1) {
    updatedRows = sumParentHours(updatedRows, getParentTaskId(rowIdx));
  }

  return updatedRows;
};

export const updatePredecessor = (updatedRow: Row, previous: Row) => {
  let previousEndDate = new Date(previous.end_date);
  let startDate = new Date(updatedRow.start_date);
  let endDate = new Date(updatedRow.end_date);
  if (previousEndDate.getTime() > startDate.getTime()) {
    updatedRow.start_date = previous.end_date;
    if (endDate.getTime() < previousEndDate.getTime()) {
      updatedRow.end_date = updatedRow.start_date;
    }
    if (updatedRow.duration !== "") {
      let newEndDate = new Date(updatedRow.start_date);
      newEndDate.setDate(newEndDate.getDate() + parseInt(updatedRow.duration, 10));
      updatedRow.end_date = newEndDate.toISOString().split('T')[0];
    }
  }
  return updatedRow;
};



export const updateEndDate = (row: Row, index: number, updatedRows: Row[]) => {
    let startDate = new Date(row.start_date);
    let duration = parseInt(row.duration, 10);
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);
    let oldEndDate = new Date(row.end_date);
    row.end_date = endDate.toISOString().split('T')[0];
    let diffDays = Math.ceil((endDate.getTime() - oldEndDate.getTime()) / (1000 * 3600 * 24));

    const shiftSubsequentTasks = (taskIdx: string, days: number, parentIdx: string = '/') => {
        updatedRows.forEach(task => {
          if (task.previous === taskIdx || task.previous === parentIdx) {
            let taskStartDate = new Date(task.start_date);
            let taskEndDate = new Date(task.end_date);
            taskStartDate.setDate(taskStartDate.getDate() + days);
            taskEndDate.setDate(taskEndDate.getDate() + days);
            task.start_date = taskStartDate.toISOString().split('T')[0];
            task.end_date = taskEndDate.toISOString().split('T')[0];
            shiftSubsequentTasks(task.idx, diffDays);
          }
        });
      };
  
    const parentId = getParentTaskId(row.idx);
    let parentIndex = findRowIndexByIdx(updatedRows, parentId);
    if (parentIndex !== -1) {
      let parentEndDate = new Date(updatedRows[parentIndex].end_date);
      if (parentEndDate.getTime() < endDate.getTime()) {
        updatedRows[parentIndex].end_date = row.end_date;
        updatedRows[parentIndex].duration = getDiffTime(updatedRows[parentIndex]).toString();
      }
  
      let parentIdx = updatedRows[parentIndex].idx;
      let children = updatedRows.filter(r => r.idx.startsWith(parentIdx + '.'));
      let latestChildEndDate = new Date(Math.max(...children.map(child => new Date(child.end_date).getTime())));
      if (parentEndDate.getTime() < latestChildEndDate.getTime()) {
        updatedRows[parentIndex].end_date = latestChildEndDate.toISOString().split('T')[0];
        shiftSubsequentTasks(updatedRows[parentIndex].idx, diffDays, parentId);
      }
    }
    shiftSubsequentTasks(row.idx, diffDays);
  
    updatedRows[index] = row;
    return updatedRows;
  };

export const getAllSuccessors = (rowIdx: string, rows: Row[]) => {
  let successors = new Array<Row>();
  rows.forEach(row => {
    if (row.previous === rowIdx) {
      successors.push(row);
    }
  });
  return successors;
};