'use strict';

const STORAGE_KEY = 'campus-planner-tasks-v1';
const $ = (selector) => document.querySelector(selector);
const taskList = $('#taskList');
const form = $('#taskForm');
const toast = $('#toast');
let filter = 'all';
let deferredInstallPrompt = null;
let toastTimeout;

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromToday(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return formatInputDate(date);
}

function demoTasks() {
  return [
    { id: 'demo-1', title: 'Prepare WADe presentation', category: 'Assignment', due: dateFromToday(2), priority: 'High', completed: false, createdAt: 1 },
    { id: 'demo-2', title: 'Review lecture notes', category: 'Lecture', due: dateFromToday(4), priority: 'Normal', completed: false, createdAt: 2 },
    { id: 'demo-3', title: 'Organize project references', category: 'Assignment', due: '', priority: 'Normal', completed: true, createdAt: 3 },
    { id: 'demo-4', title: 'Take a well-deserved break', category: 'Personal', due: '', priority: 'Normal', completed: false, createdAt: 4 },
  ];
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3200);
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    notify('Browser storage is blocked or full. Changes might not persist.');
    return false;
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return data.filter((t) => t && typeof t.id === 'string' && typeof t.title === 'string')
          .map((t) => ({
            id: t.id,
            title: t.title.slice(0, 100),
            category: ['Assignment', 'Lecture', 'Personal'].includes(t.category) ? t.category : 'Personal',
            due: typeof t.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.due) ? t.due : '',
            priority: t.priority === 'High' ? 'High' : 'Normal',
            completed: t.completed === true,
            createdAt: Number.isFinite(t.createdAt) ? t.createdAt : 0,
          }));
      }
    }
  } catch (error) {
    console.warn('Saved tasks could not be read. Demo data will be shown.', error);
  }
  return demoTasks();
}

let tasks = loadTasks();

try {
  if (localStorage.getItem(STORAGE_KEY) === null) saveTasks();
} catch (error) {

}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const CHECK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const TRASH_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 4h4m-8 3 1 13h10l1-13M10 11v5m4-5v5"/></svg>';

function friendlyDate(iso) {
  const date = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function makeTaskRow(task) {
  const row = el('li', `task-item${task.completed ? ' done' : ''}`);
  const toggle = el('button', `task-check${task.completed ? ' checked' : ''}`);
  toggle.type = 'button';
  toggle.setAttribute('aria-label', `${task.completed ? 'Mark as not completed' : 'Complete task'}: ${task.title}`);
  toggle.setAttribute('aria-pressed', String(task.completed));
  toggle.innerHTML = task.completed ? CHECK_SVG : '';
  toggle.addEventListener('click', () => {
    task.completed = !task.completed;
    saveTasks();
    render();
    notify(task.completed ? 'Nice work! Task completed.' : 'Task marked as to do.');
  });

  const main = el('div', 'task-main');
  main.append(el('span', 'task-title', task.title));
  const meta = el('div', 'task-meta');
  meta.append(el('span', `category-pill ${task.category.toLowerCase()}`, task.category));
  if (task.due) {
    const overdue = !task.completed && task.due < formatInputDate(new Date());
    meta.append(el('span', `due-pill${overdue ? ' overdue' : ''}`, `${overdue ? 'Overdue · ' : ''}${friendlyDate(task.due)}`));
  }
  if (task.priority === 'High') meta.append(el('span', 'priority-pill', 'High priority'));
  main.append(meta);

  const remove = el('button', 'delete-button');
  remove.type = 'button';
  remove.setAttribute('aria-label', `Delete task: ${task.title}`);
  remove.title = 'Delete task';
  remove.innerHTML = TRASH_SVG;
  remove.addEventListener('click', () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    render();
    notify('Task removed.');
  });
  row.append(toggle, main, remove);
  return row;
}

function render() {
  const all = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  $('#totalCount').textContent = String(all);
  $('#activeCount').textContent = String(all - completed);
  $('#doneCount').textContent = String(completed);
  $('#taskSummary').textContent = `${all} ${all === 1 ? 'task' : 'tasks'}`;
  $('#progressLabel').textContent = `${all ? Math.round((completed / all) * 100) : 0}% done`;

  const visible = tasks
    .filter((task) => filter === 'all' || (filter === 'done' ? task.completed : !task.completed))
    .sort((a, b) => Number(a.completed) - Number(b.completed) ||
      (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31') ||
      b.createdAt - a.createdAt);
  taskList.replaceChildren(...visible.map(makeTaskRow));
  $('#emptyState').hidden = visible.length > 0;
  if (!visible.length) {
    $('#emptyTitle').textContent = filter === 'done' ? 'No completed tasks yet' : filter === 'active' ? 'All caught up!' : 'A fresh start';
    $('#emptyText').textContent = filter === 'done' ? 'Complete a task to see it here.' : filter === 'active' ? 'You have no unfinished tasks.' : 'Add a task to start planning your day.';
  }
  document.querySelectorAll('[data-filter]').forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = $('#taskTitle').value.trim();
  if (!title) {
    $('#taskTitle').setCustomValidity('Please enter a task name.');
    $('#taskTitle').reportValidity();
    return;
  }
  $('#taskTitle').setCustomValidity('');
  const id = (globalThis.crypto && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  tasks.unshift({
    id, title: title.slice(0, 100),
    category: $('#taskCategory').value,
    due: $('#taskDue').value,
    priority: $('#taskPriority').value,
    completed: false,
    createdAt: Date.now(),
  });
  saveTasks();
  filter = 'all';
  render();
  form.reset();
  $('#taskTitle').focus();
  notify('Task added. You’ve got this!');
});
$('#taskTitle').addEventListener('input', () => $('#taskTitle').setCustomValidity(''));
document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => { filter = button.dataset.filter; render(); });
});
$('#resetButton').addEventListener('click', () => {
  if (!window.confirm('Replace your current tasks with the original demo tasks? This cannot be undone.')) return;
  tasks = demoTasks();
  saveTasks();
  filter = 'all';
  render();
  notify('Demo tasks restored.');
});

function updateConnectivity() {
  const online = navigator.onLine;
  $('#connectionStatus').classList.toggle('offline', !online);
  $('#connectionText').textContent = online ? 'Online' : 'Offline mode';
  $('#connectionStatus').title = online ? 'Browser reports a network connection' : 'Browser reports no network connection';
}
window.addEventListener('online', updateConnectivity);
window.addEventListener('offline', updateConnectivity);
updateConnectivity();

const installButton = $('#installButton');
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.add('is-ready');
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  notify('Campus Planner has been installed!');
});
$('#howItWorksButton').addEventListener('click', () => $('#howItWorksDialog').showModal());
installButton.addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    await promptEvent.prompt();
  
    await promptEvent.userChoice;
    return;
  }
  $('#installDialog').showModal();
});

async function setUpServiceWorker() {
  const status = $('#workerStatus');
  if (!('serviceWorker' in navigator)) {
    status.textContent = 'This browser does not support Service Workers.';
    return;
  }
  if (!window.isSecureContext) {
    status.textContent = 'Offline setup requires HTTPS or localhost.';
    return;
  }
  try {
    await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
    await navigator.serviceWorker.ready;
    status.textContent = navigator.serviceWorker.controller
      ? '✓ Offline app shell ready on this device'
      : '✓ Offline assets installed. Ready after the browser takes control.';
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      status.textContent = '✓ Offline app shell ready on this device';
    });
  } catch (error) {
    console.error('Service Worker registration failed', error);
    status.textContent = 'Offline setup failed. Check DevTools and your connection.';
  }
}
render();
setUpServiceWorker();
