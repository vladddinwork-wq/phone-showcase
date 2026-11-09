(() => {
  const key = 'flagman-test-user-id';
  let current = '';
  let storageAvailable = true;
  try { current = localStorage.getItem(key) || ''; } catch (_) { storageAvailable = false; }
  const apply = value => {
    current = value;
    (window._tmr || (window._tmr = [])).push(value ? {type: 'setUserID', userid: value} : {type: 'deleteUserID'});
  };
  // Execute synchronously before the counter queues pageView and product goals.
  apply(current);
  const bind = () => {
    const form = document.getElementById('test-user-form');
    const input = document.getElementById('test-user-input');
    const output = document.getElementById('test-user-current');
    const message = document.getElementById('test-user-message');
    if (!form || !input || !output || !message) return;
    const render = () => {
      input.value = current;
      output.textContent = current || 'не задан';
    };
    const save = value => {
      try {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
        storageAvailable = true;
      } catch (_) { storageAvailable = false; }
      apply(value);
      render();
      message.textContent = (value ? 'UserID установлен.' : 'UserID сброшен.') + (storageAvailable ? ' Значение сохранено в этом браузере.' : ' Хранилище браузера недоступно: значение действует только на этой странице.') + ' Следующие действия будут отправлены с новым значением. Для повторного просмотра обновите страницу.';
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) { message.textContent = 'Введите UserID, например test-user-1, или нажмите «Сбросить».'; return; }
      save(value);
    });
    document.getElementById('test-user-reset').addEventListener('click', () => save(''));
    window.addEventListener('storage', event => {
      if (event.key === key || event.key === null) {
        apply(event.key === null ? '' : (event.newValue || ''));
        render();
        message.textContent = 'UserID обновлён в другой вкладке.';
      }
    });
    render();
    if (!storageAvailable) message.textContent = 'Хранилище браузера недоступно: UserID будет действовать только на этой странице.';
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once: true});
  else bind();
})();
