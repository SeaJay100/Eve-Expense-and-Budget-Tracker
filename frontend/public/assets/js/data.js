const api = window.EVE_API;
const GCASH_ICON = '▣';
const state = { user: null, accounts: [], categories: [], deletedCategories: [], transactions: [] };
const manilaDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit'
});
function today() {
    const parts = Object.fromEntries(manilaDate.formatToParts(new Date()).map(part => [part.type, part.value]));
    return [parts.year, parts.month, parts.day].join('-');
}
let page = 'home';
let selectedDay = today();
let month = selectedDay.slice(0, 7);
let calendarMonth = month;
let hiddenBalances = false;
let filters = {};
let ready = false;
let loading = false;
let returnFocus;

const pesoFormat = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const money = amount => pesoFormat.format(amount);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const cents = amount => Math.round(Number(amount) * 100);
const total = (records, type) => records.filter(record => record.type === type)
    .reduce((sum, record) => sum + cents(record.amount), 0) / 100;
const monthlyTransactions = () => state.transactions.filter(record => record.date.startsWith(month));
const balance = account => (cents(account.start) + state.transactions
    .filter(record => record.account === account.id)
    .reduce((sum, record) => sum + (['income', 'transfer-in', 'adjustment-in'].includes(record.type) ? 1 : -1) * cents(record.amount), 0)) / 100;

function toast(message, error = false) {
    let element = document.querySelector('#toast');
    if (dialog.open) {
        element = dialog.querySelector('.dialog-feedback');
        if (!element) {
            element = document.createElement('p');
            element.className = 'dialog-feedback';
            dialog.append(element);
        }
        element.setAttribute('role', error ? 'alert' : 'status');
        element.classList.toggle('error-feedback', error);
    }
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 3500);
}

function transactionRows(record) {
    const base = { ...record, id: record._id, date: record.date.slice(0, 10) };
    if (record.type === 'adjustment') {
        return [{
            ...base,
            type: record.adjustmentDirection === 'increase' ? 'adjustment-in' : 'adjustment-out',
            category: 'adjustment',
            description: record.description || 'Balance adjustment'
        }];
    }
    if (record.type !== 'transfer') return [base];

    const source = state.accounts.find(account => account.id === record.account);
    const destination = state.accounts.find(account => account.id === record.otherAccount);
    const transfer = { ...base, recordId: base.id, category: 'transfer', note: base.description };
    const rows = [
        {
            ...transfer,
            id: base.id + '-out',
            type: 'transfer-out',
            description: base.description || 'Transfer to ' + (destination?.name || 'account')
        },
        {
            ...transfer,
            id: base.id + '-in',
            type: 'transfer-in',
            account: record.otherAccount,
            otherAccount: record.account,
            description: base.description || 'Transfer from ' + (source?.name || 'account')
        }
    ];
    if (base.fee > 0) {
        const bills = [...state.categories, ...state.deletedCategories]
            .find(category => category.templateKey === 'bills');
        rows.push({
            ...base,
            id: base.id + '-fee',
            recordId: base.id,
            type: 'expense',
            amount: base.fee,
            description: 'Transfer fee',
            category: bills?.id
        });
    }
    return rows;
}

async function loadData() {
    const [accounts, categories, transactions] = await Promise.all([
        api.request('/account'), api.request('/categories?includeDeleted=true'), api.request('/transaction')
    ]);
    state.accounts = accounts.map(account => ({
        id: account._id, name: account.accName, type: account.accType, start: account.accAmount,
        classification: account.accClass,
        icon: account.accName.trim().toLowerCase() === 'gcash' ? GCASH_ICON : account.accIcon,
        note: account.accNote
    }));
    const categoryList = categories.map(category => {
        const template = CATEGORY_TEMPLATES.find(item => item.templateKey === category.templateKey);
        return {
            id: category._id, name: category.categName, type: category.categType.toLowerCase(),
            budget: category.categBudget, templateKey: category.templateKey, deleted: Boolean(category.deletedAt),
            color: template?.color || '#829562', subcategories: category.subcategories || []
        };
    });
    state.categories = categoryList.filter(category => !category.deleted);
    state.deletedCategories = categoryList.filter(category => category.deleted);
    state.transactions = transactions.flatMap(transactionRows);
}

function findCategory(id) {
    return state.categories.find(category => category.id === id) ||
        state.deletedCategories.find(category => category.id === id);
}

function transactionCategories(type, originalCategoryId) {
    const choices = state.categories.filter(category => category.type === type);
    const original = state.deletedCategories.find(category => category.id === originalCategoryId);
    if (original?.type === type) choices.push(original);
    return choices;
}

