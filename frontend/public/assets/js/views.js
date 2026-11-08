const SUBCATEGORY_DEFAULTS = {
    food: ['Groceries', 'Dining out', 'Coffee', 'Bakery', 'Snacks'],
    transport: ['Gas', 'Parking', 'Public transportation', 'Toll', 'Maintenance'],
    bills: ['Electricity', 'Water', 'Internet', 'Mobile plan', 'Other utility'],
    shopping: ['Clothing', 'Home goods', 'Electronics', 'Online order', 'Gifts'],
    health: ['Pharmacy', 'Doctor', 'Dental', 'Vision', 'Fitness'],
    personalCare: ['Toiletries', 'Haircut', 'Skincare', 'Cosmetics', 'Personal products'],
    housing: ['Rent', 'Mortgage payment', 'Home maintenance', 'Security deposit', 'Property tax'],
    appliances: ['Refrigerators', 'Washing machines', 'Kitchen appliances', 'Small appliances', 'Appliance repairs'],
    furniture: ['Sofa & seating', 'Beds & mattresses', 'Tables & chairs', 'Storage', 'Furniture repairs'],
    tax: ['Income tax', 'Property tax', 'Vehicle tax', 'Sales tax', 'Filing fees'],
    hotels: ['Hotel stays', 'Resort stays', 'Booking fees', 'Meals', 'Service charges'],
    salary: ['Paycheck', 'Bonus', 'Commission', 'Allowance', 'Other income'],
    freelance: ['Design project', 'Consulting', 'Contract work', 'Tutoring', 'Other freelance']
};
const CATEGORY_TEMPLATES = [
    {
        id: 'food',
        name: 'Food & Drink',
        glyph: 'food',
        color: '#f8edce',
        subcategories: SUBCATEGORY_DEFAULTS.food
    },
    {
        id: 'transport',
        name: 'Transportation',
        glyph: 'transport',
        color: '#dceafa',
        subcategories: SUBCATEGORY_DEFAULTS.transport
    },
    {
        id: 'bills',
        name: 'Bills & Utilities',
        glyph: 'bills',
        color: '#ffe2d1',
        subcategories: SUBCATEGORY_DEFAULTS.bills
    },
    {
        id: 'shopping',
        name: 'Shopping',
        glyph: 'shopping',
        color: '#fbe0e4',
        subcategories: SUBCATEGORY_DEFAULTS.shopping
    },
    {
        id: 'health',
        name: 'Health',
        glyph: 'health',
        color: '#d5f2e9',
        subcategories: SUBCATEGORY_DEFAULTS.health
    },
    {
        id: 'personalCare',
        name: 'Personal Care',
        glyph: 'personalCare',
        color: '#eee2f5',
        subcategories: SUBCATEGORY_DEFAULTS.personalCare
    },
    {
        id: 'housing',
        name: 'Housing & Rent',
        glyph: 'housing',
        color: '#e4eee1',
        subcategories: SUBCATEGORY_DEFAULTS.housing
    },
    {
        id: 'appliances',
        name: 'Appliances',
        glyph: 'appliances',
        color: '#e4eafa',
        subcategories: SUBCATEGORY_DEFAULTS.appliances
    },
    {
        id: 'furniture',
        name: 'Furniture',
        glyph: 'furniture',
        color: '#e6f2f3',
        subcategories: SUBCATEGORY_DEFAULTS.furniture
    },
    {
        id: 'tax',
        name: 'Tax',
        glyph: 'tax',
        color: '#f2e8df',
        subcategories: SUBCATEGORY_DEFAULTS.tax
    },
    {
        id: 'hotels',
        name: 'Hotels',
        glyph: 'hotels',
        color: '#edf0df',
        subcategories: SUBCATEGORY_DEFAULTS.hotels
    }
];
const iconPaths = {
    home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
    transactions: 'M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4',
    accounts: 'M3 6h18v15H3ZM3 10h18m-5 5h2',
    categories: 'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',
    plus: 'M12 5v14M5 12h14'
};

function icon(name) {
    const path = iconPaths[name] || iconPaths.categories;
    return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
}

