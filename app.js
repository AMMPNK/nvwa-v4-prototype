/* =============================================
   女娲官网 v4 — 全局交互逻辑
   app.js
   ============================================= */

// ===== 状态管理 =====
const STATE = {
  isLoggedIn: false,
  versionChosen: false,  // 是否已选版本
  userVersion: null,     // 'self' | 'pro'
  spending: 0,           // 近7日日均消耗（模拟）
  username: '广告主',
  unreadCount: 3
};

// 从 sessionStorage 恢复状态
function loadState() {
  const saved = sessionStorage.getItem('nvwaState');
  if (saved) Object.assign(STATE, JSON.parse(saved));
}

function saveState() {
  sessionStorage.setItem('nvwaState', JSON.stringify(STATE));
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateNavUI();
  initNavbarScroll();
  initBenefitsSlider();
  initCapHover();
  checkPageSpecific();
  updateQuickLaunchCTA(); // 极速开播 CTA 登录态显示
  updateSolutionUI(); // 解决方案卡片和CTA状态
});

// ===== 导航栏滚动效果 =====
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ===== 登录态 UI 切换 =====
function updateNavUI() {
  const out = document.getElementById('navLoggedOut');
  const loggedIn = document.getElementById('navLoggedIn');
  if (!out || !loggedIn) return;

  if (STATE.isLoggedIn) {
    out.style.display = 'none';
    loggedIn.style.display = 'flex';
    const badge = document.getElementById('navBadge');
    if (badge) {
      badge.textContent = STATE.unreadCount > 99 ? '99+' : STATE.unreadCount;
      badge.style.display = STATE.unreadCount > 0 ? 'flex' : 'none';
    }
  } else {
    out.style.display = 'block';
    loggedIn.style.display = 'none';
  }
}

// ===== 极速开播 CTA 登录态显示 =====
function updateQuickLaunchCTA() {
  const cta = document.getElementById('quickLaunchCTA');
  if (!cta) return;
  cta.style.display = STATE.isLoggedIn ? 'block' : 'none';
}

// ===== 极速开播 CTA 点击逻辑 =====
function handleQuickLaunchCTA() {
  if (!STATE.isLoggedIn) {
    goLogin();
    return;
  }
  // 登录态下跳转极速开播主页（模拟）
  window.location.href = 'console.html';
}

// ===== 跳转登录 =====
function goLogin() {
  saveState();
  window.location.href = 'login-entry.html';
}

// ===== 退出登录 =====
function logout() {
  STATE.isLoggedIn = false;
  STATE.versionChosen = false;
  STATE.userVersion = null;
  STATE.spending = 0;
  saveState();
  updateNavUI();
  window.location.href = 'index.html';
}

// ===== Hero CTA 逻辑 =====
function handleHeroCTA() {
  if (!STATE.isLoggedIn) {
    sessionStorage.setItem('loginRedirect', 'heroFlow');
    goLogin();
    return;
  }
  if (STATE.versionChosen) {
    window.location.href = 'console.html';
  } else {
    showFlowModal();
  }
}

// ===== 开播工具导航逻辑 =====
function handleToolNav(e, toolName) {
  e.preventDefault();
  if (!STATE.isLoggedIn) {
    sessionStorage.setItem('loginRedirect', 'toolNav');
    sessionStorage.setItem('loginRedirectTool', toolName);
    goLogin();
    return;
  }
  if (STATE.versionChosen) {
    window.location.href = 'console.html';
  } else {
    showFlowModal();
  }
}

// ===== 登录成功后的回调 =====
// 由 login.html 调用
function onLoginSuccess(spending) {
  STATE.isLoggedIn = true;
  STATE.spending = spending;
  STATE.versionChosen = false;
  STATE.userVersion = null;
  saveState();
}

