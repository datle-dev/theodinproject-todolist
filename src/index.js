import './style.css';

import Task from './scripts/task.js';
import Project from './scripts/project.js';
import StoreLocal from './scripts/store-local.js';

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
        let projectArray = [];
        let deleteIndex = projectArray.findIndex((project) => project.getID() === projectID)
        projectArray.splaice(deleteIndex, 1);
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
    }

})();

const ScreenController = (function () {
    let currentBoard = 'general';

    const currentBoardHeading = document.querySelector('#current-board');

    
    const addTaskDialog = document.querySelector('#add-task-dialog')
    const addTaskForm = document.querySelector('#add-task-form');
    const closeTaskDialogBtn = document.querySelector('#close-task-dialog-btn');

    const addProjectBtn = document.querySelector('#add-project-btn')
    const addProjectDialog = document.querySelector('#add-project-dialog')
    const addProjectForm = document.querySelector('#add-project-form');
    const closeProjectDialogBtn = document.querySelector('#close-project-dialog-btn');

    const taskControls = document.querySelector('#task-controls');
    const taskBoard = document.querySelector('#task-board');
    const projectBoard = document.querySelector('#project-board');

    const generalBtn = document.querySelector('#general-btn')
    const todayBtn = document.querySelector('#today-btn')
    const upcomingBtn = document.querySelector('#upcoming-btn')
    const archiveBtn = document.querySelector('#archive-btn')

    const initScreen = () => {

        addProjectBtn.addEventListener('click', () => {
            addProjectDialog.showModal();
        })

        addTaskForm.onsubmit = (e) => {
            e.preventDefault();

            let title = document.querySelector('#task-title');
            let dueDate = document.querySelector('#task-due-date');
            let priority = document.querySelector('#task-priority');
            let notes = document.querySelector('#task-notes');

            let currentBoardProjectID = taskBoard.getAttribute('project-id');
            
            if (currentBoard !== 'general' && currentBoard !== 'today' && currentBoard !== 'upcoming') {
                Todo.addTaskToProject(currentBoardProjectID, title.value, dueDate.value, priority.value, notes.value);
            } else {
                Todo.addTask(title.value, dueDate.value, priority.value, notes.value);
            }
            
            updateScreen(currentBoard, currentBoardProjectID);
            
            addTaskDialog.close();
        }
        
        addProjectForm.onsubmit = (e) => {
            e.preventDefault();
            
            let title = document.querySelector('#project-title');
            let currentBoardProjectID = taskBoard.getAttribute('project-id');
            
            Todo.addProject(title.value);
            updateScreen(currentBoard, currentBoardProjectID);

            addProjectDialog.close();
        }

        closeTaskDialogBtn.addEventListener('click', () => {
            addTaskDialog.close();
        });

        closeProjectDialogBtn.addEventListener('click', () => {
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

        // default page on load is general folder
        updateScreen(currentBoard);

    };

    const clearTaskProjectBoards = () => {
        if (taskControls.firstChild) {
            taskControls.removeChild(taskControls.firstChild);
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

        if (board !== 'today' && board !== 'upcoming' && board !== 'archive') {
            const addTaskBtn = document.createElement('button');
            addTaskBtn.setAttribute('type', 'button');
            addTaskBtn.id = 'add-task-button';
            addTaskBtn.innerText = 'Add Task';
            taskControls.appendChild(addTaskBtn);
            
            addTaskBtn.addEventListener('click', () => {
                addTaskDialog.showModal();
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

            taskLeftDiv.appendChild(taskDone);
            taskInfoDiv.appendChild(taskTitle);
            taskInfoDiv.appendChild(taskDueDate);

            taskInfoDiv.classList.add('task-info');

            taskLeftDiv.appendChild(taskInfoDiv);
            taskLeftDiv.classList.add('task-left');

            taskArticle.appendChild(taskLeftDiv);
            // taskArticle.appendChild(taskPriority);
            // taskArticle.appendChild(taskNotes);


            taskEdit.appendChild(taskEditImg);
            if (!task.checkIsArchived() && !task.checkIsDone()) {
                taskActionsDiv.appendChild(taskEdit);
            }
            
            taskActionsDiv.appendChild(taskArchive);
            taskActionsDiv.appendChild(taskDelete);

            taskActionsDiv.classList.add('task-actions');

            taskArticle.appendChild(taskActionsDiv);

            taskArticle.setAttribute('task-id', task.getID());
            taskArticle.setAttribute('task-is-done', task.checkIsDone());
            taskArticle.setAttribute('task-archived', task.checkIsArchived());

            taskBoard.appendChild(taskArticle);

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