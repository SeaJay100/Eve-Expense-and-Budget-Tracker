function newestFirst(first, second) {
    return second.date.localeCompare(first.date) || second.id.localeCompare(first.id);
}

function rowList(records, preserveOrder = false) {
    if (!records.length) {
        return `<div class="empty">
            <h3>No transactions here yet</h3>
            <p class="muted">Add an income or expense to start keeping track.</p>
            ${actionButton('Add transaction', 'transaction', 'primary')}
        </div>`;
    }

    const orderedRecords = preserveOrder ? records : [...records].sort(newestFirst);
    const rows = orderedRecords.map(record => {
        const category = findCategory(record.category);
        const account = state.accounts.find(item => item.id === record.account);
        const isTransfer = record.type === 'transfer-in' || record.type === 'transfer-out';
        const isAdjustment = record.type === 'adjustment-in' || record.type === 'adjustment-out';
        const isIncoming = record.type === 'income' || record.type === 'transfer-in' || record.type === 'adjustment-in';
        const categoryName = isAdjustment ? 'Balance adjustment' : category?.name || (isTransfer ? 'Transfer' : 'Other');
        const date = new Date(record.date + 'T00:00').toLocaleDateString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        const dateLabel = date + (record.recurring || record.recurringSource ? ' (Monthly)' : '');

        return `<tr>
            <td>
                <div class="transaction-category">
                    ${categoryBadge(category, isAdjustment ? 'plus' : isTransfer ? 'transfer' : 'categories')}
                    <b>${esc(categoryName)}</b>
                </div>
            </td>
            <td>${esc(isAdjustment ? '---' : record.description?.trim() || '---')}</td>
            <td>${esc(account?.name)}</td>
            <td>${dateLabel}</td>
            <td class="amount ${isIncoming ? 'positive' : 'negative'}">
                ${isIncoming ? '+' : '−'}${money(record.amount)}
            </td>
            <td>${isAdjustment ? '' : actionButton('Edit', 'edit:' + record.id, 'quiet')}${actionButton('Delete', 'delete:' + record.id, 'quiet danger')}</td>
        </tr>`;
    }).join('');

    return `<div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Category</th><th>Description</th><th>Account</th>
                    <th>Date</th><th style="text-align:right">Amount</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

function budgetCards() {
    const records = monthlyTransactions();
    const expenses = state.categories.filter(category => category.type === 'expense');
    const defaults = CATEGORY_TEMPLATES.slice(0, 6)
        .map(template => expenses.find(category => category.templateKey === template.templateKey))
        .filter(Boolean);
    const extraCategories = expenses.filter(category => !defaults.includes(category));
    const cards = [...defaults, ...extraCategories].map(category => {
        const spent = total(records.filter(record => record.category === category.id), 'expense');
        const budget = Number(category.budget);
        const hasBudget = budget > 0;
        const remaining = budget - spent;
        const barColor = remaining < 0 ? '#ae5943' : category.color;
        let budgetDetails = '';

        if (hasBudget) {
            const percentUsed = spent / budget * 100;
            budgetDetails = ` <small class="muted">of ${money(budget)}</small>
                <div class="progress"><i style="width:${Math.min(100, percentUsed)}%;--bar:${barColor}"></i></div>
                <div class="budget-foot">
                    <span class="${remaining < 0 ? 'negative' : 'muted'}">
                        ${money(Math.abs(remaining))} ${remaining < 0 ? 'over budget' : 'left'}
                    </span>
                    <span class="muted">${Math.round(percentUsed)}% used</span>
                </div>`;
        }

        return `<article class="budget-card">
            <div class="budget-top">
                ${categoryBadge(category)}
                <h3>${esc(category.name)}</h3>
                <button class="budget-add" data-action="budget-add:${esc(category.id)}"
                    aria-label="Add ${esc(category.name)} expense">+</button>
            </div>
            <span class="amount">${hasBudget ? money(spent) : '₱' + compactAmount(spent)}</span>${budgetDetails}
        </article>`;
    }).join('');

    return `<div class="grid">${cards}</div>`;
}

function homePage() {
    const name = state.user?.name || state.user?.username || 'Eve';
    const firstName = name.trim().split(/\s+/)[0];
    const records = monthlyTransactions();
    const income = total(records, 'income');
    const expenses = total(records, 'expense');
    const net = income - expenses;
    const totalBalance = state.accounts.reduce((sum, account) => sum + balance(account), 0);
    const recent = [...state.transactions].sort(newestFirst).slice(0, 5);
    const latestAdjustment = [...state.transactions]
        .filter(record => record.type === 'adjustment-in' || record.type === 'adjustment-out')
        .sort((first, second) => second.id.localeCompare(first.id))[0];
    if (latestAdjustment && !recent.some(record => record.id === latestAdjustment.id)) {
        recent.pop();
        recent.unshift(latestAdjustment);
    }

    return `<div class="title-row">
        <div>
            <h1>Welcome back, ${esc(firstName)}</h1>
        </div>
        ${monthControl()}
    </div>
    <section class="summary">
        <div class="lead">
            <span>Total balance</span>
            <strong>${money(totalBalance)}</strong>
            <small class="muted">Across ${state.accounts.length} accounts · all time</small>
        </div>
        <div>
            <span class="muted">Monthly income</span>
            <strong>${money(income)}</strong>
        </div>
        <div>
            <span class="muted">Monthly expenses</span>
            <strong>${money(expenses)}</strong>
        </div>
        <div>
            <span class="muted">Monthly net</span>
            <strong class="${net < 0 ? 'negative' : 'positive'}">${money(net)}</strong>
        </div>
    </section>
    <div class="section-head">
        <div><h2>Your monthly budgets</h2></div>
        <a href="#categories">Manage budgets →</a>
    </div>
    ${budgetCards()}
    <div class="section-head">
        <h2>Recent transactions</h2>
        <a href="#transactions">View all →</a>
    </div>
    ${rowList(recent, true)}`;
}

function transactionsPage() {
    const deletedInUse = state.deletedCategories.filter(category =>
        state.transactions.some(record => record.category === category.id)
    );
    const filterCategories = [...state.categories, ...deletedInUse];
    const records = state.transactions.filter(record => {
        const matchesCategory = !filters.category || record.category === filters.category;
        const matchesAccount = !filters.account || record.account === filters.account;
        const matchesMonth = !filters.month || record.date.startsWith(filters.month);
        return matchesCategory && matchesAccount && matchesMonth;
    });

    return `<form id="filters" class="filter-form">
        <h2 class="filter-title">Filter</h2>
        <label>
            Category
            <select name="category">
                <option value="">All categories</option>
                ${options(filterCategories, filters.category)}
                <option value="transfer" ${filters.category === 'transfer' ? 'selected' : ''}>Transfers</option>
                <option value="adjustment" ${filters.category === 'adjustment' ? 'selected' : ''}>Balance adjustments</option>
            </select>
        </label>
        <label>
            Account
            <select name="account">
                <option value="">All accounts</option>
                ${options(state.accounts, filters.account)}
            </select>
        </label>
        <label>Month<input class="month-picker" type="month" name="month" value="${esc(filters.month || '')}"></label>
        <button class="primary">Apply filters</button>
        ${actionButton('Reset', 'reset-filters')}
    </form>
    <div class="section-head">
        <h2>${records.length} transactions</h2>
        <span class="muted">Income ${money(total(records, 'income'))} · Expenses ${money(total(records, 'expense'))}</span>
    </div>
    ${rowList(records)}`;
}

function calendarPage() {
    const firstDay = new Date(calendarMonth + '-01T00:00');
    const dayCount = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
    const monthLabel = firstDay.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
    const dayLabel = new Date(selectedDay + 'T00:00').toLocaleDateString('en-PH', {
        weekday: 'long', month: 'long', day: 'numeric'
    });
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        .map(label => `<span class="weekday">${label}</span>`).join('');
    const leadingCells = '<span></span>'.repeat(firstDay.getDay());
    const days = Array.from({ length: dayCount }, (_, index) => {
        const dayNumber = index + 1;
        const date = calendarMonth + '-' + String(dayNumber).padStart(2, '0');
        const records = state.transactions.filter(record => record.date === date);
        const net = total(records, 'income') - total(records, 'expense') +
            total(records, 'adjustment-in') - total(records, 'adjustment-out');
        const sign = net > 0 ? '+' : net < 0 ? '−' : '';
        const netLabel = sign + compactAmount(Math.abs(net));
        const color = net < 0 ? 'negative' : net > 0 ? 'positive' : 'muted';
        const isSelected = date === selectedDay;
        const label = records.length ? date + ', net ' + netLabel + ' pesos' : date;
        const amount = records.length ? `<small class="day-net ${color}">${netLabel}</small>` : '';

        return `<button class="day ${isSelected ? 'selected' : ''}" data-action="day:${date}"
            aria-label="${label}" aria-pressed="${isSelected}"><span>${dayNumber}</span>${amount}</button>`;
    }).join('');

    const selectedRecords = state.transactions.filter(record => record.date === selectedDay);
    const income = total(selectedRecords, 'income');
    const expenses = total(selectedRecords, 'expense');
    const adjustments = total(selectedRecords, 'adjustment-in') - total(selectedRecords, 'adjustment-out');

    return `<div class="calendar-layout">
        <section class="panel">
            <div class="section-head">
                <button type="button" data-action="prev-month" aria-label="Previous month">←</button>
                <h2>${monthLabel}</h2>
                <button type="button" data-action="next-month" aria-label="Next month">→</button>
            </div>
            <div class="calendar">${weekdays}${leadingCells}${days}</div>
        </section>
        <section>
            <h2>${dayLabel}</h2>
            <p class="muted">Income ${money(income)}<br>Expenses ${money(expenses)}<br>Net ${money(income - expenses + adjustments)}</p>
            ${rowList(selectedRecords)}
        </section>
    </div>`;
}
