function getCategorySubcategories(categoryId) {
    return findCategory(categoryId)?.subcategories || [];
}

function transactionCategoryChoices(categories, selectedId) {
    return categories.map(category => {
        const selected = category.id === selectedId;
        const label = category.name + (category.deleted ? ' (deleted)' : '');
        return `<button type="button" class="category-choice ${selected ? 'selected' : ''}"
            data-action="category-choice:${esc(category.id)}" aria-pressed="${selected}">
            ${categoryBadge(category)}<span>${esc(label)}</span>
        </button>`;
    }).join('');
}

function transactionSubchips(categoryId, selected = '', custom = false) {
    if (!categoryId) return '<p class="muted">Choose a category to see its subcategories.</p>';

    const chips = getCategorySubcategories(categoryId).map(name => {
        const isSelected = selected === name;
        return `<button type="button" class="subchip ${isSelected ? 'selected' : ''}"
            data-action="subchip:${esc(name)}" aria-pressed="${isSelected}">${esc(name)}</button>`;
    }).join('');

    return chips + `<button type="button" class="subchip custom-chip ${custom ? 'selected' : ''}"
        data-action="custom-description" aria-pressed="${custom}">+ Custom</button>`;
}

function updateTransactionSubchips(form) {
    form.elements.description.value = '';
    form.elements.customDescription.value = '';
    form.querySelector('.custom-description').hidden = true;
    form.querySelector('.subchips').innerHTML = transactionSubchips(form.elements.category.value);
}

function setCategorySubcategories(form, subcategories) {
    form.elements.subcategories.value = JSON.stringify(subcategories);
    const list = form.querySelector('.category-subcategory-list');

    if (!subcategories.length) {
        list.innerHTML = '<span class="muted">No subcategories yet.</span>';
        return;
    }

    list.innerHTML = subcategories.map((name, index) => `<span class="category-subcategory-chip">${esc(name)}<button
        type="button" data-action="remove-subcategory:${index}" aria-label="Remove ${esc(name)}">×</button></span>`).join('');
}

function categorySubcategoriesFromForm(form) {
    try {
        const subcategories = JSON.parse(form.elements.subcategories.value || '[]');
        if (!Array.isArray(subcategories)) return [];

        return subcategories.filter(name => typeof name === 'string')
            .map(name => name.trim())
            .filter(Boolean);
    } catch {
        return [];
    }
}

function openCategoryPicker() {
    const tiles = CATEGORY_TEMPLATES.slice(6).map((category, index) => `
        <button type="button" class="pick-category" data-action="quick-category:${index}">
            ${categoryBadge(category)}${esc(category.name)}
        </button>`).join('');

    dialog.innerHTML = `<div class="flow-head">
        <button type="button" data-action="close" aria-label="Close">×</button>
        <h2>Add category</h2><span></span>
    </div>
    <div class="category-picker">
        ${tiles}
        <button type="button" class="pick-category" data-action="custom-category">
            ${categoryBadge(null, 'plus')}Add custom
        </button>
    </div>`;

    presentDialog();
}

function openCustomCategory(name = '', type = 'expense', id = '', settings = {}) {
    const existing = state.categories.find(category => String(category.id) === String(id));
    const categoryName = existing?.name || name;
    const categoryType = existing?.type || type;
    const budget = existing?.budget || '';
    const isIncome = categoryType === 'income';
    const isEditing = Boolean(existing || id);
    const isInUse = existing && state.transactions.some(record => record.category === existing.id);
    const template = settings.template;
    const subcategories = existing ? existing.subcategories || [] : template?.subcategories || [];

    dialog.dataset.categoryOrigin = settings.origin || 'picker';
    const fromPicker = dialog.dataset.categoryOrigin === 'picker';

    dialog.innerHTML = `<form id="entry" class="category-editor-form" data-kind="category"
        data-id="${esc(existing?.id || id)}" data-new-id="${esc(template?.templateKey || '')}">
        ${flowHeader(isEditing ? 'Edit category' : 'Add category', fromPicker ? 'category-picker-back' : '')}
        <label>Category name<input name="name" maxlength="50" required value="${esc(categoryName)}" autofocus></label>
        <label>
            Type
            <select name="type" id="entry-type" ${template || existing?.templateKey ? 'disabled' : ''}>
                <option value="expense" ${categoryType === 'expense' ? 'selected' : ''}>Expense</option>
                <option value="income" ${isIncome ? 'selected' : ''}>Income</option>
            </select>
        </label>
        <label id="budget-label" ${isIncome ? 'hidden' : ''}>
            Monthly budget (optional)
            <input name="budget" type="number" min="0.01" step="0.01" ${isIncome ? 'disabled' : ''} value="${esc(budget)}">
        </label>
        <fieldset class="category-subcategory-editor">
            <legend>Subcategories</legend>
            <p class="muted">These appear only for this category when you add a transaction.</p>
            <div class="category-subcategory-list"></div>
            <div class="category-subcategory-add">
                <label class="sr-only" for="subcategory-input">New subcategory</label>
                <input id="subcategory-input" type="text" maxlength="50" placeholder="Add a subcategory">
                <button type="button" data-action="add-subcategory">Add</button>
            </div>
            <input type="hidden" name="subcategories">
        </fieldset>
        <div class="form-actions">
            ${existing ? `<button type="button" class="danger category-delete-trigger" data-action="category-delete"
                aria-controls="category-delete-confirmation" aria-expanded="false">Delete category</button>` : ''}
            <button type="button" data-action="category-picker-back">${fromPicker ? 'Back' : 'Cancel'}</button>
            <button class="primary">${isEditing ? 'Save changes' : 'Save category'}</button>
        </div>
        ${existing ? `<section class="category-delete-confirmation" id="category-delete-confirmation" hidden>
            <h3>Delete ${esc(existing.name)}?</h3>
            ${isInUse ? `<p><strong class="negative">Warning:</strong> Saved transactions will keep this category in their
                history. You won’t be able to select it for new transactions.</p>` : ''}
            <p>The category and its budget will be removed from your active categories.</p>
            <div class="form-actions">
                ${actionButton('Keep category', 'cancel-category-delete')}
                ${actionButton('Confirm delete', 'confirm-category-delete:' + esc(existing.id), 'danger')}
            </div>
        </section>` : ''}
    </form>`;

    setCategorySubcategories(dialog.querySelector('#entry'), subcategories);
    presentDialog();
}