const categoryIconPaths = {
    food: 'M10 5a2 2 0 1 1 4 0c4.3 1 7.3 4.4 7.8 8.5H2.2C2.7 9.4 5.7 6 10 5Z ' +
        'M11 4.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0ZM2 15h20v1.4c0 .9-.7 1.6-1.6 1.6H3.6c-.9 0-1.6-.7-1.6-1.6V15Z',
    transport: 'M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14h-1v2h-2v-2H8v2H6v-2H5V4Z ' +
        'M7 5v6h10V5H7Zm.5 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM2 8h2v5H2zm18 0h2v5h-2z',
    bills: 'M12 2c2.1 3.5 7 8.9 7 12.5a7 7 0 1 1-14 0C5 10.9 9.9 5.5 12 2Z ' +
        'M12.4 9 9 14h2.8L11 18l4-5.6h-3L12.4 9Z',
    shopping: 'M6 3h12a2 2 0 0 1 2 1.8l1 14.5a2 2 0 0 1-2 2.2H5a2 2 0 0 1-2-2.2L4 4.8A2 2 0 0 1 6 3Z ' +
        'M7.5 8a1 1 0 0 1 2 0 2.5 2.5 0 0 0 5 0 1 1 0 0 1 2 0 4.5 4.5 0 0 1-9 0Z',
    health: 'M8 3h8a1 1 0 0 1 1 1v3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V4a1 1 0 0 1 1-1Z ' +
        'M9 5v2h6V5H9Zm2 5v3H8v2h3v3h2v-3h3v-2h-3v-3h-2Z',
    personalCare: 'M6 8c1-3 3.5-5 7-5a7 7 0 0 1 7 7v4c0 2 1 3.6 2 4.5C20 21 15.5 22 12 22s-7.5-1-9-3.5c1.3-1 2-2.5 2-4.5v-3l1-3Z ' +
        'M8 13v1a5 5 0 0 0 10 0v-3c-2.7 1.6-5.5 2.4-10 2Zm2.5 2h5a2.5 2.5 0 0 1-5 0ZM4 1l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z',
    salary: 'M4 4h16a2 2 0 0 1 2 2v2H2V6a2 2 0 0 1 2-2Zm-2 6h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8Z ' +
        'M17 11.5v1c-1.3.1-2 .8-2 1.7 0 1 .8 1.5 1.8 1.8.7.2 1 .4 1 .7s-.3.5-.8.5c-.6 0-1.1-.2-1.7-.6l-.6 1c.6.4 1.4.7 2.3.7v1h1v-1.1c1.1-.2 1.8-.8 1.8-1.7 0-1-.7-1.5-1.9-1.8-.6-.2-.9-.3-.9-.6 0-.3.3-.5.8-.5.4 0 .9.2 1.3.5l.6-1c-.4-.3-1-.5-1.7-.6v-1h-1Z',
    freelance: 'M7 3h10l5 6-10 12L2 9l5-6Zm.2 6L6 10.5l6 5 6-5L16.8 9 12 13 7.2 9Z',
    investment: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm1 2H9v1.5h1v6.5h1.5v-2H13a3 3 0 1 0 0-6Zm0 1.5a1.5 1.5 0 0 1 0 3h-1.5v-3H13Z',
    housing: 'M2 11 12 2l10 9h-3v10h-5v-6h-4v6H5V11H2Z',
    hotels: 'M4 2h10v5h5v13h3v2H2v-2h2V2Zm2 4v2h2V6H6Zm4 0v2h2V6h-2ZM6 10v2h2v-2H6Zm4 0v2h2v-2h-2Zm5 0v2h2v-2h-2ZM6 14v2h2v-2H6Zm4 2v4h2v-4h-2Zm5-2v2h2v-2h-2Z',
    appliances: 'M5 2h14v18h-1v2h-2v-2H8v2H6v-2H5V2Zm0 8h14V9H5v1Zm2-6v3h1.5V4H7Zm0 8v5h1.5v-5H7Z',
    furniture: 'M5 12c0-3 1-6 7-6s7 3 7 6h-1c-1 0-2 .7-2 2H8c0-1.3-1-2-2-2H5Z ' +
        'M4 12a2 2 0 0 1 2 2v2h12v-2a2 2 0 1 1 4 0v4a1 1 0 0 1-1 1v2h-2v-2H5v2H3v-2a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2Z',
    tax: 'M12 2a6 6 0 0 1 5.6 8.2 4.2 4.2 0 0 0-2.5.8l-2.3 1.5-2.8-.8A6 6 0 0 1 12 2Zm-.5 2.5v1c-1 .2-1.6.8-1.6 1.7 0 .9.7 1.4 1.8 1.7.6.2.8.3.8.6 0 .3-.3.5-.7.5-.5 0-1-.2-1.5-.5l-.5 1c.5.4 1.1.6 1.7.6v.7h1v-.8c1-.2 1.6-.8 1.6-1.7 0-.9-.7-1.4-1.8-1.7-.6-.2-.9-.3-.9-.6s.3-.4.7-.4c.4 0 .8.1 1.2.4l.5-1c-.4-.3-.9-.5-1.3-.5v-1h-1Z ' +
        'M2 15h4l3-2 5 1.3a1 1 0 0 1-.4 2l-4-.9-.4 1.3 4.5 1.1 5-3.8a1.4 1.4 0 0 1 1.7 2.2L15 21H6l-4-1v-5Z',
    travel: 'M21 3c.8.8.4 2.2-.5 3.1l-4.2 4.2 1.5 7.9-1.7 1.7-3.2-6.3-3.8 3.8.1 2.6-1.3 1.3-2-3.2-3.2-2 1.3-1.3 2.6.1 3.8-3.8-6.3-3.2L5.8 6l7.9 1.5L17.9 3c.9-.9 2.3-.8 3.1 0Z',
    tickets: 'M2 5h20v5a2 2 0 0 0 0 4v5H2v-5a2 2 0 0 0 0-4V5Zm6 4v2h8V9H8Zm0 4v2h8v-2H8Z',
    shipping: 'M2 4h12v12H2V4Zm13 3h4l3 4v5h-7V7Zm2 2v3h4l-2-3h-2ZM6 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm12 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
    marketing: 'M2 3h20v15H2V3Zm3 11h2l.6-2h2.8l.6 2h2l-3-8H8l-3 8Zm3-3.5 1-3 1 3H8Zm6-4.5v8h2a4 4 0 0 0 0-8h-2Zm2 1.5a2.5 2.5 0 0 1 0 5v-5ZM5 20h14v2H5Z',
    printer: 'M6 2h12v5h4v11h-4v4H6v-4H2V7h4V2Zm2 2v3h8V4H8Zm-3 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3 5v5h8v-5H8Zm1 1h6v1H9Zm0 2h6v1H9Z',
    office: 'M2 3h20v14H2V3Zm2 10v2h16v-2H4Zm6 5h4v2h3v2H7v-2h3v-2Z',
    tools: 'M15 3a6 6 0 0 1 5-.3l-3.4 3.4.9 2.4 2.4.9L23 6a6 6 0 0 1-7.8 7.3l-7.6 7.6a3.2 3.2 0 0 1-4.5-4.5l7.6-7.6A6 6 0 0 1 15 3ZM5.5 17a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z',
    labor: 'M5 10h14v2H5v-2Zm2-1a5 5 0 0 1 10 0H7Zm1 4h8a4 4 0 0 1-8 0ZM3 22v-3l4-2 2 2 3-2 3 2 2-2 4 2v3H3Zm4-3v3h2v-3H7Zm8 0v3h2v-3h-2Z',
    kitchen: 'M9 2h6v4l4 2v2H5V8l4-2V2ZM3 12h18v10H3V12Zm3 2v2h5v-2H6Zm0 4v2h5v-2H6Zm9-4v6h3v-6h-3Z',
    bathroom: 'M10 7a5 5 0 0 1 10 0v15h-2V7a3 3 0 0 0-6 0v1a5 5 0 0 1 4 5H4a5 5 0 0 1 6-5V7ZM5 15h2v4H5zm4 0h2v4H9zm4 0h2v4h-2z',
    transfer: 'M3 7h13l-2.5-2.5L15 3l5 5-5 5-1.5-1.5L16 9H3V7Zm18 8H8l2.5-2.5L9 11l-5 5 5 5 1.5-1.5L8 17h13v-2Z',
    plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z',
    categories: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z'
};

