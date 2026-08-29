(() => {
  'use strict';

  const form = document.querySelector('[data-email-form]');
  const status = document.querySelector('[data-form-status]');

  if (!form || !status) return;

  const showStatus = (message) => {
    status.textContent = message;
    status.classList.add('is-visible');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (String(data.get('website') || '').trim()) {
      form.reset();
      showStatus('入力内容を確認しました。');
      return;
    }

    const name = String(data.get('name') || '').trim();
    const company = String(data.get('company') || '').trim();
    const email = String(data.get('email') || '').trim();
    const category = String(data.get('category') || '').trim();
    const url = String(data.get('url') || '').trim();
    const message = String(data.get('message') || '').trim();

    const subject = `【リダイフ無料診断】${company || name}さま`;
    const body = [
      'リダイフ 無料診断のお申し込み',
      '',
      `お名前：${name}`,
      `店名・会社名：${company || '未入力'}`,
      `メールアドレス：${email}`,
      `相談したいこと：${category}`,
      `ホームページ・GoogleマップのURL：${url || '未入力'}`,
      '',
      '困っていること・相談内容：',
      message
    ].join('\n');

    showStatus('メールアプリを開いています。内容を確認して送信してください。');
    window.location.href = `mailto:redaif.contact@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
