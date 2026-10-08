const videoDialog = document.getElementById('video-dialog');
const videoPlayer = document.getElementById('video-player');
const videoTitle = document.getElementById('video-title');

document.querySelectorAll('.video-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    videoTitle.textContent = button.dataset.title || '作品演示';
    videoPlayer.poster = button.dataset.poster || '';
    videoPlayer.src = button.dataset.video;
    videoDialog.showModal();
    videoPlayer.play().catch(() => {});
  });
});
document.getElementById('video-close').addEventListener('click', () => videoDialog.close());
videoDialog.addEventListener('click', (event) => {
  if (event.target === videoDialog) videoDialog.close();
});
videoDialog.addEventListener('close', () => {
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
});

const imageDialog = document.getElementById('image-dialog');
const imageViewer = document.getElementById('image-viewer');
document.querySelectorAll('.image-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    imageViewer.src = button.dataset.image;
    imageViewer.alt = button.querySelector('img').alt;
    document.getElementById('image-title').textContent = button.dataset.title;
    imageDialog.showModal();
  });
});
document.getElementById('image-close').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', (event) => {
  if (event.target === imageDialog) imageDialog.close();
});
imageDialog.addEventListener('close', () => imageViewer.removeAttribute('src'));

const questState = { about: false, clues: false, cards: false };
const questSummary = document.getElementById('quest-summary');
const questToast = document.getElementById('quest-toast');
let toastTimer;
function completeQuest(stage) {
  if (questState[stage]) return;
  questState[stage] = true;
  const step = document.querySelector(`.quest-step[data-quest="${stage}"]`);
  step.classList.add('is-complete');
  step.querySelector('i').textContent = '✓';
  const count = Object.values(questState).filter(Boolean).length;
  questSummary.textContent = `${count} / 3 章已解锁`;
  document.getElementById('quest-hud-count').textContent = `${count} / 3`;
  questToast.textContent = count === 3 ? '档案已解锁 · 前往结语查看' : `章节解锁 · ${step.querySelector('b').textContent}`;
  questToast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => questToast.classList.remove('is-visible'), 3500);
  if (count === 3) {
    const clearance = document.getElementById('clearance');
    clearance.classList.add('is-cleared');
    document.getElementById('clearance-seal').innerHTML = '档案<br>结案';
    document.getElementById('clearance-label').textContent = 'CHAPTER CLEAR / 03';
    document.getElementById('clearance-copy').textContent = '你已认识创作者、找出克莱尔的线索，也在另一段故事中作出了选择。我的工作正是让这样的发现与抉择，成为玩家真正经历的故事。期待与你一起写下下一章。';
  }
}
document.getElementById('start-investigation').addEventListener('click', () => {
  document.getElementById('quest').classList.add('is-started');
});
const aboutQuestObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    completeQuest('about');
    aboutQuestObserver.disconnect();
  }
}, { threshold: .15 });
aboutQuestObserver.observe(document.getElementById('about'));

const clueDetails = {
  passport: { title: '护照 · 留在家中', note: '亚瑟没有带走护照。克莱尔据此判断，他出发时并没有准备一段漫长的远行。' },
  glasses: { title: '阅读眼镜 · 留在家中', note: '亚瑟晚上读书离不开这副眼镜，却把它忘在了桌上。生活习惯比猜测更接近他的计划。' },
  dentist: { title: '复诊卡 · 预约未取消', note: '牙医复诊仍排在日程里。如果他早就决定长期失联，为什么保留这次普通的预约？' },
};
const foundClues = new Set();
const clueCount = document.getElementById('clue-count');
const clueLabel = document.getElementById('clue-label');
const clueNote = document.getElementById('clue-note');
const clueProgress = document.getElementById('clue-progress');
const clueConclusion = document.getElementById('clue-conclusion');
const claireLine = document.getElementById('claire-line');
const dialogueNext = document.getElementById('dialogue-next');
const clueDialogue = {
  passport: '“护照还在。他并没有准备远行。”',
  glasses: '“这副眼镜，他每晚看书都会用到。”',
  dentist: '“连复诊都没有取消。他原本打算回来。”',
};

document.querySelectorAll('.evidence-card').forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.dataset.clue;
    foundClues.add(key);
    card.setAttribute('aria-pressed', 'true');
    card.querySelector('small').textContent = '已检视';
    clueLabel.textContent = clueDetails[key].title;
    clueNote.textContent = clueDetails[key].note;
    clueCount.textContent = `${foundClues.size} / 3 已检视`;
    clueProgress.style.width = `${foundClues.size / 3 * 100}%`;
    clueConclusion.hidden = foundClues.size < 3;
    claireLine.textContent = foundClues.size === 3
      ? '“我不能证明自己知道丈夫每一个没有说出口的念头。但我知道他准备离开三天，还是准备离开一段婚姻。”'
      : clueDialogue[key];
    dialogueNext.textContent = foundClues.size === 3 ? '推论完成 · 第三十天的真相正在浮现 ◆' : '继续调查，寻找下一份证据 ◆';
    claireLine.classList.remove('dialogue-enter');
    void claireLine.offsetWidth;
    claireLine.classList.add('dialogue-enter');
    if (foundClues.size === 3) completeQuest('clues');
    clueNote.classList.remove('note-enter');
    void clueNote.offsetWidth;
    clueNote.classList.add('note-enter');
  });
});

