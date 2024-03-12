import Task from './task.js';
import Project from './project.js';
import StoreLocal from './store-local.js';

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
                    key
                )
            );
        }
        return taskArray;
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
        const taskArray = getTasks();
        const newTask = Task(title, dueDate, priority, notes);
        taskArray.push(newTask);
        const allTasksObject = convertTaskArrayToObject(taskArray);
        StoreLocal.storeTasks(allTasksObject);
    };

    const getProjects = () => {
        let projectArray = [];
        let allProjectsObject;
        if (StoreLocal.checkProjectsExist()) {
            console.log('retrieving existin gprojects');
            allProjectsObject = StoreLocal.retrieveProjects();
            console.log(allProjectsObject);
        } else {
            console.log('no existing projects');
        }
        console.log(projectArray);

    }

    const addProject = () => {
        console.log('adding project');
    }

    return {
        addTask,
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

            // Todo.addProject()

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

    initScreen();
    
})();