const categoryIconsByName = new Map([
    ['food & drink', 'food'], ['transport', 'transport'], ['transportation', 'transport'],
    ['home bills', 'bills'], ['bills & utilities', 'bills'], ['self-care', 'personalCare'],
    ['personal care', 'personalCare'], ['shopping', 'shopping'], ['health', 'health'],
    ['salary', 'salary'], ['salaries', 'salary'], ['freelance', 'freelance'],
    ['investment', 'investment'], ['housing & rent', 'housing'], ['hotels', 'hotels'],
    ['tax', 'tax'], ['furniture', 'furniture'], ['appliances', 'appliances'],
    ['travel', 'travel'], ['air travel', 'travel'], ['tickets', 'tickets'], ['shipping', 'shipping'],
    ['marketing', 'marketing'], ['office supplies', 'printer'], ['office expense', 'office'],
    ['base', 'tools'], ['labor', 'labor'], ['kitchen', 'kitchen'], ['bathroom', 'bathroom']
]);

function categoryBadge(category, fallback = 'categories') {
    const name = category?.name?.trim().toLowerCase();
    const glyph = category?.templateKey || category?.glyph;
    let key = categoryIconsByName.get(name) || fallback;

    if (glyph && glyph !== 'categories' && Object.hasOwn(categoryIconPaths, glyph)) {
        key = glyph;
    }

    return `<span class="category-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
            <path fill="currentColor" fill-rule="evenodd" d="${categoryIconPaths[key]}"/>
        </svg>
    </span>`;
}

