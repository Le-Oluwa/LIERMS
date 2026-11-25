
// LIERMS — Membership, Billing and Workforce Management
// All subscriptions, shifts and payments are simulations.


// MEMBERSHIP PLANS

const plans3 = [
    {
        n: 'Basic',
        p: 0,
        features: [
            'Public emergency requests',
            'Clinically prioritised response',
            'Case updates'
        ]
    },
    {
        n: 'Individual',
        p: 2500,
        features: [
            'Basic access',
            'Medical profile and contact notifications',
            'Care coordination; partner benefits subject to terms'
        ]
    },
    {
        n: 'Family',
        p: 7500,
        features: [
            'Up to five enrolled members',
            'Family profiles and notifications',
            'Optional contracted transport benefits'
        ]
    },
    {
        n: 'Elite',
        p: 25000,
        features: [
            'Enhanced care coordination',
            'Medical transport and evacuation options',
            'Insurance terms and clinical necessity apply'
        ]
    }
];


// SAMPLE MEMBERSHIP ACCOUNTS

const baseM = [
    {
        id: 'M-001',
        name: 'Demo individual',
        plan: 'Individual',
        cycle: 'Monthly',
        fee: 2500
    },
    {
        id: 'M-002',
        name: 'Demo family',
        plan: 'Family',
        cycle: 'Monthly',
        fee: 7500
    },
    {
        id: 'M-003',
        name: 'Demo estate',
        plan: 'Corporate',
        cycle: 'Annual',
        fee: 2000000
    },
    {
        id: 'M-004',
        name: 'Demo basic',
        plan: 'Basic',
        cycle: 'Monthly',
        fee: 0
    }
];


// SAMPLE BILLING RECORDS

const baseB = [
    {
        id: 'INV-001',
        account: 'M-001',
        service: 'Individual membership',
        amount: 2500,
        payer: 'Member / organisation',
        status: 'Unpaid'
    },
    {
        id: 'INV-002',
        account: 'M-002',
        service: 'Family membership',
        amount: 7500,
        payer: 'Member / organisation',
        status: 'Paid (demo)'
    },
    {
        id: 'INV-003',
        account: 'M-003',
        service: 'Scheduled transport',
        amount: 15000,
        payer: 'Licensed insurance partner',
        status: 'Claim draft'
    }
];


// FLEXIBLE HEALTHCARE WORKFORCE

const baseS = [
    {
        id: 'S-001',
        zone: 'Ikeja',
        role: 'Emergency nurse',
        worker: 'Demo worker A',
        status: 'Open'
    },
    {
        id: 'S-002',
        zone: 'Mainland',
        role: 'Prehospital clinician',
        worker: 'Demo worker B',
        status: 'Open'
    },
    {
        id: 'S-003',
        zone: 'Lekki',
        role: 'Emergency nurse',
        worker: 'Demo worker C',
        status: 'Confirmed (demo)'
    }
];


// APPLICATION STATE

let members = clone(baseM);
let bills = clone(baseB);
let shifts3 = clone(baseS);

let mseq = 5;
let bseq = 4;


// UTILITY FUNCTIONS

const naira = amount =>
    '₦' + Math.round(amount).toLocaleString('en-NG');

const metric3 = (name, value, description = '') => `
    <div class="metric">
        <div class="label">${name}</div>
        <div class="num">${value}</div>
        <small>${description}</small>
    </div>
`;

const val3 = (id, minimum, maximum) =>
    Math.min(
        maximum,
        Math.max(minimum, Number($(id).value) || 0)
    );


// HEALTHCARE WORKFORCE CALCULATOR

