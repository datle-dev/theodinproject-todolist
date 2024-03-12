import './style.css';

import Task from './scripts/task.js';
import Project from './scripts/project.js';
import StoreLocal from './scripts/store-local.js';

import circleIcon from './assets/circle.svg';
import checkCircleIcon from './assets/check-circle-fill.svg';
import pencilIcon from './assets/pencil.svg';
import archiveIcon from './assets/archive.svg';
import trashIcon from './assets/trash.svg';

import { format, isToday, isFuture, parse } from 'date-fns';

const Todo = (function() {

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
            // console.log('retrieving existing tasks');
            allTasksObject = StoreLocal.retrieveTasks();
            taskArray = convertTaskObjectToArray(allTasksObject);
        } else {
            // console.log('no existing tasks');
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
            // console.log('retrieving existing projects');
            allProjectsObject = StoreLocal.retrieveProjects();
            projectArray = convertProjectObjectToArray(allProjectsObject);
            // console.log(allProjectsObject);
        } else {
            // console.log('no existing projects');
        }
        // console.log(projectArray);
        return projectArray;
    }

    const addProject = (title) => {
        // console.log('adding project');
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
        // console.log(`project id checkTaskInProject: ${projectID}`);
        // console.log(`task id: ${taskID}`);


        let projectArray = getProjects();
        // console.log(projectArray.map((project) => project.getObject()));
        const projectIndex = projectArray.findIndex((project) => project.getID() === projectID);
        // console.log(`project index: ${projectIndex}`)
        // console.log(projectArray[projectIndex]);
        const projectTasks = projectArray[projectIndex].getTaskIDs();
        // console.log(`project tasks: ${projectTasks}`);
        return projectTasks.includes(taskID);

        // return false;
    }

    const deleteTask = (taskID) => {
        let taskArray = getTasks();
        let deleteIndex = taskArray.findIndex((task) => task.getID() === taskID)
        taskArray.splice(deleteIndex, 1);
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);
    };

    const toggleTaskDone = (taskID) => {
        let taskArray = getTasks();
        let toggleIndex = taskArray.findIndex((task) => task.getID() === taskID)
        taskArray[toggleIndex].switchDone();
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
        toggleTaskDone,
        checkTaskInProject,
    }

})();

