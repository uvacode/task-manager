// static/app.js — полный менеджер задач

// Для начала — localStorage. Потом раскомментируй fetch и закомментируй localStorage

let tasks = {
  today: [],
  tomorrow: [],
  nextweek: []
};

const API = '/api/tasks'; // ← раскомментируй, когда backend готов

async function loadTasks() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    // Преобразуем record в группы по deadlineAt
    const now = Date.now();
    tasks = { today: [], tomorrow: [], nextweek: [] };
    Object.values(data).forEach(t => {
      const deadline = new Date(t.deadlineAt * 1000);
      const isToday = deadline.toDateString() === new Date().toDateString();
      const isTomorrow = deadline.toDateString() === new Date(now + 86400000).toDateString();
      const isThisWeek = deadline > new Date(now) && deadline < new Date(now + 7*86400000);
      if (isToday) tasks.today.push(t);
      else if (isTomorrow) tasks.tomorrow.push(t);
      else if (isThisWeek) tasks.nextweek.push(t);
    });
  } catch (e) {
    console.warn('API не отвечает — используем localStorage', e);
    const saved = localStorage.getItem('tasks');
    if (saved) tasks = JSON.parse(saved);
  }
  renderAll();
}

async function saveTasks() {
  try {
    await fetch(API, {
      method: 'POST', // или PUT, в зависимости от твоего backend
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks)
    });
  } catch (e) {
    console.warn('Сохранение в API не удалось — сохраняем в localStorage', e);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  renderAll();
}

// Цвета приоритета (можно расширить)
function getPriorityColor(p) {
  const map = {
    high:   '#f85149',
    medium: '#f0883e',
    low:    '#58a6ff',
    none:   '#444'
  };
  return map[p] || map.none;
}

// Создание элемента задачи
function createTaskElement(task, day) {
  const el = document.createElement('div');
  el.className = `task ${task.done ? 'done' : ''}`;
  el.draggable = true;
  el.dataset.id = task.id;
  el.dataset.day = day;

  el.innerHTML = `
    <div class="grip">≡</div>
    <div class="priority-dot" style="background:${getPriorityColor(task.priority || 'none')}"></div>
    <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''}>
    <div class="task-text">${task.text}</div>
    <div class="task-actions">
      <button title="Edit priority"><i class="fas fa-flag"></i></button>
      <button title="More"><i class="fas fa-ellipsis-h"></i></button>
      <button class="delete" title="Delete"><i class="far fa-trash-alt"></i></button>
    </div>
  `;

  // Чекбокс
  el.querySelector('.task-check').onchange = () => {
    task.done = !task.done;
    task.completedAt = task.done ? Date.now() : null;
    saveTasks();
  };

  // Удаление
  el.querySelector('.delete').onclick = () => {
    if (!confirm('Удалить задачу?')) return;
    tasks[day] = tasks[day].filter(t => t.id !== task.id);
    saveTasks();
  };

  // Редактирование имени (двойной клик)
  const textEl = el.querySelector('.task-text');
  textEl.ondblclick = () => {
    textEl.contentEditable = true;
    textEl.focus();
    const range = document.createRange();
    range.selectNodeContents(textEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  textEl.onblur = () => {
    textEl.contentEditable = false;
    const newText = textEl.textContent.trim();
    if (newText !== task.text) {
      task.text = newText;
      saveTasks();
    }
  };
  textEl.onkeydown = e => {
    if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }
    if (e.key === 'Escape') { textEl.textContent = task.text; textEl.blur(); }
  };

  return el;
}

// Отрисовка всех задач
function renderTasks(day, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  tasks[day].forEach((task, idx) => {
    const el = createTaskElement(task, day);
    container.appendChild(el);
  });
}

// Полная отрисовка
function renderAll() {
  renderTasks('today', 'today-list');
  renderTasks('tomorrow', 'tomorrow-list');
  renderTasks('nextweek', 'nextweek-list');
  updateProgress();
}

// Добавление новой задачи
function startAdd(day) {
  const container = document.getElementById(day + '-list');
  const form = document.createElement('div');
  form.className = 'task add-form';
  form.innerHTML = `
    <input type="checkbox" class="task-check" disabled>
    <input type="text" class="add-input" placeholder="Task name..." autofocus>
    <div class="task-actions">
      <button disabled><i class="far fa-calendar-alt"></i></button>
      <button disabled><i class="fas fa-ellipsis-h"></i></button>
      <button disabled><i class="far fa-trash-alt"></i></button>
    </div>
  `;
  const input = form.querySelector('.add-input');
  container.appendChild(form);
  input.focus();

  const finish = () => {
    const text = input.value.trim();
    if (text) {
      const newTask = {
        id: Date.now().toString(),
        text,
        done: false,
        completedAt: null,
        priority: 'none'
      };
      tasks[day].push(newTask);
      saveTasks();
    }
    form.remove();
  };

  input.onblur = finish;
  input.onkeydown = e => {
    if (e.key === 'Enter') { e.preventDefault(); finish(); }
    if (e.key === 'Escape') { form.remove(); }
  };
}

// Обновление точек прогресса (имитация)
function updateProgress() {
  const dotsThis = document.getElementById('this-week-dots');
  const dotsNext = document.getElementById('next-week-dots');
  dotsThis.innerHTML = dotsNext.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i < 3 ? ' done' : '');
    dotsThis.appendChild(dot.cloneNode(true));
    dotsNext.appendChild(dot);
  }
}

// Drag & Drop между днями и внутри
document.querySelectorAll('.tasks-list').forEach(list => {
  Sortable.create(list, {
    group: 'tasks',
    animation: 150,
    handle: '.task',
    onEnd: evt => {
      const oldDay = evt.from.closest('.day-section').dataset.day;
      const newDay = evt.to.closest('.day-section').dataset.day;
      if (oldDay === newDay && evt.oldIndex === evt.newIndex) return;
      const item = tasks[oldDay].splice(evt.oldIndex, 1)[0];
      tasks[newDay].splice(evt.newIndex, 0, item);
      saveTasks();
    }
  });
});

// Sidebar кликабельность (демо)
document.querySelectorAll('.sidebar-item').forEach(el => {
  el.onclick = () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
  };
});

// Инициализация
loadTasks().then(renderAll);