function work3() {

    const ambulances = Math.ceil(
        val3('#wUnits', 1, 500)
    );

    const clinicalWorkers = val3('#wCrew', 1, 3);

    const reservePercentage = val3('#wShare', 0, 100);

    const additionalShifts = val3('#wShifts', 1, 3);

    const paymentPerShift = val3('#wPay', 0, 1000000);

    const effectiveWeeklyHours = val3('#wHours', 1, 48);


    // Three eight-hour shifts per day, seven days per week.

    const totalWeeklyShifts =
        ambulances * clinicalWorkers * 3 * 7;


    // Flexible healthcare workforce requirements.

    const reserveShifts = Math.ceil(
        totalWeeklyShifts * reservePercentage / 100
    );

    const coreShifts =
        totalWeeklyShifts - reserveShifts;

    const coreClinicalWorkers = Math.ceil(
        coreShifts * 8 / effectiveWeeklyHours
    );

    const minimumReserveWorkers = Math.ceil(
        reserveShifts / additionalShifts
    );

    const coreDrivers = Math.ceil(
        ambulances * 168 / effectiveWeeklyHours
    );

    const monthlyReservePay =
        reserveShifts * paymentPerShift * 52 / 12;


    // Display calculated workforce requirements.

    $('#workMetrics').innerHTML = [

        metric3(
            'Weekly clinical shifts',
            totalWeeklyShifts
        ),

        metric3(
            'Reserve shifts / week',
            reserveShifts
        ),

        metric3(
            'Core clinical workers',
            coreClinicalWorkers
        ),

        metric3(
            'Minimum reserve pool',
            minimumReserveWorkers
        ),

        metric3(
            'Core drivers',
            coreDrivers
        ),

        metric3(
            'Monthly reserve pay',
            naira(monthlyReservePay)
        )

    ].join('');


    // Display available and completed shifts.

    $('#shiftRows').innerHTML = `

        <table class="datatable">

            <thead>
                <tr>
                    <th>Shift</th>
                    <th>Zone</th>
                    <th>Role / 8h</th>
                    <th>Demo worker</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>

                ${shifts3.map(shift => `

                    <tr>

                        <td>${shift.id}</td>

                        <td>${esc(shift.zone)}</td>

                        <td>${esc(shift.role)}</td>

                        <td>${esc(shift.worker)}</td>

                        <td>${esc(shift.status)}</td>

                        <td>

                            ${shift.status === 'Open'

                                ? `
                                    <button data-shift="${shift.id}">
                                        Confirm eligible demo worker
                                    </button>
                                `

                                : shift.status === 'Confirmed (demo)'

                                    ? `
                                        <button data-shift="${shift.id}">
                                            Complete demo shift
                                        </button>
                                    `

                                    : '—'
                            }

                        </td>

                    </tr>

                `).join('')}

            </tbody>

        </table>
    `;
}


// MEMBERSHIP MANAGEMENT

function member3() {

    // Render membership pricing cards.

    $('#planCards').innerHTML = plans3.map(plan => `

        <article class="plan">

            <h3>${plan.n}</h3>

            <div class="price">

                ${naira(plan.p)}

                <span class="muted">/month</span>

            </div>

            <ul>

                ${plan.features.map(feature => `
                    <li>${esc(feature)}</li>
                `).join('')}

            </ul>

            <button data-pickplan="${plan.n}">
                Select demo plan
            </button>

        </article>

    `).join('');


    // Calculate membership revenue metrics.

    const paidMembers = members.filter(
        member => member.fee > 0
    );

    const annualRevenue = paidMembers.reduce(
        (total, member) =>
            total + member.fee *
            (member.cycle === 'Monthly' ? 12 : 1),
        0
    );

    const corporateMembers = members.filter(
        member => member.plan === 'Corporate'
    ).length;


    $('#memberMetrics').innerHTML = [

        metric3(
            'Demo accounts',
            members.length
        ),

        metric3(
            'Paid-plan accounts',
            paidMembers.length
        ),

        metric3(
            'Corporate accounts',
            corporateMembers
        ),

        metric3(
            'Annualised gross fees',
            naira(annualRevenue),
            'Not collected revenue'
        )

    ].join('');


    // Membership account register.

    $('#memberRows').innerHTML = `

        <table class="datatable">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Account</th>
                    <th>Plan</th>
                    <th>Fee / cycle</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>

                ${members.map(member => `

                    <tr>

                        <td>${member.id}</td>

                        <td>${esc(member.name)}</td>

                        <td>${esc(member.plan)}</td>

                        <td>
                            ${naira(member.fee)} /
                            ${esc(member.cycle)}
                        </td>

                        <td>

                            ${member.fee

                                ? `
                                    <button data-renew="${member.id}">
                                        Create renewal invoice
                                    </button>
                                `

                                : '—'
                            }

                        </td>

                    </tr>

                `).join('')}

            </tbody>

        </table>
    `;


    // Populate billing and citizen account selections.

    for (const id of ['#billAccount', '#citizenAccount']) {

        const previousValue = $(id).value;

        $(id).innerHTML =

            (
                id === '#citizenAccount'
                    ? '<option value="">No account (Basic access)</option>'
                    : ''
            )

            +

            members.map(member => `

                <option value="${member.id}">

                    ${esc(member.name)} · ${esc(member.plan)}

                </option>

            `).join('');


        if (
            [...$(id).options].some(
                option => option.value === previousValue
            )
        ) {
            $(id).value = previousValue;
        }

    }

    citizen3();
}