const ScreenController = (function() {
    let currentBoard = 'general';

    const currentBoardHeading = document.querySelector('#current-board');

    const addTaskBtn = document.querySelector('#add-task-btn')
    const addTaskDialog = document.querySelector('#add-task-dialog')
    const addTaskForm = document.querySelector('#add-task-form');
    const closeTaskDialogBtn = document.querySelector('#close-task-dialog-btn');

    const addProjectBtn = document.querySelector('#add-project-btn')
    const addProjectDialog = document.querySelector('#add-project-dialog')
    const addProjectForm = document.querySelector('#add-project-form');
    const closeProjectDialogBtn = document.querySelector('#close-project-dialog-btn');

    const taskBoard = document.querySelector('#task-board');
    const projectBoard = document.querySelector('#project-board');

    const generalBtn = document.querySelector('#general-btn')
    const todayBtn = document.querySelector('#today-btn')
    const upcomingBtn = document.querySelector('#upcoming-btn')

    const initScreen = () => {
        addTaskBtn.addEventListener('click', () => {
            addTaskDialog.showModal();
            // console.log('opened task dialog');
        });
    
        addProjectBtn.addEventListener('click', () => {
            addProjectDialog.showModal();
            // console.log('opened project dialog');
        })
    
    
        addTaskForm.onsubmit = (e) => {
            e.preventDefault();
    
            // console.log('submitted task form');
    
            let title = document.querySelector('#task-title');
            let dueDate = document.querySelector('#task-due-date');
            let priority = document.querySelector('#task-priority');
            let notes = document.querySelector('#task-notes');
    
            // console.log(title.value);
            // console.log(dueDate.value);
            // console.log(priority.value);
            // console.log(notes.value);

            
            let currentBoardProjectID = taskBoard.getAttribute('project-id');

            if (currentBoard !== 'general' && currentBoard !== 'today' && currentBoard !== 'upcoming') {
                console.log('adding task to project')
                console.log(`project id from board${currentBoardProjectID}`);
                Todo.addTaskToProject(currentBoardProjectID, title.value, dueDate.value, priority.value, notes.value);
            } else {
                Todo.addTask(title.value, dueDate.value, priority.value, notes.value);
            }
         

            updateScreen(currentBoard, currentBoardProjectID );

            addTaskDialog.close();
        }
    
        addProjectForm.onsubmit = (e) => {
            e.preventDefault();
    
            // console.log('submitted project form');
    
            let title = document.querySelector('#project-title');
    
            // console.log(title.value);

            Todo.addProject(title.value);
            updateScreen(currentBoard);

            addProjectDialog.close();
        }
    
        closeTaskDialogBtn.addEventListener('click', () => {
            addTaskDialog.close();
            // console.log('closed task dialog');
        });
    
        closeProjectDialogBtn.addEventListener('click', () => {
            addProjectDialog.close();
            // console.log('closed project dialog');
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

        // default page on load is general folder
        updateScreen(currentBoard);

    };

    const clearTaskProjectBoards = () => {
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
                filteredTaskArray = taskArray
                break;
            case 'today':
                filteredTaskArray = taskArray.filter((task) => (
                    isToday(parse(task.getDueDate(), 'yyyy-MM-dd', new Date()))
                ));
                break;
            case 'upcoming':
                filteredTaskArray = taskArray.filter((task) => (
                    isFuture(parse(task.getDueDate(), 'yyyy-MM-dd', new Date()))
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
        // console.log(`project id: ${projectID}`);
        clearTaskProjectBoards();

        let taskArray = getFilteredTaskArray(Todo.getTasks(), board, projectID);
        let projectArray = Todo.getProjects();

        currentBoardHeading.innerText = board.charAt(0).toUpperCase() + board.slice(1);
        taskBoard.setAttribute('project-id', projectID);



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
            
            const taskDoneIncompleteImg = document.createElement('img');
            const taskDoneCompleteImg = document.createElement('img');
            const taskEditImg = document.createElement('img');
            const taskArchiveImg = document.createElement('img');
            const taskDeleteImg = document.createElement('img');

            taskDoneIncompleteImg.src = circleIcon;
            taskDoneCompleteImg.src = checkCircleIcon;

            taskDoneIncompleteImg.alt = 'incomplete task';
            taskDoneCompleteImg.alt = 'complete task';

            taskEditImg.src = pencilIcon;
            taskArchiveImg.src = archiveIcon;
            taskDeleteImg.src = trashIcon;

            taskEditImg.alt = 'edit';
            taskArchiveImg.alt = 'archive';
            taskDeleteImg.alt = 'delete';



            taskArticle.classList.add('task-board-item');

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
            taskPriority.innerText = task.getPriority();
            taskNotes.innerText = task.getNotes();

            if (task.checkIsDone()) {
                taskDone.appendChild(taskDoneCompleteImg);
            } else {
                taskDone.appendChild(taskDoneIncompleteImg);
            }

            taskEdit.appendChild(taskEditImg);
            taskArchive.appendChild(taskArchiveImg);
            taskDelete.appendChild(taskDeleteImg);



            taskArticle.appendChild(taskDone);
            taskArticle.appendChild(taskTitle);
            taskArticle.appendChild(taskDueDate);
            // taskArticle.appendChild(taskPriority);
            // taskArticle.appendChild(taskNotes);
            taskArticle.appendChild(taskEdit);
            taskArticle.appendChild(taskArchive);
            taskArticle.appendChild(taskDelete);

            taskArticle.setAttribute('task-id', task.getID());
            taskArticle.setAttribute('task-is-done', task.checkIsDone());

            taskBoard.appendChild(taskArticle);

            

            taskDelete.addEventListener('click', (e) => {
                // target is button

                // get parent article regardless of whether img or button is clicked
                // console.log(e.currentTarget);
                
                let targetArticle = e.currentTarget;
                while (targetArticle.tagName.toLowerCase() !== 'article') {
                    targetArticle = targetArticle.parentNode;
                }
                // console.log(targetArticle);

                // console.log(targetArticle.getAttribute('task-id'));

                Todo.deleteTask(targetArticle.getAttribute('task-id'));

                updateScreen(currentBoard, projectID);
            });

            taskDone.addEventListener('click', (e) => {
                // let markDoneBtn = e.currentTarget;
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