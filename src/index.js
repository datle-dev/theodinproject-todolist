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
            console.log('retrieving existing tasks');
            allTasksObject = StoreLocal.retrieveTasks();
            taskArray = convertTaskObjectToArray(allTasksObject);
        } else {
            console.log('no existing tasks');
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
            console.log('retrieving existing projects');
            allProjectsObject = StoreLocal.retrieveProjects();
            projectArray = convertProjectObjectToArray(allProjectsObject);
            console.log(allProjectsObject);
        } else {
            console.log('no existing projects');
        }
        console.log(projectArray);
        return projectArray;
    }

    const addProject = (title) => {
        console.log('adding project');
        let projectArray = getProjects();
        const newProject = Project(title);
        projectArray.push(newProject);
        const allProjectsObject = convertProjectArrayToObject(projectArray);
        StoreLocal.storeProjects(allProjectsObject);
    }

    return {
        addTask,
        addProject,
    }

})();

const ScreenController = (function() {
    const addTaskBtn = document.querySelector('#add-task-btn')
    const addTaskDialog = document.querySelector('#add-task-dialog')
    const addTaskForm = document.querySelector('#add-task-form');
    const closeTaskDialogBtn = document.querySelector('#close-task-dialog-btn');

    const addProjectBtn = document.querySelector('#add-project-btn')
    const addProjectDialog = document.querySelector('#add-project-dialog')
    const addProjectForm = document.querySelector('#add-project-form');
    const closeProjectDialogBtn = document.querySelector('#close-project-dialog-btn');

    const initScreen = () => {
        addTaskBtn.addEventListener('click', () => {
            addTaskDialog.showModal();
            console.log('opened task dialog');
        });
    
        addProjectBtn.addEventListener('click', () => {
            addProjectDialog.showModal();
            console.log('opened project dialog');
        })
    
    
        addTaskForm.onsubmit = (e) => {
            e.preventDefault();
    
            console.log('submitted task form');
    
            let title = document.querySelector('#task-title');
            let dueDate = document.querySelector('#task-due-date');
            let priority = document.querySelector('#task-priority');
            let notes = document.querySelector('#task-notes');
    
            console.log(title.value);
            console.log(dueDate.value);
            console.log(priority.value);
            console.log(notes.value);
    
            Todo.addTask(title.value, dueDate.value, priority.value, notes.value);

            addTaskDialog.close();
        }
    
        addProjectForm.onsubmit = (e) => {
            e.preventDefault();
    
            console.log('submitted project form');
    
            let title = document.querySelector('#project-title');
    
            console.log(title.value);

            Todo.addProject(title.value);

            addProjectDialog.close();
        }
    
        closeTaskDialogBtn.addEventListener('click', () => {
            addTaskDialog.close();
            console.log('closed task dialog');
        });
    
        closeProjectDialogBtn.addEventListener('click', () => {
            addProjectDialog.close();
            console.log('closed project dialog');
        });
    };

    const updateScreen = () => {

    };

    initScreen();
    
})();