async function persist(path, options) {
    const result = await api.request(path, options);
    try {
        if (options.body?.recurring) await api.request('/transaction/recurring/sync', { method: 'POST' });
        await loadData();
        render();
    } catch (error) {
        // The mutation succeeded. Closing the form avoids duplicate saves on retry.
        ready = false;
        document.querySelector('#dialog').close();
        showLoadError('Your change was saved. ' + error.message);
    }
    return result;
}

function showStartup() {
    document.documentElement.setAttribute('data-app-loading', '');
    document.getElementById('startup-error').hidden = true;
    document.getElementById('startup-loading').hidden = false;
}

function showLoadError(message, retry = start) {
    document.documentElement.setAttribute('data-app-loading', '');
    document.getElementById('startup-loading').hidden = true;
    document.getElementById('startup-error').hidden = false;
    document.getElementById('startup-message').textContent = message;

    const retryButton = document.getElementById('startup-retry');
    retryButton.onclick = retry;
    retryButton.focus();
}

async function start() {
    if (loading || !window.EVE_SESSION?.user) return;
    loading = true;
    showStartup();
    try {
        state.user = window.EVE_SESSION.user;
        await Promise.all([
            api.request('/categories/defaults', { method: 'POST' }),
            api.request('/transaction/recurring/sync', { method: 'POST' })
        ]);
        await loadData();
        render();
        ready = true;
        document.documentElement.removeAttribute('data-app-loading');

        const entry = document.body.dataset.entry;
        if (entry && !location.hash && !start.openedEntry) {
            start.openedEntry = true;
            const id = new URLSearchParams(location.search).get('id');
            if (entry === 'add') openTransaction();
            else if (state.transactions.some(record => record.id === id)) openTransaction(id);
            else toast('That transaction was not found.');
        }
    } catch (error) {
        ready = false;
        showLoadError(error.message);
    } finally {
        loading = false;
    }
}

window.addEventListener('eve:session-ready', start);
window.addEventListener('hashchange', () => { if (ready) render(); });

const dialog = document.querySelector('#dialog');

function presentDialog() {
    const header = dialog.querySelector('.flow-head, .entry-top, .account-modal-head');
    if (header && !header.nextElementSibling?.classList.contains('dialog-body')) {
        const layout = header.parentElement;
        if (layout !== dialog) layout.classList.add('dialog-layout');

        const body = document.createElement('div');
        body.className = 'dialog-body';
        while (header.nextSibling) body.append(header.nextSibling);
        header.after(body);
    }

    if (!dialog.open) dialog.showModal();
}

dialog.addEventListener('close', () => {
    const action = returnFocus?.dataset.action;
    const target = returnFocus?.isConnected ? returnFocus :
        [...document.querySelectorAll('#app [data-action]')].find(element => element.dataset.action === action);
    (target || document.querySelector('#main'))?.focus({ preventScroll: true });
});
document.querySelector('.skip').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('#main')?.focus();
});

function highlightChoice(form, selector, selected) {
    form.querySelectorAll(selector).forEach(button => {
        button.classList.toggle('selected', button === selected);
        button.setAttribute('aria-pressed', button === selected);
    });
}

function saveButton(button, save) {
    if (button.disabled) return;
    button.disabled = true;
    return Promise.resolve().then(save).catch(error => toast(error.message, true))
        .finally(() => { button.disabled = false; });
}

