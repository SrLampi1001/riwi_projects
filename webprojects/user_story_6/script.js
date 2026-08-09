const addNote = document.querySelector('[data-add-note]');
const noteList = document.querySelector('.note-list');

if(localStorage.getItem('notes')) {
    noteList.innerHTML = localStorage.getItem('notes');
}
const saveNotesToSession = () => {
    localStorage.setItem('notes', noteList.innerHTML);
}

addNote.addEventListener('click', () => {
    const input = document.createElement('input');
    const accept = document.createElement('button');
    input.type = 'text'; accept.textContent = 'Aceptar';
    input.placeholder = 'Nueva nota'; accept.classList.add('btn', 'btn-success', 'btn-sm', 'mb-2', 'ms-2');
    accept.addEventListener('click', () => {
        const noteText = input.value.trim();
        if (noteText) {
            const li = document.createElement('li');
            li.textContent = noteText;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-2');
            deleteBtn.setAttribute('data-delete-note', '');
            input.remove(); accept.remove();
            li.appendChild(deleteBtn);
            noteList.prepend(li);
            saveNotesToSession();
        }
    });
    noteList.prepend(input, accept);
    input.classList.add('form-control', 'mb-2');
});
document.addEventListener('click', (e) => {
    if (e.target && e.target.matches('[data-delete-note]')) {
        const li = e.target.closest('li');
        if (li) li.remove();
        saveNotesToSession();
    }
});