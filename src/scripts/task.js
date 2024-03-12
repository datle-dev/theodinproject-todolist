const Task = function (title, dueDate, priority, notes, isDone, isArchived, idNum = null) {
    
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

    const getDueDate = () => {
        return dueDate;
    };

    const setDueDate = (newDueDate) => {
        dueDate = newDueDate;
    };

    const getPriority = () => {
        return priority;
    };

    const setPriority = (newPriority) => {
        prior = newPriority;
    };

    const getNotes = () => {
        return notes;
    };

    const setNotes = (newNotes) => {
        notes = newNotes;
    };
    
    const checkIsDone = () => {
        return isDone;
    };

    const switchDone = () => {
        isDone = !isDone;
    }

    const checkIsArchived = () => {
        return isArchived;
    }

    const getObject = () => {
        const taskObject = {
            'title': title,
            'dueDate': dueDate,
            'priority': priority,
            'notes': notes,
            'isDone': isDone,
            'isArchived': isArchived,
        };
        return taskObject;
    };

    return {
        getID,
        getTitle,
        getDueDate,
        getPriority,
        getNotes,
        setTitle,
        setDueDate,
        setPriority,
        setNotes,
        getObject,
        checkIsDone,
        checkIsArchived,
        switchDone,
    }
};

export default Task;