function openTransaction(id, categoryId = '') {
    const transaction = state.transactions.find(record => record.id === id);
    const availableAccounts = state.accounts.filter(account => !account.archived || account.id === transaction?.account);
    if (!availableAccounts.length) {
        dialog.innerHTML = `<div class="flow-head">
            <button type="button" data-action="close" aria-label="Close">×</button>
            <h2>Add an account first</h2><span></span>
        </div><p>Choose an account before recording a transaction.</p>
        ${actionButton('Cancel', 'cancel')} ${actionButton('Add account', 'first-account', 'primary')}`;
        presentDialog();
        return;
    }
    if (!state.categories.length && !transaction) {
        dialog.innerHTML = `<div class="flow-head">
            <button type="button" data-action="close" aria-label="Close">×</button>
            <h2>Add a category first</h2><span></span>
        </div><p>Choose a category before recording a transaction.</p>
        ${actionButton('Cancel', 'cancel')} ${actionButton('Add category', 'category', 'primary')}`;
        presentDialog();
        return;
    }

    const defaultType = state.categories.some(category => category.type === 'expense') ? 'expense' : 'income';
    const type = transaction?.type || defaultType;
    const eligible = transactionCategories(type, transaction?.category);
    const category = eligible.find(item => item.id === (categoryId || transaction?.category));
    const accountId = transaction?.account || '';
    const description = transaction?.description || '';
    const custom = Boolean(description && !getCategorySubcategories(category?.id).includes(description));
    const date = transaction?.date || (page === 'calendar' ? selectedDay :
        page === 'home' && month !== today().slice(0, 7) ? month + '-01' : today());

    const accounts = availableAccounts.map(account => {
        const active = account.id === accountId;
        const glyph = account.icon || ({ 'E-wallet': '◉', Bank: '▤' }[account.type]) || '₱';
        return `<button type="button" class="account-choice ${active ? 'selected' : ''}"
            data-action="account-choice:${esc(account.id)}" aria-pressed="${active}">
            <span class="account-choice-icon" aria-hidden="true">${esc(glyph)}</span><span>${esc(account.name)}</span>
        </button>`;
    }).join('');

    dialog.innerHTML = `<form id="entry" data-kind="transaction" data-id="${esc(id)}">
        <div class="entry-top">
            <button type="button" data-action="close" aria-label="Close">×</button>
            <h2>${transaction ? 'Edit transaction' : 'Add transaction'}</h2><span></span>
        </div>
        <div class="type-switch" role="group" aria-label="Transaction type">
            ${['expense', 'income'].map(value => `<button type="button" data-action="entry-${value}"
                class="${type === value ? 'selected' : ''}" aria-pressed="${type === value}">
                ${value === 'expense' ? 'Expense' : 'Income'}</button>`).join('')}
        </div>
        <div>
            <label for="transaction-amount">Amount (PHP)</label>
            <div class="amount-control">
                <input id="transaction-amount" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal"
                    required value="${transaction?.amount ?? ''}" placeholder="₱0.00" autofocus>
                <button type="button" data-action="amount-down" aria-label="Decrease by one peso">−</button>
                <button type="button" data-action="amount-up" aria-label="Increase by one peso">+</button>
            </div>
        </div>
        <fieldset class="category-select">
            <legend>Category</legend>
            <div class="category-choice-grid">${transactionCategoryChoices(eligible, category?.id)}</div>
            <input type="hidden" name="category" value="${esc(category?.id)}">
        </fieldset>
        <fieldset class="description-select">
            <legend>Subcategory or description <span class="muted">(optional)</span></legend>
            <div class="subchips">${transactionSubchips(category?.id, custom ? '' : description, custom)}</div>
            <label class="custom-description" ${custom ? '' : 'hidden'}>Custom description
                <input name="customDescription" maxlength="80" placeholder="Type a description" value="${custom ? esc(description) : ''}">
            </label>
        </fieldset>
        <input type="hidden" name="type" value="${type}">
        <input type="hidden" name="description" value="${custom ? '' : esc(description)}">
        <fieldset class="account-select">
            <legend>Which account?</legend>
            <div class="account-choice-grid">${accounts}</div>
            <input type="hidden" name="account" value="${esc(accountId)}">
        </fieldset>
        <div class="form-grid">
            <label>Date<input name="date" type="date" required value="${esc(date)}"></label>
            <label>Recurring<select name="recurring" ${transaction?.recurringSource ? 'disabled' : ''}>
                <option value="no">No</option><option value="yes" ${transaction?.recurring ? 'selected' : ''}>Monthly</option>
            </select></label>
        </div>
        <div class="form-actions transaction-actions">
            ${actionButton('Cancel', 'cancel')}
            <button class="primary">Save transaction</button>
        </div>
    </form>`;
    presentDialog();
    dialog.querySelector('[autofocus]')?.focus({ preventScroll: true });
}