document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const [action, ...parts] = button.dataset.action.split(':');
    const id = parts.join(':');
    if (button.closest('#app') && !dialog.open) returnFocus = button;

    switch (action) {
        case 'go-home': window.scrollTo(0, 0); break;
        case 'logout': api.logOut(); break;
        case 'cancel':
        case 'close': dialog.close(); break;
        case 'category': openCategoryPicker(); break;
        case 'category-picker-back':
            if (dialog.dataset.categoryOrigin === 'page') dialog.close();
            else openCategoryPicker();
            break;
        case 'custom-category': openCustomCategory(); break;
        case 'quick-category': {
            const template = CATEGORY_TEMPLATES.slice(6)[Number(id)];
            if (!template) break;
            const existing = state.categories.find(category => category.templateKey === template.templateKey);
            openCustomCategory(existing?.name || template.name, 'expense', existing?.id, { template });
            break;
        }
        case 'category-edit': {
            const category = state.categories.find(item => item.id === id);
            if (category) openCustomCategory(category.name, category.type, id, { origin: 'page' });
            break;
        }
        case 'category-delete': {
            const confirmation = button.form.querySelector('.category-delete-confirmation');
            confirmation.hidden = false;
            button.setAttribute('aria-expanded', 'true');
            confirmation.querySelector('button').focus();
            break;
        }
        case 'cancel-category-delete': {
            const trigger = button.form.querySelector('[data-action="category-delete"]');
            button.closest('.category-delete-confirmation').hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
            break;
        }
        case 'confirm-category-delete':
            saveButton(button, async () => {
                await persist('/categories/' + encodeURIComponent(id), { method: 'DELETE' });
                if (dialog.open && dialog.contains(button)) dialog.close();
                if (ready) toast('Category deleted.');
            });
            break;
        case 'add-subcategory': {
            const form = button.form;
            const input = form.querySelector('#subcategory-input');
            const items = categorySubcategoriesFromForm(form);
            const value = input.value.trim();
            if (!value) break;
            if (items.some(item => item.toLowerCase() === value.toLowerCase())) {
                toast('That subcategory is already listed.', true);
            } else {
                setCategorySubcategories(form, [...items, value]);
                input.value = '';
            }
            input.focus();
            break;
        }
        case 'remove-subcategory': {
            const form = button.form;
            const items = categorySubcategoriesFromForm(form);
            items.splice(Number(id), 1);
            setCategorySubcategories(form, items);
            form.querySelector('#subcategory-input').focus();
            break;
        }
        case 'transaction': openTransaction(); break;
        case 'budget-add': openTransaction('', id); break;
        case 'edit': {
            const record = state.transactions.find(item => item.id === id);
            if (!record) break;
            if (record.recordId) {
                const transfer = state.transactions.find(item => item.recordId === record.recordId && item.type === 'transfer-out');
                window.openTransfer?.(transfer.account, transfer);
            } else openTransaction(id);
            break;
        }
        case 'delete': {
            const record = state.transactions.find(item => item.id === id);
            if (!record) break;
            const isRecurring = record.recurring || record.recurringSource;
            const seriesId = record.recurring ? id : record.recurringSource;
            const hasActiveSeries = Boolean(seriesId && state.transactions.some(item =>
                item.id === seriesId && item.recurring
            ));
            const message = record.recordId
                ? 'This removes the transfer from both accounts, including any fee.'
                : record.recurringSource
                    ? hasActiveSeries
                        ? 'Delete this month’s transaction, or stop the monthly series? Past repeats stay saved.'
                        : 'The monthly series has already stopped. You can delete this month’s transaction.'
                    : record.recurring
                        ? 'This removes the original record and stops future repeats. Past repeats stay saved.'
                        : 'This removes the record and updates your balances and budgets.';
            let deleteActions;
            if (record.recordId) {
                deleteActions = actionButton('Delete transaction', 'confirm-delete:' + record.recordId, 'danger');
            } else if (record.recurringSource) {
                deleteActions = actionButton('Delete this month', 'confirm-delete:' + id, 'quiet danger');
                if (hasActiveSeries) {
                    deleteActions += actionButton('Delete monthly recurring', 'confirm-delete-series:' + seriesId, 'danger');
                }
            } else if (record.recurring) {
                deleteActions = actionButton('Delete monthly recurring', 'confirm-delete-series:' + seriesId, 'danger');
            } else {
                deleteActions = actionButton('Delete transaction', 'confirm-delete:' + id, 'danger');
            }
            dialog.innerHTML = '<div class="flow-head"><button type="button" data-action="close" aria-label="Close">×</button>' +
                '<h2>' + (isRecurring ? 'Delete monthly transaction?' : 'Delete transaction?') + '</h2><span></span></div><p>' +
                message + '</p><div class="form-actions' +
                (record.recurringSource && hasActiveSeries ? ' recurring-delete-actions' : '') + '">' +
                actionButton('Keep transaction', 'close') + deleteActions + '</div>';
            presentDialog();
            break;
        }
        case 'confirm-delete':
            saveButton(button, async () => {
                await persist('/transaction/' + encodeURIComponent(id), { method: 'DELETE' });
                if (dialog.open) dialog.close();
                if (ready) toast('Transaction deleted.');
            });
            break;
        case 'confirm-delete-series':
            saveButton(button, async () => {
                await persist('/transaction/' + encodeURIComponent(id) + '/recurring', { method: 'DELETE' });
                if (dialog.open) dialog.close();
                if (ready) toast('Monthly recurring transaction deleted. Past repeats remain saved.');
            });
            break;
        case 'subchip':
        case 'custom-description': {
            const form = button.form;
            const selected = button.getAttribute('aria-pressed') === 'true' ? null : button;
            const custom = selected && action === 'custom-description';
            form.elements.description.value = selected && !custom ? id : '';
            form.elements.customDescription.value = '';
            form.querySelector('.custom-description').hidden = !custom;
            highlightChoice(form, '.subchip', selected);
            if (custom) form.elements.customDescription.focus();
            break;
        }
        case 'category-choice': {
            const form = button.form;
            if (form.elements.category.value === id) break;
            form.elements.category.value = id;
            highlightChoice(form, '.category-choice', button);
            updateTransactionSubchips(form);
            break;
        }
        case 'account-choice':
            button.form.elements.account.value = id;
            highlightChoice(button.form, '.account-choice', button);
            break;
        case 'entry-expense':
        case 'entry-income': {
            const form = button.form;
            const type = action.slice(6);
            if (form.elements.type.value === type) break;
            const original = state.transactions.find(record => record.id === form.dataset.id);
            const choices = transactionCategories(type, original?.category);
            if (!choices.length) {
                toast('Add an ' + type + ' category first.', true);
                break;
            }
            form.elements.category.value = '';
            form.querySelector('.category-choice-grid').innerHTML = transactionCategoryChoices(choices);
            form.elements.type.value = type;
            highlightChoice(form, '.type-switch button', button);
            updateTransactionSubchips(form);
            break;
        }
        case 'amount-up':
        case 'amount-down': {
            const amount = button.form.elements.amount;
            const current = Number(amount.value) || 0;
            const next = cents(current) + (action === 'amount-up' ? 100 : -100);
            amount.value = next > 0 ? String(next / 100) : '';
            break;
        }
        case 'reset-filters': filters = {}; render(); break;
        case 'toggle-balances': hiddenBalances = !hiddenBalances; render(); break;
        case 'day': selectedDay = id; render(); break;
        case 'prev-month':
        case 'next-month': {
            const [year, number] = calendarMonth.split('-').map(Number);
            const date = new Date(year, number - 1 + (action === 'prev-month' ? -1 : 1), 1);
            calendarMonth = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
            selectedDay = calendarMonth === today().slice(0, 7) ? today() : calendarMonth + '-01';
            render();
            break;
        }
    }
});