function actionButton(label, action, className = '') {
    return `<button type="button" class="${className}" data-action="${action}">${label}</button>`;
}

function newestFirst(first, second) {
    return second.date.localeCompare(first.date) || second.id.localeCompare(first.id);
}

function rowList(records) {
    if (!records.length) {
        return `<div class="empty">
            <h3>No transactions here yet</h3>
            <p class="muted">Add an income or expense to start keeping track.</p>
            ${actionButton('Add transaction', 'transaction', 'primary')}
        </div>`;
    }

    const rows = [...records].sort(newestFirst).map(record => {
        const category = findCategory(record.category);
        const account = state.accounts.find(item => item.id === record.account);
        const isTransfer = record.type === 'transfer-in' || record.type === 'transfer-out';
        const isIncoming = record.type === 'income' || record.type === 'transfer-in';
        const categoryName = category?.name || (isTransfer ? 'Transfer' : 'Other');
        const date = new Date(record.date + 'T00:00').toLocaleDateString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        return `<tr>
            <td>
                <div class="description">
                    ${categoryBadge(category, isTransfer ? 'transfer' : 'categories')}
                    <b>${esc(record.description)}</b>
                </div>
            </td>
            <td><span class="badge">${esc(categoryName)}</span></td>
            <td>${esc(account?.name)}</td>
            <td>${date}</td>
            <td class="amount ${isIncoming ? 'positive' : 'negative'}">
                ${isIncoming ? '+' : '−'}${money(record.amount)}
            </td>
            <td>${actionButton('Edit', 'edit:' + record.id, 'quiet')}${actionButton('Delete', 'delete:' + record.id, 'quiet danger')}</td>
        </tr>`;
    }).join('');

    return `<div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Description</th><th>Category</th><th>Account</th>
                    <th>Date</th><th style="text-align:right">Amount</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

function compactAmount(amount) {
    return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(amount);
}

function getCategorySubcategories(categoryId) {
    const category = findCategory(categoryId);
    return category?.subcategories || [];
}

function transactionSubchips(categoryId, selected = '') {
    const subcategories = [...getCategorySubcategories(categoryId)];
    if (selected && !subcategories.some(name => name.toLowerCase() === selected.toLowerCase())) {
        subcategories.push(selected);
    }

    const chips = subcategories.map(name => {
        const isSelected = selected === name;
        return `<button type="button" class="subchip ${isSelected ? 'selected' : ''}"
            data-action="subchip:${esc(name)}" aria-pressed="${isSelected}">${esc(name)}</button>`;
    }).join('');

    return chips + '<button type="button" class="subchip custom-chip" data-action="custom-description">+ Custom</button>';
}

function updateTransactionSubchips(categoryId) {
    const form = document.querySelector('#entry[data-kind="transaction"]');
    if (!form) return;

    form.elements.description.value = '';
    form.elements.customDescription.value = '';
    form.querySelector('.custom-description').hidden = true;
    form.querySelector('.subchips').innerHTML = transactionSubchips(categoryId);
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

function budgetCards() {
    const records = monthlyTransactions();
    const cards = CATEGORY_TEMPLATES.slice(0, 6).map(template => {
        const category = state.categories.find(item => item.templateKey === template.id);
        if (!category) return '';

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

    return `<div class="title-row">
        <div>
            <h1>${esc(firstName)}</h1>
            <p class="muted">Here’s how your money looks this month.</p>
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
    ${rowList(recent)}`;
}

function monthControl() {
    return `<label>Month<input aria-label="Month" id="month" type="month" value="${month}"></label>`;
}

function tabs() {
    const items = [
        ['transactions', 'All transactions'],
        ['calendar', 'Calendar'],
        ['statistics', 'Statistics']
    ];
    const links = items.map(([id, label]) => {
        const isCurrent = page === id;
        return `<a href="#${id}" class="${isCurrent ? 'active' : ''}"
            ${isCurrent ? 'aria-current="page"' : ''}>${label}</a>`;
    }).join('');

    return `<div class="tabs">${links}</div>`;
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
            </select>
        </label>
        <label>
            Account
            <select name="account">
                <option value="">All accounts</option>
                ${options(state.accounts, filters.account)}
            </select>
        </label>
        <label>Month<input class="month-filter" type="month" name="month" value="${esc(filters.month || '')}"></label>
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
        const net = total(records, 'income') - total(records, 'expense');
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
            <p class="muted">Income ${money(income)}<br>Expenses ${money(expenses)}<br>Net ${money(income - expenses)}</p>
            ${rowList(selectedRecords)}
        </section>
    </div>`;
}

