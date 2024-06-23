document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const categoryInput = document.getElementById('new-category');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filters button');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (filter === 'completed') return task.completed;
            if (filter === 'pending') return !task.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <span contenteditable="true">${task.text}</span> - <em>${task.category}</em>
                <div>
                    <button class="complete">✓</button>
                    <button class="delete">x</button>
                </div>
            `;
            taskList.appendChild(li);

            li.querySelector('.complete').addEventListener('click', () => {
                task.completed = !task.completed;
                saveTasks();
                renderTasks(filter);
            });

            li.querySelector('.delete').addEventListener('click', () => {
                tasks = tasks.filter(t => t !== task);
                saveTasks();
                renderTasks(filter);
            });

            li.querySelector('span').addEventListener('blur', (e) => {
                task.text = e.target.innerText;
                saveTasks();
            });
        });
    };

    addTaskButton.addEventListener('click', () => {
        const text = taskInput.value.trim();
        const category = categoryInput.value.trim();
        if (text !== '' && category !== '') {
            tasks.push({ text, category, completed: false });
            saveTasks();
            renderTasks();
            taskInput.value = '';
            categoryInput.value = '';
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderTasks(button.getAttribute('data-filter'));
        });
    });

    renderTasks();

    const showNotification = (task) => {
        if (Notification.permission === 'granted') {
            new Notification('Tarefa Pendente', {
                body: `Você tem uma tarefa pendente: ${task.text}`,
            });
        }
    };

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification({ text: 'Permissões concedidas!' });
            }
        });
    }

    const checkPendingTasks = () => {
        const pendingTasks = tasks.filter(task => !task.completed);
        if (pendingTasks.length > 0) {
            showNotification(pendingTasks[0]);
        }
    };

    setInterval(checkPendingTasks, 60000); // Verifica a cada minuto
});
