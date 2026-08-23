const slides = [...document.querySelectorAll('.slide')];
const progress = document.getElementById('progress');
const counter = document.getElementById('counter');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const overview = document.getElementById('overview');
const overviewGrid = document.getElementById('overviewGrid');
const editButton = document.getElementById('editButton');
const resetEdits = document.getElementById('resetEdits');
const editNotice = document.getElementById('editNotice');
const editableElements = [...document.querySelectorAll('.slide h1, .slide h2, .slide h3, .slide p, .slide li, .slide blockquote, .slide small, .slide .growth b')];
const editsKey = 'geetha-intuit-presentation-edits-v3';
let current = 0;
let editing = false;

editableElements.forEach((element, index) => element.dataset.editId = `copy-${index}`);

function loadEdits() {
  try {
    const saved = JSON.parse(localStorage.getItem(editsKey) || '{}');
    editableElements.forEach(element => {
      if (Object.prototype.hasOwnProperty.call(saved, element.dataset.editId)) element.innerHTML = saved[element.dataset.editId];
    });
  } catch (_) {}
}

function saveEdits() {
  const saved = {};
  editableElements.forEach(element => saved[element.dataset.editId] = element.innerHTML);
  localStorage.setItem(editsKey, JSON.stringify(saved));
}

function setEditMode(enabled) {
  editing = enabled;
  document.body.classList.toggle('edit-mode', enabled);
  editButton.textContent = enabled ? 'Done editing' : 'Edit';
  resetEdits.hidden = !enabled;
  editNotice.hidden = !enabled;
  editableElements.forEach(element => element.contentEditable = enabled ? 'true' : 'false');
  if (enabled) editableElements[0]?.focus();
}

function goTo(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides[current].scrollIntoView({ behavior: 'smooth', block: 'start' });
  update();
}

function update() {
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  slides.forEach((slide, index) => slide.classList.toggle('active', index === current));
}

const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  current = slides.indexOf(visible.target);
  update();
}, { threshold: [0.55, 0.75] });

slides.forEach((slide, index) => {
  observer.observe(slide);
  const button = document.createElement('button');
  button.innerHTML = `<small>${String(index + 1).padStart(2, '0')} · ${slide.dataset.section}</small><b>${slide.dataset.title}</b>`;
  button.addEventListener('click', () => { overview.close(); goTo(index); });
  overviewGrid.appendChild(button);
});

document.querySelectorAll('.next').forEach(button => button.addEventListener('click', () => goTo(current + 1)));
previous.addEventListener('click', () => goTo(current - 1));
next.addEventListener('click', () => goTo(current + 1));
document.getElementById('overviewButton').addEventListener('click', () => overview.showModal());
document.getElementById('closeOverview').addEventListener('click', () => overview.close());
overview.addEventListener('click', event => { if (event.target === overview) overview.close(); });
editButton.addEventListener('click', () => setEditMode(!editing));
editableElements.forEach(element => element.addEventListener('input', saveEdits));
resetEdits.addEventListener('click', () => {
  if (!window.confirm('Reset all edits made in this browser?')) return;
  localStorage.removeItem(editsKey);
  window.location.reload();
});

document.addEventListener('keydown', event => {
  if (editing) return;
  if (overview.open) {
    if (event.key === 'Escape') overview.close();
    return;
  }
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goTo(current + 1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); goTo(current - 1); }
  if (event.key === 'Home') { event.preventDefault(); goTo(0); }
  if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
  if (event.key.toLowerCase() === 'o') overview.showModal();
});

loadEdits();
update();
