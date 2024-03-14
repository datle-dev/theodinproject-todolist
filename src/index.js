import './style.css';

import Task from './scripts/task.js';
import Project from './scripts/project.js';
import StoreLocal from './scripts/store-local.js';

import plusIcon from './assets/plus.svg';
import circleIcon from './assets/circle.svg';
import checkCircleIcon from './assets/check-circle-fill.svg';
import pencilIcon from './assets/pencil.svg';
import archiveIcon from './assets/archive.svg';
import undoIcon from './assets/arrow-counterclockwise.svg';
import trashIcon from './assets/trash.svg';

import { isToday, isFuture, parse } from 'date-fns';

const Todo = (function () {

    // converts an array to tasks created via the factory function Task() to
    // an object:
    // - key = unique ID (id attribute of Task())
    // - value = an object of the task's title, dueDate, priority, and notes
    const convertTaskArrayToObject = (taskArray) => {
        let allTasksObject = {};
        taskArray.forEach((task) => {
            allTasksObject[task.getID()] = task.getObject();
        })
        return allTasksObject;
    };

    // does the reverse of convertTaskArrayToObject() by creating new tasks
    // via the factory function Task() from the object and pushes them
    // to an array
    const convertTaskObjectToArray = (allTasksObject) => {
        let taskArray = [];
        for (let key of Object.keys(allTasksObject)) {
            taskArray.push(
                Task(
                    allTasksObject[key].title,
                    allTasksObject[key].dueDate,
                    allTasksObject[key].priority,
                    allTasksObject[key].notes,
                    allTasksObject[key].isDone,
                    allTasksObject[key].isArchived,
                    key
                )
            );
        }
        return taskArray;
    };

    // same as convertTaskArrayToObject(), but for projects
    const convertProjectArrayToObject = (projectArray) => {
        let allProjectsObject = {};
        projectArray.forEach((project) => {
            allProjectsObject[project.getID()] = project.getObject();
        })
        return allProjectsObject;
    };

    // same as convertTaskObjectToArray(), but for projects
    const convertProjectObjectToArray = (allProjectsObject) => {
        let projectArray = [];
        for (let key of Object.keys(allProjectsObject)) {
            projectArray.push(
                Project(
                    allProjectsObject[key].title,
                    allProjectsObject[key].taskIDs,
                    key
                )
            );
        }
        return projectArray;
    };

    const getTasks = () => {
        let taskArray = [];
        let allTasksObject;
        if (StoreLocal.checkTasksExist()) {
            allTasksObject = StoreLocal.retrieveTasks();
            taskArray = convertTaskObjectToArray(allTasksObject);
        }
        return taskArray;
    };

    const addTask = (title, dueDate, priority, notes) => {
        let taskArray = getTasks();
        const newTask = Task(title, dueDate, priority, notes, false, false);
        taskArray.push(newTask);
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);
    };

    const getProjects = () => {
        let projectArray = [];
        let allProjectsObject;
        if (StoreLocal.checkProjectsExist()) {
            allProjectsObject = StoreLocal.retrieveProjects();
            projectArray = convertProjectObjectToArray(allProjectsObject);
        }
        return projectArray;
    }

    const addProject = (title) => {
        let projectArray = getProjects();
        const newProject = Project(title);
        projectArray.push(newProject);
        const allProjectsObject = convertProjectArrayToObject(projectArray);
        StoreLocal.storeProjects(allProjectsObject);
    }

    const addTaskToProject = (projectID, title, dueDate, priority, notes) => {
        // below is same as addTask(), but need to intercept creation of newTask variable
        // so we can run getID() on it for adding to the given project's contained tasks
        let taskArray = getTasks();
        const newTask = Task(title, dueDate, priority, notes, false, false);
        taskArray.push(newTask);
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);

        let projectArray = getProjects();
        const projectIndex = projectArray.findIndex((project) => project.getID() === projectID)
        projectArray[projectIndex].addTaskID(newTask.getID());
        const allProjectsObject = convertProjectArrayToObject(projectArray);
        StoreLocal.storeProjects(allProjectsObject);
    };

    const checkTaskInProject = (projectID, taskID) => {
        let projectArray = getProjects();
        const projectIndex = projectArray.findIndex((project) => project.getID() === projectID);
        const projectTasks = projectArray[projectIndex].getTaskIDs();
        return projectTasks.includes(taskID);
    }

    const deleteTask = (taskID) => {
        let taskArray = getTasks();
        let deleteIndex = taskArray.findIndex((task) => task.getID() === taskID)
        taskArray.splice(deleteIndex, 1);
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);
    };
    
    const deleteProject = (projectID) => {
        let projectArray = getProjects();
        let deleteIndex = projectArray.findIndex((project) => project.getID() === projectID)
        projectArray.splice(deleteIndex, 1);
        const allProjectsObject = convertProjectArrayToObject(projectArray);
        StoreLocal.storeProjects(allProjectsObject);
    }

    const toggleTaskDone = (taskID) => {
        let taskArray = getTasks();
        let toggleIndex = taskArray.findIndex((task) => task.getID() === taskID)
        taskArray[toggleIndex].switchDone();
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);
    }

    const archiveTask = (taskID) => {
        let taskArray = getTasks();
        let toggleIndex = taskArray.findIndex((task) => task.getID() === taskID)
        taskArray[toggleIndex].switchArchived();
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);
    }

    const getTaskInfo = (taskID) => {
        let taskArray = getTasks();
        let toggleIndex = taskArray.findIndex((task) => task.getID() === taskID)
        return [
            taskArray[toggleIndex].getTitle(),
            taskArray[toggleIndex].getDueDate(),
            taskArray[toggleIndex].getPriority(),
            taskArray[toggleIndex].getNotes(),
        ];
    }

    const getProjectInfo = (projectID) => {
        let projectArray = getProjects();
        let projectIndex = projectArray.findIndex((project) => project.getID() === projectID)
        return projectArray[projectIndex].getTitle();
    }

    const updateTask = (title, dueDate, priority, notes, taskID) => {
        let taskArray = getTasks();
        let updateIndex = taskArray.findIndex((task) => task.getID() === taskID)
        taskArray[updateIndex].setTitle(title);
        taskArray[updateIndex].setDueDate(dueDate);
        taskArray[updateIndex].setPriority(priority);
        taskArray[updateIndex].setNotes(notes);
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);
    }

    const updateProject = (title, projectID) => {
        let projectArray = getProjects();
        let updateIndex = projectArray.findIndex((project) => project.getID() === projectID)
        projectArray[updateIndex].setTitle(title);
        const allProjectsObject = convertProjectArrayToObject(projectArray);
        StoreLocal.storeProjects(allProjectsObject);
    }


    return {
        addTask,
        addProject,
        addTaskToProject,
        getTasks,
        getProjects,
        deleteTask,
        deleteProject,
        toggleTaskDone,
        checkTaskInProject,
        archiveTask,
        getTaskInfo,
        getProjectInfo,
        updateTask,
        updateProject,
    }

})();

