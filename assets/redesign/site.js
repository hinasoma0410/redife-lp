(() => {
  'use strict';
  document.documentElement.classList.add('has-js');
  const menuButton = document.querySelector('[data-menu-open]');
  const menu = document.querySelector('[data-menu-dialog]');
  if (menuButton && menu && typeof menu.showModal === 'function') {
    const closeMenu = () => { menu.close(); menuButton.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; menuButton.focus(); };
    menuButton.addEventListener('click', () => { menu.showModal(); menuButton.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; });
    menu.querySelector('[data-menu-close]').addEventListener('click', closeMenu);
    menu.addEventListener('cancel', (event) => { event.preventDefault(); closeMenu(); });
    menu.addEventListener('click', (event) => { if (event.target === menu || event.target.closest('a')) closeMenu(); });
    window.matchMedia('(min-width: 701px)').addEventListener('change', (event) => { if (event.matches && menu.open) closeMenu(); });
  } else { document.documentElement.classList.remove('has-js'); }

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.2 });
    document.querySelectorAll('.motion-once').forEach((node) => observer.observe(node));
  }

  const form = document.querySelector('[data-email-form]');
  if (!form) return;
  form.noValidate = true;
  const status = document.querySelector('[data-form-status]');
  const summary = document.querySelector('[data-error-summary]');
  const errorList = summary.querySelector('ul');
  const fallbackText = document.querySelector('[data-fallback-text]');
  const categories = { map: 'Googleマップの整備', lp: 'LP・ホームページ制作', advisor: '毎月のデジタル顧問', app: '業務効率化・業務アプリ導入', follow: '追客整備', undecided: 'まだ決まっていない' };
  const chosen = categories[new URLSearchParams(window.location.search).get('service')];
  if (chosen && !form.elements.category.value) form.elements.category.value = chosen;
  const showStatus = (message) => { status.textContent = message; };
  const messages = { name: 'お名前を入力してください。', email: 'メールアドレスの形式をご確認ください。', category: '相談したいことを選んでください。', message: '相談内容を入力してください。', privacy: '送信への同意を確認してください。', url: 'URLはhttps://またはhttp://から入力してください。' };
  const validate = () => {
    errorList.replaceChildren();
    let firstInvalid = null;
    for (const name of ['name', 'email', 'category', 'url', 'message', 'privacy']) {
      const input = form.elements[name];
      const error = document.getElementById(input.id + '-error');
      let valid = input.checkValidity();
      if (input.required && input.type !== 'checkbox' && !input.value.trim()) valid = false;
      if (name === 'url' && input.value.trim() && !/^https?:\/\//i.test(input.value.trim())) valid = false;
      error.textContent = valid ? '' : messages[name];
      if (valid) input.removeAttribute('aria-invalid'); else {
        input.setAttribute('aria-invalid', 'true');
        firstInvalid ||= input;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + input.id;
        link.textContent = messages[name];
        link.addEventListener('click', () => input.focus());
        item.append(link); errorList.append(item);
      }
    }
    summary.hidden = !firstInvalid;
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  };
  const compose = () => {
    const values = new FormData(form);
    const value = (key) => String(values.get(key) || '').trim();
    const subject = '【リダイフ無料診断】' + (value('company') || value('name')) + 'さま';
    const body = ['リダイフ 無料診断のお申し込み', '', 'お名前：' + value('name'), '店名・会社名：' + (value('company') || '未入力'), 'メールアドレス：' + value('email'), '相談したいこと：' + value('category'), 'ホームページ・GoogleマップのURL：' + (value('url') || '未入力'), '', '困っていること・相談内容：', value('message')].join('\n');
    return { subject, body };
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (form.elements.website.value.trim()) return;
    if (!validate()) { showStatus('入力内容をご確認ください。まだ送信されていません。'); return; }
    const { subject, body } = compose();
    showStatus('メールアプリで内容を確認し、送信してください。この画面では送信完了を確認できません。入力内容はそのまま残しています。');
    const destination = 'mailto:redaif.contact@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = destination;
  });
  document.querySelector('[data-copy-message]').addEventListener('click', async () => {
    if (!validate()) { showStatus('コピーする前に、入力内容と送信への同意をご確認ください。'); return; }
    const { subject, body } = compose();
    const text = '件名：' + subject + '\n\n' + body;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      showStatus('コピーしました。ご利用のメールに貼り付け、宛先をredaif.contact@gmail.comにして送信してください。');
      fallbackText.hidden = true;
    } catch {
      fallbackText.hidden = false;
      fallbackText.querySelector('textarea').value = text;
      fallbackText.querySelector('textarea').focus();
      fallbackText.querySelector('textarea').select();
      showStatus('自動コピーができませんでした。下の本文を選択してコピーし、メールに貼り付けてください。');
    }
  });
})();
