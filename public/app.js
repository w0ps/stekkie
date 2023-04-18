import {toElement} from './lib.js';

const stacks = localStorage.getItem('stacks') && JSON.parse(localStorage.getItem('stacks')) || [];
const cards = localStorage.getItem('cards') && JSON.parse(localStorage.getItem('cards')) || {};
const finishedCards = [];

let updateUI;

let lastId = -1;

function createId() {
  return lastId = lastId + 1;
}

function getStack(stackName) {
  return stacks.find(({name}) => name === stackName);
}

function persist() {
  localStorage.setItem('stacks', JSON.stringify(stacks));
  localStorage.setItem('cards', JSON.stringify(cards));
}

const actions = {
  finish: stack => {
    const cardId = stack.cards.at(-1);
    finishedCards.push(cardId);
    stack.cards.pop();
  },
  postpone: stack => {
    stack.cards.unshift(stack.cards.pop());
  },
  delete: stack => {
    stacks.splice(stacks.indexOf(stack), 1);
  },
};

function drawUI() {
  let ui = toElement(`
    <div>
      <div class="stackInput">
        <h2>Add new stack</p>
        <div class="form-group">
          <input type="text" placeholder="Add a name.." class="form-control"/>
        </div>
      </div>
      <div>
        <h2>📚 Stacks</h2>
        <div id="stacks"></div>
      </div>
    </div>
  `);

  document.body.querySelector('.container').appendChild(ui);

  const input = ui.querySelector('input');
  const stacksContainer = ui.querySelector('#stacks');

  // Handle creating new cards
  stacksContainer.addEventListener('keyup', event => {
    if (event.target.matches('input[data-stack-name]') && event.keyCode === 13 && event.target.value) {
      const {
        value,
        dataset: {stackName}
      } = event.target;

      event.target.value = '';

      const card = {
        caption: value,
        id: createId(),
      };

      cards[card.id] = card;

      getStack(stackName).cards.push(card.id);

      persist();
      updateUI();
    }
  });

  stacksContainer.addEventListener('click', event => {
    if (event.target.matches('[data-stack-name][data-action]')) {
      const {
        stackName,
        action,
      } = event.target.dataset;

      const stack = getStack(stackName);

      actions[action](stack);
      persist();
      updateUI();
    }
  });

  // Handle creating new stacks
  input.addEventListener('keyup', event => {
    if (event.keyCode === 13 && event.target.value) {
      stacks.push({
        name: event.target.value,
        cards: [],
      });

      event.target.value = '';

      persist();
      updateUI();
    }
  });

  updateUI = () => {
    let str = '';

    for (const {name, cards: cardIds} of stacks) {
      const {length} = cardIds;
      const caption = length && cards[cardIds.at(-1)].caption;
      str += `<div data-stack-name="${name}" class="stack">
        <h2>${name} (${length})</h2>
        <button data-stack-name="${name}" data-action="delete" class="btn btn-secondary">Remove stack</button>
        <div class="form-group">
          <input data-stack-name="${name}" placeholder="New card.." class="form-control"/>
        </div>
        ${length ? (`
        <div class="card row">
          <h3>${caption}</h3>
          <div class="row buttons">
            <button data-stack-name="${name}" data-action="finish" class="btn btn-primary">Done ✅</button>
            <button data-stack-name="${name}" data-action="postpone" class="btn btn-secondary">Postpone 🔻</button>
          </div>
        </div>
        `) : '<p class="text-muted">Please add a card.</p>'}
      </div>`;
    }
    stacksContainer.innerHTML = str || '<p class="text-muted">Stack underflow. Please add a stack.</p>';
  };

  updateUI();
}

drawUI();