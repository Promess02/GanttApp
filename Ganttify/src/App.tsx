import React, { useState, useEffect } from 'react';
import DataGrid, { CellClickArgs } from 'react-data-grid';
import GanttChart from './Components/GanttChart.tsx';
import "./styles/App.css";
import 'react-data-grid/lib/styles.css';
import ResizableContainer from './Components/ResizableContainer.tsx';
import MyAppBar from './Components/MyAppBar.tsx';
import { Fab, Box, Menu, MenuItem } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Row } from "./Model/Row.tsx";
import { getColumns } from './Model/ColumArray.tsx';
import { findDepth, rowKeyGetter, findRowIndexByIdx, updateTimeColumns, getParentTaskId, handleGenerateReport } from './Util/UtilFunctions.tsx';
import { handleAddRow, handleDeleteRow, handleAddSubtasks, handleIndentTask, handleOutdentTask } from './Logic/rowHandlers.tsx';
import ErrorMessage from './Components/ErrorMessage.tsx';
import WorkerList from './Components/WorkerList.tsx';
import { Worker } from './Model/Worker.tsx';
import LinkResourcePicker from './Components/LinkResourcePicker.tsx';
import AuthScreen from './Components/AuthScreen.tsx';
import axios from 'axios';
import { htmlToText } from 'html-to-text';
import '@fontsource/roboto/400.css'
import ProjectPicker from './Components/ProjectPicker.tsx';
import NewProjectCreator from './Components/NewProjectCreator.tsx';
import { Project } from './Model/Project.tsx';
import TaskDescriptionWindow from './Components/TaskDescriptionWindow.tsx';
import TaskLinkedList from './Components/TaskLinkedList.tsx';
import WBStree from './Components/WBStree.tsx';
import { updateHours, updatePredecessor, updateEndDate, getAllSuccessors } from './Logic/RowUpdateHandlers.tsx';
import ProjectEvaluation from './Components/ProjectEvaluation.tsx';

type SelectedCellState = {
  rowIdx: string;
  rowNumber: number;
  depth: number
};

type Description = {
  task_id: string;
  description: string;
}

