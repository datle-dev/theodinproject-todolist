const StoreLocal = function () {

    const checkTasksExist = () => {
        return (localStorage.getItem('tasks') === null) ? false : true;
    };

    const checkProjectsExist = () => {
        return (localStorage.getItem('projects') === null) ? false : true;
    };

    const storeTasks = (item) => {
        localStorage.setItem('tasks', JSON.stringify(item))
    };

    const retrieveTasks = () => {
        return JSON.parse(localStorage.getItem('tasks'));
    }

    const storeProjects = (item) => {
        localStorage.setItem('projects', JSON.stringify(item))
    };

    const retrieveProjects = () => {
        return JSON.parse(localStorage.getItem('projects'));
    }

    return {
        checkTasksExist,
        checkProjectsExist,
        storeTasks,
        retrieveTasks,
        storeProjects,
        retrieveProjects,
    }
}();

export default StoreLocal;