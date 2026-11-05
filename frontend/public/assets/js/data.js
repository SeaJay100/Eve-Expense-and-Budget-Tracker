(() => {
    const api = window.EVE_API;
    const state = { accounts: [], categories: [], transactions: [] };
    const accountForm = document.getElementById('account-form');
    const categoryForm = document.getElementById('category-form');
    const transactionForm = document.getElementById('transaction-form') || document.getElementById('editTransaction-form');
    const isEdit = transactionForm?.id === 'editTransaction-form';
    const editId = new URLSearchParams(window.location.search).get('id');
    let initialized = false;
    let loading = false;
    const message = document.createElement('p');
    message.id = 'data-message';
    message.className = 'session-status data-message';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    message.hidden = true;
    document.getElementById('session-status').after(message);

    const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
    const accountName = id => state.accounts.find(item => item._id === id)?.accName || 'Unavailable account';
    const categoryName = id => state.categories.find(item => item._id === id)?.categName || 'Unavailable category';
    const signedAmount = item => (item.type === 'income' ? 1 : -1) * item.amount;
    const balance = account => account.accAmount + state.transactions.filter(item => item.account === account._id).reduce((sum, item) => sum + signedAmount(item), 0);

    function showMessage(text, success = false) {
        message.textContent = text;
        message.dataset.type = success ? 'success' : 'error';
        message.hidden = !text;
    }

    function setBusy(form, busy) {
        if (!form) return;
        form.querySelectorAll('[type="submit"]').forEach(button => { button.disabled = busy; });
        form.setAttribute('aria-busy', String(busy));
    }

    function options(select, records, label) {
        if (!select) return;
        const selected = select.value;
        while (select.options.length > 1) select.remove(1);
        for (const record of records) select.add(new Option(record[label], record._id));
        select.value = selected;
    }

    function card(title, details, amount) {
        const element = document.createElement('article');
        element.className = 'account-card';
        const heading = document.createElement('h3');
        heading.textContent = title;
        const detail = document.createElement('p');
        detail.textContent = details;
        const value = document.createElement('p');
        value.className = 'account-balance';
        value.textContent = money(amount);
        element.append(heading, detail, value);
        return element;
    }

    function renderCards() {
        const accounts = document.getElementById('account-cards');
        if (accounts) {
            accounts.replaceChildren(...state.accounts.map(account => card(account.accName, account.accType, balance(account))));
            if (!state.accounts.length) accounts.textContent = 'No saved accounts yet. Add your first account below.';
        }
        const categories = document.getElementById('category-cards');
        if (categories) {
            categories.replaceChildren(...state.categories.map(category => card(category.categName, `${category.categType} · Budget`, category.categBudget)));
            if (!state.categories.length) categories.textContent = 'No saved categories yet. Add your first category below.';
        }
    }

    function renderTransactions() {
        const body = document.getElementById('transactionTable-body') || document.getElementById('transactionTableBody');
        if (!body) return;
        const hasActions = body.id === 'transactionTable-body';
        const filter = document.getElementById('filter-form');
        const records = state.transactions.filter(item => {
            if (!filter) return true;
            const date = item.date.slice(0, 10);
            return (!filter.elements.account.value || item.account === filter.elements.account.value)
                && (!filter.elements.category.value || item.category === filter.elements.category.value)
                && (!filter.elements.from.value || date >= filter.elements.from.value)
                && (!filter.elements.to.value || date <= filter.elements.to.value);
        });
        body.replaceChildren();
        for (const item of records) {
            const row = document.createElement('tr');
            for (const value of [item.date.slice(0, 10), item.description || '—', categoryName(item.category), accountName(item.account), money(signedAmount(item))]) {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            }
            if (hasActions) {
                const actions = document.createElement('td');
                const edit = document.createElement('a');
                edit.href = `edit-transaction.html?id=${encodeURIComponent(item._id)}`;
                edit.textContent = 'Edit';
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'btn btn-danger';
                remove.textContent = 'Delete';
                remove.addEventListener('click', async () => {
                    if (!window.confirm('Delete this transaction?')) return;
                    remove.disabled = true;
                    try {
                        await api.request(`/transaction/${item._id}`, { method: 'DELETE' });
                        state.transactions = state.transactions.filter(record => record._id !== item._id);
                        renderTransactions();
                        showMessage('Transaction deleted.', true);
                    } catch (error) {
                        showMessage(error.message);
                        remove.disabled = false;
                    }
                });
                actions.append(edit, ' ', remove);
                row.append(actions);
            }
            body.append(row);
        }
        if (!records.length) {
            const cell = document.createElement('td');
            cell.colSpan = hasActions ? 6 : 5;
            cell.textContent = 'No transactions to display.';
            const row = document.createElement('tr');
            row.append(cell);
            body.append(row);
        }
    }

    function renderDashboard() {
        if (!document.getElementById('total-balance')) return;
        const today = new Date();
        const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const monthly = state.transactions.filter(item => item.date.startsWith(month));
        const income = monthly.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
        const expenses = monthly.filter(item => item.type !== 'income').reduce((sum, item) => sum + item.amount, 0);
        for (const [id, amount] of Object.entries({ 'total-balance': state.accounts.reduce((sum, account) => sum + balance(account), 0), 'month-income': income, 'month-expenses': expenses, 'month-net': income - expenses })) {
            document.getElementById(id).textContent = money(amount);
        }
    }

    function onSubmit(form, save) {
        if (!form) return;
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!initialized || form.querySelector('[type="submit"]').disabled || !form.reportValidity()) return;
            setBusy(form, true);
            showMessage('');
            try {
                await save();
            } catch (error) {
                showMessage(error.message);
            } finally {
                setBusy(form, false);
            }
        });
    }

    function nonZeroAmount(raw) {
        const value = Number(raw.replace(/,/g, '').trim());
        if (!Number.isFinite(value) || value === 0) throw new Error('Enter a valid, non-zero amount.');
        return value;
    }

    onSubmit(accountForm, async () => {
        const account = await api.request('/account', { method: 'POST', body: {
            accName: accountForm.elements.name.value.trim(),
            accAmount: nonZeroAmount(accountForm.elements.startingBalance.value),
            accType: accountForm.elements.type.value,
        } });
        state.accounts.push(account);
        renderCards();
        accountForm.reset();
        showMessage('Account saved.', true);
    });

    onSubmit(categoryForm, async () => {
        const category = await api.request('/categories', { method: 'POST', body: {
            categName: categoryForm.elements.categName.value.trim(),
            categType: categoryForm.elements.categType.value,
            categBudget: nonZeroAmount(categoryForm.elements.categBudget.value),
        } });
        state.categories.push(category);
        renderCards();
        categoryForm.reset();
        showMessage('Category saved.', true);
    });

    onSubmit(transactionForm, async () => {
        const fields = transactionForm.elements;
        const body = {
            type: fields.type.value,
            amount: nonZeroAmount(fields.amount.value),
            description: fields.description.value.trim(),
            date: fields.date.value,
            account: fields.account.value,
            category: fields.category.value,
        };
        await api.request(isEdit ? `/transaction/${encodeURIComponent(editId)}` : '/transaction', { method: isEdit ? 'PUT' : 'POST', body });
        window.location.assign('transactions.html');
    });

    document.getElementById('filter-form')?.addEventListener('submit', event => {
        event.preventDefault();
        renderTransactions();
    });

    async function loadPage() {
        if (loading) return;
        loading = true;
        initialized = false;
        document.documentElement.setAttribute('data-session-pending', '');
        message.textContent = 'Loading your saved data...';
        message.dataset.type = 'info';
        message.hidden = false;
        [accountForm, categoryForm, transactionForm].forEach(form => setBusy(form, true));
        try {
            [state.accounts, state.categories, state.transactions] = await Promise.all([
                api.request('/account'), api.request('/categories'), api.request('/transaction'),
            ]);
            renderCards();
            options(document.getElementById('filter-account'), state.accounts, 'accName');
            options(document.getElementById('filter-category'), state.categories, 'categName');
            renderTransactions();
            renderDashboard();
            if (transactionForm) {
                options(transactionForm.elements.account, state.accounts, 'accName');
                options(transactionForm.elements.category, state.categories, 'categName');
                if (isEdit) {
                    if (!editId) throw new Error('Choose a transaction from the Transactions page to edit.');
                    const item = await api.request(`/transaction/${encodeURIComponent(editId)}`);
                    for (const name of ['amount', 'description', 'account', 'category', 'type']) transactionForm.elements[name].value = item[name] ?? '';
                    transactionForm.elements.date.value = item.date.slice(0, 10);
                } else if (!transactionForm.elements.date.value) {
                    const today = new Date();
                    transactionForm.elements.date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                }
                if (!state.accounts.length || !state.categories.length) throw new Error('Add an account and a category using the navigation above before saving a transaction.');
            }
            initialized = true;
            document.documentElement.removeAttribute('data-session-pending');
            showMessage('');
            [accountForm, categoryForm, transactionForm].forEach(form => setBusy(form, false));
        } catch (error) {
            showMessage(error.message);
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'session-retry';
            retry.textContent = 'Try again';
            retry.addEventListener('click', () => { showMessage(''); loadPage(); });
            message.append(' ', retry);
        } finally {
            loading = false;
        }
    }

    [accountForm, categoryForm, transactionForm].forEach(form => setBusy(form, true));
    window.addEventListener('eve:session-ready', loadPage);
    if (window.EVE_SESSION.user) loadPage();
})();
