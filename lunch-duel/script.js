const $ = selector => document.querySelector(selector);
const setup = $('#setup'), arena = $('#arena'), result = $('#result'), input = $('#food-input'), setupError = $('#setup-error');
const optionA = $('#option-a'), optionB = $('#option-b');
let foods = [], contenders = [], champion = '', round = 0, rescueUsed = false;
const profile = { hunger: '正常吃', time: '半小时', mood: '想吃辣' };
const calls = ['第一盏灯亮了，摊主在叫号。', '闻到香味了，但只留一个。', '不要分析配料，信第一口的直觉。', '这一轮之后，队伍会更短。', '最后一位挑战者，请上桌。'];
const chapters = ['第一盏灯', '拐角香气', '人群中央', '摊位尽头', '最后叫号'];
const recommendationBank = {
  low: {
    spicy: [['重庆小面', '花椒和热汤，适合快速醒胃'], ['麻辣烫', '按自己胃口拿菜，热乎不等人'], ['香辣鸡腿饭', '预算友好，但有满足感']],
    light: [['鸡丝凉面', '清爽有味，不会太撑'], ['蔬菜卷饼', '边走边吃的轻量选择'], ['番茄鸡蛋盖饭', '简单、温和、稳妥']],
    comfort: [['牛肉粉', '一碗顶住下午的饥饿'], ['卤肉饭', '熟悉味道，少想一点'], ['煎饼果子', '十分钟内解决的踏实']]
  },
  mid: {
    spicy: [['烤肉拌饭', '焦香和辣酱，适合饿狠了'], ['泰式炒河粉', '酸辣甜一起上场'], ['川味冒菜', '多种食材的热闹选择']],
    light: [['越南河粉', '香草和热汤，清爽但不寡淡'], ['日式荞麦面', '给胃留一点余地'], ['三文鱼波奇饭', '冷食、谷物和蔬菜的组合']],
    comfort: [['海南鸡饭', '不冒险，也不会失望'], ['日式咖喱饭', '浓稠温暖，适合慢慢吃'], ['牛肉汉堡', '最直接的快乐热量']]
  },
  high: {
    spicy: [['水煮牛肉', '今天的味觉主角'], ['韩式部队锅', '一锅解决热闹和饥饿'], ['炭火烤肉', '给晚饭一点仪式感']],
    light: [['寿司拼盘', '每一口都不一样'], ['地中海沙拉碗', '明亮、清爽、份量刚好'], ['菌菇鸡汤面', '干净但有香气']],
    comfort: [['潮汕牛肉火锅', '慢慢吃才值得'], ['石锅拌饭', '锅巴是额外奖励'], ['意式肉酱面', '给今天一个可靠句号']]
  }
};
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
  setupError.textContent = ''; contenders = shuffle(foods); champion = contenders.shift(); round = 1; rescueUsed = false; $('#rescue-btn').disabled = false; $('#rescue-btn').textContent = '犹豫救援：抛一次硬币'; show(arena); renderArena();
}
function choose(winner) { champion = winner; contenders.shift(); round += 1; if (!contenders.length) { finishGame(); return; } renderArena(); }
function finishGame() {
  $('#result-title').textContent = champion;
  $('#receipt-date').textContent = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date()).replace('/', '.');
  $('#profile-summary').textContent = profile.hunger + ' / ' + profile.time + ' / ' + profile.mood;
  $('#defeat-count').textContent = (foods.length - 1) + ' 位摊位对手';
  const fortunes = ['不是随机，是你亲手把它留到了最后。', '这张小票不保证最好吃，但保证是你现在最想吃的。', '胃口已经表态，别再把决定丢回群聊。'];
  $('#fortune').textContent = fortunes[(foods.length + champion.length) % fortunes.length];
  saveHistory(); renderHistory(); show(result);
}
function getHistory() {
  try { return JSON.parse(localStorage.getItem('night-market-history') || '[]'); } catch { return []; }
}
function saveHistory() {
  const entry = { food: champion, profile: profile.hunger + ' / ' + profile.time + ' / ' + profile.mood, date: new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date()), defeats: foods.length - 1 };
  try { localStorage.setItem('night-market-history', JSON.stringify([entry, ...getHistory()].slice(0, 5))); } catch { /* local storage can be unavailable */ }
}
function renderHistory() {
  const history = getHistory(); const list = $('#history-list'); list.innerHTML = '';
  if (!history.length) { list.innerHTML = '<li class="history-empty">还没有锁单记录。完成这一局后，它会留在这台设备上。</li>'; return; }
  history.forEach((entry, index) => { const item = document.createElement('li'); item.innerHTML = '<span>0' + (index + 1) + '</span><b>' + entry.food + '</b><small>' + entry.date + ' · ' + entry.defeats + ' 胜</small>'; list.appendChild(item); });
}
function generateRecommendations() {
  const choices = recommendationBank[$('#budget-select').value][$('#taste-select').value];
  $('#recommendations').innerHTML = choices.map(item => '<article class="rec-card"><b>' + item[0] + '</b><small>' + item[1] + '</small><button class="add-rec" type="button" data-food="' + item[0] + '">加入对决</button></article>').join('');
}
document.querySelectorAll('.choice-set').forEach(set => set.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  set.querySelectorAll('button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); profile[set.dataset.group] = button.dataset.value;
}));
$('#example-btn').addEventListener('click', () => { input.value = '泰式炒河粉、重庆小面、汉堡、沙拉碗、烤肉饭'; input.focus(); });
$('#intel-btn').addEventListener('click', () => { $('#intel-panel').classList.toggle('is-hidden'); $('#intel-btn').querySelector('span').textContent = $('#intel-panel').classList.contains('is-hidden') ? '＋' : '−'; });
$('#generate-btn').addEventListener('click', generateRecommendations);
$('#recommendations').addEventListener('click', event => { const button = event.target.closest('.add-rec'); if (!button) return; const current = parseFoods(input.value); if (current.includes(button.dataset.food)) { button.textContent = '已在名单中'; return; } if (current.length >= 8) { setupError.textContent = '候选项已经有 8 道，请先删掉一道再加入。'; return; } input.value = (input.value.trim() ? input.value.trim() + '、' : '') + button.dataset.food; button.textContent = '已加入 ✓'; input.focus(); });
$('#start-btn').addEventListener('click', startGame); optionA.addEventListener('click', () => choose(champion)); optionB.addEventListener('click', () => choose(contenders[0]));
$('#back-btn').addEventListener('click', () => show(setup)); $('#new-list-btn').addEventListener('click', () => show(setup));
$('#rescue-btn').addEventListener('click', () => { if (rescueUsed) return; rescueUsed = true; $('#rescue-btn').disabled = true; $('#rescue-btn').textContent = '硬币已抛过'; const winner = Math.random() < .5 ? champion : contenders[0]; $('#market-call').textContent = '硬币落地：今晚偏向「' + winner + '」。'; setTimeout(() => choose(winner), 650); });
$('#again-btn').addEventListener('click', () => { contenders = shuffle(foods); champion = contenders.shift(); round = 1; rescueUsed = false; $('#rescue-btn').disabled = false; $('#rescue-btn').textContent = '犹豫救援：抛一次硬币'; show(arena); renderArena(); });
$('#clear-history-btn').addEventListener('click', () => { try { localStorage.removeItem('night-market-history'); } catch { /* ignore unavailable storage */ } renderHistory(); });
input.addEventListener('input', () => { setupError.textContent = ''; });
renderHistory();
