import { cardsData as blueCardsImport } from './data/mythicCards/blue/index.js';
import { cardsData as brownCardsImport } from './data/mythicCards/brown/index.js';
import { cardsData as greenCardsImport } from './data/mythicCards/green/index.js';
import Ancients from './data/ancients.js';
import { getUniqueItem, shuffle } from './utils.js';

const CARD_DIFFICULTIES = ['easy', 'normal', 'hard'];
const GAME_DIFFICULTY_LIST = ['very easy', 'easy', 'normal', 'hard', 'very hard'];
const COLORS = ['blue','green', 'brown'];
const CARDS_COLOR = ['blueCards', 'greenCards', 'brownCards'];
const STAGES = ['firstStage', 'secondStage', 'thirdStage'];

const ancientsContainer = document.querySelector('.ancients-selector__list');
const difficultyContainer = document.querySelector('.difficulty-level__list');
const deckContainer = document.querySelector('.player-card-deck__list');
const deckStatsContainer = document.querySelector('.player-card-deck-stat');
const stages = document.querySelectorAll('.stage');

let stack = [];
let ancient = {};
let difficulty = '';


init();

deckContainer.addEventListener('click', deckClickHandler);
ancientsContainer.addEventListener('click', ancientClickHandler);
difficultyContainer.addEventListener('click', buttonClickHandler);

function buttonClickHandler(evt) {
  const clickedButton = evt.target.closest('button');
  if(!clickedButton) {
    return;
  }
  const value = clickedButton.textContent;
  difficulty = value;
  console.log(`Selected difficulty: ${difficulty}`);
  const buttons = difficultyContainer.querySelectorAll('button');
  buttons.forEach((button) => {
    button.classList.toggle('difficulty-level__button--active', button.textContent === difficulty);
  })
  document.querySelector('.ancients-selector').classList.add('ancients-selector--enabled');
  showStartButton();
}

function ancientClickHandler(evt) {
  const selectedAncientCard = evt.target.closest('li');
  if(!selectedAncientCard) {
    return;
  } 
  const selectedAncient = selectedAncientCard.dataset.value;
  const result = Ancients.find((item) => item.name === selectedAncient);
  ancient = result;
  console.log(`Selected ancient:`);
  console.log(ancient);
  const cards = ancientsContainer.querySelectorAll('li');
  cards.forEach((item) => {
    item.classList.toggle('ancients-selector__item--active', item.dataset.value === selectedAncient);
  });
  showStartButton();
}

function deckClickHandler() {
  const deletedCard = stack.pop();
  const cardList = deckContainer.querySelectorAll('li');
  const itemToDelete = Array.from(cardList).find((item) => item.dataset.id === deletedCard.id);
  console.log('removed:');
  console.log(deletedCard);
  itemToDelete.remove();
  paintDackStat(stack)
}

function showStartButton() {
  const button = document.querySelector('.start-game-button');
  button.classList.toggle('start-game-button--active', difficulty && Object.keys(ancient).length !== 0)
  button.addEventListener('click', game);
}

function init() {
  paintAncientCards();
  paintDifficulty();
}

function game() {
  console.log('Start game');
  const cardsByDifficultyTypes = collectCardsByDifficultyTypes();
  const cardDeckByColor = getCardDeckByColor(ancient, difficulty, cardsByDifficultyTypes);
  const completeDeck = getCardDeckByStage(ancient, cardDeckByColor);
  console.log(`Card deck by stage: `);
  console.log(completeDeck);
  stack = getStack(completeDeck);
  console.log(`Card stack: `);
  console.log(stack);
  paintDeck(stack);
  paintDackStat(stack);
  deckStatsContainer.classList.add('player-card-deck-stat--enabled');
  document.querySelector('.start-game-button').classList.remove('start-game-button--active');
}

function getStack(deck) {
  let stack = [];
  for(let stage in deck) {
    let stageArray = [];
    for (let color in deck[stage]) {
      for(let card of deck[stage][color]) {
        card.stage = stage;
        stageArray.push(card);
      }
    }
    shuffle(stageArray);
    stack.push(...stageArray);
  }
  return stack.reverse();
}

function paintAncientCards() {
  ancientsContainer.innerHTML = '';
  let shift = -225;
  Ancients.forEach((item) => {
    ancientsContainer.insertAdjacentHTML('beforeend',
    `<li class="ancients-selector__item" data-value="${item.name}" style="transform: translateY(${shift}px)">
      <span class="visually-hidden">${item.name}</span>
      <img class="ancients-selector__img" src="${item.cardFace}">
    </li>`
    )
    shift += 75;
  })
}

