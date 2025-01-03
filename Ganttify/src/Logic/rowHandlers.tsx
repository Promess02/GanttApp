import React from 'react';
import { TaskTree } from './TaskTree.tsx'; 
import { Row } from "../Model/Row.tsx";
import { findRowIndexByIdx, findDepth } from '../Util/UtilFunctions.tsx';

type SelectedCellState = {
    rowIdx: string;
    rowNumber: number;
    depth: number
  };

  const resetSelectedCell = (rowId: string, rows: Row[], setCell: React.Dispatch<React.SetStateAction<SelectedCellState | null>>) => {
    setCell({ rowIdx: rowId, rowNumber: findRowIndexByIdx(rows, rowId), depth: findDepth(rowId)});
  };

  export const handleDeleteRow = (
    rows: Row[],
    setRows: React.Dispatch<React.SetStateAction<Row[]>>,
    selectedCell: SelectedCellState | null,
    setSelectedCell: React.Dispatch<React.SetStateAction<SelectedCellState | null>>
  ) => {
    const taskTree = new TaskTree(rows);
    if(selectedCell){
      taskTree.removeTask(selectedCell.rowIdx);
      setRows(taskTree.rows);
      resetSelectedCell(selectedCell.rowIdx, taskTree.rows, setSelectedCell);
    }
  };

  export const handleAddRow = (
    rows: Row[],
    setRows: React.Dispatch<React.SetStateAction<Row[]>>,
    selectedCell: SelectedCellState | null,
    setSelectedCell: React.Dispatch<React.SetStateAction<SelectedCellState | null>>
  ) => {
    const taskTree = new TaskTree(rows);
    if(selectedCell){
      taskTree.addTask(selectedCell.rowIdx);
      setRows(taskTree.rows);
      resetSelectedCell(selectedCell.rowIdx, taskTree.rows, setSelectedCell);
    }
  };

  export const handleIndentTask = (
    rows: Row[],
    setRows: React.Dispatch<React.SetStateAction<Row[]>>,
    selectedCell: SelectedCellState | null,
    setSelectedCell: React.Dispatch<React.SetStateAction<SelectedCellState | null>>
  ) => {
    const taskTree = new TaskTree(rows);
    if(selectedCell){
      taskTree.indentTask(selectedCell.rowIdx);
      setRows(taskTree.rows);
      resetSelectedCell(selectedCell.rowIdx, taskTree.rows, setSelectedCell);
    }
  }

  export const handleOutdentTask = (
    rows: Row[],
    setRows: React.Dispatch<React.SetStateAction<Row[]>>,
    selectedCell: SelectedCellState | null,
    setSelectedCell: React.Dispatch<React.SetStateAction<SelectedCellState | null>>
  ) => {
    const taskTree = new TaskTree(rows);
    if(selectedCell){
      taskTree.outdentTask(selectedCell.rowIdx);
      setRows(taskTree.rows);
      resetSelectedCell(selectedCell.rowIdx, taskTree.rows, setSelectedCell);
    }
  }

  export const handleAddSubtasks = (rows: Row[],
    setRows: React.Dispatch<React.SetStateAction< Row[]>>,
    selectedCell: SelectedCellState | null,
    numSubtasks: number,
    setSelectedCell: React.Dispatch<React.SetStateAction<SelectedCellState | null>>) => {
    const taskTree = new TaskTree(rows);
    if(selectedCell){
      taskTree.addSubtasks(selectedCell.rowIdx, numSubtasks);
      setRows(taskTree.rows);
      resetSelectedCell(selectedCell.rowIdx, taskTree.rows, setSelectedCell);
    }
  }