const ScreenController = (function () {
    let currentBoard = 'general';

    let taskDialogMode = 'add';
    let projectDialogMode = 'add';

    let currentTaskID = '';

    const currentBoardHeading = document.querySelector('#current-board');
    
    const addTaskDialog = document.querySelector('#add-task-dialog')
    const addTaskForm = document.querySelector('#add-task-form');
    const closeTaskDialogBtn = document.querySelector('#close-task-dialog-btn');

    const addProjectBtn = document.querySelector('#add-project-btn')
    const addProjectDialog = document.querySelector('#add-project-dialog')
    const addProjectForm = document.querySelector('#add-project-form');
    const closeProjectDialogBtn = document.querySelector('#close-project-dialog-btn');

    const taskBoardHeader = document.querySelector('#task-board-header');
    const projectControls = document.querySelector('#project-controls');
    const taskControls = document.querySelector('#task-controls');
    const taskBoard = document.querySelector('#task-board');
    const projectBoard = document.querySelector('#project-board');

    const generalBtn = document.querySelector('#general-btn')
    const todayBtn = document.querySelector('#today-btn')
    const upcomingBtn = document.querySelector('#upcoming-btn')
    const archiveBtn = document.querySelector('#archive-btn')

    const initScreen = () => {

        const plusIconImg = document.createElement('img');
        const addProjectBtnText = document.createElement('p');

        plusIconImg.src = plusIcon;
        plusIconImg.alt = 'add project';
        addProjectBtnText.innerText = 'Add Project';

        addProjectBtn.appendChild(plusIconImg);
        addProjectBtn.appendChild(addProjectBtnText);

        addProjectBtn.addEventListener('click', () => {
            const addProjectHeading = document.getElementById('project-dialog-heading');
            const addProjectButtonsDiv = document.getElementById('project-dialog-buttons');

            if (addProjectButtonsDiv.childElementCount > 1) {
                addProjectButtonsDiv.removeChild(addProjectButtonsDiv.firstChild);
            }

            const addProjectDialogAddTaskBtn = document.createElement('button');
            addProjectDialogAddTaskBtn.setAttribute('type', 'submit');

            addProjectDialogAddTaskBtn.innerText = 'Add Project';
            addProjectHeading.innerText = 'Add Project';

            addProjectButtonsDiv.insertBefore(addProjectDialogAddTaskBtn, addProjectButtonsDiv.firstChild);
            addProjectDialog.showModal();
        })

        addTaskForm.onsubmit = (e) => {
            e.preventDefault();

            let title = document.querySelector('#task-title');
            let dueDate = document.querySelector('#task-due-date');
            let priority = document.querySelector('#task-priority');
            let notes = document.querySelector('#task-notes');


            let currentBoardProjectID = taskBoard.getAttribute('project-id');
            
            console.log(`taskdialogmode: ${taskDialogMode}`);

            if (taskDialogMode === 'add') {
                if (currentBoard !== 'general' && currentBoard !== 'today' && currentBoard !== 'upcoming') {
                    Todo.addTaskToProject(currentBoardProjectID, title.value, dueDate.value, priority.value, notes.value);
                } else {
                    Todo.addTask(title.value, dueDate.value, priority.value, notes.value);
                }
            } else if (taskDialogMode === 'edit') {
                console.log('updating task');
                Todo.updateTask(title.value, dueDate.value, priority.value, notes.value, currentTaskID);
            }
            
            title.value = '';
            dueDate.value = '';
            priority.selectedIndex = 3;
            notes.value = '';

            taskDialogMode = 'add';

            updateScreen(currentBoard, currentBoardProjectID);
            
            addTaskDialog.close();
        }

        addProjectForm.onsubmit = (e) => {
            e.preventDefault();
            
            let title = document.querySelector('#project-title');
            let currentBoardProjectID = taskBoard.getAttribute('project-id');
            
            if (projectDialogMode === 'add') {
                Todo.addProject(title.value);
            } else if (projectDialogMode === 'edit') {
                Todo.updateProject(title.value, currentBoardProjectID);
            }

            title.value = '';

            projectDialogMode = 'add';
            
            updateScreen(currentBoard, currentBoardProjectID);

            addProjectDialog.close();
        }

        closeTaskDialogBtn.addEventListener('click', (e) => {
            let title = document.querySelector('#task-title');
            let dueDate = document.querySelector('#task-due-date');
            let priority = document.querySelector('#task-priority');
            let notes = document.querySelector('#task-notes');

            title.value = '';
            dueDate.value = '';
            priority.selectedIndex = 3;
            notes.value = '';

            taskDialogMode = 'add';

            addTaskDialog.close();
        });

        closeProjectDialogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            let title = document.querySelector('#project-title');

            title.value = '';

            projectDialogMode = 'add';

            addProjectDialog.close();
        });

        generalBtn.addEventListener('click', () => {
            currentBoard = 'general';
            updateScreen(currentBoard);
        })

        todayBtn.addEventListener('click', () => {
            currentBoard = 'today';
            updateScreen(currentBoard);
        })

        upcomingBtn.addEventListener('click', () => {
            currentBoard = 'upcoming';
            updateScreen(currentBoard);
        })

        archiveBtn.addEventListener('click', () => {
            currentBoard = 'archive';
            updateScreen(currentBoard);
        })

        taskDialogMode = 'add';
        projectDialogMode = 'add';

        // default page on load is general folder
        updateScreen(currentBoard);

    };

    const clearTaskProjectBoards = () => {
        if (taskControls.firstChild) {
            taskControls.removeChild(taskControls.firstChild);
        }
        while (projectControls.firstChild) {
            projectControls.removeChild(projectControls.firstChild);
        }
        while (taskBoard.firstChild) {
            taskBoard.removeChild(taskBoard.firstChild);
        }
        while (projectBoard.firstChild) {
            projectBoard.removeChild(projectBoard.firstChild);
        }
    };

    const getFilteredTaskArray = (taskArray, board, projectID) => {
        let filteredTaskArray;
        switch (board) {
            case 'general':
                filteredTaskArray = taskArray.filter((task) => (
                    !task.checkIsArchived()
                ));
                break;
            case 'today':
                filteredTaskArray = taskArray.filter((task) => (
                    isToday(parse(task.getDueDate(), 'yyyy-MM-dd', new Date())) && !task.checkIsArchived()
                ));
                break;
            case 'upcoming':
                filteredTaskArray = taskArray.filter((task) => (
                    isFuture(parse(task.getDueDate(), 'yyyy-MM-dd', new Date())) && !task.checkIsArchived()
                ));
                break;
            case 'archive':
                filteredTaskArray = taskArray.filter((task) => (
                    task.checkIsArchived()
                ));
                break;
            default:
                filteredTaskArray = taskArray.filter((task) => (
                    Todo.checkTaskInProject(projectID, task.getID())
                ));
        }
        console.log(`filtered task array: ${filteredTaskArray}`);
        return filteredTaskArray;
    };

    const updateScreen = (board, projectID = '') => {
        clearTaskProjectBoards();

        let taskArray = getFilteredTaskArray(Todo.getTasks(), board, projectID);
        let projectArray = Todo.getProjects();

        currentBoardHeading.innerText = board.charAt(0).toUpperCase() + board.slice(1);
        taskBoard.setAttribute('project-id', projectID);

        // show button to add task only if it's general or a project
        if (board !== 'today' && board !== 'upcoming' && board !== 'archive') {
            const addTaskBtn = document.createElement('button');

            const plusIconImg = document.createElement('img');
            const addTaskBtnText = document.createElement('p');

            plusIconImg.src = plusIcon;
            plusIconImg.alt = 'add task';
            addTaskBtnText.innerText = 'Add Task';

            addTaskBtn.appendChild(plusIconImg);
            addTaskBtn.appendChild(addTaskBtnText);
            
            addTaskBtn.setAttribute('type', 'button');
            addTaskBtn.id = 'add-task-btn';

            taskControls.appendChild(addTaskBtn);
            
            addTaskBtn.addEventListener('click', (e) => {
                                const addTaskHeading = document.getElementById('task-dialog-heading');
                const addTaskButtonsDiv = document.getElementById('task-dialog-buttons');

                if (addTaskButtonsDiv.childElementCount > 1) {
                    addTaskButtonsDiv.removeChild(addTaskButtonsDiv.firstChild);
                }

                const addTaskDialogAddTaskBtn = document.createElement('button');
                addTaskDialogAddTaskBtn.setAttribute('type', 'submit');

                addTaskDialogAddTaskBtn.innerText = 'Add Task';
                addTaskHeading.innerText = 'Add Task';

                addTaskButtonsDiv.insertBefore(addTaskDialogAddTaskBtn, addTaskButtonsDiv.firstChild);
                addTaskDialog.showModal();
            });
        }

        // show project controls only if it's a project
        if (board !== 'general' && board !== 'today' && board !== 'upcoming' && board !== 'archive') {
            
            const editProjectBtn = document.createElement('button');
            const deleteProjectBtn = document.createElement('button');
            const editProjectBtnImg = document.createElement('img');
            const deleteProjectBtnImg = document.createElement('img');

            editProjectBtnImg.src = pencilIcon;
            editProjectBtnImg.alt = 'edit project';
            deleteProjectBtnImg.src = trashIcon;
            deleteProjectBtnImg.alt = 'delete project';

            editProjectBtn.setAttribute('project-id', projectID);
            deleteProjectBtn.setAttribute('project-id', projectID);

            editProjectBtn.appendChild(editProjectBtnImg);
            deleteProjectBtn.appendChild(deleteProjectBtnImg);

            projectControls.appendChild(editProjectBtn);
            projectControls.appendChild(deleteProjectBtn);

            editProjectBtn.addEventListener('click', (e) => {
                projectDialogMode = 'edit';

                const editProjectHeading = document.getElementById('project-dialog-heading');
                const editProjectButtonsDiv = document.getElementById('project-dialog-buttons');
                const editProjectTitleInput = document.getElementById('project-title');

                if (editProjectButtonsDiv.childElementCount > 1) {
                    editProjectButtonsDiv.removeChild(editProjectButtonsDiv.firstChild);
                }

                const editProjectDialogAddTaskBtn = document.createElement('button');
                editProjectDialogAddTaskBtn.setAttribute('type', 'submit');

                editProjectDialogAddTaskBtn.innerText = 'Save Edits';
                editProjectHeading.innerText = 'Edit Project';
                console.log(`title of project: ${Todo.getProjectInfo(projectID)}`);
                editProjectTitleInput.value = Todo.getProjectInfo(projectID);

                editProjectButtonsDiv.insertBefore(editProjectDialogAddTaskBtn, editProjectButtonsDiv.firstChild);
                addProjectDialog.showModal();
            })

            deleteProjectBtn.addEventListener('click', (e) => {
                console.log('delete project');
                console.log(e.currentTarget.getAttribute('project-id'));
                Todo.deleteProject(e.currentTarget.getAttribute('project-id'));
                currentBoard = 'general';
                updateScreen('general');
            });
        
        }

        for (let task of taskArray) {
            const taskArticle = document.createElement('article');
            const taskTitle = document.createElement('p');
            const taskDueDate = document.createElement('p');
            const taskPriority = document.createElement('p');
            const taskNotes = document.createElement('p');

            const taskDone = document.createElement('button');
            const taskEdit = document.createElement('button');
            const taskArchive = document.createElement('button');
            const taskDelete = document.createElement('button');

            const taskLeftDiv = document.createElement('div');
            const taskInfoDiv = document.createElement('div');
            const taskActionsDiv = document.createElement('div');

            const taskDoneIncompleteImg = document.createElement('img');
            const taskDoneCompleteImg = document.createElement('img');
            const taskEditImg = document.createElement('img');
            const taskArchiveImg = document.createElement('img');
            const taskArchiveUndoImg = document.createElement('img');
            const taskDeleteImg = document.createElement('img');

            taskDoneIncompleteImg.src = circleIcon;
            taskDoneCompleteImg.src = checkCircleIcon;

            taskDoneIncompleteImg.alt = 'incomplete task';
            taskDoneCompleteImg.alt = 'complete task';

            taskEditImg.src = pencilIcon;
            taskArchiveImg.src = archiveIcon;
            taskArchiveUndoImg.src = undoIcon;
            taskDeleteImg.src = trashIcon;

            taskEditImg.alt = 'edit';
            taskArchiveImg.alt = 'archive';
            taskArchiveUndoImg.alt = 'undo';
            taskDeleteImg.alt = 'delete';

            taskArticle.classList.add('task-board-item');

            if (task.checkIsDone()) {
                taskArticle.classList.add('task-done');
            }

            switch (task.getPriority()) {

                case '1':
                    taskArticle.classList.add('priority-1-task')
                    break;
                case '2':
                    taskArticle.classList.add('priority-2-task')
                    break;
                case '3':
                    taskArticle.classList.add('priority-3-task')
                    break;
            }

            taskTitle.innerText = task.getTitle();
            taskDueDate.innerText = task.getDueDate();
            taskNotes.innerText = task.getNotes();

            if (task.checkIsDone()) {
                taskDone.appendChild(taskDoneCompleteImg);
            } else {
                taskDone.appendChild(taskDoneIncompleteImg);
            }

            taskEdit.appendChild(taskEditImg);
            if (task.checkIsArchived()) {
                taskArchive.appendChild(taskArchiveUndoImg);
            } else {
                taskArchive.appendChild(taskArchiveImg);
            }
            taskDelete.appendChild(taskDeleteImg);

            taskDueDate.classList.add('task-date');
            taskNotes.classList.add('task-notes');
            taskNotes.classList.add('none');
            taskLeftDiv.appendChild(taskDone);
            taskInfoDiv.appendChild(taskTitle);
            taskInfoDiv.appendChild(taskDueDate);
            taskInfoDiv.appendChild(taskNotes);

            taskInfoDiv.classList.add('task-info');

            taskLeftDiv.appendChild(taskInfoDiv);
            taskLeftDiv.classList.add('task-left');

            taskArticle.appendChild(taskLeftDiv);
            // taskArticle.appendChild(taskPriority);


            taskEdit.appendChild(taskEditImg);
            if (task.checkIsArchived() || task.checkIsDone()) {
                taskEdit.classList.add('hidden');
            }
            taskEdit.setAttribute('task-id', task.getID());
            taskActionsDiv.appendChild(taskEdit);
            
            taskActionsDiv.appendChild(taskArchive);
            taskActionsDiv.appendChild(taskDelete);

            taskActionsDiv.classList.add('task-actions');

            taskArticle.appendChild(taskActionsDiv);

            taskArticle.setAttribute('task-id', task.getID());
            taskArticle.setAttribute('task-is-done', task.checkIsDone());
            taskArticle.setAttribute('task-archived', task.checkIsArchived());

            taskBoard.appendChild(taskArticle);

            taskInfoDiv.addEventListener('click', (e) => {
                taskNotes.classList.toggle('none');    
            });

            taskEdit.addEventListener('click', (e) => {
                taskDialogMode = 'edit';

                currentTaskID = e.currentTarget.getAttribute('task-id');

                const editTaskHeading = document.getElementById('task-dialog-heading');
                const editTaskButtonsDiv = document.getElementById('task-dialog-buttons');
                const editTaskTitleInput = document.getElementById('task-title');
                const editTaskDueDate = document.getElementById('task-due-date');
                const editTaskPriority = document.getElementById('task-priority');
                const editTaskNotes = document.getElementById('task-notes');

                if (editTaskButtonsDiv.childElementCount > 1) {
                    editTaskButtonsDiv.removeChild(editTaskButtonsDiv.firstChild);
                }

                const editTaskDialogAddTaskBtn = document.createElement('button');
                editTaskDialogAddTaskBtn.setAttribute('type', 'submit');

                editTaskDialogAddTaskBtn.innerText = 'Save Edits';
                editTaskHeading.innerText = 'Edit Task';

                const taskInfo = Todo.getTaskInfo(currentTaskID);
                console.log(`title ${taskInfo[0]}`);
                console.log(`due date ${taskInfo[1]}`);
                console.log(`priority ${taskInfo[2]}`);
                console.log(`notes ${taskInfo[3]}`);
                editTaskTitleInput.value = taskInfo[0];
                editTaskDueDate.value = taskInfo[1];
                editTaskPriority.value = taskInfo[2];
                editTaskNotes.value = taskInfo[3];

                editTaskButtonsDiv.insertBefore(editTaskDialogAddTaskBtn, editTaskButtonsDiv.firstChild);
                addTaskDialog.showModal();
            });

            taskDelete.addEventListener('click', (e) => {
                // get parent article regardless of whether img or button is clicked
                // console.log(e.currentTarget);
                let targetArticle = e.currentTarget;
                while (targetArticle.tagName.toLowerCase() !== 'article') {
                    targetArticle = targetArticle.parentNode;
                }

                Todo.deleteTask(targetArticle.getAttribute('task-id'));

                updateScreen(currentBoard, projectID);
            });

            taskArchive.addEventListener('click', (e) => {
                // get parent article regardless of whether img or button is clicked
                // console.log(e.currentTarget);
                let targetArticle = e.currentTarget;
                while (targetArticle.tagName.toLowerCase() !== 'article') {
                    targetArticle = targetArticle.parentNode;
                }

                Todo.archiveTask(targetArticle.getAttribute('task-id'));

                updateScreen(currentBoard, projectID);
            });

            taskDone.addEventListener('click', (e) => {
                let targetArticle = e.currentTarget;
                while (targetArticle.tagName.toLowerCase() !== 'article') {
                    targetArticle = targetArticle.parentNode;
                }

                Todo.toggleTaskDone(targetArticle.getAttribute('task-id'));

                updateScreen(currentBoard, projectID);
            })

        }

        for (let project of projectArray) {
            const projectBtn = document.createElement('button');

            projectBtn.classList.add('project-board-item');
            projectBtn.setAttribute('type', 'button');
            projectBtn.setAttribute('project-id', project.getID());
            projectBtn.innerText = project.getTitle();

            projectBtn.addEventListener('click', () => {
                currentBoard = project.getTitle();
                updateScreen(currentBoard, project.getID());
            });

            projectBoard.appendChild(projectBtn)
        }
    };

    initScreen();

})();