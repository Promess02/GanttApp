import { Row } from "../Model/Row.tsx";
import { Worker } from "../Model/Worker.tsx";
import PDFDocument, { set } from 'pdfkit/js/pdfkit.standalone.js';
import blobStream from 'blob-stream';
import { htmlToText } from 'html-to-text';

export function incrementIndex(index: string): string {
    return handleIndexUpdate(index, true);
  }

export function  decrementIndex(index: string): string {
    return handleIndexUpdate(index, false);
  }

function handleIndexUpdate(index: string, increment: boolean) {
    const parts = index.split(".").map(Number);
    if (increment) {
      parts[parts.length - 1] += 1;
    } else {
      parts[parts.length - 1] -= 1;
    }
    const newIdx = parts.join(".");
    return newIdx;
  }

export function generateRow(idx: string, start_date: string, end_date: string, worker_id: string, parent_id: string): Row {
    return {
      idx,
      name: "",
      duration: "",
      start_date,
      end_date,
      hours: "",
      worker_id,
      parent_idx: parent_id,
      previous: "",
      description: "",
    };
  }

  export const findDepth = (idx: string): number => {
    const parts = idx.split('.');
    return parts.length - 1;
  };

  export function rowKeyGetter(row: Row) {
    return row.idx;
  }

  export const findRowIndexByIdx = (rows: Row[], idx: string): number => {
    return rows.findIndex(row => row.idx === idx);
  };

  export const getDiffTime = (row: Row): number => {
       const startDate = new Date(row.start_date);
        const endDate = new Date(row.end_date);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  export const getEndDate = (row: Row): string => {
    const startDate = new Date(row.start_date);
    const duration = parseInt(row.duration, 10);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);
    return endDate.toISOString().split('T')[0];
  }

  export const updateTimeColumns = (updatedRows: Row[], { indexes }: { indexes: number[] }) => {
    const newRows = [...updatedRows];
    indexes.forEach((index) => {
      const row = updatedRows[index];
      if (row.start_date && row.end_date) {
        row.duration = getDiffTime(row).toString();
      } else if (row.start_date && row.duration) {
        row.end_date = getEndDate(row);
      }
      newRows[index] = row;
    });
    return newRows;
  }

  export function sumParentHours(rows: Row[], parentIndex: string) {
    let sum = 0;
    let updatedRows = [...rows];
    let children = checkIfRowIsParent(updatedRows, parentIndex)
    children.forEach((child) => {
      let rowHours = Number(child.hours);
      sum+=rowHours;
    })

    let parentRowIndex = updatedRows.findIndex((row) => row.idx === parentIndex);
    if (parentRowIndex !== -1) {
      updatedRows[parentRowIndex].hours = sum.toString();
    }


    let parentParts = parentIndex.split('.');
    while (parentParts.length>1) {
      parentParts.pop();
      let newParentIndex = parentParts.join('.');
      let parentChildren = checkIfRowIsParent(updatedRows, newParentIndex)
      let subSum = 0;
      parentChildren.forEach((child) => {
          let childHours = Number(child.hours);
          subSum+=childHours;
      })
      let parentIndex = updatedRows.findIndex((node) => node.idx === newParentIndex)
      if (parentIndex !== -1){
        updatedRows[parentIndex].hours = subSum.toString();
      }
    }

    return updatedRows;
  }

  export function checkIfRowIsParent(rows: Row[], idx: string) {
    let depth = idx.split('.').length;
    let children = rows.filter((child) => (child.idx.startsWith(idx) && child.idx !== idx 
    && child.idx.split('.').length === depth+1));
    return children;
  }

  export const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  export function getParentTaskId(index: string): string {
    const parts = index.split('.');
    if (parts.length === 1) {
      return '';
    }
    return parts.slice(0, parts.length - 1).join('.');
  }

  export function getDateValue(date: string): number {
    return new Date(date).getDate().valueOf();
  }

  type Description = {
    task_id: string;
    description: string;
  }

  export const calculateStartDate = (rows: Row[]): Date => {
    return rows.reduce((earliest, row) => {
      const rowStartDate = new Date(row.start_date);
      return rowStartDate < earliest ? rowStartDate : earliest;
    }, new Date(rows[0].start_date));
  };
  
  export const calculateEndDate = (rows: Row[]): Date => {
    return rows.reduce((latest, row) => {
      const rowEndDate = new Date(row.end_date);
      return rowEndDate > latest ? rowEndDate : latest;
    }, new Date(rows[0].end_date));
  };
  
  export const calculateTotalHours = (rows: Row[]): number => {
    return rows.reduce((sum, row) => {
      const depth = row.idx.split('.').length;
      if (depth === 1) {
        const hours = parseFloat(row.hours);
        if (!isNaN(hours)) {
          return sum + hours;
        }
      }
      return sum;
    }, 0);
  };
  
  export const filterWorkersOnProject = (rows: Row[], workers: Worker[]): Worker[] => {
    return workers.filter(worker =>
      rows.some(row => row.worker_id === worker.worker_id)
    );
  };

  export const calculateTotalCost = (rows: Row[], workers: Worker[]): number => {
    return rows.reduce((sum, row) => {
      const worker = workers.find(worker => worker.worker_id === row.worker_id);
      if (worker && checkIfRowIsParent(rows, row.idx).length === 0) {
        return sum + worker.pay_per_hour * parseFloat(row.hours);
      }
      return sum;
    }, 0);
  };
  
  export const getTasksByWorker = (rows: Row[], workers: Worker[]): { worker: Worker, tasks: any[], totalHours: number, totalPay: number }[] => {
    const workersOnProject = filterWorkersOnProject(rows, workers);
    return workersOnProject.map(worker => {
      const tasks = rows
        .filter(row => row.worker_id === worker.worker_id)
        .map(row => ({
          task_name: row.name,
          task_id: row.idx,
          start_date: row.start_date,
          end_date: row.end_date,
          hours: row.hours
        }));
  
      const leafTasks = tasks.filter(task => checkIfRowIsParent(rows, task.task_id).length === 0);
      const totalHours = leafTasks.reduce((sum, task) => sum + parseFloat(task.hours), 0);
      const totalPay = totalHours * worker.pay_per_hour;
      return {
        worker,
        tasks,
        totalHours,
        totalPay
      };
    });
  };

  export const handleGenerateReport = (rows: Row[], workers: Worker[], projectCurrency: 'USD' | 'EUR' | 'PLN' |'GBP', taskDescriptions: Description[]) => {
    const startDate = calculateStartDate(rows);
    const endDate = calculateEndDate(rows);
    const totalHours = calculateTotalHours(rows);
    const workersOnProject = filterWorkersOnProject(rows, workers);
    const totalCost = calculateTotalCost(rows, workers);
    const tasksByWorker = getTasksByWorker(rows, workers);

    const fetchFont = async (url: string): Promise<ArrayBuffer> => {
      const response = await fetch(url);
      return await response.arrayBuffer();
    };

    const generateReport = async () => {
      const report = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalHours,
        workersOnProject,
        totalCost,
        tasksByWorker
      };

      const fontBuffer = await fetchFont('/Roboto-Medium.ttf');
      const doc = new PDFDocument();
      const stream = doc.pipe(blobStream());
      doc.registerFont('Roboto', fontBuffer);
      doc.font('Roboto');
      doc.fontSize(18).text('Project Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Start Date: ${report.startDate}`);
      doc.text(`End Date: ${report.endDate}`);
      doc.moveDown();
      doc.text(`Total Hours: ${report.totalHours}`);

      const currencySymbol = (() => {
        switch (projectCurrency) {
          case 'USD':
            return '$';
          case 'EUR':
            return '€';
          case 'PLN':
            return 'zł';
          case 'GBP':
            return '£';
          default:
            return '';
        }
      })();

      doc.moveDown();
      doc.text(`Total Cost: ${report.totalCost.toFixed(2)}${currencySymbol}`);
      doc.moveDown();
      doc.text('Workers on Project:');
      report.workersOnProject.forEach((worker) => {
        doc.text(`${worker.name} ${worker.surname} - ${worker.job_name}`);
      });

      doc.addPage();
      doc.fontSize(14).text('Total Hours and Pay for Each Worker:', { underline: true });
      report.tasksByWorker.forEach((workerReport) => {
        doc.moveDown();
        doc.fontSize(12).text(`Worker: ${workerReport.worker.name} ${workerReport.worker.surname}`);
        doc.text(`Total Hours: ${workerReport.totalHours}`);
        doc.text(`Total Pay: ${workerReport.totalPay.toFixed(2)}${currencySymbol}`);
      });

      doc.moveDown();
      report.tasksByWorker.forEach((workerReport, index) => {
        if (index > 0) {
          doc.addPage();
        }
        doc.moveDown();
        doc.fontSize(14).text(`Tasks for ${workerReport.worker.name} ${workerReport.worker.surname}:`, { underline: true });
        workerReport.tasks.forEach((task) => {
          doc.moveDown();
          doc.fontSize(12).text(`Task name: ${task.task_name}`);
          doc.text(`Start Date: ${task.start_date}`);
          doc.text(`End Date: ${task.end_date}`);
          doc.text(`Hours: ${task.hours}`);
          doc.text(`Total Pay: ${(parseFloat(task.hours) * workerReport.worker.pay_per_hour).toFixed(2)}${currencySymbol}`);
          const description = taskDescriptions.find(description => description.task_id === task.task_id)?.description || 'No description';
          const textDescription = htmlToText(description, {
            wordwrap: 130,
            tags: {
              'a': { options: { hideLinkHrefIfSameAsText: true } },
              'b': { format: 'bold' },
              'i': { format: 'italic' },
              'u': { format: 'underline' },
            }
          });
          doc.text(`Description:`);
          doc.text(textDescription);
        });
      });

      doc.end();
      stream.on('finish', function () {
        const blob = stream.toBlobURL('application/pdf');
        window.open(blob);
      });
    };

    generateReport().catch(error => console.error(error));
  };