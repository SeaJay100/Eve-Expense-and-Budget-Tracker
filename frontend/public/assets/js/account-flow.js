(() => {
    const dialog = document.getElementById('dialog');
    if (!dialog) return;

    const accounts = () => state.accounts || [];
    const activeAccounts = () => accounts().filter(account => !account.archived);
    const transactions = () => state.transactions || [];
    const accountById = id => accounts().find(account => String(account.id) === String(id));
    function accountGlyph(account) {
        if (account.icon) return account.icon;
        if (/wallet/i.test(account.type)) return '◉';
        if (/cash/i.test(account.type)) return '₱';
        if (/credit/i.test(account.type)) return '▣';
        if (/bank/i.test(account.type)) return '▤';
        return '+';
    }

    function isLiability(account) {
        return account.classification === 'liability' || /credit|liabil|debt|loan/i.test(account.type || '');
    }

    function currentBalance(account) {
        return Number(balance(account) || 0);
    }

    function show(html) {
        dialog.innerHTML = html;
        presentDialog();
    }

    const banks = {
        debit: ['BPI', 'BDO', 'Metrobank', 'UnionBank', 'LandBank', 'PNB', 'Security Bank'],
        credit: ['BPI', 'BDO', 'Metrobank', 'UnionBank', 'Security Bank', 'RCBC'],
    };

    function accountPicker() {
        const groups = {
            Debit: [
                ['Debit Cards', '▣', 'debit-cards'],
                ['Cash', '₱', 'cash'],
                ['GCash', GCASH_ICON, 'gcash'],
                ['Other Debit Account', '+', 'other-debit']
            ],
            Credit: [['Credit Cards', '▤', 'credit-cards'], ['Other Credit Account', '+', 'other-credit']]
        };
        const choices = Object.entries(groups).map(([label, options]) => `
            <h3 class="account-group">${label}</h3><div class="account-options">
                ${options.map(([name, glyph, action]) => `
                    <button type="button" class="account-option" data-action="new-account-choice:${action}">
                        <span class="account-option-icon">${glyph}</span><span>${name}</span>
                    </button>`).join('')}
            </div>`).join('');
        show(flowHeader('Add account') + choices);
    }

    function brandPicker(group) {
        const title = group === 'credit' ? 'Credit Cards' : 'Debit Cards';
        const bankButtons = banks[group].map(name => `<button type="button" data-action="account-brand:${esc(name)}:${group}">
            <span class="account-option-icon" aria-hidden="true">${esc(name[0])}</span>
            <span>${esc(name)}</span>
        </button>`).join('');
        const customButton = group === 'debit' ? `<button type="button" data-action="custom-debit-card">
            <span class="account-option-icon">+</span><span>Custom</span>
        </button>` : '';

        show(`${flowHeader(title, 'account-back')}
            <label class="brand-search">Search<input id="brand-search" type="search" placeholder="Find your bank"></label>
            <div class="brand-list">${bankButtons}${customButton}</div>`);
        document.getElementById('brand-search')?.focus({ preventScroll: true });
    }

    function accountForm({ name = '', type, classification = 'asset', icon = '+', back = 'account-back', card = false } = {}) {
        const noteField = card ? `<label>
            Note (optional)<input name="note" maxlength="50" placeholder="e.g. last 4 digits">
        </label>` : '';
        const balanceHint = classification === 'liability' ?
            '<small class="muted">Use a negative amount for money you owe.</small>' : '';

        show(`${flowHeader('Add account', back)}
            <form id="entry" data-kind="account">
                <div class="detail-row">
                    <span>Icon</span><span class="account-option-icon" data-account-form-icon>${esc(icon)}</span>
                </div>
                <label>
                    Account name
                    <input name="name" maxlength="50" required value="${esc(name)}" ${name ? 'readonly' : ''}>
                </label>
                ${noteField}
                <input type="hidden" name="type" value="${esc(type)}">
                <input type="hidden" name="classification" value="${classification}">
                <input type="hidden" name="icon" value="${esc(icon)}">
                <label>
                    Starting balance (PHP)
                    <input name="start" type="number" step="0.01" value="0" required>
                    ${balanceHint}
                </label>
                <div class="form-actions">
                    <button class="primary">Add account</button>
                </div>
            </form>`);
    }

    function accountDetail(id, mode = 'day') {
        const account = accountById(id);
        if (!account) return;
        dialog.dataset.accountId = account.id;
        dialog.dataset.transferTarget = '';
        const value = currentBalance(account);
        const balanceDisplay = viewAmount(value);
        const records = transactions().filter(item => String(item.account) === String(account.id))
            .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id)));
        const shownRecords = mode === 'month'
            ? records.filter(item => item.date.startsWith(today().slice(0, 7)))
            : records;
        const activity = shownRecords.length ? accountHistory(shownRecords, mode, account.id) :
            `<div class="account-activity-empty">
                <p>No activity for this ${mode === 'month' ? 'month' : 'account'} yet.</p>
                ${actionButton('Add transaction', 'account-addtx:' + esc(account.id), 'button button-primary')}
            </div>`;

        show(`<section class="account-detail">
            <div class="account-modal-head">
                <button type="button" data-action="close" aria-label="Close account details">×</button>
                <h2>${esc(account.name)}</h2>
                <button type="button" class="account-edit-link" data-action="account-edit:${esc(account.id)}">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
                    </svg>Edit
                </button>
            </div>
            <div class="account-balance-card">
                <div class="account-balance-name">
                    <span class="account-balance-glyph">${esc(accountGlyph(account))}</span>
                    <div><b>${esc(account.name)}</b><small>${esc(account.note || account.type)}</small></div>
                </div>
                <div class="account-balance-actions">
                    <strong>${balanceDisplay}</strong>
                    <div>
                        <button type="button" class="balance-action add" aria-label="Add transaction"
                            data-action="account-addtx:${esc(account.id)}">+</button>
                        <button type="button" class="balance-action transfer" aria-label="Transfer to another account"
                            data-action="account-transfer:${esc(account.id)}">↔</button>
                    </div>
                </div>
            </div>
            <div class="account-history-head">
                <h2>Transactions</h2>
                <div class="filter-chips">
                    <button type="button" data-action="account-period:day:${esc(account.id)}"
                        aria-pressed="${mode === 'day'}">Day</button>
                    <button type="button" data-action="account-period:month:${esc(account.id)}"
                        aria-pressed="${mode === 'month'}">Month</button>
                </div>
            </div>
            ${activity}
        </section>`);
    }

    function accountHistory(records, mode, accountId) {
        const groups = new Map();
        for (const record of records) {
            const date = String(record.date).slice(0, 10);
            const key = mode === 'month' ? date.slice(0, 7) : date;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(record);
        }
        return '<div class="account-activity">' + [...groups].map(([day, items]) => {
            const incoming = total(items, 'income') + total(items, 'transfer-in') + total(items, 'adjustment-in');
            const outgoing = total(items, 'expense') + total(items, 'transfer-out') + total(items, 'adjustment-out');
            const net = incoming - outgoing;
            const netClass = net > 0 ? 'positive' : net < 0 ? 'negative' : 'muted';
            const netLabel = (net > 0 ? '+' : net < 0 ? '−' : '') + money(Math.abs(net));
            const title = mode === 'month'
                ? new Date(day + '-01T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
                : new Date(day + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: '2-digit' });
            return '<section class="account-day"><div class="account-day-head"><strong>' + title +
                '</strong><span class="' + netClass + '">' + netLabel + '</span></div>' +
                items.map(record => {
                    const isAdjustment = record.type === 'adjustment-in' || record.type === 'adjustment-out';
                    const incomingRecord = record.type === 'income' || record.type === 'transfer-in' || record.type === 'adjustment-in';
                    const isTransfer = String(record.type).startsWith('transfer-');
                    const category = findCategory(record.category);
                    const categoryName = isAdjustment ? 'Balance adjustment' : isTransfer ? 'Transfer' : category?.name || 'Other';
                    const otherAccount = accountById(record.otherAccount);
                    const direction = incomingRecord ? 'Transfer from ' : 'Transfer to ';
                    const description = isAdjustment ? '---' : isTransfer
                        ? direction + (otherAccount?.name || 'another account')
                        : record.description || categoryName;
                    const amount = Number(record.amount);
                    const sourceId = record.type === 'transfer-in' ? record.otherAccount : accountId;
                    const edit = isTransfer ? '<button type="button" class="account-transfer-edit" data-action="transfer-edit:' +
                        esc(sourceId) + ':' + esc(record.recordId) + '" aria-label="Edit transfer">Edit</button>' : '';
                    const badge = isAdjustment
                        ? categoryBadge(null, 'plus')
                        : isTransfer
                        ? '<span class="account-transaction-icon transfer" aria-hidden="true">↔</span>'
                        : categoryBadge(category);
                    return '<div class="account-transaction">' + badge +
                        '<span class="account-transaction-copy"><b>' + esc(categoryName) +
                        '</b><small>' + esc(description) + '</small></span><span class="account-transaction-value ' +
                        (incomingRecord ? 'positive' : 'negative') + '">' + (incomingRecord ? '+' : '−') + money(amount) + '<small>' +
                        new Date(String(record.date).slice(0, 10) +
                        'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: '2-digit' }) + '</small>' + edit + '</span></div>';
                }).join('') + '</section>';
        }).join('') + '</div>';
    }

    function accountEdit(id) {
        const account = accountById(id);
        if (!account) return;
        show(flowHeader('Edit account', 'account-open:' + account.id) +
            '<form id="account-edit-form" data-account-id="' + esc(account.id) + '">' +
            '<label>Account name<input name="name" maxlength="50" required value="' + esc(account.name) + '"></label>' +
            '<label>Current balance (PHP)<input name="currentBalance" type="number" step="0.01" required value="' +
                currentBalance(account) + '"></label>' +
            '<p class="muted">A balance change is recorded as a Balance adjustment transaction.</p>' +
            '<div class="form-actions account-edit-actions"><button type="button" class="danger account-delete-button" data-action="account-delete:' +
                esc(account.id) + '">Delete account</button><button type="button" data-action="account-open:' + esc(account.id) +
                '">Cancel</button><button class="primary">Save changes</button></div></form>');
    }

    function accountDelete(id) {
        const account = accountById(id);
        if (!account) return;

        show(flowHeader('Delete account', 'account-edit:' + account.id) +
            '<p class="account-delete-warning">Deleting ' + esc(account.name) +
            ' removes it from active accounts and net worth. Its transaction history will stay in Eve.</p>' +
            '<div class="form-actions">' + actionButton('Keep account', 'account-edit:' + esc(account.id)) +
            actionButton('Delete account', 'account-delete-confirm:' + esc(account.id), 'danger') + '</div>');
    }

    function transferForm(accountId, record = null) {
        const fromId = record?.type === 'transfer-in' ? record.otherAccount : accountId;
        const from = accountById(fromId);
        if (!from) return;
        const toId = record?.type === 'transfer-in' ? accountId : record?.otherAccount || '';
        dialog.dataset.accountId = from.id;
        dialog.dataset.transferTarget = toId;
        const fromAction = 'account-open:' + from.id;
        const available = activeAccounts().filter(account => String(account.id) !== String(from.id));
        const destination = accountById(toId);
        if (record && destination?.archived) available.unshift(destination);
        if (!available.length) {
            show(flowHeader('Transfer', fromAction) + '<p>Add another account to transfer money.</p><div class="form-actions">' +
                actionButton('Add account', 'account', 'primary') + '</div>');
            return;
        }
        const date = String(record?.date || today()).slice(0, 10);
        const recordAttribute = record?.recordId ? `data-record-id="${esc(record.recordId)}"` : '';
        const title = record ? 'Edit transfer' : 'Transfer';
        const choices = available.map(account => `<button type="button" class="account-option"
            data-action="transfer-target:${esc(account.id)}">
            <span class="account-option-icon">${esc(accountGlyph(account))}</span>
            <span>${esc(account.name)}${account.archived ? ' (archived)' : ''}</span>
            <span class="muted">${viewAmount(currentBalance(account))}</span>
        </button>`).join('');

        show(`${flowHeader(title, fromAction)}
            <form id="transfer-form" data-from="${esc(from.id)}" ${recordAttribute}>
                <div class="transfer-accounts">
                    <div class="transfer-account">
                        <small>From</small>
                        <b><span class="mini-glyph">${esc(accountGlyph(from))}</span>${esc(from.name)}</b>
                    </div>
                    <span class="transfer-arrows">↔</span>
                    <button type="button" class="transfer-to" data-action="transfer-target-open">
                        <small>To</small><b>${esc(destination?.name || 'Select account')}</b>
                    </button>
                </div>
                <input type="hidden" name="to" value="${esc(toId)}">
                <div class="transfer-chooser" hidden>
                    <div class="transfer-chooser-head">
                        <b>Choose an account</b>${actionButton('Back', 'transfer-target-close')}
                    </div>
                    <div class="account-options">${choices}</div>
                </div>
                <label>
                    Amount
                    <input name="amount" type="number" min="0.01" step="0.01" required
                        value="${record ? Number(record.amount) : ''}" placeholder="₱0.00">
                </label>
                <label>Transfer fee<input name="fee" type="number" min="0" step="0.01" value="${Number(record?.fee || 0)}"></label>
                <label>Date<input name="date" type="date" required value="${date}"></label>
                <label>Note (optional)<input name="note" maxlength="120" value="${esc(record?.note || '')}"
                    placeholder="Add a note"></label>
                <div class="form-actions">
                    ${actionButton('Cancel', esc(fromAction))}
                    <button class="primary">${record ? 'Save changes' : 'Confirm transfer'}</button>
                </div>
            </form>`);
    }

    window.openTransfer = (accountId, record) => transferForm(accountId, record);

    function accountCard(account, balance) {
        const liability = isLiability(account) || balance < 0;
        const openingBalance = Number(account.start || 0);
        const activity = balance - openingBalance;
        const activityClass = liability || activity < 0 ? 'negative' : 'positive';
        const activitySign = activity >= 0 ? '+' : '−';

        return `<article class="account-card">
            <div class="account-card-top">
                <span class="account-mark">${esc(accountGlyph(account))}</span>
                <div class="account-ident">
                    <h3>${esc(account.name)}</h3>
                    <span class="muted">${esc(account.type)}</span>
                </div>
                <button type="button" class="account-card-edit" data-action="account-open:${esc(account.id)}"
                    aria-label="Edit ${esc(account.name)} account">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
                    </svg>
                </button>
            </div>
            <p class="account-balance ${balance < 0 ? 'negative' : ''}">${viewAmount(balance)}</p>
            <div class="account-card-foot">
                <span class="muted">Starting ${viewAmount(openingBalance)}</span>
                <span class="${activityClass}">${activitySign}${viewAmount(Math.abs(activity))} activity</span>
            </div>
        </article>`;
    }

    window.accountsPage = function accountsPage() {
        let assetTotal = 0;
        let liabilityTotal = 0;
        let assetCount = 0;
        let liabilityCount = 0;
        const cards = [];
        for (const account of activeAccounts()) {
            const balance = currentBalance(account);
            if (balance > 0 || (balance === 0 && !isLiability(account))) {
                assetTotal += balance;
                assetCount++;
            } else {
                liabilityTotal += Math.abs(balance);
                liabilityCount++;
            }
            cards.push(accountCard(account, balance));
        }
        const currentMonth = today().slice(0, 7);
        const records = state.transactions.filter(record => record.date.startsWith(currentMonth));
        const income = total(records, 'income');
        const expenses = total(records, 'expense');

        return `<section class="page-section accounts-page">
            <div class="grid account-summary">
                <article class="panel metric">
                    <span class="muted">Net worth</span>
                    <strong>${viewAmount(assetTotal - liabilityTotal)}</strong>
                    <span class="muted">Assets minus liabilities</span>
                </article>
                <article class="panel metric">
                    <span class="muted">Assets</span>
                    <strong class="positive">${viewAmount(assetTotal)}</strong>
                    <span class="muted">${assetCount} account${assetCount === 1 ? '' : 's'}</span>
                </article>
                <article class="panel metric">
                    <span class="muted">Liabilities</span>
                    <strong class="negative">${viewAmount(liabilityTotal)}</strong>
                    <span class="muted">${liabilityCount} account${liabilityCount === 1 ? '' : 's'}</span>
                </article>
            </div>
            <div class="section-head accounts-subhead">
                <div>
                    <h2>Your accounts</h2>
                    <p class="muted">Balances include recorded income, expenses, and transfers.</p>
                </div>
            </div>
            <div class="grid account-grid">
                ${cards.join('') || `<div class="panel empty-state">
                    <h3>No accounts yet</h3>
                    <p class="muted">Add Cash, an E-wallet, or a bank account to track your balances.</p>
                    ${actionButton('Add an account', 'account', 'button button-primary')}
                </div>`}
            </div>
            <section class="panel account-month">
                <div class="section-head">
                    <div><h2>This month</h2><p class="muted">Activity across all accounts</p></div>
                </div>
                <div class="grid">
                    <div class="metric">
                        <span class="muted">Income</span><strong class="positive">${viewAmount(income)}</strong>
                    </div>
                    <div class="metric">
                        <span class="muted">Expenses</span><strong class="negative">${viewAmount(expenses)}</strong>
                    </div>
                </div>
            </section>
        </section>`;
    };

    document.addEventListener('click', event => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const handle = () => { event.preventDefault(); event.stopImmediatePropagation(); };

        if (action === 'account' || action === 'first-account') { handle(); accountPicker(); }
        else if (action === 'account-back') { handle(); accountPicker(); }
        else if (action.startsWith('new-account-choice:')) {
            handle();
            const choice = action.slice('new-account-choice:'.length);
            if (choice === 'debit-cards') brandPicker('debit');
            else if (choice === 'credit-cards') brandPicker('credit');
            else {
                const isCash = choice === 'cash';
                const isGCash = choice === 'gcash';
                const isCredit = choice === 'other-credit';
                const preset = {
                    name: isCash ? 'Cash' : isGCash ? 'GCash' : '',
                    type: 'Bank',
                    classification: isCredit ? 'liability' : 'asset',
                    icon: isCash ? '₱' : isGCash ? GCASH_ICON : '+',
                    card: isCash || isGCash
                };
                if (isCash) preset.type = 'Cash';
                if (isGCash) preset.type = 'E-wallet';
                if (isCredit) preset.type = 'Credit card';
                accountForm(preset);
            }
        } else if (action === 'custom-debit-card') {
            handle();
            accountForm({ type: 'Bank', back: 'account-brand-back:debit', card: true });
        } else if (action.startsWith('account-brand:')) {
            handle();
            const [name, group] = action.slice('account-brand:'.length).split(':');
            const isCredit = group === 'credit';
            accountForm({
                name,
                type: isCredit ? 'Credit card' : 'Bank',
                classification: isCredit ? 'liability' : 'asset',
                icon: name[0],
                back: 'account-brand-back:' + group,
                card: true
            });
        } else if (action.startsWith('account-brand-back:')) { handle(); brandPicker(action.slice('account-brand-back:'.length)); }
        else if (action.startsWith('account-open:')) { handle(); accountDetail(action.slice('account-open:'.length)); }
        else if (action.startsWith('account-edit:')) { handle(); accountEdit(action.slice('account-edit:'.length)); }
        else if (action.startsWith('account-delete:')) { handle(); accountDelete(action.slice('account-delete:'.length)); }
        else if (action.startsWith('account-delete-confirm:')) {
            handle();
            const id = action.slice('account-delete-confirm:'.length);
            button.disabled = true;
            persist('/account/' + encodeURIComponent(id), { method: 'DELETE' })
                .then(() => {
                    if (!ready) return;
                    dialog.close();
                    toast('Account deleted.');
                })
                .catch(error => toast(error.message, true))
                .finally(() => { if (button.isConnected) button.disabled = false; });
        }
        else if (action.startsWith('account-addtx:')) {
            handle();
            dialog.close();
            openTransaction();
        } else if (action.startsWith('account-transfer:')) { handle(); transferForm(action.slice('account-transfer:'.length)); }
        else if (action.startsWith('account-period:')) { handle(); const [, mode, id] = action.split(':'); accountDetail(id, mode); }
        else if (action.startsWith('transfer-edit:')) {
            handle();
            const [, accountId, recordId] = action.split(':');
            const record = transactions().find(item => String(item.id) === String(recordId) || String(item.recordId) === String(recordId));
            if (record) window.openTransfer(accountId, record);
        }
        else if (action === 'transfer-target-open') { handle(); dialog.querySelector('.transfer-chooser').hidden = false; }
        else if (action === 'transfer-target-close') { handle(); dialog.querySelector('.transfer-chooser').hidden = true; }
        else if (action.startsWith('transfer-target:')) {
            handle();
            const id = action.slice('transfer-target:'.length);
            const form = dialog.querySelector('#transfer-form');
            const account = accountById(id);
            if (form && account) {
                form.elements.to.value = account.id;
                dialog.querySelector('.transfer-to b').textContent = account.name;
                dialog.querySelector('.transfer-chooser').hidden = true;
            }
        } else if (action === 'toggle-balances') {
            handle();
            hiddenBalances = !hiddenBalances;
            render();
        }
    }, true);

    document.addEventListener('input', event => {
        if (event.target.id === 'brand-search') {
            const query = event.target.value.toLocaleLowerCase();
            dialog.querySelectorAll('.brand-list button[data-action^="account-brand:"]').forEach(button => {
                button.hidden = !button.textContent.toLocaleLowerCase().includes(query);
            });
        }
        if (event.target.matches('#dialog input[name="name"]')) {
            const first = Array.from(event.target.value.trim()).find(character => /[\p{L}\p{N}]/u.test(character)) || '+';
            const icon = dialog.querySelector('[data-account-form-icon]');
            const iconInput = event.target.form.elements.icon;
            if (icon) icon.textContent = first.toLocaleUpperCase();
            if (iconInput) iconInput.value = first.toLocaleUpperCase();
        }
    }, true);

    document.addEventListener('submit', async event => {
        const form = event.target;
        if (!['entry', 'account-edit-form', 'transfer-form'].includes(form.id)) return;
        if (form.id === 'entry' && form.dataset.kind !== 'account') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!form.reportValidity()) return;
        const submit = form.querySelector('[type="submit"],button.primary');
        if (submit) submit.disabled = true;
        try {
            const values = Object.fromEntries(new FormData(form));
            if (form.id === 'entry') {
                const name = String(values.name || '').trim();
                const amount = Number(values.start);
                if (!name || !Number.isFinite(amount)) throw new Error('Enter an account name and valid starting balance.');
                const body = {
                    accName: name,
                    accAmount: amount,
                    accType: values.type,
                    accClass: values.classification,
                    accIcon: values.icon,
                    accNote: String(values.note || '').trim()
                };
                await persist('/account', { method: 'POST', body });
                if (!ready) return;
                dialog.close();
                toast('Account added.');
            } else if (form.id === 'account-edit-form') {
                const account = accountById(form.dataset.accountId);
                const currentBalance = Number(values.currentBalance);
                if (!account || !String(values.name || '').trim() || !Number.isFinite(currentBalance)) throw new Error('Enter an account name and valid balance.');
                await persist('/account/' + encodeURIComponent(account.id), { method: 'PUT', body: { accName: values.name.trim(), currentBalance } });
                if (!ready) return;
                accountDetail(account.id);
                toast('Account updated.', false);
            } else {
                const from = accountById(form.dataset.from);
                const to = accountById(values.to);
                const amount = Number(values.amount);
                const fee = Number(values.fee || 0);
                const validAmount = Number.isFinite(amount) && amount > 0;
                const validFee = Number.isFinite(fee) && fee >= 0;
                if (!from || !to || String(from.id) === String(to.id) || !validAmount || !validFee || !values.date) {
                    throw new Error('Choose another account and enter a valid amount and date.');
                }
                const body = { account: from.id, otherAccount: to.id, amount, fee, date: values.date, description: String(values.note || '').trim() };
                if (form.dataset.recordId) {
                    await persist('/transaction/' + encodeURIComponent(form.dataset.recordId), { method: 'PUT', body });
                    if (!ready) return;
                } else {
                    await persist('/transfer', { method: 'POST', body });
                    if (!ready) return;
                }
                accountDetail(from.id);
                toast(form.dataset.recordId ? 'Transfer updated.' : 'Transfer saved.', false);
            }
        } catch (error) {
            toast(error.message || 'Unable to save this change.', true);
            if (submit) submit.disabled = false;
        }
    }, true);
})();
