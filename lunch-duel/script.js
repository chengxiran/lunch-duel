const setup = document.querySelector('#setup');
const duel = document.querySelector('#duel');
const result = document.querySelector('#result');
const input = document.querySelector('#food-input');
const setupError = document.querySelector('#setup-error');
const optionA = document.querySelector('#option-a');
const optionB = document.querySelector('#option-b');
const roundLabel = document.querySelector('#round-label');
const progressFill = document.querySelector('#progress-fill');
const resultTitle = document.querySelector('#result-title');
const resultReason = document.querySelector('#result-reason');

let foods = [];
let contenders = [];
let champion = '';
let round = 0;

function parseFoods(value) {
  return [...new Set(value.split(/[，,、\n]+/).map(item => item.trim()).filter(Boolean))];
}

function show(section) {
  [setup, duel, result].forEach(panel => panel.classList.add('is-hidden'));
  section.classList.remove('is-hidden');
}

function startGame() {
  foods = parseFoods(input.value);
  if (foods.length < 2) {
    setupError.textContent = '请至少输入两个不同的午餐选项，才能开始对决。';
    input.focus();
    return;
  }
  if (foods.length > 8) {
    setupError.textContent = '候选项最多 8 个；少一点会更容易做决定。';
    input.focus();
    return;
  }
  setupError.textContent = '';
  contenders = [...foods];
  champion = contenders.shift();
  round = 1;
  show(duel);
  renderDuel();
}

function renderDuel() {
  const challenger = contenders[0];
  optionA.textContent = champion;
  optionB.textContent = challenger;
  roundLabel.textContent = `第 ${round} / ${foods.length - 1} 轮`;
  progressFill.style.width = `${((round - 1) / (foods.length - 1)) * 100}%`;
}

function choose(winner) {
  champion = winner;
  contenders.shift();
  round += 1;
  if (!contenders.length) {
    finishGame();
    return;
  }
  renderDuel();
}

function finishGame() {
  progressFill.style.width = '100%';
  resultTitle.textContent = champion;
  resultReason.textContent = `经过 ${foods.length - 1} 轮直觉对决，它从 ${foods.length} 个候选项中胜出。今天就吃它吧。`;
  show(result);
}

document.querySelector('#start-btn').addEventListener('click', startGame);
document.querySelector('#example-btn').addEventListener('click', () => {
  input.value = '海南鸡饭、兰州拉面、麻辣烫、寿司、牛肉汉堡';
  setupError.textContent = '';
  input.focus();
});
optionA.addEventListener('click', () => choose(champion));
optionB.addEventListener('click', () => choose(contenders[0]));
document.querySelector('#again-btn').addEventListener('click', () => { contenders = [...foods]; champion = contenders.shift(); round = 1; show(duel); renderDuel(); });
document.querySelector('#new-list-btn').addEventListener('click', () => show(setup));
document.querySelector('#restart-from-duel').addEventListener('click', () => show(setup));
input.addEventListener('input', () => { setupError.textContent = ''; });
