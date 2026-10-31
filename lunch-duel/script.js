const $ = selector => document.querySelector(selector);
const setup = $('#setup'), arena = $('#arena'), result = $('#result'), input = $('#food-input'), setupError = $('#setup-error');
const optionA = $('#option-a'), optionB = $('#option-b');
let foods = [], contenders = [], champion = '', round = 0, rescueUsed = false;
const profile = { hunger: 'a proper meal', time: 'half an hour', mood: 'spicy' };
const calls = ['First lantern: a vendor calls your name.', 'The smell is good, but only one can stay.', 'Do not analyse it. Trust the first bite in your head.', 'After this round, the crowd gets smaller.', 'Final challenger: step up.'];
const chapters = ['FIRST LIGHT', 'AROUND THE CORNER', 'IN THE CROWD', 'END OF THE STREET', 'LAST CALL'];
const recommendationBank = {
  low: { spicy: [['spicy noodles', 'Hot, fast, and enough to wake up your appetite.'], ['street tacos', 'Build your own heat without spending much.'], ['chili chicken rice', 'Budget-friendly with real satisfaction.']], light: [['cold sesame noodles', 'Fresh, savoury, and not too heavy.'], ['vegetable wrap', 'A quick and light market walk meal.'], ['tomato egg rice', 'Simple, warm, and safe.']], comfort: [['beef noodle soup', 'A bowl that can carry you through the afternoon.'], ['braised pork rice', 'Familiar flavour; fewer decisions.'], ['breakfast burrito', 'Solid comfort in ten minutes.']] },
  mid: { spicy: [['bibimbap', 'Warm rice, chili sauce, and plenty of texture.'], ['pad thai', 'Sweet, sour, spicy: a full conversation.'], ['mala bowl', 'Pick your own ingredients, then bring the heat.']], light: [['pho', 'Herbs and broth: bright but still substantial.'], ['soba salad', 'A calm option with real flavour.'], ['poke bowl', 'Cool, colourful, and built to your taste.']], comfort: [['Hainanese chicken rice', 'Reliable, gentle, and never too dramatic.'], ['Japanese curry', 'Rich, warm, and made for slowing down.'], ['smash burger', 'Direct, uncomplicated happiness.']] },
  high: { spicy: [['Korean barbecue', 'Make dinner an event, not a task.'], ['Sichuan fish stew', 'Tonight’s main character has arrived.'], ['hot pot', 'Slow, social, and as spicy as you dare.']], light: [['sushi set', 'Every piece changes the next bite.'], ['Mediterranean grain bowl', 'Bright vegetables and a little breathing room.'], ['mushroom chicken soup', 'Clean flavours with depth.']], comfort: [['steak frites', 'A deliberate, satisfying choice.'], ['stone-pot bibimbap', 'The crispy rice is the extra reward.'], ['fresh pasta', 'A dependable ending to the day.']] }
};
function parseFoods(value) { return [...new Set(value.split(/[，,、\n]+/).map(item => item.trim()).filter(Boolean))]; }
function shuffle(list) { return [...list].sort(() => Math.random() - .5); }
function show(screen) { [setup, arena, result].forEach(item => item.classList.add('is-hidden')); screen.classList.remove('is-hidden'); }
function noteFor(food) {
  const tags = profile.mood === 'spicy' ? ['heat rising', 'smells dangerous', 'bring the fire'] : profile.mood === 'something new' ? ['unknown stall', 'worth a try', 'new route ahead'] : ['familiar choice', 'safe hands', 'no risk needed'];
  const seed = [...food].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tags[seed % tags.length] + ' · ' + profile.hunger + ' · ' + profile.time;
}
function fillCard(button, food) { button.querySelector('.food-name').textContent = food; button.querySelector('.food-note').textContent = noteFor(food); }
function renderArena() {
  fillCard(optionA, champion); fillCard(optionB, contenders[0]);
  $('#round-count').textContent = String(round).padStart(2, '0');
  $('#arena-chapter').textContent = chapters[Math.min(round - 1, chapters.length - 1)];
  $('#route-fill').style.width = ((round - 1) / (foods.length - 1)) * 100 + '%';
  $('#market-call').textContent = calls[Math.min(round - 1, calls.length - 1)];
  $('#memory-line').textContent = (round - 1) + ' challenger' + (round === 2 ? '' : 's') + ' eliminated. ' + (foods.length - round) + ' waiting.';
}
function resetRescue() { rescueUsed = false; $('#rescue-btn').disabled = false; $('#rescue-btn').textContent = 'Tie-breaker: flip a coin'; }
function startGame() {
  foods = parseFoods(input.value);
  if (foods.length < 2) { setupError.textContent = 'Add at least two different lunches before the market can open.'; input.focus(); return; }
  if (foods.length > 8) { setupError.textContent = 'The market is too crowded: keep your shortlist to eight options or fewer.'; input.focus(); return; }
  setupError.textContent = ''; contenders = shuffle(foods); champion = contenders.shift(); round = 1; resetRescue(); show(arena); renderArena();
}
function choose(winner) { champion = winner; contenders.shift(); round += 1; if (!contenders.length) { finishGame(); return; } renderArena(); }
function history() { try { return JSON.parse(localStorage.getItem('night-market-history') || '[]'); } catch { return []; } }
function renderHistory() {
  const records = history(), list = $('#history-list'); list.innerHTML = '';
  if (!records.length) { list.innerHTML = '<li class="history-empty">No locked orders yet. Finish a round and it will stay on this device.</li>'; return; }
  records.forEach((entry, index) => { const item = document.createElement('li'); item.innerHTML = '<span>0' + (index + 1) + '</span><b>' + entry.food + '</b><small>' + entry.date + ' · ' + entry.defeats + ' wins</small>'; list.appendChild(item); });
}
function saveHistory() {
  const entry = { food: champion, date: new Intl.DateTimeFormat('en-GB', { month: 'short', day: '2-digit' }).format(new Date()), defeats: foods.length - 1 };
  try { localStorage.setItem('night-market-history', JSON.stringify([entry, ...history()].slice(0, 5))); } catch { /* Storage can be unavailable. */ }
}
function finishGame() {
  $('#result-title').textContent = champion;
  $('#receipt-date').textContent = new Intl.DateTimeFormat('en-GB', { month: '2-digit', day: '2-digit' }).format(new Date()).replace('/', '.');
  $('#profile-summary').textContent = profile.hunger + ' / ' + profile.time + ' / ' + profile.mood;
  $('#defeat-count').textContent = (foods.length - 1) + ' market challengers';
  const fortunes = ['Not random: you personally kept it alive until the end.', 'This receipt cannot promise the best lunch. It can promise what you want right now.', 'Your appetite has spoken. Stop returning the decision to the group chat.'];
  $('#fortune').textContent = fortunes[(foods.length + champion.length) % fortunes.length]; saveHistory(); renderHistory(); show(result);
}
function generateRecommendations() {
  const choices = recommendationBank[$('#budget-select').value][$('#taste-select').value];
  $('#recommendations').innerHTML = choices.map(item => '<article class="rec-card"><b>' + item[0] + '</b><small>' + item[1] + '</small><button class="add-rec" type="button" data-food="' + item[0] + '">Add to showdown</button></article>').join('');
}
document.querySelectorAll('.choice-set').forEach(set => set.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  set.querySelectorAll('button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); profile[set.dataset.group] = button.dataset.value;
}));
$('#example-btn').addEventListener('click', () => { input.value = 'ramen, tacos, curry, pho, smash burger'; input.focus(); });
$('#intel-btn').addEventListener('click', () => { $('#intel-panel').classList.toggle('is-hidden'); $('#intel-btn').querySelector('span').textContent = $('#intel-panel').classList.contains('is-hidden') ? '＋' : '−'; });
$('#generate-btn').addEventListener('click', generateRecommendations);
$('#recommendations').addEventListener('click', event => { const button = event.target.closest('.add-rec'); if (!button) return; const current = parseFoods(input.value); if (current.includes(button.dataset.food)) { button.textContent = 'Already listed'; return; } if (current.length >= 8) { setupError.textContent = 'Your shortlist already has eight options. Remove one before adding another.'; return; } input.value = (input.value.trim() ? input.value.trim() + ', ' : '') + button.dataset.food; button.textContent = 'Added ✓'; input.focus(); });
$('#start-btn').addEventListener('click', startGame); optionA.addEventListener('click', () => choose(champion)); optionB.addEventListener('click', () => choose(contenders[0]));
$('#back-btn').addEventListener('click', () => show(setup)); $('#new-list-btn').addEventListener('click', () => show(setup));
$('#rescue-btn').addEventListener('click', () => { if (rescueUsed) return; rescueUsed = true; $('#rescue-btn').disabled = true; $('#rescue-btn').textContent = 'Coin already flipped'; const winner = Math.random() < .5 ? champion : contenders[0]; $('#market-call').textContent = 'The coin lands on “' + winner + '”.'; setTimeout(() => choose(winner), 650); });
$('#again-btn').addEventListener('click', () => { contenders = shuffle(foods); champion = contenders.shift(); round = 1; resetRescue(); show(arena); renderArena(); });
$('#clear-history-btn').addEventListener('click', () => { try { localStorage.removeItem('night-market-history'); } catch { /* Ignore unavailable storage. */ } renderHistory(); });
input.addEventListener('input', () => { setupError.textContent = ''; });
renderHistory();