// CITIZEN MEMBERSHIP PORTAL

function citizen3() {

    const member = members.find(
        item => item.id === $('#citizenAccount').value
    );

    const plan = plans3.find(
        item => item.n === (member?.plan || 'Basic')
    );

    const features = plan?.features || [
        'Contracted organisation benefits'
    ];


    $('#citizenPlan').innerHTML = `

        <h3>

            ${member ? esc(member.name) + ' · ' : ''}

            ${plan?.n || 'Corporate'}

        </h3>

        <p>

            ${member

                ? naira(member.fee) + ' / ' + member.cycle

                : '₦0 / month'

            }

        </p>

        <ul>

            ${features.map(feature => `
                <li>${esc(feature)}</li>
            `).join('')}

        </ul>

        <p class="muted">
            Emergency priority is independent of membership.
        </p>

    `;
}


// BILLING AND INSURANCE CLAIMS

function bill3() {

    const paid = bills
        .filter(bill => bill.status === 'Paid (demo)')
        .reduce(
            (total, bill) => total + bill.amount,
            0
        );

    const totalInvoices = bills.reduce(
        (total, bill) => total + bill.amount,
        0
    );

    const outstanding = totalInvoices - paid;

    const claims = bills.filter(
        bill => bill.status.includes('Claim')
    ).length;


    // Billing metrics.

    $('#billMetrics').innerHTML = [

        metric3(
            'Demo invoices',
            bills.length
        ),

        metric3(
            'Simulated receipts',
            naira(paid)
        ),

        metric3(
            'Outstanding / claims',
            naira(outstanding)
        ),

        metric3(
            'Claim referrals',
            claims
        )

    ].join('');


    // Billing and claims register.

    $('#billRows').innerHTML = `

        <table class="datatable">

            <thead>
                <tr>
                    <th>Invoice</th>
                    <th>Account</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>

                ${bills.map(bill => `

                    <tr>

                        <td>${bill.id}</td>

                        <td>

                            ${esc(
                                members.find(
                                    member => member.id === bill.account
                                )?.name || bill.account
                            )}

                        </td>

                        <td>

                            ${esc(bill.service)}

                            <br>

                            <span class="muted">
                                ${esc(bill.payer)}
                            </span>

                        </td>

                        <td>${naira(bill.amount)}</td>

                        <td>${esc(bill.status)}</td>

                        <td>

                            ${bill.status === 'Unpaid'

                                ? `
                                    <button data-bill="${bill.id}">
                                        Simulate payment
                                    </button>
                                `

                                : bill.status === 'Claim draft'

                                    ? `
                                        <button data-bill="${bill.id}">
                                            Simulate claim referral
                                        </button>
                                    `

                                    : '—'
                            }

                        </td>

                    </tr>

                `).join('')}

            </tbody>

        </table>
    `;
}


// CREATE OPTIONAL SERVICE INVOICE

function addBill3(account, service, amount, payer) {

    if (!members.some(member => member.id === account)) {
        toast('Select a valid demo account.');
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        toast('Enter a valid invoice amount.');
        return;
    }

    const bill = {

        id: 'INV-' + String(bseq++).padStart(3, '0'),

        account,

        service,

        amount,

        payer,

        status:
            payer === 'Licensed insurance partner'
                ? 'Claim draft'
                : 'Unpaid'

    };

    bills.unshift(bill);

    log(bill.id + ': demo commercial invoice created.');

    bill3();

    toast('Demo invoice created.');
}


// REGISTER NEW MEMBER

