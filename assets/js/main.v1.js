(function(){
  'use strict';
  var drawer = document.getElementById('drawer'),
      openBtn = document.getElementById('burger'),
      closeBtn = document.getElementById('drawerClose'),
      lastFocus = null;
  function openD(){
    lastFocus = document.activeElement;
    drawer.setAttribute('data-open','true');
    document.body.classList.add('lock');
    if(openBtn) openBtn.setAttribute('aria-expanded','true');
    var f = drawer.querySelector('a,button');
    if(f) f.focus();
  }
  function closeD(){
    drawer.setAttribute('data-open','false');
    document.body.classList.remove('lock');
    if(openBtn) openBtn.setAttribute('aria-expanded','false');
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if(openBtn) openBtn.addEventListener('click', openD);
  if(closeBtn) closeBtn.addEventListener('click', closeD);
  drawer.addEventListener('click', function(e){
    if(e.target === drawer) closeD();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') closeD();
    if(e.key === 'Tab' && drawer.getAttribute('data-open') === 'true'){
      var f = drawer.querySelectorAll('a,button');
      if(!f.length) return;
      var first = f[0], last = f[f.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  document.querySelectorAll('.faq__q').forEach(function(q){
    q.addEventListener('click', function(){
      var item = q.parentElement,
          open = item.classList.contains('is-open');
      item.classList.toggle('is-open', !open);
      q.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  var SYM = {
    cel: {t:'Горит Check Engine', s:['Двигатель (ME 2.8 / CDI)','Пропуски зажигания','Топливная коррекция'],
      steps:['Читаю сохранённые и текущие коды по двигателю','Смотрю стоп-кадр: обороты, нагрузка, температура в момент ошибки','Сбрасываю коды и проверяю, вернулись ли они сразу','Объясняю, что означает код и что смотреть дальше'],
      n:'Важно: если ошибка возвращается сразу после сброса, причина не устранена. Сброс не лечит, он показывает, что осталось.'},
    box: {t:'Коробка в аварийном режиме', s:['АКПП 722.6 / 722.9','Блок управления КПП','Датчики частоты вращения'],
      steps:['Читаю коды по блоку КПП и по двигателю','Проверяю, не связана ли ошибка с датчиками ABS/ESP','Смотрю адаптации и температуру масла, если блок отдаёт параметры','Уточняю, что нужно проверить по механике'],
      n:'Аварийный режим часто включает ESP или датчик вращения колеса, а не саму коробку. Читаю обе группы.'},
    sbc: {t:'Ошибка SBC / тормозной системы', s:['Блок SBC (до рестайлинга)','ABS / ESP','Датчики давления'],
      steps:['Читаю коды SBC и ABS/ESP отдельно','Смотрю счётчики и параметры блока, что он отдаёт','Объясняю, какие коды критические, а какие информационные','Даю понятный вывод: ездить можно или нет'],
      n:'По тормозам не даю «на всякий случай сброшу»: сначала читаю и объясняю, что показывает блок.'},
    air: {t:'Airmatic: машина легла', s:['Пневмоподвеска','Датчики уровня','Компрессор'],
      steps:['Читаю коды по Airmatic','Смотрю показания датчиков уровня по колёсам','Сбрасываю и проверяю, повторяется ли','Подсказываю, что проверять: пневмостойки, клапаны, компрессор'],
      n:'Ошибка уровня часто остаётся после сброса, если есть утечка. Код укажет, какое колесо и какой датчик.'},
    start: {t:'Не заводится', s:['EIS / иммобилайзер','Топливная система','Стартер и питание'],
      steps:['Проверяю, видит ли иммобилайзер ключ','Читаю коды по двигателю и по EIS','Смотрю давление топлива и обороты прокрутки в параметрах','Отделяю электрику от механики'],
      n:'Если двигатель крутит, но не схватывает, чаще всего есть коды по синхронизации или топливу.'},
    troit: {t:'Троит, дёргается', s:['Зажигание','Форсунки','Подсос воздуха'],
      steps:['Читаю пропуски по цилиндрам','Смотрю коррекции по топливу','Сбрасываю и проверяю, на каких режимах возвращается','Объясняю порядок проверки: свечи, катушки, форсунки, подсос'],
      n:'Пропуски по конкретному цилиндру сильно сужают поиск, это видно в параметрах.'},
    esp: {t:'ESP / ABS', s:['ABS / ESP','Датчики вращения колёс','Блок управления'],
      steps:['Читаю коды ABS/ESP','Смотрю показания скорости каждого колеса','Проверяю, совпадает ли код с датчиком','Сбрасываю и проверяю повтор'],
      n:'Разница скоростей колёс в параметрах видна до появления кода, иногда это и есть ответ.'},
    sam: {t:'Свет, стеклоочистители, комфорт', s:['Передний SAM','Задний SAM','Кодирование блоков'],
      steps:['Читаю коды по обоим SAM','Смотрю, что блок видит по входам и выходам','Сбрасываю коды и проверяю реакцию','Объясняю, что менять: блок, проводку или исполнитель'],
      n:'По W211 часть отказов по свету идёт от окисления разъёмов, код укажет конкретную цепь.'}
  };
  var list = document.getElementById('symList'), out = document.getElementById('symOut');
  function paint(k){
    var d = SYM[k];
    if(!d || !out) return;
    out.innerHTML = '<h3>' + d.t + '</h3>' +
      '<ul>' + d.steps.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<div class="chips">' + d.s.map(function(x){ return '<span class="chip">' + x + '</span>'; }).join('') + '</div>' +
      '<p class="hint">' + d.n + '</p>';
  }
  if(list){
    list.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(){
        list.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
        b.setAttribute('aria-pressed','true');
        paint(b.getAttribute('data-k'));
      });
    });
    paint('cel');
  }

  var form = document.getElementById('form'), out2 = document.getElementById('formout');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var g = function(n){ var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      if(g('name').length < 2 || g('tel').length < 6){
        if(out2){ out2.textContent = 'Заполните имя и телефон, иначе не смогу ответить.'; out2.style.color = '#A33B2C'; }
        return;
      }
      var msg = 'Заявка с сайта Диагностика W211: ' + g('name') + ' · ' + g('tel') + ' · авто: ' + g('car') + ' · симптом: ' + g('task');
      if(out2){ out2.textContent = 'Открываю WhatsApp с готовым сообщением.'; out2.style.color = ''; }
      window.open('https://wa.me/375290000000?text=' + encodeURIComponent(msg), '_blank');
    });
  }
})();