function options(items, selectedId) {
    return items.map(item => `<option value="${esc(item.id)}"
        ${item.id === selectedId ? 'selected' : ''}>${esc(item.name)}${item.deleted ? ' (deleted)' : ''}</option>`).join('');
}

function openCategoryPicker(type = 'expense') {
    dialog.dataset.categoryType = type;
    dialog.dataset.categoryOrigin = 'picker';

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
    const subcategories = existing ? getCategorySubcategories(existing.id) :
        settings.subcategories || template?.subcategories || [];

    dialog.dataset.categoryType = categoryType;
    dialog.dataset.categoryOrigin = settings.origin || 'picker';
    const fromPicker = dialog.dataset.categoryOrigin === 'picker';
    const backButton = fromPicker
        ? `<button type="button" class="category-picker-back" data-action="category-picker-back">
            <span aria-hidden="true">←</span> Back
        </button>`
        : '';

    dialog.innerHTML = `<form id="entry" class="category-editor-form" data-kind="category"
        data-id="${esc(existing?.id || id)}" data-new-id="${esc(settings.newId || template?.id || '')}">
        <div class="flow-head">
            <div class="flow-start">
                <button type="button" data-action="close" aria-label="Close">×</button>${backButton}
            </div>
            <h2>${isEditing ? 'Edit category' : 'Add category'}</h2><span></span>
        </div>
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

function openForm(kind, id, categoryId = '') {
    if (kind !== 'transaction') return;
    if (!state.accounts.length) {
        dialog.innerHTML = `<div class="flow-head">
            <button type="button" data-action="close" aria-label="Close">×</button>
            <h2>Add an account first</h2><span></span>
        </div><p>Choose an account before recording a transaction.</p>
        ${actionButton('Cancel', 'close')} ${actionButton('Add account', 'first-account', 'primary')}`;
        presentDialog();
        return;
    }
    const transaction = state.transactions.find(record => record.id === id);
    if (!state.categories.length && !transaction) {
        dialog.innerHTML = `<div class="flow-head">
            <button type="button" data-action="close" aria-label="Close">×</button>
            <h2>Add a category first</h2><span></span>
        </div><p>Choose a category before recording a transaction.</p>
        ${actionButton('Cancel', 'close')} ${actionButton('Add category', 'category', 'primary')}`;
        presentDialog();
        return;
    }

    const defaultType = state.categories.some(category => category.type === 'expense') ? 'expense' : 'income';
    const type = transaction?.type || defaultType;
    const eligible = transactionCategories(type, transaction?.category);
    const category = eligible.find(item => item.id === (categoryId || transaction?.category)) || eligible[0];
    const accountId = transaction?.account || state.accounts[0].id;
    const description = transaction?.description || '';
    const custom = Boolean(description && !getCategorySubcategories(category?.id).includes(description));
    const date = transaction?.date || (page === 'calendar' ? selectedDay :
        page === 'home' && month !== today().slice(0, 7) ? month + '-01' : today());

    const accounts = state.accounts.map(account => {
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
                <input id="transaction-amount" name="amount" type="number" min="0.01" step="any" inputmode="decimal"
                    required value="${transaction?.amount ?? ''}" placeholder="₱0.00" autofocus>
                <button type="button" data-action="amount-down" aria-label="Decrease by one peso">−</button>
                <button type="button" data-action="amount-up" aria-label="Increase by one peso">+</button>
            </div>
        </div>
        <fieldset class="description-select">
            <legend>Description / subcategory</legend>
            <div class="subchips">${transactionSubchips(category?.id, custom ? '' : description)}</div>
            <label class="custom-description" ${custom ? '' : 'hidden'}>Custom description
                <input name="customDescription" maxlength="80" placeholder="Type a description" value="${custom ? esc(description) : ''}">
            </label>
        </fieldset>
        <input type="hidden" name="type" value="${type}">
        <input type="hidden" name="description" value="${custom ? '' : esc(description)}">
        <label>Category<select name="category" id="entry-category" required>${options(eligible, category?.id)}</select></label>
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
        <div class="form-actions">${actionButton('Cancel', 'close')}<button class="primary">Save transaction</button></div>
    </form>`;
    presentDialog();
    dialog.querySelector('[autofocus]')?.focus({ preventScroll: true });
}

