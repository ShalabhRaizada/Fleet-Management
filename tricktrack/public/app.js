'use strict';

/* Tricktrack UI — vanilla JS single page app.
 * Demo sign-in: pick a directory user in the header; the id is sent as the
 * x-user-id header on every API call. */

const $ = (sel, el = document) => el.querySelector(sel);
const state = { user: null, meta: null, users: [], tab: 'catalog' };

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(state.user ? { 'x-user-id': String(state.user.id) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `${res.status}`);
  return json;
}

function toast(msg, isError = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' err' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), isError ? 5000 : 2600);
}

function statusChip(status) {
  const s = String(status ?? '');
  let cls = 'info';
  if (['Approved', 'User Accepted', 'Available', 'In Stock', 'Available for Reuse', 'Compliant', 'Accepted', 'Closed', 'In Use', 'Cloud Provisioned'].includes(s)) cls = 'ok';
  if (s.startsWith('Pending') || ['Return Requested', 'More Information Required', 'Under Repair', 'Reserved', 'In Fulfilment', 'Over-allocated'].includes(s)) cls = 'warn';
  if (['Rejected', 'Cancelled', 'Lost', 'Damaged', 'Retired', 'Disposed', 'Expired', 'License Expired', 'License Revoked', 'Cloud Decommissioned'].includes(s)) cls = 'bad';
  return `<span class="chip ${cls}">${esc(s)}</span>`;
}

function urgencyChip(u) {
  const cls = u === 'Critical' ? 'bad' : u === 'High' ? 'warn' : u === 'Low' ? '' : 'info';
  return `<span class="chip ${cls}">${esc(u)}</span>`;
}

// ---------------- Dialog helper ----------------

function openDialog(title, fieldsHtml, onSubmit, submitLabel = 'Submit') {
  const dlg = $('#dialog');
  dlg.innerHTML = `
    <div class="dlg-head"><h3>${esc(title)}</h3></div>
    <form method="dialog" id="dlg-form">
      ${fieldsHtml}
      <div class="dlg-actions">
        <button type="button" class="ghost" id="dlg-cancel">Cancel</button>
        <button type="submit" class="primary">${esc(submitLabel)}</button>
      </div>
    </form>`;
  $('#dlg-cancel', dlg).onclick = () => dlg.close();
  $('#dlg-form', dlg).onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    for (const cb of e.target.querySelectorAll('input[type=checkbox]')) data[cb.name] = cb.checked;
    try {
      await onSubmit(data, e.target);
      dlg.close();
    } catch (err) {
      toast(err.message, true);
    }
  };
  dlg.showModal();
  return dlg;
}

const field = (label, inner) => `<label class="field">${esc(label)}${inner}</label>`;
const input = (name, opts = {}) =>
  `<input name="${name}" type="${opts.type ?? 'text'}" value="${esc(opts.value ?? '')}" placeholder="${esc(opts.placeholder ?? '')}" ${opts.required ? 'required' : ''} ${opts.min != null ? `min="${opts.min}"` : ''} ${opts.max != null ? `max="${opts.max}"` : ''}>`;
