const Project = function (title, taskIDs = [], idNum = null) {

    let id;

    if (idNum !== null) {
        id = idNum;
    } else {
        id = crypto.randomUUID();
    }

    const getID = () => {
        return id;
    };

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

    const getObject = () => {
        const projectObject = {
            'title': title,
            'taskIDs': taskIDs,
        };
        return projectObject;
    }

    return {
        getID,
        getTitle,
        setTitle,
        getTaskIDs,
        addTaskID,
        removeTaskIDAtIndex,
        getObject,
    }
};

export default Project;