document.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('input[type="month"]')) input.blur();
    if (input.id === 'month' && input.value) {
        month = input.value;
        render();
    }
    if (input.id === 'entry-type') {
        const budget = input.form.elements.budget;
        budget.closest('label').hidden = input.value === 'income';
        budget.disabled = input.value === 'income';
    }
});

document.addEventListener('keydown', event => {
    if (event.target.name === 'amount' && event.target.closest('#entry') &&
        ['ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        event.target.form.querySelector('[data-action="amount-' + (event.key === 'ArrowUp' ? 'up' : 'down') + '"]').click();
    }
    if (event.key === 'Enter' && event.target.id === 'subcategory-input') {
        event.preventDefault();
        event.target.form.querySelector('[data-action="add-subcategory"]').click();
    }
});

document.addEventListener('submit', event => {
    const form = event.target;
    if (form.id !== 'filters' && form.id !== 'entry') return;
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (form.id === 'filters') {
        filters = values;
        render();
        return;
    }

    const id = form.dataset.id;
    const method = id ? 'PUT' : 'POST';
    const suffix = id ? '/' + encodeURIComponent(id) : '';
    const submit = event.submitter || form.querySelector('button.primary');

    if (form.dataset.kind === 'transaction') {
        if (!values.category) {
            toast('Choose a category.', true);
            form.querySelector('.category-choice')?.focus();
            return;
        }
        if (!values.account) {
            toast('Choose an account.', true);
            form.querySelector('.account-choice')?.focus();
            return;
        }
        const customDescription = values.customDescription.trim();
        const body = {
            amount: Number(values.amount), date: values.date, account: values.account,
            category: values.category, description: customDescription || values.description, type: values.type,
            saveSubcategory: Boolean(customDescription)
        };
        if (values.recurring !== undefined) body.recurring = values.recurring === 'yes';
        saveButton(submit, async () => {
            const result = await persist('/transaction' + suffix, { method, body });
            if (dialog.open) dialog.close();
            if (ready) toast(result.warning || 'Transaction saved.');
        });
    } else {
        const body = {
            categName: values.name.trim(), categType: form.elements.type.value,
            categBudget: form.elements.type.value === 'expense' ? Number(values.budget || 0) : 0,
            subcategories: categorySubcategoriesFromForm(form)
        };
        if (form.dataset.newId) body.templateKey = form.dataset.newId;
        saveButton(submit, async () => {
            await persist('/categories' + suffix, { method, body });
            if (dialog.open) dialog.close();
            if (ready) toast('Category saved.');
        });
    }
});
