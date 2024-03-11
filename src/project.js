const Project = function (title, tasks = []) {

    const getTitle = () => {
        return title;
    };
    
    const setTitle = (newTitle) => {
        title = newTitle;
    };

    const getTasks = () => {
        return tasks;
    };

    const addTask = (newTask) => {
        tasks.push(newTask);
    };

    const removeTaskAtIndex = (index) => {
        tasks.splice(index, 1);
    };


    return {
        getTitle,
        setTitle,
        getTasks,
        addTask,
        removeTaskAtIndex,
    }
}

export default Project;