document.getElementById('clue-reset').addEventListener('click', () => {
  foundClues.clear();
  document.querySelectorAll('.evidence-card').forEach((card) => {
    card.setAttribute('aria-pressed', 'false');
    card.querySelector('small').textContent = '点击检视';
  });
  clueLabel.textContent = '调查档案 · 第三十天';
  clueNote.textContent = '选择一件留在家中的物品。每个普通的生活细节，都可能推翻“他主动离开”的解释。';
  clueCount.textContent = '0 / 3 已检视';
  clueProgress.style.width = '0%';
  clueConclusion.hidden = true;
  claireLine.textContent = '“亚瑟，你到底留下了什么？”';
  dialogueNext.textContent = '点击线索，听见她的推断 ◆';
});

const selection = { person: '阿禾', method: '藏粮消息', identity: '无名流民' };
const combinations = window.SAINT_COMBINATIONS || [];
const resultLevel = document.getElementById('result-level');
const resultText = document.getElementById('result-text');
const resultId = document.getElementById('result-id');
const effectChips = document.getElementById('effect-chips');

function showCombination() {
  const chosen = combinations.find((item) => item.person === selection.person && item.method === selection.method && item.identity === selection.identity);
  if (!chosen) return;
  resultLevel.textContent = `${chosen.level} · ${chosen.feedback}`;
  resultText.textContent = chosen.result;
  resultId.textContent = chosen.id;
  effectChips.replaceChildren();
  const effects = Object.entries(chosen.effects || {}).filter(([, amount]) => amount !== 0);
  if (!effects.length) {
    const chip = document.createElement('span');
    chip.textContent = '本次无变量变化';
    effectChips.append(chip);
  } else {
    effects.forEach(([name, amount]) => {
      const chip = document.createElement('span');
      chip.textContent = `${name} ${amount > 0 ? '+' : ''}${amount}`;
      effectChips.append(chip);
    });
  }
}

document.querySelectorAll('.card-column').forEach((column) => {
  column.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    column.querySelectorAll('button[data-value]').forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
    selection[column.dataset.field] = button.dataset.value;
    showCombination();
    completeQuest('cards');
  });
});

document.getElementById('draw-combination').addEventListener('click', () => {
  if (!combinations.length) return;
  const current = combinations.find((item) => item.person === selection.person && item.method === selection.method && item.identity === selection.identity);
  const options = combinations.filter((item) => item.id !== current?.id);
  const chosen = options[Math.floor(Math.random() * options.length)];
  for (const field of ['person', 'method', 'identity']) {
    selection[field] = chosen[field];
    const column = document.querySelector(`.card-column[data-field="${field}"]`);
    column.querySelectorAll('button[data-value]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.value === chosen[field])));
  }
  showCombination();
  completeQuest('cards');
  if (window.matchMedia('(max-width: 760px)').matches) {
    document.querySelector('.lab-result').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

if (combinations.length) showCombination();
else {
  resultLevel.textContent = '规则表暂时无法加载';
  resultText.textContent = '请下载下方的完整规则表查看。';
  resultId.textContent = '';
}

const pageProgress = document.getElementById('page-progress');
let progressTicking = false;
function updatePageProgress() {
  const remaining = document.documentElement.scrollHeight - window.innerHeight;
  pageProgress.style.width = `${remaining > 0 ? Math.min(100, window.scrollY / remaining * 100) : 0}%`;
  if (window.scrollY < document.getElementById('about').offsetTop - window.innerHeight * .55) {
    document.querySelectorAll('.nav a, .mobile-dock a').forEach((link) => link.removeAttribute('aria-current'));
  }
  progressTicking = false;
}
window.addEventListener('scroll', () => {
  if (!progressTicking) {
    requestAnimationFrame(updatePageProgress);
    progressTicking = true;
  }
}, { passive: true });
updatePageProgress();

const sectionLinks = document.querySelectorAll('.nav a, .mobile-dock a');
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  sectionLinks.forEach((link) => {
    if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-20% 0px -55% 0px', threshold: [0, .25, .5] });
['about', 'projects', 'practice', 'more'].forEach((id) => sectionObserver.observe(document.getElementById(id)));
