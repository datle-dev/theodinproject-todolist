const addTaskBtn = document.querySelector('#add-task-btn')
const addTaskDialog = document.querySelector('#add-task-dialog')
const addTaskForm = document.querySelector('#add-task-form');
const closeTaskDialogBtn = document.querySelector('#close-task-dialog-btn');

const addProjectBtn = document.querySelector('#add-project-btn')
const addProjectDialog = document.querySelector('#add-project-dialog')
const addProjectForm = document.querySelector('#add-project-form');
const closeProjectDialogBtn = document.querySelector('#close-project-dialog-btn');


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

    addTaskDialog.close();
}

addProjectForm.onsubmit = (e) => {
    e.preventDefault();

    console.log('submitted project form');

    let title = document.querySelector('#project-title');

    console.log(title.value);

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