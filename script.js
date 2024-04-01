// Grupo: Antonio, Rodrigo, Elias

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    let db;

    const openDB = () => {
        const request = window.indexedDB.open('tasksDB', 1);

        request.onerror = () => {
            console.error('Erro ao abrir o banco de dados');
        };

        request.onsuccess = () => {
            db = request.result;
            fetchTasks();
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('taskName', 'taskName', { unique: false });
        };
    };

    const addTask = (taskName) => {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');
        const task = {
            taskName: taskName
        };

        const request = objectStore.add(task);
        request.onsuccess = () => {
            fetchTasks();
            taskInput.value = '';
        };
    };

    const deleteTask = (taskId) => {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.delete(taskId);
        request.onsuccess = () => {
            fetchTasks();
        };
    };

    const editTask = (taskId, newTaskName) => {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.get(taskId);
        request.onsuccess = () => {
            const task = request.result;
            task.taskName = newTaskName;
            const updateRequest = objectStore.put(task);
            updateRequest.onsuccess = () => {
                fetchTasks();
            };
        };
    };

    const fetchTasks = () => {
        while (taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }

        const objectStore = db.transaction('tasks').objectStore('tasks');
        objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${cursor.value.taskName}</span>
                    <button class="edit-btn" data-task-id="${cursor.value.id}">Editar</button>
                    <button class="delete-btn" data-task-id="${cursor.value.id}">Excluir</button>
                `;
                taskList.appendChild(li);

                li.querySelector('.delete-btn').addEventListener('click', (event) => {
                    const taskId = Number(event.target.getAttribute('data-task-id'));
                    deleteTask(taskId);
                });

                li.querySelector('.edit-btn').addEventListener('click', (event) => {
                    const taskId = Number(event.target.getAttribute('data-task-id'));
                    const newTaskName = prompt('Digite o novo nome da tarefa:');
                    if (newTaskName !== null) {
                        editTask(taskId, newTaskName);
                    }
                });

                cursor.continue();
            }
        };
    };

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const taskName = taskInput.value.trim();
        if (taskName !== '') {
            addTask(taskName);
        }
    });

    openDB();
});
