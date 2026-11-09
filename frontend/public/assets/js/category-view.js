function categoryEditButton(category) {
    return `<button type="button" class="category-edit" data-action="category-edit:${esc(category.id)}"
        aria-label="Edit ${esc(category.name)}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
        </svg>
        <span>Edit</span>
    </button>`;
}

function expenseCategoryRow(category, spent) {
    const budget = Number(category.budget || 0);
    const remaining = budget - spent;
    const hasBudget = budget > 0;
    const isOverBudget = hasBudget && spent > budget;
    const used = hasBudget ? Math.min(100, Math.max(0, Math.round(spent / budget * 100))) : 0;
    const color = safeColor(category.color, '#46886c');
    const progressColor = isOverBudget ? ';--progress-color:#b4534b' : '';
    const spending = hasBudget || hiddenBalances ? viewAmount(spent) : '₱' + compactAmount(spent);
    let status = 'No budget set';

    if (isOverBudget) status = '<span class="negative">Over budget</span>';
    else if (hasBudget) status = viewAmount(remaining) + ' left';

    return `<article class="category-row">
        <div class="category-row-main">
            ${categoryBadge(category)}
            <div class="category-label">
                <h3>${esc(category.name)}</h3>
                <span class="muted">${status}</span>
            </div>
            <div class="category-totals">
                <strong class="${isOverBudget ? 'negative' : ''}">${spending}</strong>
                ${hasBudget ? `<span class="muted">of ${viewAmount(budget)}</span>` : ''}
            </div>
            ${categoryEditButton(category)}
        </div>
        <div ${hasBudget ? '' : 'hidden'} class="progress" role="progressbar"
            aria-label="${esc(category.name)} budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${used}">
            <span style="width:${used}%;--category-color:${color}${progressColor}"></span>
        </div>
    </article>`;
}

function categoriesPage() {
    const expenses = state.categories.filter(category => category.type === 'expense');
    const incomes = state.categories.filter(category => category.type === 'income');
    const records = monthlyTransactions();
    const budgeted = expenses.reduce((sum, category) => sum + Number(category.budget || 0), 0);
    const spentAll = total(records, 'expense');
    let overCount = 0;

    const expenseRows = expenses.map(category => {
        const spent = total(categoryTransactions(category, records), 'expense');
        if (Number(category.budget) > 0 && spent > Number(category.budget)) overCount++;
        return expenseCategoryRow(category, spent);
    }).join('');

    const incomeRows = incomes.map(category => {
        const amount = total(categoryTransactions(category, records), 'income');
        return `<div class="income-category-row">
            ${categoryBadge(category)}
            <span>${esc(category.name)}</span>
            <strong class="positive">${viewAmount(amount)}</strong>
            ${categoryEditButton(category)}
        </div>`;
    }).join('');

    return `<section class="page-section categories-page">
        <div class="grid category-summary">
            <article class="panel metric">
                <span class="muted">Monthly budgets</span>
                <strong>${viewAmount(budgeted)}</strong>
                <span class="muted">${expenses.length} expense categories</span>
            </article>
            <article class="panel metric">
                <span class="muted">Spent this month</span>
                <strong>${viewAmount(spentAll)}</strong>
                <span class="muted">${budgeted ? 'Across expense categories' : 'No budgets set'}</span>
            </article>
            <article class="panel metric">
                <span class="muted">Needs attention</span>
                <strong class="${overCount ? 'negative' : ''}">${overCount}</strong>
                <span class="muted">categories over budget</span>
            </article>
        </div>
        <div class="section-head category-subhead">
            <div>
                <h2>Expense budgets</h2>
                <p class="muted">Spending resets at the start of each month.</p>
            </div>
            <span class="muted">Spent / budget</span>
        </div>
        <section class="panel category-list">
            ${expenseRows || `<div class="empty-state">
                <h3>No expense categories</h3><p class="muted">Add categories to organize your spending.</p>
            </div>`}
        </section>
        <section class="panel income-category-panel">
            <div class="section-head">
                <div><h2>Income categories</h2><p class="muted">Income received this month by category.</p></div>
                <span class="badge">${incomes.length} categories</span>
            </div>
            <div class="income-category-list">
                ${incomeRows || '<div class="empty-state compact-empty"><p class="muted">No income categories yet.</p></div>'}
            </div>
        </section>
    </section>`;
}
