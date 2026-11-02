let todos = [];
let filter = "all";
let editingId = null;

const input = document.getElementById("new-todo");
const addBtn = document.getElementById("add-btn");
const listEl = document.getElementById("todo-list");
const countEl = document.getElementById("count");
const filtersEl = document.getElementById("filters");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");

const TRASH_ICON = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/>
</svg>`;

function addTodo() {
    const text = input.value.trim();
    if (!text) return;

    todos.push({ id: Date.now() + Math.random(), text: text, completed: false });
    input.value = "";
    input.focus();
    render();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
    render();
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    render();
}

function saveEdit(id, newText) {
    const text = newText.trim();
    if (!text) {
        deleteTodo(id);
    } else {
        const todo = todos.find(t => t.id === id);
        if (todo) todo.text = text;
    }
    editingId = null;
    render();
}

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    render();
}

function clearAll() {
    todos = [];
    render();
}

function setFilter(next) {
    filter = next;
    render();
}

function visibleTodos() {
    if (filter === "active") return todos.filter(t => !t.completed);
    if (filter === "completed") return todos.filter(t => t.completed);
    return todos;
}

function createItem(todo) {
    const li = document.createElement("li");
    li.className = "todo" + (todo.completed ? " done" : "");
    li.dataset.id = String(todo.id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", 'Mark "' + todo.text + '" as completed');
    li.appendChild(checkbox);

    if (editingId === todo.id) {
        const edit = document.createElement("input");
        edit.type = "text";
        edit.className = "edit";
        edit.value = todo.text;
        li.appendChild(edit);

        setTimeout(() => {
            edit.focus();
            edit.setSelectionRange(edit.value.length, edit.value.length);
        }, 0);
    } else {
        const label = document.createElement("span");
        label.className = "label";
        label.textContent = todo.text;
        li.appendChild(label);
    }

    const del = document.createElement("button");
    del.className = "btn-delete";
    del.setAttribute("aria-label", 'Delete "' + todo.text + '"');
    del.innerHTML = TRASH_ICON;
    li.appendChild(del);

    return li;
}

function render() {
    listEl.innerHTML = "";
    const items = visibleTodos();

    if (items.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent =
            todos.length === 0 ? "Nothing here yet. Add your first todo above." : "No " + filter + " todos.";
        listEl.appendChild(empty);
    } else {
        items.forEach(t => listEl.appendChild(createItem(t)));
    }

    const left = todos.filter(t => !t.completed).length;
    countEl.textContent = left + (left === 1 ? " item" : " items") + " left";

    filtersEl.querySelectorAll(".filter").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    clearCompletedBtn.disabled = !todos.some(t => t.completed);
    clearAllBtn.disabled = todos.length === 0;
}

addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", e => {
    if (e.key === "Enter") addTodo();
});

filtersEl.addEventListener("click", e => {
    const btn = e.target.closest(".filter");
    if (btn) setFilter(btn.dataset.filter);
});

function idOf(target) {
    const li = target.closest(".todo");
    return li ? Number(li.dataset.id) : null;
}

listEl.addEventListener("click", e => {
    const id = idOf(e.target);
    if (id === null) return;
    if (e.target.closest(".btn-delete")) deleteTodo(id);
});

listEl.addEventListener("change", e => {
    if (e.target.type !== "checkbox") return;
    const id = idOf(e.target);
    if (id !== null) toggleTodo(id);
});

listEl.addEventListener("dblclick", e => {
    if (!e.target.classList.contains("label")) return;
    const id = idOf(e.target);
    if (id !== null) {
        editingId = id;
        render();
    }
});

listEl.addEventListener("keydown", e => {
    if (!e.target.classList.contains("edit")) return;
    const id = idOf(e.target);
    if (id === null) return;

    if (e.key === "Enter") saveEdit(id, e.target.value);
    if (e.key === "Escape") {
        editingId = null;
        render();
    }
});

listEl.addEventListener("focusout", e => {
    if (!e.target.classList.contains("edit") || editingId === null) return;
    const id = idOf(e.target);
    if (id !== null) saveEdit(id, e.target.value);
});

clearCompletedBtn.addEventListener("click", clearCompleted);
clearAllBtn.addEventListener("click", clearAll);

render();