// ===== 分流弹窗 =====
function showFlowModal() {
  const modal = document.getElementById('flowModal');
  if (!modal) return;

  const isHighSpend = STATE.spending >= 300;
  renderFlowCards(isHighSpend);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFlowModal() {
  const modal = document.getElementById('flowModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  // 关闭后回到首页
  if (!STATE.versionChosen) {
    window.location.href = 'index.html';
  }
}

function renderFlowCards(isHighSpend) {
  const container = document.getElementById('flowCards');
  const note = document.getElementById('flowNote');
  if (!container) return;

  if (isHighSpend) {
    // 高级版高亮
    container.innerHTML = `
      <div class="flow-card dimmed">
        <div class="flow-card-title">自助版 · 即买即用</div>
        <div class="flow-card-sub">低门槛快速体验</div>
        <div class="flow-card-price">599元/周起</div>
        <div class="flow-benefits">低门槛快速体验数字人直播<br/>更适合中小品类商家、个人卖家</div>
      </div>
      <div class="flow-card highlighted">
        <div class="flow-rec-badge">⭐ 系统推荐</div>
        <div class="flow-card-title">高级版 · 专属定制</div>
        <div class="flow-card-sub">日耗 ≥ 300 元 · 品牌商家首选</div>
        <div class="flow-benefits">
          ✓ 定制/复刻专属数字人<br/>
          ✓ 高清直播间（4K）<br/>
          ✓ 深度诊断分析 + 1pp 流量扶持<br/>
          ✓ 矩阵多线路开播
        </div>
        <button class="flow-btn" onclick="selectVersion('pro')">进入控制台</button>
      </div>`;
    if (note) note.textContent = '您的日均消耗已达到高级版标准，享受更多专属权益';
  } else {
    // 自助版高亮
    container.innerHTML = `
      <div class="flow-card highlighted">
        <div class="flow-rec-badge">⭐ 系统推荐</div>
        <div class="flow-card-title">自助版 · 即买即用</div>
        <div class="flow-card-sub">低门槛快速体验</div>
        <div class="flow-card-price">599元/周起</div>
        <div class="flow-benefits">
          ✓ 极速开播，5分钟上岗<br/>
          ✓ AI 智能脚本生成<br/>
          ✓ 7×24h 不间断连播
        </div>
        <button class="flow-btn" onclick="selectVersion('self')">立即充值开播</button>
      </div>
      <div class="flow-card dimmed">
        <div class="flow-card-title">高级版 · 专属定制</div>
        <div class="flow-card-sub">日耗 &gt; 300元 · 品牌商家</div>
        <div class="flow-benefits">
          日耗&gt;300元；关注定制需求、矩阵运营、进阶权益<br/>
          更适合品牌商家、KA用户
        </div>
        <button class="flow-btn flow-btn-ghost" style="pointer-events:none;opacity:.5">进入控制台</button>
        <div style="text-align:center;margin-top:10px;font-size:12px;">
          <a href="solution.html" style="color:var(--primary);" onclick="document.getElementById('flowModal').style.display='none'">了解高级版权益 →</a>
        </div>
      </div>`;
    if (note) note.textContent = '累计消耗满 2,000 元可升级高级版';
  }
}

function selectVersion(version) {
  STATE.versionChosen = true;
  STATE.userVersion = version;
  saveState();
  document.getElementById('flowModal').style.display = 'none';
  document.body.style.overflow = '';
  
  // 根据版本跳转不同页面
  if (version === 'self') {
    window.location.href = 'cashier.html';
  } else {
    window.location.href = 'console.html';
  }
}

// 点击蒙层关闭弹窗
document.addEventListener('click', (e) => {
  const modal = document.getElementById('flowModal');
  if (modal && e.target === modal) closeFlowModal();
});

// ===== 利益点 Slider =====
let currentBenefit = 0;
const benefitCount = 3;

function initBenefitsSlider() {
  // Auto-play
  setInterval(() => {
    if (!document.hidden) nextBenefit();
  }, 5000);
}

function switchBenefit(idx) {
  const slides = document.querySelectorAll('.benefit-slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  slides[currentBenefit]?.classList.remove('active');
  dots[currentBenefit]?.classList.remove('active');
  currentBenefit = idx;
  slides[currentBenefit]?.classList.add('active');
  dots[currentBenefit]?.classList.add('active');
}

function nextBenefit() {
  switchBenefit((currentBenefit + 1) % benefitCount);
}

function prevBenefit() {
  switchBenefit((currentBenefit - 1 + benefitCount) % benefitCount);
}

// ===== AI 能力悬停浮窗（fixed 定位，完全脱离父级 stacking context） =====
function initCapHover() {
  const POPUP_W = 300;
  const POPUP_MARGIN = 8;

  document.querySelectorAll('.cap-item').forEach(item => {
    item.addEventListener('mouseenter', function() { positionPopup(this); });
    item.addEventListener('mousemove',  function() { positionPopup(this); });
  });

  function positionPopup(item) {
    const popup = item.querySelector('.cap-popup');
    if (!popup) return;

    const rect = item.getBoundingClientRect();
    const vpW  = window.innerWidth;

    // 弹窗实际高度（已渲染时读取，否则用估算值）
    const popupH = popup.offsetHeight || 260;

    // 水平：居中于卡片，超边界时贴边
    let left = rect.left + rect.width / 2 - POPUP_W / 2;
    left = Math.max(12, Math.min(left, vpW - POPUP_W - 12));

    // 垂直：优先显示在卡片上方；上方不足时翻转到下方
    let top = rect.top - popupH - POPUP_MARGIN;
    if (top < 70) {
      top = rect.bottom + POPUP_MARGIN;
    }

    popup.style.left      = left + 'px';
    popup.style.top       = top  + 'px';
    popup.style.right     = 'auto';
    popup.style.bottom    = 'auto';
    popup.style.transform = 'none';
  }
}

// ===== FAQ 手风琴 =====
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');

  // 先关闭所有
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

  if (!isOpen) item.classList.add('open');
}

// ===== 页面特定初始化 =====
function checkPageSpecific() {
  const path = window.location.pathname;

  // 检查登录回调参数
  const params = new URLSearchParams(window.location.search);
  if (params.get('loginDone') === '1') {
    const spending = parseInt(params.get('spending') || '0');
    onLoginSuccess(spending);
    updateNavUI();
    // 清理 URL
    history.replaceState({}, '', window.location.pathname);
    // 显示分流弹窗
    setTimeout(() => showFlowModal(), 300);
  }
}

// ===== 解决方案页卡片和CTA状态更新 =====
function updateSolutionUI() {
  // 首页P6卡片
  const planSelf = document.getElementById('planSelf');
  const planPro = document.getElementById('planPro');
  const planSelfNote = document.getElementById('planSelfNote');
  const planProNote = document.getElementById('planProNote');
  
  // 独立页卡片
  const pccSelf = document.getElementById('planSelf') ? null : document.getElementById('planSelf');
  const pccPro = document.getElementById('planPro') ? null : document.getElementById('planPro');
  
  // CTA按钮
  const ctaBtn = document.getElementById('solutionCTABtn');
  
  if (!ctaBtn) return;
  
  // 清除所有状态类
  [planSelf, planPro].forEach(el => {
    if (el) el.classList.remove('recommended', 'current', 'disabled');
  });
  [planSelfNote, planProNote].forEach(el => {
    if (el) el.textContent = '';
  });
  
  if (!STATE.isLoggedIn) {
    // 未登录：卡片正常，CTA显示「登录查看资格」
    ctaBtn.textContent = '登录查看资格';
    ctaBtn.onclick = () => { window.location.href = 'login-entry.html'; };
    return;
  }
  
  const isHighSpend = STATE.spending >= 300;
  
  if (!STATE.versionChosen) {
    // 已登录未选版本
    if (isHighSpend) {
      // 高消耗：高级版高亮
      if (planSelf) {
        planSelf.classList.add('disabled');
        if (planSelfNote) planSelfNote.textContent = '您的消耗暂不满足此版本';
      }
      if (planPro) planPro.classList.add('recommended');
      ctaBtn.textContent = '进入高级版';
      ctaBtn.onclick = () => { window.location.href = 'console.html'; };
    } else {
      // 低消耗：自助版高亮
      if (planSelf) planSelf.classList.add('recommended');
      if (planPro) {
        planPro.classList.add('disabled');
        if (planProNote) planProNote.textContent = '您的消耗暂不满足此版本';
      }
      ctaBtn.textContent = '立即充值开播';
      ctaBtn.onclick = () => { window.location.href = 'cashier.html'; };
    }
  } else {
    // 已选版本
    const isSelf = STATE.userVersion === 'self';
    if (planSelf) {
      planSelf.classList.toggle('current', isSelf);
      planSelf.classList.toggle('disabled', !isSelf);
      if (!isSelf && planSelfNote) planSelfNote.textContent = '当前版本：高级版';
    }
    if (planPro) {
      planPro.classList.toggle('current', !isSelf);
      planPro.classList.toggle('disabled', isSelf);
      if (isSelf && planProNote) planProNote.textContent = '当前版本：自助版';
    }
    ctaBtn.textContent = '进入控制台';
    ctaBtn.onclick = () => { window.location.href = 'console.html'; };
  }
}

// ===== 解决方案CTA点击处理 =====
function handleSolutionCTA() {
  if (!STATE.isLoggedIn) {
    window.location.href = 'login-entry.html';
    return;
  }
  
  if (STATE.versionChosen) {
    window.location.href = 'console.html';
    return;
  }
  
  if (STATE.spending >= 300) {
    window.location.href = 'console.html';
  } else {
    window.location.href = 'cashier.html';
  }
}