$('#memberForm').addEventListener('submit', event => {

    event.preventDefault();

    const data = new FormData(event.target);

    const name = String(data.get('name')).trim();

    const plan = data.get('plan');

    const cycle =
        plan === 'Corporate'
            ? 'Annual'
            : data.get('cycle');

    const selectedPlan = plans3.find(
        item => item.n === plan
    );

    const fee =
        plan === 'Corporate'

            ? Number(data.get('quote'))

            : selectedPlan.p *
                (cycle === 'Annual' ? 12 : 1);


    if (!name || !Number.isFinite(fee) || fee < 0) {
        toast('Please enter valid account details.');
        return;
    }

    const id = 'M-' + String(mseq++).padStart(3, '0');

    members.push({
        id,
        name,
        plan,
        cycle,
        fee
    });

    log(id + ': demo account created.');

    member3();

    event.target.reset();

    toast('Demo account registered. No actual subscription.');

});


// CREATE NEW BILL

$('#billForm').addEventListener('submit', event => {

    event.preventDefault();

    const data = new FormData(event.target);

    const account = data.get('account');
    const amount = Number(data.get('amount'));

    if (
        !data.get('approved') ||
        !members.some(member => member.id === account) ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        toast('Complete the invoice requirements.');
        return;
    }

    addBill3(
        account,
        data.get('service'),
        amount,
        data.get('payer')
    );

    event.target.reset();

});


// UPDATE WORKFORCE CALCULATIONS

$('#workInputs').addEventListener('input', work3);


// UPDATE CITIZEN MEMBERSHIP PREVIEW

$('#citizenAccount').addEventListener('change', citizen3);


// MEMBERSHIP AND WORKFORCE EVENT HANDLERS

document.addEventListener('click', event => {

    const button = event.target.closest('button');

    if (!button) return;


    // SELECT A MEMBERSHIP PLAN

    if (button.dataset.pickplan) {

        $('#memberPlan').value = button.dataset.pickplan;

        $('#memberForm').querySelector('input').focus();


    // CREATE A MEMBERSHIP RENEWAL INVOICE

    } else if (button.dataset.renew) {

        const member = members.find(
            item => item.id === button.dataset.renew
        );

        if (member?.fee) {

            addBill3(
                member.id,
                member.plan + ' membership renewal',
                member.fee,
                'Member / organisation'
            );

            switchView('billing');

        }


    // PROCESS SIMULATED PAYMENT OR INSURANCE CLAIM

    } else if (button.dataset.bill) {

        const bill = bills.find(
            item => item.id === button.dataset.bill
        );

        if (!bill) return;

        if (bill.status === 'Unpaid') {

            bill.status = 'Paid (demo)';

        } else if (bill.status === 'Claim draft') {

            bill.status = 'Claim referred (demo)';

        } else {

            return;

        }

        log(bill.id + ': ' + bill.status);

        bill3();

        toast('Simulated update only.');


    // CONFIRM OR COMPLETE FLEXIBLE HEALTHCARE SHIFT

    } else if (button.dataset.shift) {

        const shift = shifts3.find(
            item => item.id === button.dataset.shift
        );

        if (!shift) return;

        if (shift.status === 'Open') {

            const eligible = confirm(

                'For this fictional shift only:\n\n' +

                'Confirm professional licence, employer approval, ' +

                'adequate rest, emergency competency and ' +

                'no roster conflict.'

            );

            if (!eligible) return;

            shift.status = 'Confirmed (demo)';

        } else if (shift.status === 'Confirmed (demo)') {

            shift.status = 'Completed (demo)';

        } else {

            return;

        }

        log(shift.id + ': ' + shift.status);

        work3();

        toast('Demo shift updated.');


    // CITIZEN SOS BUTTON

    } else if (button.id === 'citizenSOS') {

        // No membership or payment requirement.

        $('#incidentDialog').showModal();


    // RESET COMMERCIAL AND WORKFORCE DATA

    } else if (button.id === 'reset') {

        members = clone(baseM);

        bills = clone(baseB);

        shifts3 = clone(baseS);

        mseq = 5;

        bseq = 4;

        $('#memberForm').reset();

        $('#billForm').reset();

        const defaults = {

            wUnits: 10,

            wCrew: 2,

            wShare: 30,

            wShifts: 2,

            wPay: 20000,

            wHours: 32

        };

        for (const [id, value] of Object.entries(defaults)) {

            $('#' + id).value = value;

        }

        work3();

        member3();

        bill3();

    }

});


// INITIALISE COMMERCIAL AND WORKFORCE MODULES

work3();

member3();

bill3();
