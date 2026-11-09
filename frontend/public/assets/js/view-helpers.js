const iconPaths = {
    home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
    transactions: 'M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4',
    accounts: 'M3 6h18v15H3ZM3 10h18m-5 5h2',
    categories: 'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',
    plus: 'M12 5v14M5 12h14',
    logout: 'M10 4H4v16h6m4-13 5 5-5 5M9 12h10'
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
    freelance: 'M7 3h10l5 6-10 12L2 9l5-6Zm.2 6L6 10.5l6 5 6-5L16.8 9 12 13 7.2 9Z',
    housing: 'M2 11 12 2l10 9h-3v10h-5v-6h-4v6H5V11H2Z',
    hotels: 'M4 2h10v5h5v13h3v2H2v-2h2V2Zm2 4v2h2V6H6Zm4 0v2h2V6h-2ZM6 10v2h2v-2H6Zm4 0v2h2v-2h-2Zm5 0v2h2v-2h-2ZM6 14v2h2v-2H6Zm4 2v4h2v-4h-2Zm5-2v2h2v-2h-2Z',
    appliances: 'M5 2h14v18h-1v2h-2v-2H8v2H6v-2H5V2Zm0 8h14V9H5v1Zm2-6v3h1.5V4H7Zm0 8v5h1.5v-5H7Z',
    furniture: 'M5 12c0-3 1-6 7-6s7 3 7 6h-1c-1 0-2 .7-2 2H8c0-1.3-1-2-2-2H5Z ' +
        'M4 12a2 2 0 0 1 2 2v2h12v-2a2 2 0 1 1 4 0v4a1 1 0 0 1-1 1v2h-2v-2H5v2H3v-2a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2Z',
    tax: 'M12 2a6 6 0 0 1 5.6 8.2 4.2 4.2 0 0 0-2.5.8l-2.3 1.5-2.8-.8A6 6 0 0 1 12 2Zm-.5 2.5v1c-1 .2-1.6.8-1.6 1.7 0 .9.7 1.4 1.8 1.7.6.2.8.3.8.6 0 .3-.3.5-.7.5-.5 0-1-.2-1.5-.5l-.5 1c.5.4 1.1.6 1.7.6v.7h1v-.8c1-.2 1.6-.8 1.6-1.7 0-.9-.7-1.4-1.8-1.7-.6-.2-.9-.3-.9-.6s.3-.4.7-.4c.4 0 .8.1 1.2.4l.5-1c-.4-.3-.9-.5-1.3-.5v-1h-1Z ' +
        'M2 15h4l3-2 5 1.3a1 1 0 0 1-.4 2l-4-.9-.4 1.3 4.5 1.1 5-3.8a1.4 1.4 0 0 1 1.7 2.2L15 21H6l-4-1v-5Z',
    transfer: 'M3 7h13l-2.5-2.5L15 3l5 5-5 5-1.5-1.5L16 9H3V7Zm18 8H8l2.5-2.5L9 11l-5 5 5 5 1.5-1.5L8 17h13v-2Z',
    plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z',
    categories: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z'
};

const categoryIconsByName = new Map([
    ['food & drink', 'food'], ['transport', 'transport'], ['transportation', 'transport'],
    ['home bills', 'bills'], ['bills & utilities', 'bills'], ['self-care', 'personalCare'],
    ['personal care', 'personalCare'], ['shopping', 'shopping'], ['health', 'health'],
    ['salary', 'salary'], ['salaries', 'salary'], ['allowance', 'allowance'], ['freelance', 'freelance'],
    ['housing & rent', 'housing'], ['hotels', 'hotels'],
    ['tax', 'tax'], ['furniture', 'furniture'], ['appliances', 'appliances']
]);

const pesoMarkPath = 'M3 1h4a4 4 0 0 1 0 8H5v5H3V1Zm2 2v4h2a2 2 0 0 0 0-4H5ZM2 5h8v1.2H2V5Zm0 2.6h8v1.2H2V7.6Z';
const allowanceHandPath = 'M2 14.5h5.2c.8 0 1.5.3 2.1.8l1 .8h3.2l2.5-1.8a1.4 1.4 0 0 1 1.7 2.2l-3.1 2.2c-.5.4-1.1.6-1.7.6H8l-3 1.5H2v-6.3Z';

function categoryBadge(category, fallback = 'categories') {
    const name = category?.name?.trim().toLowerCase();
    const glyph = category?.templateKey;
    let key = categoryIconsByName.get(name) || fallback;

    if (glyph && glyph !== 'categories' && Object.hasOwn(categoryIconPaths, glyph)) {
        key = glyph;
    }

    const iconContent = key === 'salary'
        ? `<path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm-2 4v2h20V9H2Z" fill="currentColor" fill-rule="evenodd"/>
            <path d="${pesoMarkPath}" transform="translate(12.4 9.5) scale(.58)" fill="var(--category-icon-cutout)"/>`
        : key === 'allowance'
            ? `<circle cx="12" cy="7.5" r="5" fill="currentColor"/>
                <path d="${pesoMarkPath}" transform="translate(9.5 2.8) scale(.48)" fill="var(--category-icon-cutout)"/>
                <path d="${allowanceHandPath}" fill="currentColor"/>
                `
            : `<path fill="currentColor" fill-rule="evenodd" d="${categoryIconPaths[key]}"/>`;

    return `<span class="category-icon${key === 'salary' || key === 'allowance' ? ' currency-category-icon' : ''}" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">${iconContent}</svg>
    </span>`;
}

function actionButton(label, action, className = '') {
    return `<button type="button" class="${className}" data-action="${action}">${label}</button>`;
}

function flowHeader(title, backAction = '') {
    const backButton = backAction
        ? `<button type="button" class="dialog-back" data-action="${esc(backAction)}">
            <span aria-hidden="true">←</span> Back
        </button>`
        : '';

    return `<div class="flow-head">
        <div class="flow-start">
            <button type="button" data-action="close" aria-label="Close">×</button>${backButton}
        </div>
        <h2>${esc(title)}</h2><span></span>
    </div>`;
}

function compactAmount(amount) {
    return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(amount);
}

function monthControl() {
    return `<label class="month-control">Month<input class="month-picker" id="month" type="month" value="${month}"></label>`;
}

function options(items, selectedId) {
    return items.map(item => `<option value="${esc(item.id)}"
        ${item.id === selectedId ? 'selected' : ''}>${esc(item.name)}${item.deleted ? ' (deleted)' : ''}${item.archived ? ' (archived)' : ''}</option>`).join('');
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