const select = (name, options, selected) =>
  `<select name="${name}">${options.map((o) => `<option value="${esc(o)}" ${o === selected ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;

// ---------------- Tabs ----------------

const TABS = [
  { id: 'catalog', label: 'Request Asset', roles: 'all' },
  { id: 'my-requests', label: 'My Requests', roles: 'all' },
  { id: 'my-assets', label: 'My Assets', roles: 'all' },
  { id: 'approvals', label: 'Approvals', roles: ['manager', 'it_asset_admin', 'it_support', 'security', 'finance', 'admin'] },
  { id: 'fulfilment', label: 'Fulfilment & Returns', roles: ['it_asset_admin', 'admin'] },
  { id: 'assets', label: 'Asset Master', roles: ['it_asset_admin', 'admin'] },
  { id: 'inventory', label: 'Inventory', roles: ['it_asset_admin', 'admin', 'it_support'] },
  { id: 'reports', label: 'Reports', roles: ['it_asset_admin', 'admin', 'finance', 'security', 'it_support', 'manager'] },
  { id: 'audit', label: 'Audit Log', roles: ['it_asset_admin', 'admin', 'finance', 'security'] },
];

function renderNav() {
  const nav = $('#nav');
  const visible = TABS.filter((t) => t.roles === 'all' || t.roles.includes(state.user.role));
  if (!visible.some((t) => t.id === state.tab)) state.tab = visible[0].id;
  nav.innerHTML = visible
    .map((t) => `<button data-tab="${t.id}" class="${t.id === state.tab ? 'active' : ''}">${esc(t.label)}</button>`)
    .join('');
  nav.querySelectorAll('button').forEach((b) => {
    b.onclick = () => { state.tab = b.dataset.tab; render(); };
  });
}

// ---------------- Catalog (end user, section 6.2) ----------------

async function viewCatalog(main) {
  const items = await api('GET', '/api/catalog');
  main.innerHTML = `
    <h2>Request an asset</h2>
    <p class="hint">Select what you need. Tell us why. Tell us how urgent it is. Submit.</p>
    <div class="cards">${items.map((c) => `
      <div class="card">
        <span class="cat">${esc(c.category_label)}</span>
        <span class="name">${esc(c.name)}</span>
        <span class="desc">${esc(c.description ?? '')}</span>
        <div class="meta">
          ${c.approval_required ? '<span class="chip warn">Approval required</span>' : '<span class="chip ok">No approval needed</span>'}
          ${c.standard_issue_days ? `<span class="chip">Issue: ~${c.standard_issue_days}d</span>` : ''}
          ${c.cost_indicator ? `<span class="chip">${esc(c.cost_indicator)}</span>` : ''}
          ${c.available_stock != null ? `<span class="chip ${c.available_stock > 0 ? 'ok' : 'bad'}">${c.available_stock} in stock</span>` : ''}
          ${c.available_licenses != null ? `<span class="chip ${c.available_licenses > 0 ? 'ok' : 'bad'}">${c.available_licenses} licenses left</span>` : ''}
          ${c.allocation_type === 'temporary' ? `<span class="chip">Temporary${c.max_duration_days ? ` · max ${c.max_duration_days}d` : ''}</span>` : ''}
          ${c.requires_return ? '<span class="chip">Return required</span>' : ''}
        </div>
        <button class="primary" data-request="${c.id}">Request</button>
      </div>`).join('') || '<div class="empty">No requestable items in the catalog yet.</div>'}
    </div>`;

  main.querySelectorAll('[data-request]').forEach((b) => {
    b.onclick = () => requestDialog(items.find((c) => c.id === Number(b.dataset.request)));
  });
}

function requestDialog(item) {
  const cat = item.category;
  const extra = [];
  if (cat === 'api') {
    extra.push(
      field('Application name', input('application_name', { required: true })),
      field('Environment', select('environment', state.meta.environments, 'dev')),
      field('Expected usage volume', input('expected_usage', { placeholder: 'e.g. 50k calls / month' })),
      field('Data sensitivity', select('data_sensitivity', state.meta.data_sensitivity, 'internal'))
    );
  }
  if (cat === 'ai_tool') {
    extra.push(
      field('Data types to be used', input('expected_usage', { placeholder: 'e.g. code, documents' })),
      `<label class="check"><input type="checkbox" name="confidential_data"> Company confidential data will be used</label>`,
      item.usage_policy
        ? `<div class="panel" style="margin:0"><strong>Usage policy</strong><p class="hint" style="margin:0.3rem 0 0.5rem">${esc(item.usage_policy)}</p>
           <label class="check"><input type="checkbox" name="policy_acknowledged" required> I have read and accept the usage policy</label></div>`
        : ''
    );
  }
  if (cat === 'cloud') {
    extra.push(
      field('Project / application', input('project', { required: true })),
      field('Environment', select('environment', state.meta.environments, 'dev')),
      `<div class="grid2">
        ${field('CPU (vCores)', input('cpu', { type: 'number', min: 1 }))}
        ${field('Memory (GB)', input('memory_gb', { type: 'number', min: 1 }))}
        ${field('Storage (GB)', input('storage_gb', { type: 'number', min: 1 }))}
        ${field('Region', input('region', { placeholder: 'e.g. ap-south-1' }))}
      </div>`,
      field('Estimated monthly cost', input('est_monthly_cost', { type: 'number', min: 0 })),
      field('Cost center', input('cost_center', { value: state.user.cost_center ?? '' })),
      field('Data sensitivity', select('data_sensitivity', state.meta.data_sensitivity, 'internal'))
    );
  }

  const durationField = item.allocation_type === 'temporary'
    ? field(`Duration needed (days)${item.max_duration_days ? ` — max ${item.max_duration_days}` : ''}`,
        input('duration_days', { type: 'number', min: 1, max: item.max_duration_days ?? undefined, required: true }))
    : field('Duration of need (days, optional)', input('duration_days', { type: 'number', min: 1 }));

  openDialog(`Request: ${item.name}`, `
    ${item.requires_justification ? field('Business justification', `<textarea name="justification" required placeholder="Why do you need this?"></textarea>`) : field('Business justification (optional)', `<textarea name="justification"></textarea>`)}
    <div class="grid2">
      ${field('Urgency', select('urgency', state.meta.urgency_levels, 'Normal'))}
      ${field('Required by', input('required_date', { type: 'date' }))}
    </div>
    <button type="button" class="ghost small" id="suggest-urgency">Suggest urgency from justification</button>
    ${durationField}
    ${extra.join('')}
  `, async (data) => {
    const body = { catalog_item_id: item.id, ...data };
    for (const n of ['duration_days', 'cpu', 'memory_gb', 'storage_gb', 'est_monthly_cost']) {
      if (body[n] === '') delete body[n]; else if (body[n] != null) body[n] = Number(body[n]);
    }
    const r = await api('POST', '/api/requests', body);
    toast(`Request ${r.request_no} submitted — ${r.status}`);
    state.tab = 'my-requests';
    render();
  });

  $('#suggest-urgency')?.addEventListener('click', async () => {
    const just = $('#dlg-form [name=justification]')?.value ?? '';
    const { urgency } = await api('POST', '/api/suggest-urgency', { justification: just });
    $('#dlg-form [name=urgency]').value = urgency;
    toast(`Suggested urgency: ${urgency} (you can change it)`);
  });
}

// ---------------- My Requests ----------------

async function viewMyRequests(main) {
  const rows = await api('GET', '/api/requests?scope=mine');
  main.innerHTML = `
    <h2>My requests</h2>
    <div class="tablewrap"><table>
      <tr><th>Request</th><th>Item</th><th>Urgency</th><th>Status</th><th>Raised</th><th></th></tr>
      ${rows.map((r) => `
        <tr>
          <td>${esc(r.request_no)}</td>
          <td>${esc(r.catalog_name)}<br><small class="hint">${esc(r.justification ?? '')}</small></td>
          <td>${urgencyChip(r.urgency)}</td>
          <td>${statusChip(r.status)}</td>
          <td>${esc((r.created_at ?? '').slice(0, 10))}</td>
          <td class="btnrow">
            ${r.status === 'More Information Required' ? `<button class="primary small" data-info="${r.id}">Respond</button>` : ''}
            ${['Draft', 'Submitted', 'More Information Required', 'Approved'].includes(r.status) || r.status.startsWith('Pending')
              ? `<button class="danger small" data-cancel="${r.id}">Cancel</button>` : ''}
          </td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty">No requests yet — start from “Request Asset”.</td></tr>'}
    </table></div>`;

  main.querySelectorAll('[data-cancel]').forEach((b) => {
    b.onclick = async () => {
      try { await api('POST', `/api/requests/${b.dataset.cancel}/cancel`); toast('Request cancelled'); render(); }
      catch (e) { toast(e.message, true); }
    };
  });
  main.querySelectorAll('[data-info]').forEach((b) => {
    b.onclick = () => openDialog('Provide more information', `
      ${field('Response to approver', '<textarea name="comment" required></textarea>')}
      ${field('Updated justification (optional)', '<textarea name="justification"></textarea>')}
    `, async (data) => {
      if (!data.justification) delete data.justification;
      await api('POST', `/api/requests/${b.dataset.info}/provide-info`, data);
      toast('Sent back for approval');
      render();
    });
  });
}

// ---------------- My Assets (section 6.4) ----------------

async function viewMyAssets(main) {
  const rows = await api('GET', '/api/my-assets');
  main.innerHTML = `
    <h2>My assets</h2>
    <div class="tablewrap"><table>
      <tr><th>Asset</th><th>Tag / Resource</th><th>Issued</th><th>Expected return</th><th>Status</th><th></th></tr>
      ${rows.map((a) => `
        <tr>
          <td>${esc(a.asset_name)}</td>
          <td>${esc(a.asset_tag ?? a.cloud_resource_id ?? '—')}</td>
          <td>${esc(a.issue_date ?? '')}</td>
          <td>${esc(a.expected_return_date ?? '—')}</td>
          <td>${statusChip(a.status)}</td>
          <td class="btnrow">
            ${a.status === 'Issued' ? `<button class="primary small" data-accept="${a.id}">Confirm receipt</button>` : ''}
            ${['Issued', 'Accepted'].includes(a.status) ? `
              <button class="ghost small" data-return="${a.id}">Return</button>
              <button class="danger small" data-report="${a.id}">Report issue</button>` : ''}
          </td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty">Nothing allocated to you right now.</td></tr>'}
    </table></div>`;

  main.querySelectorAll('[data-accept]').forEach((b) => {
    b.onclick = async () => {
      try { await api('POST', `/api/allocations/${b.dataset.accept}/accept`); toast('Handover acknowledged'); render(); }
      catch (e) { toast(e.message, true); }
    };
  });
  main.querySelectorAll('[data-return]').forEach((b) => {
    b.onclick = () => openDialog('Return asset', `
      ${field('Reason', select('reason', state.meta.return_reasons))}
      ${field('Notes (optional)', '<textarea name="notes"></textarea>')}
    `, async (data) => {
      await api('POST', `/api/allocations/${b.dataset.return}/request-return`, data);
      toast('Return requested — IT will confirm collection');
      render();
    }, 'Request return');
  });
  main.querySelectorAll('[data-report]').forEach((b) => {
    b.onclick = () => openDialog('Report damaged or lost asset', `
      ${field('What happened?', select('type', ['damaged', 'lost']))}
      ${field('Details', '<textarea name="notes" required></textarea>')}
    `, async (data) => {
      await api('POST', `/api/allocations/${b.dataset.report}/report`, data);
      toast('Reported — IT has been notified');
      render();
    }, 'Report');
  });
}

// ---------------- Approvals (section 4.2) ----------------

async function viewApprovals(main) {
  const rows = await api('GET', '/api/requests?scope=approvals');
  main.innerHTML = `
    <h2>Requests pending your approval</h2>
    <div class="tablewrap"><table>
      <tr><th>Request</th><th>Requester</th><th>Item</th><th>Justification</th><th>Urgency</th><th>Cost implication</th><th>Stage</th><th></th></tr>
      ${rows.map((r) => `
        <tr>
          <td>${esc(r.request_no)}</td>
          <td>${esc(r.user_name)}</td>
          <td>${esc(r.catalog_name)}${r.environment ? `<br><small class="hint">${esc(r.environment)}${r.project ? ' · ' + esc(r.project) : ''}</small>` : ''}</td>
          <td><small>${esc(r.justification ?? '—')}</small></td>
          <td>${urgencyChip(r.urgency)}</td>
          <td>${r.est_monthly_cost ? `₹${r.est_monthly_cost}/mo` : r.monthly_cost ? `₹${r.monthly_cost}/mo` : r.unit_cost ? `₹${r.unit_cost}` : '—'}</td>
          <td>${statusChip(r.status)}</td>
          <td class="btnrow">
            <button class="primary small" data-approve="${r.id}">Approve</button>
            <button class="ghost small" data-askinfo="${r.id}">Ask info</button>
            <button class="danger small" data-reject="${r.id}">Reject</button>
          </td>
        </tr>`).join('') || '<tr><td colspan="8" class="empty">Nothing waiting for you. 🎉</td></tr>'}
    </table></div>`;

  main.querySelectorAll('[data-approve]').forEach((b) => {
    b.onclick = () => openDialog('Approve request', `
      ${field('Comment (optional)', '<textarea name="comment"></textarea>')}
      ${field('Adjust urgency (optional)', select('urgency', ['(keep)', ...state.meta.urgency_levels], '(keep)'))}
    `, async (data) => {
      if (data.urgency === '(keep)') delete data.urgency;
      await api('POST', `/api/requests/${b.dataset.approve}/approve`, data);
      toast('Approved');
      render();
    }, 'Approve');
  });
  main.querySelectorAll('[data-reject]').forEach((b) => {
    b.onclick = () => openDialog('Reject request', field('Reason', '<textarea name="comment" required></textarea>'),
      async (data) => { await api('POST', `/api/requests/${b.dataset.reject}/reject`, data); toast('Rejected'); render(); }, 'Reject');
  });
  main.querySelectorAll('[data-askinfo]').forEach((b) => {
    b.onclick = () => openDialog('Ask for more information', field('What do you need to know?', '<textarea name="comment" required></textarea>'),
      async (data) => { await api('POST', `/api/requests/${b.dataset.askinfo}/request-info`, data); toast('Question sent'); render(); }, 'Send');
  });
}

// ---------------- Fulfilment & Returns (sections 6.3, 6.4) ----------------

async function viewFulfilment(main) {
  const [queue, returns] = await Promise.all([
    api('GET', '/api/requests?scope=fulfilment'),
    api('GET', '/api/returns'),
  ]);
  main.innerHTML = `
    <h2>Fulfilment queue</h2>
    <p class="hint">Approved requests, most urgent first. Allocate an instance, license seat, or provision the cloud resource.</p>
    <div class="tablewrap"><table>
      <tr><th>Request</th><th>Requester</th><th>Item</th><th>Urgency</th><th>Required by</th><th></th></tr>
      ${queue.map((r) => `
        <tr>
          <td>${esc(r.request_no)}</td><td>${esc(r.user_name)}</td>
          <td>${esc(r.catalog_name)}${r.project ? `<br><small class="hint">${esc(r.project)}</small>` : ''}</td>
          <td>${urgencyChip(r.urgency)}</td><td>${esc(r.required_date ?? '—')}</td>
          <td><button class="primary small" data-allocate="${r.id}" data-cat="${esc(r.category)}">Allocate</button></td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty">No approved requests waiting.</td></tr>'}
    </table></div>

    <h2>Returns to process</h2>
    <div class="tablewrap"><table>
      <tr><th>Asset</th><th>Tag / Resource</th><th>User</th><th>Reason</th><th>Requested</th><th></th></tr>
      ${returns.map((r) => `
        <tr>
          <td>${esc(r.asset_name)}</td><td>${esc(r.asset_tag ?? r.cloud_resource_id ?? '—')}</td>
          <td>${esc(r.user_name)}</td><td>${esc(r.return_reason ?? '')}</td>
          <td>${esc((r.return_requested_at ?? '').slice(0, 10))}</td>
          <td><button class="primary small" data-receive="${r.id}" data-cat="${esc(r.category)}">Receive return</button></td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty">No pending returns.</td></tr>'}
    </table></div>`;

  main.querySelectorAll('[data-allocate]').forEach((b) => {
    b.onclick = () => allocateDialog(Number(b.dataset.allocate), b.dataset.cat);
  });
  main.querySelectorAll('[data-receive]').forEach((b) => {
    b.onclick = () => receiveReturnDialog(Number(b.dataset.receive), b.dataset.cat);
  });
}

async function allocateDialog(requestId, category) {
  if (category === 'cloud') {
    openDialog('Provision cloud asset', `
      ${field('Cloud resource ID', input('cloud_resource_id', { required: true, placeholder: 'e.g. i-0abc123' }))}
      <p class="hint" style="margin:0">Cost allocation tags are mandatory (FinOps).</p>
      <div class="grid2">
        ${field('Tag: department', input('t_department', { required: true }))}
        ${field('Tag: project', input('t_project', { required: true }))}
        ${field('Tag: application', input('t_application', { required: true }))}
        ${field('Tag: owner', input('t_owner', { required: true }))}
        ${field('Tag: cost center', input('t_cost_center', { required: true }))}
        ${field('Region', input('region'))}
      </div>
      <div class="grid2">
        ${field('Review date', input('review_date', { type: 'date' }))}
        ${field('Decommission date', input('decommission_date', { type: 'date' }))}
      </div>
    `, async (d) => {
      await api('POST', `/api/requests/${requestId}/allocate`, {
        cloud_resource_id: d.cloud_resource_id,
        cloud_tags: { department: d.t_department, project: d.t_project, application: d.t_application, owner: d.t_owner, cost_center: d.t_cost_center },
        region: d.region || undefined,
        review_date: d.review_date || undefined,
        decommission_date: d.decommission_date || undefined,
      });
      toast('Cloud asset provisioned and recorded');
      render();
    }, 'Provision');
    return;
  }

  const instances = await api('GET', `/api/requests/${requestId}/available-instances`);
  const instField = instances.length
    ? field('Asset instance', `<select name="instance_id">${instances.map((i) =>
        `<option value="${i.id}">${esc(i.asset_tag ?? 'Instance ' + i.id)}${i.serial_number ? ' · ' + esc(i.serial_number) : ''} (${esc(i.status)})</option>`).join('')}</select>`)
    : '<p class="hint">No physical instances — a license seat / access will be assigned.</p>';

  openDialog('Allocate asset', `
    ${instField}
    <div class="grid2">
      ${field('Date of issue', input('issue_date', { type: 'date', value: new Date().toISOString().slice(0, 10) }))}
      ${field('Location', input('location'))}
      ${field('Condition at issue', input('condition_at_issue', { value: 'Good' }))}
      ${field('Expected return date (if temporary)', input('expected_return_date', { type: 'date' }))}
    </div>
    ${field('Accessories issued', input('accessories', { placeholder: 'e.g. charger, bag' }))}
  `, async (d) => {
    const body = { ...d };
    if (body.instance_id) body.instance_id = Number(body.instance_id);
    for (const k of Object.keys(body)) if (body[k] === '') delete body[k];
    await api('POST', `/api/requests/${requestId}/allocate`, body);
    toast('Allocated — user asked to confirm receipt');
    render();
  }, 'Allocate');
}

function receiveReturnDialog(allocationId, category) {
  const outcomes = category === 'cloud'
    ? ['Cloud Decommissioned']
    : ['Available for Reuse', 'Under Repair', 'Retired', 'Lost', 'Damaged'];
  openDialog('Receive returned asset', `
    <div class="grid2">
      ${field('Date returned', input('return_date', { type: 'date', value: new Date().toISOString().slice(0, 10) }))}
      ${field('Returned condition', input('returned_condition', { value: 'Good' }))}
    </div>
    ${field('Missing accessories', input('missing_accessories'))}
    ${field('Damage notes', '<textarea name="damage_notes"></textarea>')}
    <label class="check"><input type="checkbox" name="data_wipe_required"> Data wipe required</label>
    <label class="check"><input type="checkbox" name="license_revoked"> License / access revoked</label>
    ${field('New asset status', select('new_status', outcomes))}
  `, async (d) => {
    await api('POST', `/api/allocations/${allocationId}/return`, d);
    toast('Return processed');
    render();
  }, 'Complete return');
}

// ---------------- Asset Master (section 6.1) ----------------

async function viewAssets(main) {
  const assets = await api('GET', '/api/assets');
  const cats = state.meta.categories;
  main.innerHTML = `
    <h2>Asset master</h2>
    <p class="hint">The Asset Master defines the item · Inventory tracks instances · the Catalog controls what users can request.</p>
    <div class="btnrow" style="margin-bottom:1rem">
      <button class="primary" id="new-asset">+ New asset</button>
    </div>
    <div class="tablewrap"><table>
      <tr><th>Asset</th><th>Category</th><th>Status</th><th>Approval chain</th><th>Stock</th><th>Licenses</th><th>Vendor / cost</th><th></th></tr>
      ${assets.map((a) => `
        <tr>
          <td>${esc(a.name)}${a.requestable ? ' <span class="chip ok">requestable</span>' : ''}</td>
          <td>${esc(cats[a.category] ?? a.category)}</td>
          <td>${statusChip(a.lifecycle_status)}</td>
          <td>${a.approval_stages.length ? a.approval_stages.map(esc).join(' → ') : '<small class="hint">none</small>'}</td>
          <td>${a.stock ? `${a.stock.available}/${a.stock.total}` : '—'}</td>
          <td>${a.licenses ? `${a.licenses.available}/${a.licenses.total} free` : '—'}</td>
          <td>${esc(a.vendor ?? '')}${a.unit_cost ? ` · ₹${a.unit_cost}` : ''}${a.monthly_cost ? ` · ₹${a.monthly_cost}/mo` : ''}</td>
          <td class="btnrow">
            <button class="ghost small" data-instance="${a.id}">+ Instance</button>
            <button class="ghost small" data-catalogize="${a.id}">+ Catalog</button>
            <button class="ghost small" data-lifecycle="${a.id}">Status</button>
          </td>
        </tr>`).join('')}
    </table></div>`;

  $('#new-asset').onclick = () => {
    openDialog('Create asset', `
      ${field('Name', input('name', { required: true }))}
      <div class="grid2">
        ${field('Category', `<select name="category">${Object.entries(cats).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>`)}
        ${field('Subcategory', input('subcategory', { placeholder: 'e.g. Laptop' }))}
        ${field('Vendor', input('vendor'))}
        ${field('Unit cost', input('unit_cost', { type: 'number', min: 0 }))}
        ${field('Monthly cost', input('monthly_cost', { type: 'number', min: 0 }))}
        ${field('Lifecycle status', select('lifecycle_status', state.meta.asset_statuses, 'In Stock'))}
      </div>
      ${field('Description', '<textarea name="description"></textarea>')}
      <label class="check"><input type="checkbox" name="requestable" checked> Requestable by users</label>
      <label class="check"><input type="checkbox" name="track_stock"> Track physical stock (instances)</label>
      <label class="check"><input type="checkbox" name="track_license"> Track license seats</label>
      <div class="grid2">
        ${field('License type', input('license_type'))}
        ${field('License count', input('license_count', { type: 'number', min: 0 }))}
        ${field('License expiry', input('license_expiry', { type: 'date' }))}
        ${field('Renewal date', input('renewal_date', { type: 'date' }))}
        ${field('Cloud provider', input('cloud_provider', { placeholder: 'AWS / Azure / GCP' }))}
        ${field('Region', input('region'))}
      </div>
      <p class="hint" style="margin:0">Approval chain (runs in this order):</p>
      <div class="btnrow">
        ${state.meta.approval_stages.map((s) => `<label class="check"><input type="checkbox" name="st_${s}"> ${esc(s)}</label>`).join('')}
      </div>
    `, async (d) => {
      const body = { ...d, approval_stages: state.meta.approval_stages.filter((s) => d[`st_${s}`]) };
      for (const n of ['unit_cost', 'monthly_cost', 'license_count']) {
        if (body[n] === '') delete body[n]; else if (body[n] != null) body[n] = Number(body[n]);
      }
      for (const k of Object.keys(body)) if (body[k] === '') delete body[k];
      await api('POST', '/api/assets', body);
      toast('Asset created');
      render();
    }, 'Create');
  };

  main.querySelectorAll('[data-instance]').forEach((b) => {
    b.onclick = () => openDialog('Add inventory instance', `
      <div class="grid2">
        ${field('Asset tag', input('asset_tag', { placeholder: 'TT-LT-0004' }))}
        ${field('Serial number', input('serial_number'))}
        ${field('Status', select('status', state.meta.asset_statuses, 'In Stock'))}
        ${field('Location', input('location', { value: 'HQ Store' }))}
        ${field('PO reference', input('po_reference'))}
        ${field('Invoice reference', input('invoice_reference'))}
        ${field('Purchase date', input('purchase_date', { type: 'date' }))}
        ${field('Purchase cost', input('purchase_cost', { type: 'number', min: 0 }))}
        ${field('Warranty end', input('warranty_end', { type: 'date' }))}
      </div>
    `, async (d) => {
      if (d.purchase_cost === '') delete d.purchase_cost; else if (d.purchase_cost != null) d.purchase_cost = Number(d.purchase_cost);
      for (const k of Object.keys(d)) if (d[k] === '') delete d[k];
      await api('POST', `/api/assets/${b.dataset.instance}/instances`, d);
      toast('Instance added to inventory');
      render();
    }, 'Add');
  });

  main.querySelectorAll('[data-catalogize]').forEach((b) => {
    const asset = assets.find((a) => a.id === Number(b.dataset.catalogize));
    b.onclick = () => openDialog('Publish to approved catalog', `
      ${field('Catalog item name', input('name', { value: asset.name, required: true }))}
      ${field('Short description', `<textarea name="description">${esc(asset.description ?? '')}</textarea>`)}
      <div class="grid2">
        ${field('Standard issue time (days)', input('standard_issue_days', { type: 'number', min: 0, value: 2 }))}
        ${field('Cost indicator', input('cost_indicator', { placeholder: '₹ / ₹₹ / Monthly cost applies' }))}
        ${field('Allocation type', select('allocation_type', ['permanent', 'temporary']))}
        ${field('Max duration (days)', input('max_duration_days', { type: 'number', min: 1 }))}
      </div>
      ${field('Usage policy', '<textarea name="usage_policy"></textarea>')}
      <label class="check"><input type="checkbox" name="requires_justification" checked> Justification required</label>
      <label class="check"><input type="checkbox" name="requires_return"> Return required</label>
    `, async (d) => {
      const body = { asset_id: asset.id, ...d };
      for (const n of ['standard_issue_days', 'max_duration_days']) {
        if (body[n] === '') delete body[n]; else if (body[n] != null) body[n] = Number(body[n]);
      }
      for (const k of Object.keys(body)) if (body[k] === '') delete body[k];
      await api('POST', '/api/catalog', body);
      toast('Published to catalog');
      render();
    }, 'Publish');
  });

  main.querySelectorAll('[data-lifecycle]').forEach((b) => {
    const asset = assets.find((a) => a.id === Number(b.dataset.lifecycle));
    b.onclick = () => openDialog(`Lifecycle status — ${asset.name}`, `
      ${field('New status', select('lifecycle_status', state.meta.asset_statuses, asset.lifecycle_status))}
    `, async (d) => {
      await api('PATCH', `/api/assets/${asset.id}`, d);
      toast('Status updated');
      render();
    }, 'Update');
  });
}

// ---------------- Inventory ----------------

async function viewInventory(main) {
  const assets = await api('GET', '/api/assets');
  const details = await Promise.all(assets.filter((a) => a.track_stock || a.category === 'cloud').map((a) => api('GET', `/api/assets/${a.id}`)));
  const rows = details.flatMap((a) => a.instances.map((i) => ({ ...i, asset_name: a.name, category: a.category })));
  main.innerHTML = `
    <h2>Inventory</h2>
    <div class="tablewrap"><table>
      <tr><th>Asset</th><th>Tag / Resource</th><th>Serial</th><th>Status</th><th>Condition</th><th>Location</th><th>Allocated to</th><th>Warranty end</th><th></th></tr>
      ${rows.map((i) => `
        <tr>
          <td>${esc(i.asset_name)}</td>
          <td>${esc(i.asset_tag ?? i.cloud_resource_id ?? '—')}</td>
          <td>${esc(i.serial_number ?? '')}</td>
          <td>${statusChip(i.status)}</td>
          <td>${esc(i.condition ?? '')}</td>
          <td>${esc(i.location ?? '')}</td>
          <td>${esc(i.allocated_to_name ?? '—')}</td>
          <td>${esc(i.warranty_end ?? '—')}</td>
          <td><button class="ghost small" data-edit="${i.id}" data-status="${esc(i.status)}">Update</button></td>
        </tr>`).join('') || '<tr><td colspan="9" class="empty">No inventory instances yet.</td></tr>'}
    </table></div>`;

  main.querySelectorAll('[data-edit]').forEach((b) => {
    b.onclick = () => openDialog('Update instance', `
      ${field('Status', select('status', state.meta.asset_statuses, b.dataset.status))}
      ${field('Condition', input('condition'))}
      ${field('Location', input('location'))}
      ${field('Notes (e.g. support ticket ref)', '<textarea name="notes"></textarea>')}
    `, async (d) => {
      for (const k of Object.keys(d)) if (d[k] === '') delete d[k];
      await api('PATCH', `/api/instances/${b.dataset.edit}`, d);
      toast('Instance updated');
      render();
    }, 'Update');
  });
}

// ---------------- Reports ----------------

async function viewReports(main) {
  const [inv, lic, ren, cloud] = await Promise.all([
    api('GET', '/api/reports/inventory'),
    api('GET', '/api/reports/licenses'),
    api('GET', '/api/reports/renewals?days=365'),
    api('GET', '/api/reports/cloud'),
  ]);
  const finance = ['finance', 'it_asset_admin', 'admin'].includes(state.user.role)
    ? await api('GET', '/api/reports/finance') : null;

  main.innerHTML = `
    <h2>Reports</h2>
    <div class="stat-row">
      ${inv.by_status.map((s) => `<div class="stat"><div class="v">${s.count}</div><div class="k">${esc(s.status)}</div></div>`).join('')}
      <div class="stat"><div class="v">₹${Math.round(cloud.total_active_monthly_cost)}</div><div class="k">Cloud spend / month</div></div>
    </div>

    <h3>License compliance</h3>
    <div class="tablewrap"><table>
      <tr><th>Software</th><th>Vendor</th><th>Type</th><th>Seats</th><th>In use</th><th>Free</th><th>Expiry</th><th>Renewal</th><th>Position</th></tr>
      ${lic.map((l) => `
        <tr>
          <td>${esc(l.name)}<br><small class="hint">${l.assigned_users.map((a) => esc(a.name)).join(', ') || 'no users'}</small></td>
          <td>${esc(l.vendor ?? '')}</td><td>${esc(l.license_type ?? '')}</td>
          <td>${l.total}</td><td>${l.used}</td><td>${l.available}</td>
          <td>${esc(l.license_expiry ?? '—')}</td><td>${esc(l.renewal_date ?? '—')}</td>
          <td>${statusChip(l.compliance)}</td>
        </tr>`).join('') || '<tr><td colspan="9" class="empty">No license-tracked assets.</td></tr>'}
    </table></div>

    <h3>Due in the next 12 months</h3>
    <div class="tablewrap"><table>
      <tr><th>Type</th><th>Item</th><th>Due date</th></tr>
      ${[
        ...ren.licenses.map((l) => ['License renewal', l.name, l.renewal_date ?? l.license_expiry]),
        ...ren.warranties.map((w) => ['Warranty end', `${w.asset_name} (${w.asset_tag ?? ''})`, w.warranty_end]),
        ...ren.returns_due.map((r) => ['Return due', `${r.asset_name} — ${r.user_name}`, r.expected_return_date]),
        ...ren.cloud_reviews.map((c) => ['Cloud review / decommission', `${c.asset_name} (${c.cloud_resource_id ?? ''})`, c.review_date ?? c.decommission_date]),
      ].sort((a, b2) => String(a[2]).localeCompare(String(b2[2])))
        .map(([t, n, d]) => `<tr><td>${esc(t)}</td><td>${esc(n)}</td><td>${esc(d ?? '')}</td></tr>`).join('')
        || '<tr><td colspan="3" class="empty">Nothing due.</td></tr>'}
    </table></div>

    <h3>Cloud cost allocation (monthly, by tag)</h3>
    <div class="tablewrap"><table>
      <tr><th>Cost center</th><th>₹ / month</th><th>Project</th><th>₹ / month</th><th>Department</th><th>₹ / month</th></tr>
      ${(() => {
        const cc = Object.entries(cloud.monthly_cost_by_cost_center);
        const pj = Object.entries(cloud.monthly_cost_by_project);
        const dp = Object.entries(cloud.monthly_cost_by_department);
        const n = Math.max(cc.length, pj.length, dp.length, 1);
        let out = '';
        for (let i = 0; i < n; i++) {
          out += `<tr>
            <td>${esc(cc[i]?.[0] ?? '')}</td><td>${cc[i] ? Math.round(cc[i][1]) : ''}</td>
            <td>${esc(pj[i]?.[0] ?? '')}</td><td>${pj[i] ? Math.round(pj[i][1]) : ''}</td>
            <td>${esc(dp[i]?.[0] ?? '')}</td><td>${dp[i] ? Math.round(dp[i][1]) : ''}</td>
          </tr>`;
        }
        return out;
      })()}
    </table></div>

    ${finance ? `
      <h3>Purchases (PO / invoice)</h3>
      <div class="tablewrap"><table>
        <tr><th>Asset</th><th>Vendor</th><th>Tag</th><th>PO</th><th>Invoice</th><th>Date</th><th>Cost</th><th>Warranty</th></tr>
        ${finance.purchases.map((p) => `
          <tr><td>${esc(p.asset_name)}</td><td>${esc(p.vendor ?? '')}</td><td>${esc(p.asset_tag ?? '')}</td>
          <td>${esc(p.po_reference ?? '')}</td><td>${esc(p.invoice_reference ?? '')}</td>
          <td>${esc(p.purchase_date ?? '')}</td><td>${p.purchase_cost ? '₹' + p.purchase_cost : ''}</td>
          <td>${esc(p.warranty_end ?? '')}</td></tr>`).join('')}
      </table></div>` : ''}
  `;
}

// ---------------- Audit ----------------

async function viewAudit(main) {
  const rows = await api('GET', '/api/audit?limit=300');
  main.innerHTML = `
    <h2>Audit trail</h2>
    <p class="hint">Append-only log of every significant action, newest first.</p>
    <div class="tablewrap"><table>
      <tr><th>When</th><th>Action</th><th>Entity</th><th>Actor</th><th>Details</th></tr>
      ${rows.map((a) => `
        <tr>
          <td><small>${esc(a.created_at)}</small></td>
          <td><span class="chip info">${esc(a.action)}</span></td>
          <td>${esc(a.entity_type)} #${a.entity_id ?? ''}</td>
          <td>${esc(a.actor_name ?? 'system')}</td>
          <td>${a.details ? `<details class="audit-details"><summary>view</summary><pre>${esc(JSON.stringify(JSON.parse(a.details), null, 2))}</pre></details>` : ''}</td>
        </tr>`).join('')}
    </table></div>`;
}

// ---------------- Boot ----------------

const VIEWS = {
  catalog: viewCatalog,
  'my-requests': viewMyRequests,
  'my-assets': viewMyAssets,
  approvals: viewApprovals,
  fulfilment: viewFulfilment,
  assets: viewAssets,
  inventory: viewInventory,
  reports: viewReports,
  audit: viewAudit,
};

async function render() {
  renderNav();
  const main = $('#main');
  main.innerHTML = '<p class="hint">Loading…</p>';
  try {
    await VIEWS[state.tab](main);
  } catch (err) {
    main.innerHTML = `<div class="empty">${esc(err.message)}</div>`;
  }
}

async function boot() {
  // A first unauthenticated meta call gives us nothing user-specific but
  // confirms the API is up; then load the user directory via a seeded admin.
  const saved = Number(localStorage.getItem('tricktrack-user')) || 7; // Ravi (end user)
  state.user = { id: saved };
  try {
    state.meta = await api('GET', '/api/meta');
    state.users = await api('GET', '/api/users');
  } catch {
    $('#main').innerHTML = '<div class="empty">API not reachable, or database not seeded. Run <code>npm run seed</code> and restart.</div>';
    return;
  }
  state.user = state.users.find((u) => u.id === saved) ?? state.users[0];
  state.meta = await api('GET', '/api/meta'); // refresh with role context

  const sw = $('#user-switch');
  sw.innerHTML = state.users
    .map((u) => `<option value="${u.id}" ${u.id === state.user.id ? 'selected' : ''}>${esc(u.name)} — ${esc(u.role)}</option>`)
    .join('');
  sw.onchange = async () => {
    state.user = state.users.find((u) => u.id === Number(sw.value));
    localStorage.setItem('tricktrack-user', String(state.user.id));
    state.tab = 'catalog';
    render();
  };
  render();
}

boot();