const App: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCellState | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showWorkerList, setShowWorkerList] = useState(false);
  const [showLinkResource, setShowLinkResource] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [project_name, setProjectName] = useState<string>('');
  const [user_email, setUserEmail] = useState<string>('');
  const [newProjectCreator, setNewProjectCreator] = useState<boolean>(false);
  const [projectCurrency, setProjectCurrency] = useState<'USD' | 'GBP' | 'PLN' | 'EUR'>('USD');
  const [taskDescriptions, setTaskDescriptions] = useState<Description[]>([]);
  const [showTaskDescription, setShowTaskDescription] = useState<boolean>(false);
  const [infoType, setInfoType] = useState<boolean>(false);
  const [view, setView] = useState<'showChartAndGrid' | 'onlyGrid' | 'onlyChart' | 'onlyNetwork' | 'onlyWBS'>('showChartAndGrid'); 
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [projectsFetched, setProjectsFetched] = useState(false); 
  const [evaluation, setEvaluation] = useState(false);

  const handleLoginSuccess = (user_email: string) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user_email', user_email);
    setIsLoggedIn(true);
    setUserEmail(user_email);
    fetchProjects();
   };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedProjectId(null);
    setRows([]);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user_email');
    localStorage.removeItem('selectedProjectId');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const fetchProjectsAndSelectedProject = async () => {
      if (projectsFetched){
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setInfoType(true);
          setError('No token found');
          return;
        }

        const response = await axios.get('/projects', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProjects(response.data);
        setIsLoggedIn(true);
        setProjectsFetched(true);

        const storedProjectId = localStorage.getItem('selectedProjectId');
        if (storedProjectId) {
          await fetchProject(Number(storedProjectId));
          setSelectedProjectId(Number(storedProjectId));
        }
      } catch (error) {
        setInfoType(true);
        setError('fetch error');
      }
    };

    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedIsLoggedIn === 'true') {
      fetchProjectsAndSelectedProject();
    }
    const storedUserEmail = localStorage.getItem('user_email');
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }
  }, []);

  const fetchProjects = async () => {
      if (projectsFetched){
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setInfoType(true);
          setError('No token found');
          return;
        }

        const response = await axios.get('/projects', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProjects(response.data);
        setProjectsFetched(true);
      } catch (error) {
        setInfoType(true);
        setError('fetch error');
      }
  }

  useEffect(() => {
    if (projectsFetched && selectedProjectId !== null) {
      fetchProject(selectedProjectId);
    }
  }, [projectsFetched, selectedProjectId]);

  const fetchProject = async (projectId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const responseTasks = await axios.get(`/projects/${projectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const responseWorkers = await axios.get(`/projects/${projectId}/workers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      handleProjectSelect(projectId, responseTasks.data, responseWorkers.data);
    } catch (error){
      setInfoType(true);
      setError('project select error');
    }
  };

  const handleProjectSelect = (projectId: number, tasks: any[], workers: any[]) => {
    setSelectedProjectId(projectId);
    localStorage.setItem('selectedProjectId', projectId.toString());
    tasks = tasks.map((task) => ({
      idx: String(task.task_index),
      name: task.name,
      duration: task.days,
      start_date: task.start_date,
      end_date: task.end_date,
      hours: task.hours,
      worker_id: task.worker,
      parent_idx: task.parent,
      previous: task.previous,
      description: task.description
    }));

  tasks.sort((a, b) => {
    const idxA = a.idx.split('.').map(Number); 
    const idxB = b.idx.split('.').map(Number);

    for (let i = 0; i < Math.max(idxA.length, idxB.length); i++) {
      const numA = idxA[i] || 0; 
      const numB = idxB[i] || 0;
      if (numA !== numB) return numA - numB; 
    }
    return 0; 
  });

  setRows(tasks);
    workers = workers.map((worker) => ({
      worker_id: worker.worker_id,
      name: worker.name,
      surname: worker.surname,
      job_name: worker.job,
      pay_per_hour: worker.pay
    }));
    setWorkers(workers);
    const selectedProject = projects.find(project => project.project_id === projectId);
    if (selectedProject) {
      setProjectName(selectedProject.project_name);
    }
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleClickAnchor = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAnchor = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (viewOption: 'showChartAndGrid' | 'onlyGrid' | 'onlyChart' | 'onlyNetwork' | 'onlyWBS') => {
    setView(viewOption);
    handleCloseAnchor();
  };

  const handleCellClick = (args: CellClickArgs<Row, unknown>) => {
    setSelectedCell({
      rowIdx: `${args.row.idx}`,
      rowNumber: findRowIndexByIdx(rows, args.row.idx),
      depth: findDepth(`${args.row.idx}`)
    });
    setSelectedWorkerId(args.row.worker_id);
  };

  const handleChangeProjectCurrency = (currency: 'USD' | 'GBP' | 'PLN' | 'EUR') => {
    setProjectCurrency(currency);
  };

  const handleRowsChange = (updatedRows: Row[], { indexes }: { indexes: number[] }) => {
    try {
      const index = indexes[0];
      const updatedRow = updatedRows[index];
      if (updatedRow.start_date === '') {
        updatedRow.start_date = new Date().toISOString().split('T')[0];
      }

      if (updatedRow.hours !== rows[index].hours) {
        updatedRows = updateHours(updatedRow.idx, updatedRows);
      }
      if (updatedRow.previous !== rows[index].previous) {
        let previous = updatedRows[findRowIndexByIdx(updatedRows, updatedRow.previous)];
        updatedRows[index] = updatePredecessor(updatedRow, previous);
      }
      if (updatedRow.duration !== rows[index].duration) {
        updatedRows = updateEndDate(updatedRow, index, updatedRows);
      }
      if (updatedRow.end_date !== rows[index].end_date) {
        let successors = getAllSuccessors(updatedRow.idx, updatedRows);
        successors.forEach(successor => {
          updatedRows[findRowIndexByIdx(updatedRows, successor.idx)] = updatePredecessor(successor, updatedRow);
        });
      }
      const newRows = updateTimeColumns(updatedRows, { indexes });
      setRows(newRows);
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      setInfoType(true);
      setError('Error updating rows: \n ' + error);
    }
  };

  const updateRowData = (rowIdx, columnKey, date) => {
    try {
      const updatedRows = [...rows];
      let index = findRowIndexByIdx(rows, rowIdx);
      updatedRows[index] = { ...updatedRows[index], [columnKey]: date };
      let parentIndex = findRowIndexByIdx(updatedRows, getParentTaskId(rowIdx));
      if (parentIndex !== -1 && columnKey === 'end_date') {
        let parentDateValue = new Date(updatedRows[parentIndex].end_date).getTime();
        let dateValue = new Date(date).getTime();

        if (parentDateValue < dateValue) {
          updatedRows[parentIndex] = { ...updatedRows[parentIndex], end_date: date };
        }
      }

      handleRowsChange(updatedRows, { indexes: [index] });
    } catch (error) {
      setInfoType(true);
      setError('Error updating row data');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleDefineResource = () => {
    setShowWorkerList(!showWorkerList);
  };

  const handleAddWorker = (newWorker: Worker) => {
    setWorkers([...workers, { ...newWorker, worker_id: (workers.length + 1).toString() }]);
  };

  const handleDeleteWorker = (worker_id: string) => {
    setWorkers(workers.filter(worker => worker.worker_id !== worker_id));
  };

  const handleModifyWorker = (modifiedWorker: Worker) => {
    setWorkers(workers.map(worker => (worker.worker_id === modifiedWorker.worker_id ? modifiedWorker : worker)));
  };

  const handleLinkResource = () => {
    setShowLinkResource(!showLinkResource);
  };

  const showNewProjectCreator = () => {
    setNewProjectCreator(true);
  }

  const closeNewProjectCreator = () => {
    setNewProjectCreator(false);
  }

  const handleCreateNewProject = (project: string, project_start: string, project_description: string) => {
    const newRows = new Array<Row>();
    newRows.push({ idx: '1', name: 'First task', duration: '0', start_date: project_start, end_date: project_start, hours: '0', worker_id: '', parent_idx: '', previous: '', description: '' });

    const token = localStorage.getItem('token');
    if (!token) {
      setInfoType(true);
      setError('No token found');
      return;
    }

    axios.post('/projects', {
      projectName: project,
      projectDescription: project_description,
      startDate: project_start,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      const newProject = response.data;
      newProject.description = project_description;
      newProject.project_name = project;
      newProject.start_date = project_start;
      setProjects([...projects, newProject]);
      setProjectName(project);
      setSelectedProjectId(newProject.project_id);
      setInfoType(false);
      setError('Project created successfully');
    }).catch(error => setError('Creating project failed'));

    setRows(newRows);
  };

  const handleDeleteProject = (projectId: number, err: string) => {
    if (err!=='') {
      setInfoType(true);
      setError(err);
      return;
    }
    setProjects(projects.filter(project => project.project_id !== projectId));
    if (projectId === selectedProjectId) {
      setSelectedProjectId(null);
      localStorage.removeItem('selectedProjectId');
    }
  };

  const handlePickWorker = (worker_id: string) => {
    if (selectedCell) {
      const updatedRows = [...rows];
      const rowIndex = selectedCell.rowNumber;
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], worker_id };
      setRows(updatedRows);
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  const handleUnlinkResource = () => {
    if (selectedCell) {
      const updatedRows = [...rows];
      const rowIndex = selectedCell.rowNumber;
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], worker_id: '' };
      setRows(updatedRows);
      setRefreshKey(prevKey => prevKey + 1);
    }
  };

  const handleAddTaskDescription = (task_idx: string, description: string) => {
    setTaskDescriptions(prevDescriptions => {
      const existingDescriptionIndex = prevDescriptions.findIndex(desc => desc.task_id === task_idx);
      if (existingDescriptionIndex !== -1) {
        const updatedDescriptions = [...prevDescriptions];
        updatedDescriptions[existingDescriptionIndex].description = description;
        return updatedDescriptions;
      } else {
        return [...prevDescriptions, { task_id: task_idx, description: description }];
      }
    });
    const updatedRows = rows.map(row => {
      if (row.idx === task_idx) {
        const plainTextDescription = htmlToText(description, {
          wordwrap: 130,
          tags: {
            'a': { options: { hideLinkHrefIfSameAsText: true } },
            'b': { format: 'bold' },
            'i': { format: 'italic' },
            'u': { format: 'underline' },
          }
        });
        return { ...row, description: plainTextDescription };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleInitDescription = () => {
    const description = taskDescriptions.find((description) => {
      return description.task_id === selectedCell?.rowIdx;
    })?.description;

    return description === undefined ? "" : description;
  }

  const handleChangeProjectName = (newName: string) => {
    setProjectName(newName);
    setProjects(projects.map(project => (project.project_id === selectedProjectId ? { ...project, project_name: newName } : project)));
  }

  const handleSaveProject = () => {
    const token = localStorage.getItem('token');
    const body = {
      project_name: project_name,
      project_description: '',
      tasks: rows.map(row => ({
        task_id: rows.findIndex(r => r.idx === row.idx) + 1,
        task_index: row.idx,
        project_id: selectedProjectId,
        name: row.name,
        days: row.duration,
        start_date: row.start_date,
        end_date: row.end_date,
        hours: row.hours,
        worker: row.worker_id,
        parent: row.parent_idx,
        previous: row.previous,
        description: taskDescriptions.find(description => description.task_id === row.idx)?.description || ''
      })),
      workers: workers.map(worker => ({
        worker_id: worker.worker_id,
        name: worker.name,
        surname: worker.surname,
        job: worker.job_name,
        pay: worker.pay_per_hour
      }))
    }
    if (!token) {
      setInfoType(true);
      setError('No token found');
      return;
    }

    axios.put(`/projects/${selectedProjectId}`, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
      
    }).then(_ => {
      setInfoType(false);
      setError('Project saved successfully');
    })
    .catch(error => {
      setInfoType(true);
      setError('Saving project failed')
    });
  };

  const gridElement = (
    <DataGrid
      key={refreshKey}
      rowKeyGetter={rowKeyGetter}
      columns={getColumns(rows, view, workers, updateRowData)}
      rows={rows}
      defaultColumnOptions={{
        resizable: true
      }}
      onRowsChange={handleRowsChange}
      className="fill-grid"
      onCellClick={handleCellClick}
    />
  );

  const renderView = () => {
    switch (view) {
      case 'showChartAndGrid':
        return (
          <ResizableContainer>
          <div id="spreadsheet-container" className="spreadsheet-container">{gridElement}</div>
          <div id="gantt-chart-container" className='fill-grid'>
            <GanttChart project_name={project_name} key={refreshKey} rows={rows} />
          </div>
        </ResizableContainer>
        );
      case 'onlyGrid':
        return (
          <div className='container'>
            <div className="grid-only">
            <div id="spreadsheet-container" className="spreadsheet-container">{gridElement}</div>
            </div>
          </div>  
        );
      case 'onlyChart':
        return (
          <div className='container'>
          <div className="chart-only">
            <GanttChart project_name={project_name} key={refreshKey} rows={rows} />
          </div>
          </div>
        );
      case 'onlyNetwork':
        const rows_copy = rows;
        return (
          <div className="network-only">
            <TaskLinkedList tasks={rows_copy} />
          </div>
        );
      case 'onlyWBS':
          return (
            <div className="network-only">
              <WBStree tasks={rows} />
            </div>
          );
      default:
        return  null;
    }
    
  };  

  return (
    <div>
      {isLoggedIn ? (
        selectedProjectId ? (
          <>
            <MyAppBar project_name={project_name} selectedProjectId={selectedProjectId} user_email={user_email} projects={projects} project_currency={projectCurrency} onProjectSelect={handleProjectSelect} onAddRow={() => handleAddRow(rows, setRows, selectedCell, setSelectedCell)} onShowProjectEvaluation={() => setEvaluation(true)}
              onDeleteRow={() => handleDeleteRow(rows, setRows, selectedCell, setSelectedCell)}
              onAddSubtasks={(numSubtasks) => handleAddSubtasks(rows, setRows, selectedCell, numSubtasks, setSelectedCell)}
              onIndentRow={() => handleIndentTask(rows, setRows, selectedCell, setSelectedCell)}
              onOutdentRow={() => handleOutdentTask(rows, setRows, selectedCell, setSelectedCell)}
              onHandleResources={handleDefineResource}
              onLinkResource={handleLinkResource}
              onUnlinkResource={handleUnlinkResource}
              onGenerateReport={() => handleGenerateReport(rows, workers, projectCurrency, taskDescriptions)}
              onLogout={handleLogout}
              onSaveProject={handleSaveProject}
              onCreateNewProject={showNewProjectCreator}
              onAddTaskDescription={() => setShowTaskDescription(true)}
              handleChangeProjectCurrency={handleChangeProjectCurrency}
              handleDeleteProject={handleDeleteProject}
              onProjectNameChange={handleChangeProjectName}
            />
            <div id="main-content">
             {renderView()}
              <WorkerList
                isOpen={showWorkerList}
                currency={projectCurrency}
                onRequestClose={() => {
                  setShowWorkerList(false);
                  setWorkers(workers);
                }}
                workers={workers}
                onAddWorker={handleAddWorker}
                onDeleteWorker={handleDeleteWorker}
                onModifyWorker={handleModifyWorker}
              />
              <ProjectEvaluation isOpen={evaluation} rows={rows} workers={workers} onRequestClose={() => setEvaluation(false)}/>
              <LinkResourcePicker
                isOpen={showLinkResource}
                onRequestClose={() => setShowLinkResource(false)}
                workers={workers}
                onPickWorker={handlePickWorker}
                selectedWorkerId={selectedWorkerId}
              />
              <NewProjectCreator isOpen={newProjectCreator} onRequestClose={closeNewProjectCreator} onCreateProject={handleCreateNewProject} />
              <ErrorMessage message={error} onClose={handleCloseError} type={infoType}/>
              <TaskDescriptionWindow isModalOpen={showTaskDescription} initialDescription={handleInitDescription()} task_id={selectedCell?.rowIdx} onSave={handleAddTaskDescription} onCancel={() => setShowTaskDescription(false)} />
              <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
                <Fab color="primary" onClick={handleClickAnchor}>
                  <MoreVertIcon />
                </Fab>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseAnchor}
                >
                  <MenuItem onClick={() => handleMenuItemClick('showChartAndGrid')}>
                    <ViewModuleIcon sx={{ mr: 1 }} /> Show Chart and Grid
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('onlyGrid')}>
                    <ViewListIcon sx={{ mr: 1 }} /> Only Grid
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('onlyChart')}>
                    <ShowChartIcon sx={{ mr: 1 }} /> Only Chart
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('onlyNetwork')}>
                    <ShowChartIcon sx={{ mr: 1 }} /> Only Network Chart
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick('onlyWBS')}>
                    <ShowChartIcon sx={{ mr: 1 }} /> Only WBS tree
                  </MenuItem>
                </Menu>
              </Box>
            </div>
          </>
        ) : (
          <div style={{ backgroundColor: '#dbe4f8', height: '100vh' }}>
          <header className='app-header'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '10px' 
              }}>
              <img src="/logo_gantt-removebg-preview.png" alt="Ganttify Logo" style={{ width: 70, height: 70 }} />
            </div>
            <span className='title'>Ganttify</span>
          </div>
          <button className='about-button'>About us</button>
          </header>
            <h2 style={{ textAlign: 'center', marginTop: '20px' }}>Select project or create a new one: </h2>
            <NewProjectCreator isOpen={newProjectCreator} onRequestClose={closeNewProjectCreator} onCreateProject={handleCreateNewProject} />
            <ProjectPicker handleCloseDrawer={() => { }} projects={projects} onProjectSelect={handleProjectSelect} onCreateNewProject={showNewProjectCreator} onDeleteProject={handleDeleteProject} />
          </div>
        )
      ) : (
        <div style={{ backgroundColor: '#dbe4f8', height: '100vh' }}>
          <header className='app-header'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '10px' 
              }}>
              <img src="/logo_gantt-removebg-preview.png" alt="Ganttify Logo" style={{ width: 70, height: 70 }} />
              </div>
              <span className='title'>Ganttify</span>
            </div>
          <button className='about-button'>About us</button>
          </header>
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
    </div>
  );
};

export default App;