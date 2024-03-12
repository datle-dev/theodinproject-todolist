const Project = function (title, taskIDs = []) {

    const getTitle = () => {
        return title;
    };
    
    const setTitle = (newTitle) => {
        title = newTitle;
    };

    const getTaskIDs = () => {
        return taskIDs;
    };

    const addTaskID = (newTaskID) => {
        taskIDs.push(newTaskID);
    };

    const removeTaskIDAtIndex = (index) => {
        taskIDs.splice(index, 1);
    };

    return {
        getTitle,
        setTitle,
        getTaskIDs,
        addTaskID,
        removeTaskIDAtIndex,
    }
}

export default Project;