function render() {
    const host = document.querySelector('#app');
    const active = document.activeElement;
    const activeAction = active?.dataset.action;
    const activeId = active?.id;
    const routes = ['home', 'transactions', 'calendar', 'statistics', 'accounts', 'categories'];
    const route = location.hash.slice(1);
    page = routes.includes(route) ? route : document.body.dataset.page;
    const transactionsSection = ['transactions', 'calendar', 'statistics'].includes(page);
    const navigation = [
        ['home', 'Home'], ['transactions', 'Transactions'], ['accounts', 'Accounts'], ['categories', 'Categories']
    ].map(([id, label]) => {
        const current = id === page || (id === 'transactions' && transactionsSection);
        return '<a href="#' + id + '"' + (current ? ' aria-current="page"' : '') + '>' + icon(id) + label + '</a>';
    }).join('');

    const name = (state.user?.name || state.user?.username || 'Eve').trim();
    const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const label = page[0].toUpperCase() + page.slice(1);
    const pageTitle = transactionsSection ? 'Transactions' : label;
    const subtitles = {
        accounts: 'A place for every peso.',
        categories: 'Make room for your everyday priorities.'
    };
    const titleControl = page === 'accounts' ? actionButton('Add account', 'account', 'primary') :
        ['categories', 'statistics'].includes(page) ? monthControl() : '';
    const title = '<div class="title-row"><div><h1>' + pageTitle + '</h1><p class="muted">' +
        (subtitles[page] || 'Your everyday money, all in one place.') + '</p></div>' + titleControl + '</div>';
    const views = {
        home: homePage, accounts: window.accountsPage, categories: window.categoriesPage,
        transactions: transactionsPage, calendar: calendarPage, statistics: window.statsPage
    };

    host.innerHTML = `<aside>
        <a class="brand" href="#home">
            <svg viewBox="0 0 32 40" aria-hidden="true">
                <path fill="#315f4b" d="M16 1C0 10-1 24 16 39 33 24 32 10 16 1Z"/>
                <path stroke="#e2ecb8" fill="none" stroke-width="2" d="M16 8v24m0-11-7-7m7 13 7-9"/>
            </svg><span>Eve</span>
        </a>
        <nav aria-label="Main navigation">${navigation}</nav>
        <div class="bottom">
            <div class="sidebar-note">A fresh view of your money.<br>Make tracking your money easier.</div>
            <div class="profile">
                <span class="avatar" aria-hidden="true">${esc(initials)}</span>
                <div class="profile-details"><b>${esc(name)}</b><br><small class="muted">Personal workspace</small></div>
            </div>
            ${actionButton('Log out', 'logout', 'sidebar-logout quiet')}
        </div>
    </aside>
    <main id="main" tabindex="-1">
        <header>
            <span class="breadcrumb">${label}</span>
            <div class="header-actions">
                ${actionButton(icon('plus') + ' Add transaction', 'transaction', 'primary')}
                ${actionButton('Log out', 'logout', 'mobile-logout quiet')}
            </div>
        </header>
        ${page === 'home' ? '' : title}
        ${transactionsSection ? tabs() : ''}
        ${views[page]()}
    </main>`;

    if (dialog.open) return;
    const next = activeId ? document.getElementById(activeId) : [...host.querySelectorAll('[data-action]')]
        .find(button => activeAction && button.dataset.action === activeAction && button.getClientRects().length);
    next?.focus({ preventScroll: true });
}
function viewAmount(value) {
    return hiddenBalances ? '••••••' : money(value);
}

