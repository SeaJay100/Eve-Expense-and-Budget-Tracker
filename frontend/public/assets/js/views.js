function transactionTabs() {
    const items = [
        ['transactions', 'All transactions'],
        ['calendar', 'Calendar']
    ];
    const links = items.map(([id, label]) => {
        const isCurrent = page === id;
        return `<a href="#${id}" class="${isCurrent ? 'active' : ''}"
            ${isCurrent ? 'aria-current="page"' : ''}>${label}</a>`;
    }).join('');

    return `<div class="tabs">${links}</div>`;
}

function render() {
    const host = document.querySelector('#app');
    const active = document.activeElement;
    const activeAction = active?.dataset.action;
    const activeId = active?.id;
    const routes = ['home', 'transactions', 'calendar', 'accounts', 'categories'];
    const route = location.hash.slice(1);
    page = routes.includes(route) ? route : document.body.dataset.page;
    const transactionsSection = page === 'transactions' || page === 'calendar';
    const navigation = [
        ['home', 'Home'],
        ['transactions', 'Transactions'],
        ['accounts', 'Accounts'],
        ['categories', 'Categories']
    ].map(([id, label]) => {
        const current = id === page || (id === 'transactions' && transactionsSection);
        const currentPage = current ? ' aria-current="page"' : '';
        return `<a href="#${id}"${currentPage}>${icon(id)}${label}</a>`;
    }).join('');

    const name = (state.user?.name || state.user?.username || 'Eve').trim();
    const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const label = page[0].toUpperCase() + page.slice(1);
    const pageTitle = transactionsSection ? 'Transactions' : label;
    const subtitles = {
        accounts: 'A place for every peso.',
        categories: 'Make room for your everyday priorities.'
    };
    let titleControls = '';
    if (page === 'accounts') {
        titleControls = `<button type="button" data-action="toggle-balances" aria-pressed="${hiddenBalances}">
            ${hiddenBalances ? 'Show balances' : 'Hide balances'}
        </button>${actionButton('Add account', 'account', 'primary')}`;
    } else if (page === 'categories') {
        titleControls = monthControl() + actionButton('Add category', 'category');
    }
    const subtitle = subtitles[page] || 'Your everyday money, all in one place.';
    const title = `<div class="title-row">
        <div><h1>${pageTitle}</h1><p class="muted">${subtitle}</p></div>
        ${titleControls ? `<div class="title-controls">${titleControls}</div>` : ''}
    </div>`;
    const views = {
        home: homePage,
        accounts: window.accountsPage,
        categories: categoriesPage,
        transactions: transactionsPage,
        calendar: calendarPage
    };

    host.innerHTML = `<aside>
        <a class="brand" href="#home" data-action="go-home" aria-label="Eve home">
            <svg viewBox="0 0 32 40" aria-hidden="true">
                <path fill="#315f4b" d="M16 1C0 10-1 24 16 39 33 24 32 10 16 1Z"/>
                <path stroke="#e2ecb8" fill="none" stroke-width="2" d="M16 8v24m0-11-7-7m7 13 7-9"/>
            </svg><span>Eve</span>
        </a>
        <nav aria-label="Main navigation">${navigation}</nav>
        <div class="bottom">
            <div class="sidebar-note">A fresh view of your money.<br>Make tracking your money easier.</div>
            ${actionButton(icon('logout') + ' Log out', 'logout', 'sidebar-logout')}
            <div class="profile">
                <span class="avatar" aria-hidden="true">${esc(initials)}</span>
                <div class="profile-details"><b>${esc(name)}</b><br><small class="muted">Personal workspace</small></div>
            </div>
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
        ${transactionsSection ? transactionTabs() : ''}
        ${views[page]()}
    </main>`;

    if (dialog.open) return;
    const next = activeId ? document.getElementById(activeId) : [...host.querySelectorAll('[data-action]')]
        .find(button => activeAction && button.dataset.action === activeAction && button.getClientRects().length);
    next?.focus({ preventScroll: true });
}