function paintDifficulty() {
  difficultyContainer.innerHTML = '';
  GAME_DIFFICULTY_LIST.forEach((item) => {
    difficultyContainer.insertAdjacentHTML('beforeend',
    `<li class="difficulty-level__item">
      <button class="difficulty-level__button button" type="button">${item}</button>
    </li>`
    )
  })
}

function paintDeck(deck) {
  deckContainer.innerHTML = '';
  let shift = -375;
  deck.forEach((card) => {
    deckContainer.insertAdjacentHTML('beforeend',
    `<li class="player-card-deck__item" data-id="${card.id}" style="transform: translateY(${shift}px)">
      <img class="player-card-deck__img" src="${card.cardFace}">
    </li>`
  )
  shift += 25;
});

}

function paintDackStat(deck) {
  const stack = {};
  STAGES.forEach((stage) => {
    stack[stage] = {};
    COLORS.forEach((color) => {
      stack[stage][color] = 0;
    })
  })
  for(let item of deck) {
    STAGES.forEach((stage) => {
      stack[stage] = {};
      COLORS.forEach((color) => {
        stack[stage][color] = deck.filter((item) => item.stage === stage && item.color === color).length;
      })
    })
  }
  STAGES.forEach((stageItem) => {
    const stage = Array.from(stages).find((item) => item.dataset.stage === stageItem);
    stage.querySelector('.card-stat--green').textContent = stack[stageItem].green;
    stage.querySelector('.card-stat--brown').textContent = stack[stageItem].brown;
    stage.querySelector('.card-stat--blue').textContent = stack[stageItem].blue;
    stage.classList.toggle('stage--done', (stack[stageItem].green+ stack[stageItem].brown + stack[stageItem].blue) === 0);
  });
}

function collectCardsByDifficultyTypes() {
const blueCards = {};
const brownCards = {};
const greenCards = {};
  CARD_DIFFICULTIES.forEach((item) => {
    blueCards[item] = blueCardsImport.filter((card) => card.difficulty === item);
    brownCards[item] = brownCardsImport.filter((card) => card.difficulty === item);
    greenCards[item] = greenCardsImport.filter((card) => card.difficulty === item);
  });
  const cardsCollection = { blueCards, brownCards, greenCards };
  return cardsCollection;
};

function getCardDeckByColor(ancient, difficulty, cardsByType) {
  const result = {};
  CARDS_COLOR.forEach((color) => {
    let mergedEasyArray = [...cardsByType[color].easy, ...cardsByType[color].normal];
    let mergedNormalArray = [...cardsByType[color].easy, ...cardsByType[color].normal, ...cardsByType[color].hard];
    let mergedHardArray = [...cardsByType[color].normal, ...cardsByType[color].hard];
    result[color] = [];
    STAGES.forEach((stage) => {
      let counter = ancient[stage][color];
      switch (difficulty) {
        case 'very easy':
          while (counter !== 0 && cardsByType[color].easy.length !== 0) {
            getUniqueItem(result[color], cardsByType[color].easy);
            counter--;
          }
          while (counter !== 0) {
            getUniqueItem(result[color], cardsByType[color].normal);
            counter--;
          }
          break;
        case 'easy':
          while (counter !== 0) {
            getUniqueItem(result[color], mergedEasyArray);
            counter--;
          }
          break;
        case 'normal':
          while (counter !== 0) {
            getUniqueItem(result[color], mergedNormalArray);
            counter--;
          }
          break;
        case 'hard':
          while (counter !== 0) {
            getUniqueItem(result[color], mergedHardArray);
            counter--;
          }
          break;
        case 'very hard':
          while (counter !== 0 && cardsByType[color].hard.length !== 0) {
            getUniqueItem(result[color], cardsByType[color].hard);
            counter--;
          }
          while (counter !== 0) {
            getUniqueItem(result[color], cardsByType[color].normal);
            counter--;
          }
          break;
      }
    });
  });

  return result;
}

function getCardDeckByStage(ancient, calculatedCards) {
  const result = {};
  STAGES.forEach((stage) => {
    result[stage] = {};
    CARDS_COLOR.forEach((color) => {
      let counter = ancient[stage][color];
      result[stage][color] = [];
      while (counter !== 0) {
        getUniqueItem(result[stage][color], calculatedCards[color]);
        counter--;
      }
    });
  });
  return result;
}