function categoryTransactions(category, records) {
    return records.filter(record => String(record.category) === String(category.id));
}

function safeColor(value, fallback) {
    const color = String(value || '');
    return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color) ? color : fallback;
}

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

window.categoriesPage = function categoriesPage() {
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
        <div class="head-actions">${actionButton('Add category', 'category', 'button button-primary')}</div>
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
};

function monthKey(date) {
    return String(date || '').slice(0, 7);
}

function monthTitle(key) {
    const [year, monthNumber] = key.split('-').map(Number);
    const date = new Date(year, monthNumber - 1, 1);
    return date.toLocaleDateString('en-PH', { month: 'short' });
}

function sixMonthKeys() {
    const [year, monthNumber] = month.split('-').map(Number);
    return Array.from({ length: 6 }, (_, index) => {
        const date = new Date(year, monthNumber - 6 + index, 1);
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    });
}

function statsTrend(records, keys, type) {
    return keys.map(key => total(records.filter(record => monthKey(record.date) === key), type));
}

function statsFilterButton(label, action, active) {
    return `<button type="button" class="filter-chip${active ? ' is-active' : ''}"
        data-action="${action}" aria-pressed="${active}">${esc(label)}</button>`;
}

function trendBar(key, income, expense, largestTotal) {
    const label = monthTitle(key);
    const incomeHeight = income ? Math.max(2, income / largestTotal * 100) : 0;
    const expenseHeight = expense ? Math.max(2, expense / largestTotal * 100) : 0;

    return `<div class="trend-month">
        <div class="trend-values"><span>${money(income)}</span><span>${money(expense)}</span></div>
        <div class="trend-bars" role="img" aria-label="${label}: income ${money(income)}, expenses ${money(expense)}">
            <span class="trend-bar income-bar" style="height:${incomeHeight}%"></span>
            <span class="trend-bar expense-bar" style="height:${expenseHeight}%"></span>
        </div>
        <span class="trend-month-label">${label}</span>
    </div>`;
}

