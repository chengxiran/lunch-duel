const $ = selector => document.querySelector(selector);
const setup = $('#setup'), arena = $('#arena'), result = $('#result'), input = $('#food-input'), setupError = $('#setup-error');
const optionA = $('#option-a'), optionB = $('#option-b');
let foods = [], contenders = [], champion = '', round = 0;
const profile = { hunger: '正常吃', time: '半小时', mood: '想吃辣' };
const calls = ['第一盏灯亮了，摊主在叫号。', '闻到香味了，但只留一个。', '不要分析配料，信第一口的直觉。', '这一轮之后，队伍会更短。', '最后一位挑战者，请上桌。'];
const chapters = ['第一盏灯', '拐角香气', '人群中央', '摊位尽头', '最后叫号'];
function parseFoods(value) { return [...new Set(value.split(/[，,、\n]+/).map(item => item.trim()).filter(Boolean))]; }
function shuffle(list) { return [...list].sort(() => Math.random() - .5); }
function show(screen) { [setup, arena, result].forEach(item => item.classList.add('is-hidden')); screen.classList.remove('is-hidden'); }
function noteFor(food) {
  const tags = profile.mood === '想吃辣' ? ['热气上头', '香味勾人', '今晚够劲'] : profile.mood === '来点新鲜' ? ['未知摊位', '值得试试', '换条路线'] : ['熟悉味道', '稳妥选择', '不必冒险'];
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
  $('#memory-line').textContent = '已淘汰 ' + (round - 1) + ' 位对手，' + (foods.length - round) + ' 位还在等。';
}
function startGame() {
  foods = parseFoods(input.value);
  if (foods.length < 2) { setupError.textContent = '至少写下两道不同的午餐，夜市才开得起来。'; input.focus(); return; }
  if (foods.length > 8) { setupError.textContent = '夜市太挤了：请留下最多 8 道候选。'; input.focus(); return; }
  setupError.textContent = ''; contenders = shuffle(foods); champion = contenders.shift(); round = 1; show(arena); renderArena();
}
function choose(winner) { champion = winner; contenders.shift(); round += 1; if (!contenders.length) { finishGame(); return; } renderArena(); }
function finishGame() {
  $('#result-title').textContent = champion;
  $('#receipt-date').textContent = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date()).replace('/', '.');
  $('#profile-summary').textContent = profile.hunger + ' / ' + profile.time + ' / ' + profile.mood;
  $('#defeat-count').textContent = (foods.length - 1) + ' 位摊位对手';
  const fortunes = ['不是随机，是你亲手把它留到了最后。', '这张小票不保证最好吃，但保证是你现在最想吃的。', '胃口已经表态，别再把决定丢回群聊。'];
  $('#fortune').textContent = fortunes[(foods.length + champion.length) % fortunes.length]; show(result);
}
document.querySelectorAll('.choice-set').forEach(set => set.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  set.querySelectorAll('button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); profile[set.dataset.group] = button.dataset.value;
}));
$('#example-btn').addEventListener('click', () => { input.value = '泰式炒河粉、重庆小面、汉堡、沙拉碗、烤肉饭'; input.focus(); });
$('#start-btn').addEventListener('click', startGame); optionA.addEventListener('click', () => choose(champion)); optionB.addEventListener('click', () => choose(contenders[0]));
$('#back-btn').addEventListener('click', () => show(setup)); $('#new-list-btn').addEventListener('click', () => show(setup));
$('#again-btn').addEventListener('click', () => { contenders = shuffle(foods); champion = contenders.shift(); round = 1; show(arena); renderArena(); });
input.addEventListener('input', () => { setupError.textContent = ''; });
