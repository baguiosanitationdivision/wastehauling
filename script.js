  // ── Replace with the Apps Script Web App URL ──
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx3WRKwgSg4QeJmn1pTqoqxN8pC0pdxy6HWLyWmRimvEVi3e_49e7YBRwKa5X2GQ7w0Zg/exec";

  const sessionLog = [];

  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
  });

  function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = type;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = ''; }, 5000);
  }

  function clearForm() {
    document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('inspector').value = '';
    document.getElementById('inspection').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('dhc').value = '';
  }

  function renderLog() {
    const list = document.getElementById('logList');
    if (!sessionLog.length) {
      list.innerHTML = '<p class="log-empty">No entries submitted yet.</p>';
      return;
    }
    list.innerHTML = sessionLog.slice().reverse().map(l => {
      if (l.error) return `<div class="log-entry"><span class="log-err">&#x26A0; ${l.error}</span></div>`;
      return `
        <div class="log-entry">
          <span class="log-date">${l.date}</span>
          <span class="log-desc">${l.inspector} &mdash; ${l.dhc}</span>
          <span class="log-kg">${parseFloat(l.weight).toFixed(2)} kg</span>
        </div>`;
    }).join('');
  }

  async function submitEntry() {
    const url    = SCRIPT_URL;
    const date   = document.getElementById('entryDate').value;
    const insp   = document.getElementById('inspector').value.trim();
    const treat  = document.getElementById('inspection').value;
    const weight = document.getElementById('weight').value;
    const dhc    = document.getElementById('dhc').value.trim();

    if (!date)   { showToast('⚠ Date is required.', 'error'); return; }
    if (!insp)   { showToast('⚠ Inspector name is required.', 'error'); return; }
    if (!treat)  { showToast('⚠ Inspection and treatment is required.', 'error'); return; }
    if (!weight) { showToast('⚠ Weight is required.', 'error'); return; }
    if (!dhc)    { showToast('⚠ District health center is required.', 'error'); return; }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" stroke-width="1.6" stroke-dasharray="10 28" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.7s" repeatCount="indefinite"/></circle></svg> Submitting…';

    const payload = {
      date:       date,
      inspector:  insp,
      inspection: treat,
      weight:     parseFloat(weight),
      dhc:        dhc
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      // no-cors means we won't get a readable response — assume success
      showToast('✓ Entry submitted to Google Sheets!', 'success');
      sessionLog.push(payload);
      renderLog();
      clearForm();
    } catch (e) {
      showToast('✗ Network error: ' + e.message, 'error');
      sessionLog.push({ error: e.message });
      renderLog();
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Submit to Sheet';
    }
  }