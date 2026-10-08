const STORAGE_KEY = 'decisionDiceChoices';
const CHOOSING_DURATION = 1400;

const choiceForm = document.querySelector('#choice-form');
const choiceInput = document.querySelector('#choice-input');
const choiceList = document.querySelector('#choice-list');
const emptyMessage = document.querySelector('#empty-message');
const choiceCount = document.querySelector('#choice-count');
const clearButton = document.querySelector('#clear-button');
const decideButton = document.querySelector('#decide-button');
const result = document.querySelector('#result');
const resultValue = document.querySelector('#result-value');

// Restore saved choices when the page opens.
let choices = loadChoices();
let isChoosing = false;

renderChoices();

choiceForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addChoice();
});

clearButton.addEventListener('click', clearChoices);
decideButton.addEventListener('click', decide);

function loadChoices() {
  try {
    const savedChoices = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedChoices)
      ? savedChoices.filter((choice) => typeof choice === 'string')
      : [];
  } catch {
    return [];
  }
}

function saveChoices() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
}

function addChoice() {
  const choice = choiceInput.value.trim();

  if (!choice || isChoosing) {
    choiceInput.focus();
    return;
  }

  choices.push(choice);
  choiceInput.value = '';
  result.classList.remove('is-selected');
  resultValue.textContent = 'The dice are waiting...';
  saveChoices();
  renderChoices();
  choiceInput.focus();
}

function deleteChoice(index) {
  choices.splice(index, 1);
  result.classList.remove('is-selected');
  resultValue.textContent = 'The dice are waiting...';
  saveChoices();
  renderChoices();
}

function renderChoices() {
  choiceList.replaceChildren();

  choices.forEach((choice, index) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const deleteButton = document.createElement('button');

    item.className = 'choice-item';
    name.className = 'choice-name';
    name.textContent = choice;
    deleteButton.className = 'button-delete';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `Delete ${choice}`);
    deleteButton.addEventListener('click', () => deleteChoice(index));

    item.append(name, deleteButton);
    choiceList.append(item);
  });

  const hasChoices = choices.length > 0;
  emptyMessage.hidden = hasChoices;
  choiceList.hidden = !hasChoices;
  choiceCount.textContent = `${choices.length} ${choices.length === 1 ? 'choice' : 'choices'}`;
  decideButton.disabled = !hasChoices || isChoosing;
  clearButton.disabled = !hasChoices || isChoosing;
  choiceInput.disabled = isChoosing;
}

function decide() {
  if (choices.length === 0 || isChoosing) {
    return;
  }

  isChoosing = true;
  result.classList.remove('is-selected');
  result.classList.add('is-choosing');
  resultValue.textContent = 'Choosing...';
  renderChoices();

  const animation = window.setInterval(() => {
    const previewIndex = Math.floor(Math.random() * choices.length);
    resultValue.textContent = choices[previewIndex];
  }, 100);

  window.setTimeout(() => {
    window.clearInterval(animation);
    const selectedIndex = Math.floor(Math.random() * choices.length);

    result.classList.remove('is-choosing');
    result.classList.add('is-selected');
    resultValue.textContent = choices[selectedIndex];
    isChoosing = false;
    renderChoices();
  }, CHOOSING_DURATION);
}

function clearChoices() {
  if (isChoosing) {
    return;
  }

  choices = [];
  result.classList.remove('is-selected', 'is-choosing');
  resultValue.textContent = 'The dice are waiting...';
  saveChoices();
  renderChoices();
  choiceInput.focus();
}