function statisticsCategoryList(records, type) {
    const categories = [...state.categories, ...state.deletedCategories];
    const groups = categories.map(category => ({
        category,
        amount: total(categoryTransactions(category, records), type)
    })).filter(group => group.amount > 0).sort((first, second) => second.amount - first.amount);

    if (!groups.length) {
        return `<div class="empty-state">
            <h3>No activity to show</h3>
            <p class="muted">Add a transaction and it will appear in your category breakdown.</p>
            ${actionButton('Add transaction', 'transaction', 'button button-primary')}
        </div>`;
    }

    const fullAmount = groups.reduce((sum, group) => sum + group.amount, 0);
    return groups.map(({ category, amount }) => {
        const share = amount / fullAmount * 100;
        const percent = Math.round(share) + '%';
        const color = safeColor(category.color, '#46886c');
        const showPercent = statMode === 'percent';

        return `<div class="stat-category-row">
            ${categoryBadge(category)}
            <span class="stat-category-name">${esc(category.name)}</span>
            <span class="stat-share muted">${showPercent ? '' : percent}</span>
            <strong>${showPercent ? percent : viewAmount(amount)}</strong>
            <span class="stat-track"><i style="width:${Math.max(2, share)}%;--category-color:${color}"></i></span>
        </div>`;
    }).join('');
}

window.statsPage = function statsPage() {
    const keys = sixMonthKeys();
    const records = state.transactions;
    const currentRecords = monthlyTransactions();
    const isIncome = statType === 'income';
    const isExpense = statType === 'expense';
    const incomes = isExpense ? keys.map(() => 0) : statsTrend(records, keys, 'income');
    const expenses = isIncome ? keys.map(() => 0) : statsTrend(records, keys, 'expense');
    const largestTotal = Math.max(1, ...incomes, ...expenses);
    const bars = keys.map((key, index) => trendBar(key, incomes[index], expenses[index], largestTotal)).join('');
    const rows = keys.map((key, index) => `<tr>
        <td>${esc(key)}</td><td>${money(incomes[index])}</td><td>${money(expenses[index])}</td>
    </tr>`).join('');

    const monthlyIncome = total(currentRecords, 'income');
    const monthlyExpenses = total(currentRecords, 'expense');
    const net = monthlyIncome - monthlyExpenses;
    const categoryList = statisticsCategoryList(currentRecords, isIncome ? 'income' : 'expense');

    return `<section class="page-section stats-page">
        <div class="grid stats-summary">
            <article class="panel metric">
                <span class="muted">Income this month</span><strong class="positive">${viewAmount(monthlyIncome)}</strong>
            </article>
            <article class="panel metric">
                <span class="muted">Expenses this month</span><strong class="negative">${viewAmount(monthlyExpenses)}</strong>
            </article>
            <article class="panel metric">
                <span class="muted">Monthly net</span>
                <strong class="${net >= 0 ? 'positive' : 'negative'}">${viewAmount(net)}</strong>
            </article>
        </div>
        <section class="panel trend-panel">
            <div class="section-head">
                <div><h2>Income &amp; expenses</h2><p class="muted">Monthly totals over the last six months.</p></div>
                <div class="trend-legend">
                    <span><i class="legend-dot income-dot"></i>Income</span>
                    <span><i class="legend-dot expense-dot"></i>Expenses</span>
                </div>
            </div>
            <div class="trend-chart" role="group" aria-label="Income and expense totals by month">${bars}</div>
            <details>
                <summary>View monthly amounts</summary>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Month</th><th>Income</th><th>Expenses</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </details>
        </section>
        <section class="panel stats-category-panel">
            <div class="section-head">
                <div>
                    <h2>${isIncome ? 'Income by category' : 'Spending by category'}</h2>
                    <p class="muted">${isIncome ? 'Where your income came from.' : "Your share of this month's spending."}</p>
                </div>
                <div class="stats-controls">
                    <div class="filter-chips" role="group" aria-label="Choose transaction type">
                        ${statsFilterButton('All', 'stat-all', !isIncome && !isExpense)}
                        ${statsFilterButton('Income', 'stat-income', isIncome)}
                        ${statsFilterButton('Expenses', 'stat-expense', isExpense)}
                    </div>
                    <div class="filter-chips" role="group" aria-label="Choose amount display">
                        ${statsFilterButton('₱', 'mode-currency', statMode !== 'percent')}
                        ${statsFilterButton('%', 'mode-percent', statMode === 'percent')}
                    </div>
                </div>
            </div>
            <div class="stat-category-list">${categoryList}</div>
        </section>
    </section>`;
};
