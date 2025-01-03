const LSKEY = 'TodoApp';

export function saveToLocalStorage(key, value) {

    try {
        if (value.length > 0) {
            localStorage.setItem(`${LSKEY}.${key}`, JSON.stringify(value));
            console.log(`${LSKEY}.${key} saved successfuly`);
        }
    } catch (error) {
        console.error('Failed to save todos:', error);
    }
}

export function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(`${LSKEY}.${key}`);
        if (data) {
            console.log(`${LSKEY}.${key} loaded successfuly`)
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to load todos:', error);
    }
}

export function removeItemFromLocalStorage(key) {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.log(`Failed to remove '${key}' from local storage`)
    }
}

export function clearLocalStorage(key) {
    localStorage.clear(`${LSKEY}.${key}`);
    console.log('All data has been cleared from local storage')
}

export function updateLocalStorage(updated_todos, categories) {
    saveToLocalStorage('all', updated_todos)

    categories.forEach(category => {
        const catogory_todo = updated_todos.filter((todo) => todo.categories.includes(category))
        saveToLocalStorage(category, catogory_todo);
    });
}
