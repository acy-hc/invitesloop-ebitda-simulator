/* 병원정보 설정 > 병원 기초정보 섹션 — 매출 항목·재무 상수·환자 구분 계수·프리셋·가정
 * 한 페이지에 성과 설정 섹션과 함께 놓이므로 이름·이벤트·탭 주소(#basic-*)를 이 섹션(root) 안에 가둔다. */
function mountHospitalBasic(root) {
  const TABS = [
    { key: 'info', label: '기본정보·실적', icon: 'building-2', help: '병원 시스템에서 받는 정보입니다. 읽기만 할 수 있습니다.' },
    { key: 'items', label: '매출 항목', icon: 'list-tree', help: '병원 매출을 이루는 항목과 계산 방식을 정합니다.' },
    { key: 'profile', label: '재무 상수', icon: 'landmark', help: '인건비·세율·감가상각·WACC처럼 모든 시나리오가 함께 쓰는 값입니다.' },
    { key: 'params', label: '환자 구분 계수', icon: 'users', help: '환자 구분별 인원을 계산에 쓸 때 곱하는 비율입니다.' },
    { key: 'presets', label: '시나리오 프리셋', icon: 'sliders-horizontal', help: '시나리오를 만들 때 고르는 시작 값 묶음입니다.' },
    { key: 'assumptions', label: '가정', icon: 'file-check', help: '입력값의 근거와 적용 범위입니다.' },
  ];

  root.innerHTML = `
    <section class="card">
      <div class="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-1"><div class="text-xs text-muted-foreground">병원</div><div id="hospitalName" class="text-lg font-semibold"></div></div>
        <dl id="hospitalSummary" class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4"></dl>
      </div>
    </section>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2"><div class="overflow-x-auto"><div class="tabs-list" role="tablist" id="tabList"></div></div><p id="tabHelp" class="text-sm text-muted-foreground"></p></div>
      <div id="tabBody" class="space-y-6"></div>
    </div>`;

  const HOSPITALS = loadHospitals();
  const state = { hid: currentHospitalId(), tab: TABS.some(t => `#basic-${t.key}` === location.hash) ? location.hash.slice(7) : 'info', preset: null, profileDirty: false };
  const hosp = () => HOSPITALS.find(h => h.id === state.hid);
  const scenarioCount = key => loadScenarios(state.hid).filter(s => s.preset === key).length;

  const SOURCE = {
    ext: '<span class="badge badge-secondary"><i data-lucide="lock" class="size-3"></i>병원 시스템 제공 · 읽기 전용</span>',
    own: '<span class="badge badge-outline"><i data-lucide="pencil" class="size-3"></i>이 화면에서 관리</span>',
  };
  const card = (title, desc, body, right = '', help = '') => `<section class="card"><div class="card-header flex-row flex-wrap items-start justify-between gap-3"><div class="space-y-1.5"><h2 class="card-title flex items-center gap-1.5">${title}${tip(help)}</h2>${desc ? `<p class="card-desc">${desc}</p>` : ''}</div><div class="flex flex-wrap items-center gap-2">${right}</div></div><div class="card-content">${body}</div></section>`;

  /* 월별 실적 — 집계 기간의 달 수만큼 만든다 (예시값) */
  function monthly(v, seed) {
    const avg = v.count / v.months;
    return Array.from({ length: v.months }, (_, i) => Math.round(avg * (1 + 0.12 * Math.sin((i + seed) * 1.3) + 0.04 * Math.cos(i * 2.1))));
  }

  /* ---------- 상단 ---------- */
  function renderTop() {
    const h = hosp();
    root.querySelector('#hospitalName').textContent = h.name;
    const dd = (k, v, help = '') => `<div><dt class="flex items-center gap-1 text-xs text-muted-foreground">${k}${tip(help, k)}</dt><dd class="font-medium">${v}</dd></div>`;
    root.querySelector('#hospitalSummary').innerHTML =
      dd('병원 코드', h.code) + dd('통화', h.currency === h.report ? h.currency : `${h.currency} → ${h.report}`, '모든 화면(병원 EBITDA 시뮬레이터·병원경영 Dashboard·병원정보 설정)의 금액은 보고 통화로 입력하고 보여 줍니다. 병원 통화는 참고용입니다.') +
      dd('기준연도', h.baseYear, '실적이 속한 연도입니다. 시뮬레이션은 다음 해를 Y1로 5년을 계산합니다.') + dd('실적 수신', h.receivedAt, '병원 시스템에서 실적을 마지막으로 받은 날짜입니다.');
    root.querySelector('#tabList').innerHTML = TABS.map(t => `<button type="button" class="tabs-trigger" role="tab" data-tab="${t.key}" data-state="${t.key === state.tab ? 'active' : 'inactive'}"><i data-lucide="${t.icon}" class="size-4"></i>${t.label}</button>`).join('');
    root.querySelector('#tabHelp').textContent = TABS.find(t => t.key === state.tab).help;
  }

  /* ---------- 기본정보·실적 ---------- */
  function infoTab() {
    const h = hosp();
    const dl = (k, v, help = '') => `<div class="space-y-1"><dt class="flex items-center gap-1 text-xs text-muted-foreground">${k}${tip(help, k)}</dt><dd class="text-sm">${v}</dd></div>`;
    const basic = card('병원', '병원 시스템에서 받은 기본 정보입니다. 이 화면에서 수정할 수 없습니다.', `
      <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
        ${dl('병원명', esc(h.name))}${dl('병원 코드', h.code)}${dl('국가', h.country)}${dl('기준연도', `${h.baseYear} (시뮬레이션 Y1 = ${h.baseYear + 1})`)}
        ${dl('병원 통화', h.currency)}${dl('보고 통화', `${h.report}${h.fx ? ` <span class="text-xs text-muted-foreground">${h.fx}</span>` : ''}`)}
        ${dl('운영 거점', `<span class="flex flex-wrap items-center gap-1.5">${h.locations.map(l => `<span class="badge badge-outline">${l}</span>`).join('')}${h.locations.length > 1 ? '<span class="text-xs text-muted-foreground">한 병원으로 합산</span>' : ''}</span>`)}
            </dl>`, SOURCE.ext);

    const rows = h.volumes.map((v, i) => {
      const label = VOLUME_TYPES.find(t => t.key === v.key).label;
      return `<tr class="border-b last:border-0">
        <td class="td font-medium">${label}</td>
        <td class="td num">${F.int(v.count)}</td>
        <td class="td tabular-nums">${periodText(v)}</td>
        <td class="td num">${v.months}개월</td>
        <td class="td num">${v.months < 12 ? `<span class="inline-flex items-center gap-1.5"><span class="badge badge-warning">연환산</span>${F.int(annualized(v))}</span>` : F.int(v.count)}</td>
        <td class="td">${sparkBars(monthly(v, i + 1))}</td>
        <td class="td text-xs text-muted-foreground">${v.bySite ? h.sites.map(st => `${st.name} ${F.int(v.bySite[st.key])}`).join(' · ') : ''}${v.note ? `${v.bySite ? '<br>' : ''}${esc(v.note)}` : ''}</td>
      </tr>`;
    }).join('');
    const volumes = card('환자 실적', `${h.volumes.map(v => VOLUME_TYPES.find(t => t.key === v.key).label).join('·')}으로 나눠 받은 ${h.baseYear} 실적입니다. 집계 기간이 12개월보다 짧으면 연환산 인원을 시뮬레이터에 넘깁니다.`, `
      <div class="overflow-x-auto"><table class="w-full min-w-[640px] text-sm">
        <thead><tr class="border-b"><th class="th">구분</th><th class="th num">실적 인원</th><th class="th"><span class="inline-flex items-center gap-1">집계 기간${term('집계 기간')}</span></th><th class="th num">개월</th><th class="th num"><span class="inline-flex items-center gap-1">시뮬레이터 반영 인원${term('연환산')}</span></th><th class="th">월별 추이</th><th class="th">비고</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <p class="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><i data-lucide="info" class="size-3.5"></i>병원 시스템 ${h.receivedAt} 수신${h.locations.length > 1 ? ` · ${h.locations.join('·')} 거점 실적 합산` : ''}</p>`, SOURCE.ext);
    return basic + volumes;
  }

  /* ---------- 매출 항목 ---------- */
  function itemsTab() {
    const h = hosp(), list = h.revenueItems;
    const rows = list.map((it, i) => `<tr class="border-b last:border-0 ${it.enabled ? '' : 'text-muted-foreground'}">
      <td class="td text-muted-foreground tabular-nums">${i + 1}</td>
      <td class="td font-medium">${esc(it.name)}${it.template ? ' <span class="badge badge-secondary ms-1">표준 템플릿</span>' : ''}${it.custom ? ' <span class="badge badge-warning ms-1">추가</span>' : ''}</td>
      <td class="td">${segBadge(it.segment)}</td>
      <td class="td">${CALC_TYPES[it.type].label}</td>
      <td class="td">${BASE_LABEL[it.base] || '-'}</td>
      <td class="td max-w-[260px] truncate text-xs text-muted-foreground" title="${esc(it.fields.map(f => f.label).join(', '))}">${it.fields.map(f => f.label).join(', ')}</td>
      <td class="td">${switchHtml(it.enabled, `data-item-toggle="${it.key}" aria-label="${esc(it.name)} 사용"`)}</td>
      <td class="td text-end"><div class="inline-flex gap-1">
        <button type="button" class="btn btn-ghost btn-icon" data-item-move="${i}:-1" ${i === 0 ? 'disabled' : ''} aria-label="위로"><i data-lucide="arrow-up"></i></button>
        <button type="button" class="btn btn-ghost btn-icon" data-item-move="${i}:1" ${i === list.length - 1 ? 'disabled' : ''} aria-label="아래로"><i data-lucide="arrow-down"></i></button>
        <button type="button" class="btn btn-ghost btn-icon" data-item-edit="${it.key}" aria-label="편집"><i data-lucide="pencil"></i></button>
        <button type="button" class="btn btn-ghost btn-icon text-destructive" data-item-delete="${it.key}" aria-label="삭제"><i data-lucide="trash-2"></i></button>
      </div></td></tr>`).join('');
    const table = card('매출 항목', `${esc(h.name)}의 매출을 이루는 항목입니다. 사용하는 항목만 시뮬레이터 입력판과 결과에 나타납니다.`, `
      <div class="overflow-x-auto"><table class="w-full min-w-[860px] text-sm">
        <thead><tr class="border-b"><th class="th w-10">순서</th><th class="th">항목명</th><th class="th"><span class="inline-flex items-center gap-1">부문${term('부문')}</span></th><th class="th"><span class="inline-flex items-center gap-1">산출 방식${term('산출 방식')}</span></th><th class="th"><span class="inline-flex items-center gap-1">기반 인원${term('기반 인원')}</span></th><th class="th">시뮬레이터 입력</th><th class="th"><span class="inline-flex items-center gap-1">사용${tip('끄면 시뮬레이터 입력판과 결과에서 이 항목이 빠집니다. 값은 지워지지 않습니다.')}</span></th><th class="th text-end">관리</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`, `${SOURCE.own}<button type="button" class="btn btn-outline btn-sm" id="addTemplate" ${Object.keys(REVENUE_TEMPLATES).every(k => list.some(x => x.key === k)) ? 'disabled' : ''}><i data-lucide="layout-template"></i>템플릿에서 추가</button><button type="button" class="btn btn-default btn-sm" id="addItem"><i data-lucide="plus"></i>매출 항목 추가</button>`);
    const types = card('산출 방식', '매출 항목을 추가할 때 고르는 계산 방식입니다. 방식에 따라 시뮬레이터 입력 항목이 정해집니다.', `
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">${Object.entries(CALC_TYPES).map(([k, t]) => `<div class="space-y-2 rounded-lg border p-4">
        <div class="font-medium">${t.label}</div><code class="block rounded bg-muted px-2 py-1 text-xs">${t.formula}</code>
        <div class="flex flex-wrap gap-1">${t.fields.map(f => `<span class="badge badge-outline">${f.label}</span>`).join('')}</div></div>`).join('')}</div>`);
    return table + types;
  }

  function itemModal(key) {
    const h = hosp(), it = key ? h.revenueItems.find(x => x.key === key) : null;
    const typeLocked = it && !it.custom;
    openModal({
      title: it ? '매출 항목 편집' : '매출 항목 추가', size: 'max-w-xl',
      desc: typeLocked ? '계산식이 연결된 표준 템플릿 항목입니다. 이름·부문과 모델 값을 바꿀 수 있습니다.' : '',
      body: `<form class="space-y-4" onsubmit="return false">
        <label class="block space-y-1.5"><span class="label">항목명 <span class="text-destructive">*</span></span><input id="imName" class="input" maxlength="30" value="${esc(it?.name ?? '')}" placeholder="예: 건강검진 패키지 업셀"/></label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block space-y-1.5"><span class="label">부문</span><select id="imSeg" class="select">${['Medical', 'Commerce'].map(s => `<option ${it?.segment === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          <label class="block space-y-1.5"><span class="label">기반 인원</span><select id="imBase" class="select" ${typeLocked ? 'disabled' : ''}>${Object.entries(BASE_LABEL).map(([k, l]) => `<option value="${k}" ${it?.base === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
        <fieldset class="space-y-2"><legend class="label">산출 방식</legend>
          <div class="grid gap-2 sm:grid-cols-2">${Object.entries(CALC_TYPES).map(([k, t], i) => `<label class="flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent/60 ${typeLocked ? 'pointer-events-none opacity-60' : ''}">
            <input type="radio" name="imType" value="${k}" class="mt-0.5 size-4 shrink-0" ${(it ? it.type === k : i === 0) ? 'checked' : ''} ${typeLocked ? 'disabled' : ''}/>
            <span class="space-y-1"><span class="block text-sm font-medium">${t.label}</span><span class="block text-xs text-muted-foreground">${t.formula}</span></span></label>`).join('')}</div>
        </fieldset>
        <div class="rounded-lg bg-muted/60 px-4 py-3 text-sm"><span class="text-muted-foreground">시뮬레이터 입력</span> <span id="imFields" class="font-medium"></span></div>
        ${it?.model ? modelFieldsHtml(it) : ''}
      </form>`,
      footer: `<button type="button" class="btn btn-outline" data-close>취소</button><button type="button" class="btn btn-default" id="imSave">저장</button>`,
      onMount: (el, close) => {
        const name = el.querySelector('#imName'), save = el.querySelector('#imSave');
        const type = () => el.querySelector('input[name="imType"]:checked').value;
        const sync = () => {
          el.querySelector('#imFields').textContent = (typeLocked ? it.fields : CALC_TYPES[type()].fields).map(f => f.label).join(', ');
          el.querySelector('#imBase').disabled = typeLocked || type() === 'MANUAL';
          save.disabled = !name.value.trim();
        };
        el.addEventListener('input', sync); el.addEventListener('change', sync); sync();
        save.addEventListener('click', () => {
          const seg = el.querySelector('#imSeg').value, base = type() === 'MANUAL' ? null : el.querySelector('#imBase').value;
          if (it?.model) {
            const bad = readModelInputs(el, it);
            if (bad) { bad.focus(); toast('모델 값은 0 이상의 숫자로 입력하세요.'); return; }
          }
          if (it) {
            Object.assign(it, { name: name.value.trim(), segment: seg });
            if (!typeLocked) { const k = it.key; Object.assign(it, { type: type(), base, fields: makeFields(k, type()) }); }
          } else {
            const k = 'item' + Date.now();
            h.revenueItems.push({ key: k, name: name.value.trim(), segment: seg, type: type(), base, enabled: true, custom: true, fields: makeFields(k, type()) });
          }
          saveHospital(h); close(); render(); toast('저장했습니다.');
        });
      },
    });
  }

  /* 템플릿 항목의 모델 값 — 계산식에 들어가는 비율·단가·대상 인원 (D16-d). 침투율은 소수로 저장하고 %로 보인다 */
  function modelFieldsHtml(it) {
    const defs = MODEL_FIELDS[it.template] || [], tpl = REVENUE_TEMPLATES[it.template]?.model || {};
    const unit = f => f.money ? CUR.sym : f.unit || '';
    const row = f => f.yearly
      ? `<div class="space-y-1.5 sm:col-span-2"><span class="label">${f.label} <span class="text-xs font-normal text-muted-foreground">${unit(f)} · Y1~Y5</span></span>
          <div class="grid grid-cols-5 gap-1.5">${it.model[f.key].map((v, i) => `<input class="input h-8 px-2 text-end text-xs tabular-nums" data-model="${f.key}.${i}" value="${+(v * 100).toFixed(2)}" aria-label="${f.label} Y${i + 1}"/>`).join('')}</div></div>`
      : `<label class="block space-y-1.5"><span class="label">${f.label} <span class="text-xs font-normal text-muted-foreground">${unit(f)}${tpl[f.key] !== it.model[f.key] ? ` · 템플릿 ${tpl[f.key]}` : ''}</span></span>
          <input class="input h-8 text-end tabular-nums" data-model="${f.key}" value="${it.model[f.key]}"/></label>`;
    return `<fieldset class="space-y-3 rounded-lg border p-4"><legend class="label px-1">모델 값${tip('표준 템플릿 계산식에 들어가는 비율·단가입니다. 템플릿 기본값에서 시작하고, 이 병원에 맞게 바꿉니다.')}</legend>
      <div class="grid gap-3 sm:grid-cols-2">${defs.map(row).join('')}</div></fieldset>`;
  }
  /* 모델 값 입력을 항목에 옮긴다. 잘못된 칸이 있으면 그 칸을 돌려준다 */
  function readModelInputs(el, it) {
    const inputs = [...el.querySelectorAll('[data-model]')], num = x => +String(x.value).replace(/,/g, '');
    const bad = inputs.find(x => x.value.trim() === '' || !Number.isFinite(num(x)) || num(x) < 0);
    if (bad) return bad;
    inputs.forEach(x => { const [k, i] = x.dataset.model.split('.'); if (i != null) it.model[k][+i] = num(x) / 100; else it.model[k] = num(x); });
    return null;
  }
  /* 표준 템플릿에서 매출 항목 추가 — 이 병원에 없는 템플릿만 고른다 (D16-c) */
  function templateModal() {
    const h = hosp(), avail = Object.entries(REVENUE_TEMPLATES).filter(([k]) => !h.revenueItems.some(x => x.key === k));
    openModal({
      title: '템플릿에서 매출 항목 추가', size: 'max-w-xl', desc: 'Invites 표준 항목입니다. 계산식이 연결되어 있고, 모델 값은 추가한 뒤 편집에서 바꿉니다.',
      body: `<div class="space-y-2">${avail.map(([k, t]) => `<button type="button" data-tpl-add="${k}" class="flex w-full items-start gap-3 rounded-lg border p-3 text-start hover:bg-accent/40"><i data-lucide="layout-template" class="mt-0.5 size-4 shrink-0 text-primary"></i><span class="space-y-0.5"><span class="flex items-center gap-1.5 text-sm font-medium">${esc(t.name)} ${segBadge(t.segment)}</span><span class="block text-xs text-muted-foreground">${esc(t.desc)}</span><span class="block text-[11px] text-muted-foreground">입력: ${t.fields.map(f => f.label).join(', ')}</span></span></button>`).join('')}</div>`,
      footer: '<button type="button" class="btn btn-outline" data-close>닫기</button>',
      onMount: (el, close) => el.addEventListener('click', e => {
        const b = e.target.closest('[data-tpl-add]'); if (!b) return;
        const item = fromTemplate(b.dataset.tplAdd);
        h.revenueItems.push(item);
        if (item.toggle && h.defaults[item.toggle] == null) h.defaults[item.toggle] = true;
        saveHospital(h); close(); render(); toast(`${item.name}을(를) 추가했습니다.${item.model ? ' 모델 값을 확인하세요.' : ''}`);
      }),
    });
  }

  /* ---------- 재무 상수 ---------- */
  function profileTab() {
    const h = hosp(), p = h.profile, unit = CUR.sym;
    const field = (key, label, value, suffix = '', help = '') => `<label class="block space-y-1.5"><span class="label flex items-center gap-1.5">${label}${tip(help, label)}</span>
      <span class="flex items-center gap-2"><input class="input text-end tabular-nums" value="${value}" data-profile="${key}"/>${suffix ? `<span class="shrink-0 text-sm text-muted-foreground">${suffix}</span>` : ''}</span></label>`;
    const yearRow = (key, label, arr, suffix) => `<tr class="border-b last:border-0"><td class="td">${label} <span class="text-xs text-muted-foreground">${suffix}</span></td>${arr.map((v, i) => `<td class="td"><input class="input h-8 text-end tabular-nums" value="${F.int(v)}" data-profile="${key}.${i}" aria-label="${label} Y${i + 1}"/></td>`).join('')}</tr>`;
    const yearHead = `<tr class="border-b"><th class="th">항목</th>${YEARS.map(n => `<th class="th num">Y${n} <span class="text-[10px] font-normal">${h.baseYear + n}</span></th>`).join('')}</tr>`;
    const allocation = [...COST_ITEMS, { key: 'capexAttr', label: 'CAPEX 귀속' }, { key: 'dep', label: '감가상각' }];
    return `
      ${card('인건비', '연 상승률은 복리로 적용합니다.', `
        <div class="grid gap-4 md:grid-cols-3">${field('laborUnitCost', '1인 인건비 (연)', F.int(p.laborUnitCost), unit, '직원 1명의 연간 인건비입니다. 연도별 인원을 곱해 인건비를 계산합니다.')}${field('laborInflation', '연 상승률', p.laborInflation, '%', '1인 인건비가 매년 오르는 비율입니다. 복리로 적용합니다.')}
          <label class="block space-y-1.5"><span class="label">상승률 근거</span><input class="input" value="${esc(p.laborInflationBasis)}" data-profile="laborInflationBasis" data-text/></label></div>
        <div class="mt-4 overflow-x-auto"><table class="w-full min-w-[560px] text-sm"><thead>${yearHead}</thead><tbody>${yearRow('staff', '인원', p.staff, '명')}</tbody></table></div>`, SOURCE.own)}
      <div class="grid gap-6 lg:grid-cols-2">
        ${card('세금·로열티', '', `<div class="grid gap-4 sm:grid-cols-3">${field('royaltyRate', '로열티율', p.royaltyRate, '%', '매출 대비 로열티 비율입니다.')}${field('taxRate', '법인세율', p.taxRate, '%', 'EBIT에 적용하는 세율입니다.')}${field('taxLossYears', '이월결손금 공제', p.taxLossYears, '년', GLOSSARY.이월결손금 + ' 0년이면 공제하지 않습니다.')}</div>`)}
        ${card('기업가치', '시뮬레이터의 EV·민감도 계산에 쓰입니다.', `<div class="grid gap-4 sm:grid-cols-3">${field('wacc', 'WACC', p.wacc, '%', GLOSSARY.WACC)}${field('growth', '영구성장률', p.growth, '%', GLOSSARY.영구성장률)}${field('nwcRate', '운전자본 비율', p.nwcRate, '%', '매출 증가분 중 운전자본으로 묶이는 비율입니다. ' + GLOSSARY.운전자본)}</div>`)}
      </div>
      ${card(`감가상각·CAPEX${term('CAPEX')}`, `단위 ${unit}`, `<div class="overflow-x-auto"><table class="w-full min-w-[640px] text-sm"><thead>${yearHead}</thead><tbody>${yearRow('depreciation', '감가상각', p.depreciation, unit)}${yearRow('capex', 'CAPEX', p.capex, unit)}</tbody></table></div>`)}
      ${card(`비용 배분${term('비용 배분')}`, 'Medical·Commerce 부문 손익을 나눌 때 비용 항목별로 쓰는 기준입니다.', `<div class="overflow-x-auto"><table class="w-full min-w-[480px] text-sm"><thead><tr class="border-b"><th class="th">비용 항목</th><th class="th">배분 기준</th></tr></thead>
        <tbody>${allocation.map(c => `<tr class="border-b last:border-0"><td class="td">${c.label}</td><td class="td"><select class="select h-8 w-56" data-profile="allocation.${c.key}" data-text>${Object.entries(ALLOCATION_LABEL).map(([k, l]) => `<option value="${k}" ${h.allocation[c.key] === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`)}
      <div class="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-5 py-3 shadow-sm backdrop-blur">
        <span class="text-sm text-muted-foreground">v${p.version} · ${p.updatedAt} · ${p.updatedBy}${state.profileDirty ? ' <span class="badge badge-warning ms-1">수정됨</span>' : ''}</span>
        <div class="flex gap-2"><button type="button" class="btn btn-outline" id="profileReset" ${state.profileDirty ? '' : 'disabled'}>취소</button><button type="button" class="btn btn-default" id="profileSave" ${state.profileDirty ? '' : 'disabled'}><i data-lucide="save"></i>저장</button></div>
      </div>`;
  }

  /* ---------- 환자 구분 계수 ---------- */
  function paramsTab() {
    const h = hosp();
    const cell = (v, attr) => v == null ? '<span class="text-muted-foreground">-</span>' : `<input class="input ms-auto h-8 w-24 text-end tabular-nums" value="${v}" ${attr}/>`;
    const th = (label, help) => `<th class="th num"><span class="inline-flex items-center gap-1">${label}${tip(help)}</span></th>`;
    const byType = card('구분별 계수', '외래·입원·건강검진 인원에 적용하는 계수입니다.', `
      <div class="overflow-x-auto"><table class="w-full min-w-[520px] text-sm">
        <thead><tr class="border-b"><th class="th">구분</th>${th('위험군 비율 (%)', '건강검진 수검자 중 위험군 비율입니다. 위험군은 Medical 구독과 외래 연계 대상이 되고, 나머지는 Wellness 대상이 됩니다.')}${th('연 환자 증가율 (%)', '실적 인원이 매년 늘어나는 비율입니다. 복리로 적용합니다.')}</tr></thead>
        <tbody>${h.params.map(p => `<tr class="border-b last:border-0"><td class="td font-medium">${VOLUME_TYPES.find(t => t.key === p.key).label}</td>
          <td class="td num">${cell(p.risk, `data-param="${p.key}.risk"`)}</td><td class="td num">${cell(p.growth, `data-param="${p.key}.growth"`)}</td></tr>`).join('')}</tbody></table></div>`, SOURCE.own);
    const bySite = card('거점별 계수', `${h.sites.map(st => st.name).join('·')} 거점은 한 병원으로 합산해 보여 주지만, 외래 환자 구성이 달라 거점마다 따로 계산합니다.`, `
      <div class="overflow-x-auto"><table class="w-full min-w-[620px] text-sm">
        <thead><tr class="border-b"><th class="th">거점</th><th class="th num">외래 실적</th><th class="th num">건강검진 실적</th>${th('외래 만성질환 비율 (%)', '외래 환자 중 만성질환자 비율입니다. 만성질환자는 Medical, 나머지는 Wellness 전환 대상입니다.')}${th('외래연계 계수 (×)', '시나리오의 외래연계율에 곱해 이 거점의 Y1 연계율을 정합니다. 1이면 입력한 연계율 그대로입니다.')}</tr></thead>
        <tbody>${h.sites.map(st => { const vol = k => h.volumes.find(v => v.key === k)?.bySite?.[st.key]; return `<tr class="border-b last:border-0"><td class="td font-medium">${st.name}</td>
          <td class="td num">${vol('OUT') != null ? F.int(vol('OUT')) : '-'}</td><td class="td num">${vol('CHK') != null ? F.int(vol('CHK')) : '-'}</td>
          <td class="td num">${cell(st.chronic, `data-site="${st.key}.chronic"`)}</td><td class="td num">${cell(st.referral, `data-site="${st.key}.referral"`)}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="mt-3 text-xs text-muted-foreground">실적 인원은 병원 시스템 제공 값이며 읽기 전용입니다.</p>`, SOURCE.own);
    return byType + bySite + `<div class="flex justify-end"><button type="button" class="btn btn-default" id="paramsSave"><i data-lucide="save"></i>저장</button></div>`;
  }

  /* ---------- 시나리오 프리셋 ---------- */
  const presetFields = h => [
    ...h.revenueItems.filter(i => i.enabled).map(i => ({ group: i.name, fields: i.fields.filter(f => !f.yearly) })),
    { group: '비용', fields: [
      { key: 'opexRate', label: '운영비율', unit: '%' }, { key: 'mktgRate', label: '마케팅·CAC·간접비', unit: '%' },
      { key: 'bizdevK', label: '초기사업개발비', unit: CUR.kUnit }, { key: 'omRate', label: '유지보수비', unit: '%' },
    ] },
  ].filter(g => g.fields.length);
  const fmtVal = (f, v, h) => f.toggle ? (v ? '켜짐' : '꺼짐') : v == null ? '-' : `${f.money ? CUR.sym : ''}${typeof v === 'number' ? v.toLocaleString('en-US') : v}${f.unit || ''}`;

  function presetsTab() {
    const h = hosp();
    if (!h.presets.some(p => p.key === state.preset)) state.preset = h.presets[0]?.key ?? null;
    const p = h.presets.find(x => x.key === state.preset);
    const list = h.presets.map(x => `<button type="button" data-preset="${x.key}" class="w-full space-y-1 rounded-lg border p-3 text-start transition-colors ${x.key === state.preset ? 'border-primary bg-accent/60' : 'hover:bg-accent/40'}">
        <span class="flex flex-wrap items-center gap-1.5 text-sm font-medium">${esc(x.name)}${bandBadge(x.band)}${x.custom ? '<span class="badge badge-warning">추가</span>' : ''}</span>
        <span class="block text-xs text-muted-foreground">${esc(x.desc)}</span>
        <span class="block text-[11px] text-muted-foreground">이 프리셋으로 만든 시나리오 ${scenarioCount(x.key)}개 · ${x.updatedAt} ${esc(x.updatedBy)}</span></button>`).join('');
    const detail = p ? (() => {
      const values = { ...h.defaults, ...p.set };
      const rows = presetFields(h).map(g => `<tr class="bg-muted/50"><td class="td text-xs font-semibold text-muted-foreground" colspan="3">${esc(g.group)}</td></tr>` + g.fields.map(f => {
        const changed = Object.prototype.hasOwnProperty.call(p.set, f.key) && p.set[f.key] !== h.defaults[f.key];
        return `<tr class="border-b"><td class="td ps-5">${f.label}</td><td class="td num ${changed ? 'font-semibold text-primary' : ''}">${fmtVal(f, values[f.key], h)}</td><td class="td num text-muted-foreground">${fmtVal(f, h.defaults[f.key], h)}</td></tr>`;
      }).join('')).join('');
      return `<div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1"><div class="flex flex-wrap items-center gap-2"><h3 class="text-lg font-semibold">${esc(p.name)}</h3>${bandBadge(p.band)}</div><p class="text-sm text-muted-foreground">${esc(p.desc)}</p>
            ${p.basedOn ? `<p class="text-xs text-muted-foreground">값 출처: ${esc(h.presets.find(x => x.key === p.basedOn)?.name ?? '삭제된 프리셋')}</p>` : ''}</div>
          <div class="flex gap-2"><button type="button" class="btn btn-outline btn-sm" data-preset-edit="${p.key}"><i data-lucide="pencil"></i>편집</button>
            <button type="button" class="btn btn-ghost btn-sm text-destructive hover:text-destructive" data-preset-delete="${p.key}"><i data-lucide="trash-2"></i>삭제</button></div>
        </div>
        <div class="overflow-x-auto"><table class="w-full min-w-[420px] text-sm"><thead><tr class="border-b"><th class="th">입력</th><th class="th num">이 프리셋</th><th class="th num"><span class="inline-flex items-center gap-1">병원 기본값${tip('프리셋에 값이 없는 입력은 병원 기본값을 씁니다.')}</span></th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="text-xs text-muted-foreground">굵게 표시한 값이 병원 기본값과 다릅니다. 프리셋에 없는 입력은 병원 기본값을 씁니다.</p>
      </div>`;
    })() : '<p class="text-sm text-muted-foreground">프리셋이 없습니다. 프리셋을 추가하세요.</p>';
    return card('시나리오 프리셋', '시나리오를 만들 때 고르는 시작 값 묶음입니다. 하한·상한 프리셋은 시뮬레이터의 EBITDA 밴드에 쓰입니다.', `
      <div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div class="space-y-2">${list}</div><div class="min-w-0">${detail}</div></div>`,
      `${SOURCE.own}<button type="button" class="btn btn-default btn-sm" id="addPreset"><i data-lucide="plus"></i>프리셋 추가</button>`);
  }

  function presetModal(key) {
    const h = hosp(), editing = key ? h.presets.find(p => p.key === key) : null;
    const groups = presetFields(h);
    const inputs = src => {
      const values = { ...h.defaults, ...(src ? src.set : {}) };
      return groups.map(g => `<tr class="bg-muted/50"><td class="td text-xs font-semibold text-muted-foreground" colspan="2">${esc(g.group)}</td></tr>` + g.fields.map(f => `<tr class="border-b">
        <td class="td ps-5">${f.label} <span class="text-xs text-muted-foreground">${f.money ? CUR.sym : ''}${f.unit || ''}</span></td>
        <td class="td text-end">${f.toggle ? `<input type="checkbox" class="size-4" data-pv="${f.key}" ${values[f.key] ? 'checked' : ''}/>` : `<input class="input h-8 w-32 text-end tabular-nums" data-pv="${f.key}" value="${values[f.key] ?? ''}"/>`}</td></tr>`).join('')).join('');
    };
    openModal({
      title: editing ? '프리셋 편집' : '프리셋 추가', size: 'max-w-2xl',
      desc: `${esc(h.name)}의 시나리오 프리셋입니다. 저장하면 시뮬레이터의 새 시나리오 만들기에서 고를 수 있습니다.`,
      body: `<form class="space-y-4" onsubmit="return false">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block space-y-1.5"><span class="label">이름 <span class="text-destructive">*</span></span><input id="pmName" class="input" maxlength="30" value="${esc(editing?.name ?? '')}" placeholder="예: 신규 거점 확장"/>
            <span id="pmMsg" class="block text-xs text-destructive"></span></label>
          <label class="block space-y-1.5"><span class="label flex items-center gap-1.5">값 가져오기${tip('고른 프리셋의 값을 아래 표에 채웁니다. 채운 뒤 값을 고칠 수 있습니다.')}</span><select id="pmSrc" class="select"><option value="">병원 기본값</option>${h.presets.map(p => `<option value="${p.key}" ${(editing ? editing.key : '') === p.key ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
        </div>
        <label class="block space-y-1.5"><span class="label">설명</span><input id="pmDesc" class="input" maxlength="100" value="${esc(editing?.desc ?? '')}" placeholder="이 프리셋의 전제를 한 줄로 적어 두세요."/></label>
        <fieldset class="space-y-2"><legend class="label flex items-center gap-1.5">밴드 역할${term('EBITDA 밴드')}</legend>
          <div class="flex flex-wrap gap-4 text-sm">${[['', '없음'], ['LOW', '하한 (보수)'], ['HIGH', '상한 (공격)']].map(([v, l]) => `<label class="flex items-center gap-2"><input type="radio" name="pmBand" value="${v}" class="size-4" ${(editing?.band ?? '') === v ? 'checked' : ''}/>${l}</label>`).join('')}</div>
          <p id="pmBandMsg" class="text-xs text-muted-foreground"></p></fieldset>
        <div class="rounded-lg border"><table class="w-full text-sm"><tbody id="pmValues">${inputs(editing)}</tbody></table></div>
      </form>`,
      footer: `<button type="button" class="btn btn-outline" data-close>취소</button><button type="button" class="btn btn-default" id="pmSave">저장</button>`,
      onMount: (el, close) => {
        const name = el.querySelector('#pmName'), save = el.querySelector('#pmSave');
        const sync = () => {
          const v = name.value.trim(), dup = h.presets.some(p => p.name === v && p !== editing);
          el.querySelector('#pmMsg').textContent = dup ? '같은 이름의 프리셋이 있습니다.' : '';
          save.disabled = !v || dup;
          const band = el.querySelector('input[name="pmBand"]:checked').value, holder = band && h.presets.find(p => p.band === band && p !== editing);
          el.querySelector('#pmBandMsg').textContent = holder ? `저장하면 "${holder.name}"의 ${BAND_LABEL[band]} 역할이 해제됩니다.` : '';
        };
        el.querySelector('#pmSrc').addEventListener('change', e => { el.querySelector('#pmValues').innerHTML = inputs(h.presets.find(p => p.key === e.target.value)); });
        el.addEventListener('input', sync); el.addEventListener('change', sync); sync();
        save.addEventListener('click', () => {
          const set = {};
          el.querySelectorAll('[data-pv]').forEach(i => { const k = i.dataset.pv, v = i.type === 'checkbox' ? i.checked : +i.value; if (v !== h.defaults[k]) set[k] = v; });
          const band = el.querySelector('input[name="pmBand"]:checked').value || null;
          if (band) h.presets.forEach(p => { if (p.band === band && p !== editing) p.band = null; });
          const src = el.querySelector('#pmSrc').value;
          const today = new Date(), stamp = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
          const data = { name: name.value.trim(), desc: el.querySelector('#pmDesc').value.trim(), band, set, updatedBy: '홍길동', updatedAt: stamp };
          if (editing) Object.assign(editing, data);
          else {
            const basedOn = src ? (h.presets.find(p => p.key === src).basedOn || src) : null;
            const p = { key: 'p' + Date.now(), ...data, basedOn, custom: true };
            h.presets.push(p); state.preset = p.key;
          }
          saveHospital(h); close(); render(); toast('저장했습니다.');
        });
      },
    });
  }

  /* ---------- 가정 ---------- */
  function assumptionsTab() {
    const h = hosp();
    return card('가정', '시뮬레이터 입력의 근거입니다.', `
      <div class="overflow-x-auto"><table class="w-full min-w-[760px] text-sm">
        <thead><tr class="border-b"><th class="th">항목</th><th class="th num">값</th><th class="th">근거</th><th class="th">적용 시작일</th><th class="th"><span class="inline-flex items-center gap-1">범위${tip('시스템: 모든 병원 공통 값. 병원: 이 병원에서 따로 정한 값으로, 시스템 값보다 우선합니다.')}</span></th></tr></thead>
        <tbody>${h.assumptions.map(a => `<tr class="border-b last:border-0">
          <td class="td font-medium">${esc(a.label)}</td><td class="td num">${a.money ? CUR.sym : ''}${a.value}${a.unit}</td>
          <td class="td max-w-[320px] truncate text-muted-foreground" title="${esc(a.basis)}">${esc(a.basis)}</td>
          <td class="td tabular-nums">${a.validFrom}</td><td class="td">${a.scope === '시스템' ? '<span class="badge badge-outline">시스템</span>' : '<span class="badge badge-secondary">병원</span>'}</td></tr>`).join('')}</tbody></table></div>`,
      SOURCE.own);
  }

  /* ---------- 렌더·이벤트 ---------- */
  const TAB_RENDER = { info: infoTab, items: itemsTab, profile: profileTab, params: paramsTab, presets: presetsTab, assumptions: assumptionsTab };
  function render() {
    useCurrency(hosp());
    renderTop();
    root.querySelector('#tabBody').innerHTML = TAB_RENDER[state.tab]();
    lucide.createIcons();
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('[data-tab],[data-preset],[data-preset-edit],[data-preset-delete],#addPreset,#addItem,#addTemplate,[data-item-edit],[data-item-delete],[data-item-toggle],[data-item-move],#profileSave,#profileReset,#paramsSave');
    if (!t) return;
    const h = hosp();
    if (t.dataset.tab) { state.tab = t.dataset.tab; history.replaceState(null, '', '#basic-' + state.tab); render(); }
    else if (t.dataset.preset) { state.preset = t.dataset.preset; render(); }
    else if (t.id === 'addPreset') presetModal(null);
    else if (t.dataset.presetEdit) presetModal(t.dataset.presetEdit);
    else if (t.dataset.presetDelete) {
      const p = h.presets.find(x => x.key === t.dataset.presetDelete), n = scenarioCount(p.key);
      confirmModal(`"${esc(p.name)}" 프리셋을 삭제합니다.${n ? ` 이 프리셋으로 만든 시나리오 ${n}개는 입력값을 그대로 두고 프리셋 연결만 해제됩니다.` : ''}`, () => {
        h.presets = h.presets.filter(x => x !== p); saveHospital(h); render(); toast('삭제했습니다.');
      }, { okLabel: '삭제', destructive: true, title: '프리셋 삭제' });
    }
    else if (t.id === 'addItem') itemModal(null);
    else if (t.id === 'addTemplate') templateModal();
    else if (t.dataset.itemEdit) itemModal(t.dataset.itemEdit);
    else if (t.dataset.itemDelete) {
      const it = h.revenueItems.find(x => x.key === t.dataset.itemDelete);
      confirmModal(`"${esc(it.name)}" 매출 항목을 삭제합니다. 시나리오에 입력한 이 항목의 값도 함께 사라집니다.${it.template ? ' 표준 템플릿 항목은 템플릿에서 다시 추가할 수 있습니다.' : ''}`, () => {
        h.revenueItems = h.revenueItems.filter(x => x !== it); saveHospital(h); render(); toast('삭제했습니다.');
      }, { okLabel: '삭제', destructive: true, title: '매출 항목 삭제' });
    }
    else if (t.dataset.itemToggle) { const it = h.revenueItems.find(x => x.key === t.dataset.itemToggle); it.enabled = !it.enabled; saveHospital(h); render(); }
    else if (t.dataset.itemMove) {
      const [i, d] = t.dataset.itemMove.split(':').map(Number), arr = h.revenueItems;
      [arr[i], arr[i + d]] = [arr[i + d], arr[i]]; saveHospital(h); render();
    }
    else if (t.id === 'profileSave') confirmModal('재무 상수를 바꾸면 이 병원의 모든 시나리오 계산 결과가 달라집니다. 저장할까요?', () => {
      readProfileInputs(h);
      h.profile.version += 1; h.profile.updatedAt = stampNow(); h.profile.updatedBy = '홍길동';
      saveHospital(h); state.profileDirty = false; render(); toast('저장했습니다. 시뮬레이터 결과에 반영됩니다.');
    }, { okLabel: '저장' });
    else if (t.id === 'profileReset') { state.profileDirty = false; render(); }
    else if (t.id === 'paramsSave') {
      const num = el => +String(el.value).replace(/,/g, '');
      const bad = [...root.querySelectorAll('[data-param],[data-site]')].find(el => !Number.isFinite(num(el)) || num(el) < 0);
      if (bad) { bad.focus(); toast('0 이상의 숫자를 입력하세요.'); return; }
      root.querySelectorAll('[data-param]').forEach(el => { const [k, f] = el.dataset.param.split('.'); h.params.find(p => p.key === k)[f] = num(el); });
      root.querySelectorAll('[data-site]').forEach(el => { const [k, f] = el.dataset.site.split('.'); h.sites.find(st => st.key === k)[f] = num(el); });
      saveHospital(h); render(); toast('저장했습니다. 시뮬레이터 결과에 반영됩니다.');
    }
  });
  /* 재무 상수 입력값을 프로필에 옮긴다 — 키가 "staff.0"이면 배열 칸, "allocation.labor"면 비용 배분 */
  function readProfileInputs(h) {
    root.querySelectorAll('[data-profile]').forEach(el => {
      const [k, sub] = el.dataset.profile.split('.');
      const v = el.dataset.text !== undefined ? el.value : +String(el.value).replace(/,/g, '') || 0;
      if (k === 'allocation') h.allocation[sub] = v;
      else if (sub != null) h.profile[k][+sub] = v;
      else h.profile[k] = v;
    });
  }
  function stampNow() {
    const n = new Date(), p = x => String(x).padStart(2, '0');
    return `${n.getFullYear()}.${p(n.getMonth() + 1)}.${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
  }
  /* 입력 중인 칸을 다시 그리면 입력값과 포커스를 잃으므로 저장 막대만 바꾼다 */
  function markProfileDirty() {
    if (state.profileDirty) return;
    state.profileDirty = true;
    root.querySelector('#profileSave').disabled = false;
    root.querySelector('#profileReset').disabled = false;
    root.querySelector('#profileSave').closest('div.sticky').querySelector('span').insertAdjacentHTML('beforeend', ' <span class="badge badge-warning ms-1">수정됨</span>');
  }
  root.addEventListener('input', e => { if (e.target.dataset.profile !== undefined) markProfileDirty(); });
  root.addEventListener('change', e => {
    if (e.target.dataset.profile !== undefined) markProfileDirty();
  });

  render();
}
