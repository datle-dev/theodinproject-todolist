const Task = function (title, dueDate, priority, notes) {
    
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
    
    return {
        getTitle,
        getDueDate,
        getPriority,
        getNotes,
        setTitle,
        setDueDate,
        setPriority,
        setNotes,
    }
};

export default Task;
