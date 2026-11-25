
// LIERMS — Emergency Operations Management
// All records and emergency assignments are simulations.

// LAGOS COVERAGE ZONES

const Z = [
    ['Ikeja', 'Ikeja, Agege, Ifako-Ijaiye', 205, 64],
    ['Alimosho', 'Alimosho', 115, 94],
    ['Oshodi', 'Oshodi-Isolo, Mushin', 196, 130],
    ['Kosofe', 'Kosofe, Shomolu', 279, 94],
    ['Mainland', 'Lagos Mainland, Surulere', 245, 178],
    ['Apapa', 'Apapa, Ajeromi-Ifelodun, Amuwo-Odofin', 182, 218],
    ['Ojo', 'Ojo', 108, 194],
    ['Badagry', 'Badagry', 39, 235],
    ['Lagos Island', 'Lagos Island', 293, 241],
    ['Lekki', 'Eti-Osa', 382, 254],
    ['Ikorodu', 'Ikorodu', 375, 50],
    ['Epe–Ibeju', 'Epe, Ibeju-Lekki', 538, 98]
];


// SIMULATED EMERGENCY INCIDENTS

const baseI = [
    {
        id: 'LG-1001',
        type: 'Medical',
        title: 'Simulated critical medical request',
        zone: 'Ikeja',
        priority: 'Critical',
        status: 'New',
        unit: null
    },
    {
        id: 'LG-1002',
        type: 'Fire',
        title: 'Simulated building fire report',
        zone: 'Mainland',
        priority: 'High',
        status: 'Dispatched',
        unit: 'DEMO-F02'
    },
    {
        id: 'LG-1003',
        type: 'Road rescue',
        title: 'Simulated road collision',
        zone: 'Lekki',
        priority: 'High',
        status: 'New',
        unit: null
    },
    {
        id: 'LG-1004',
        type: 'Water rescue',
        title: 'Simulated water assistance',
        zone: 'Ikorodu',
        priority: 'High',
        status: 'New',
        unit: null
    },
    {
        id: 'LG-1005',
        type: 'Medical',
        title: 'Simulated patient transfer',
        zone: 'Alimosho',
        priority: 'Routine',
        status: 'En route',
        unit: 'DEMO-A03'
    },
    {
        id: 'LG-1006',
        type: 'Security liaison',
        title: 'Simulated request for agency referral',
        zone: 'Oshodi',
        priority: 'High',
        status: 'New',
        unit: null
    },
    {
        id: 'LG-1007',
        type: 'Medical',
        title: 'Simulated medical case',
        zone: 'Lagos Island',
        priority: 'Routine',
        status: 'Resolved',
        unit: null
    }
];


// SIMULATED EMERGENCY RESOURCES

const baseR = [
    {
        id: 'DEMO-A01',
        type: 'Medical',
        label: 'Ground ambulance',
        zone: 'Ikeja',
        status: 'Available'
    },
    {
        id: 'DEMO-A02',
        type: 'Medical',
        label: 'Ground ambulance',
        zone: 'Lekki',
        status: 'Available'
    },
    {
        id: 'DEMO-A03',
        type: 'Medical',
        label: 'Ground ambulance',
        zone: 'Alimosho',
        status: 'Assigned'
    },
    {
        id: 'DEMO-F01',
        type: 'Fire',
        label: 'Fire response unit',
        zone: 'Ikeja',
        status: 'Available'
    },
    {
        id: 'DEMO-F02',
        type: 'Fire',
        label: 'Fire response unit',
        zone: 'Mainland',
        status: 'Assigned'
    },
    {
        id: 'DEMO-R01',
        type: 'Road rescue',
        label: 'Road response unit',
        zone: 'Lekki',
        status: 'Available'
    },
    {
        id: 'DEMO-W01',
        type: 'Water rescue',
        label: 'Water response unit',
        zone: 'Ikorodu',
        status: 'Available'
    },
    {
        id: 'DEMO-M01',
        type: 'Medical',
        label: 'Motorcycle responder',
        zone: 'Oshodi',
        status: 'Offline'
    },
    {
        id: 'DEMO-S01',
        type: 'Security liaison',
        label: 'Agency liaison desk',
        zone: 'Oshodi',
        status: 'Available'
    },
    {
        id: 'DEMO-H01',
        type: 'Air coordination',
        label: 'Aviation liaison desk',
        zone: 'Ikeja',
        status: 'Offline'
    },
    {
        id: 'DEMO-D01',
        type: 'Disaster',
        label: 'Disaster coordination desk',
        zone: 'Mainland',
        status: 'Available'
    }
];


// APPLICATION STATE

let incidents;
let resources;
let events;
let selected;
let zone = 'All';
let filter = 'All';
let nextId;
let view = 'overview';


// UTILITY FUNCTIONS

const $ = selector => document.querySelector(selector);

const clone = value => JSON.parse(JSON.stringify(value));

const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

const icon = {
    Medical: '✚',
    Fire: '♨',
    'Road rescue': '↔',
    'Water rescue': '≈',
    'Security liaison': '◇',
    'Air coordination': '↑',
    Disaster: '!'
};

const rank = {
    Critical: 0,
    High: 1,
    Routine: 2
};

const pill = (status, className) =>
    `<span class="pill ${className}">${esc(status)}</span>`;

const pri = status => pill(status, status.toLowerCase());

const stat = status => pill(
    status,
    status === 'Available' || status === 'Resolved'
        ? 'ready'
        : status === 'Offline'
            ? 'offline'
            : 'assigned'
);


// ACTIVITY LOG

function log(message) {
    events.unshift({
        t: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        msg: message
    });

    renderAudit();
}

function renderAudit() {
    $('#auditRows').innerHTML = events.map(event => `
        <div class="step">
            <span class="muted">${esc(event.t)}</span>
            <strong>${esc(event.msg)}</strong>
        </div>
    `).join('');
}


// NOTIFICATIONS

function toast(message) {
    $('#toast').textContent = message;
    $('#toast').style.display = 'block';

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        $('#toast').style.display = 'none';
    }, 3000);
}


// RESET APPLICATION

function reset() {
    incidents = clone(baseI);
    resources = clone(baseR);
    events = [];
    selected = 'LG-1001';
    zone = 'All';
    filter = 'All';
    nextId = 1008;

    log('Demo session initialised. All records are fictional.');

    render();
    switchView('overview');
}


// NAVIGATION

function switchView(newView) {
    view = newView;

    document.querySelectorAll('.view').forEach(element => {
        element.classList.toggle('active', element.id === newView);
    });

    document.querySelectorAll('nav button').forEach(button => {
        button.classList.toggle(
            'active',
            button.dataset.view === newView
        );
    });

    render();

    window.scrollTo({
        top: 0,
        behavior: 'instant'
    });
}


// ZONE AND INCIDENT FILTERING

function setZone(newZone) {
    zone = newZone;
    filter = 'All';
    render();
}

function openCases() {
    return incidents.filter(
        incident => incident.status !== 'Resolved'
    );
}

function shown() {
    return openCases()
        .filter(incident => {
            const zoneMatches =
                zone === 'All' || incident.zone === zone;

            const serviceMatches =
                filter === 'All' ||
                (
                    filter === 'Other'
                        ? !['Medical', 'Fire', 'Road rescue']
                            .includes(incident.type)
                        : incident.type === filter
                );

            return zoneMatches && serviceMatches;
        })
        .sort((a, b) =>
            rank[a.priority] - rank[b.priority] ||
            a.id.localeCompare(b.id)
        );
}

function choose(id) {
    selected = id;
    render();
}


// MAIN DASHBOARD RENDERING

function render() {

    const open = openCases();
    const items = shown();

    if (!items.some(incident => incident.id === selected)) {
        selected = items[0]?.id ?? null;
    }

    const available = resources.filter(
        resource => resource.status === 'Available'
    ).length;

    const metrics = [
        [
            'Open incidents',
            open.length,
            '',
            'Statewide · simulated'
        ],
        [
            'Critical incidents',
            open.filter(i => i.priority === 'Critical').length,
            'red',
            'Requires priority review'
        ],
        [
            'Available resources',
            available,
            'green',
            `${resources.length} sample resources`
        ],
        [
            'Resolved incidents',
            incidents.filter(i => i.status === 'Resolved').length,
            '',
            'Demo session records'
        ]
    ];

    $('#metrics').innerHTML = metrics.map(
        ([label, number, colour, description]) => `
            <div class="metric">
                <div class="label">${label}</div>
                <div class="num ${colour}">${number}</div>
                <small>${description}</small>
            </div>
        `
    ).join('');

    $('#zoneSelect').value = zone;

    document.querySelectorAll('[data-filter]').forEach(button => {
        button.classList.toggle(
            'active',
            button.dataset.filter === filter
        );
    });

    $('#queuecount').textContent =
        `${items.length} open · ${zone === 'All' ? 'all zones' : zone}`;

    renderQueue(items);
    renderMap(open);
    renderDetail();
    renderResources();
    renderIncidentTable();
    renderZones(open);
    renderAudit();
}


// EMERGENCY INCIDENT QUEUE

function renderQueue(items) {

    $('#queue').innerHTML = items.length

        ? items.map(incident => `
            <button
                class="incident ${incident.id === selected ? 'selected' : ''}"
                data-incident="${incident.id}">

                <div class="itype">
                    ${icon[incident.type]}
                </div>

                <div class="text">
                    <b>${esc(incident.title)}</b>
                    <span class="muted">
                        ${incident.id} ·
                        ${esc(incident.zone)} ·
                        ${esc(incident.status)}
                    </span>
                </div>

                <div class="right">
                    ${pri(incident.priority)}
                </div>

            </button>
        `).join('')

        : '<div class="empty">No matching open incidents.</div>';
}


// SCHEMATIC LAGOS MAP

function renderMap(open) {

    $('#pins').innerHTML = Z.map(
        ([name, lgas, x, y], index) => {

            const active = open.filter(
                incident => incident.zone === name
            );

            const colour = active.some(
                incident => incident.priority === 'Critical'
            )
                ? '#c54a55'
                : active.length
                    ? '#d39740'
                    : '#348c77';

            return `
                <g class="zone-pin"
                   data-zone="${esc(name)}"
                   tabindex="0"
                   role="button"
                   aria-label="Filter ${esc(name)}">

                    <title>
                        ${esc(name)}: ${active.length} open incidents
                    </title>

                    ${zone === name ? `
                        <circle
                            cx="${x}" cy="${y}" r="20"
                            fill="none"
                            stroke="#0a7662"
                            stroke-width="2"
                            stroke-dasharray="3 2"/>
                    ` : ''}

                    <circle
                        cx="${x}"
                        cy="${y}"
                        r="12"
                        fill="${colour}"
                        stroke="white"
                        stroke-width="2"/>

                    <text
                        x="${x}"
                        y="${y + 4}"
                        text-anchor="middle"
                        font-size="11"
                        font-weight="700"
                        fill="white">

                        ${index + 1}

                    </text>

                    <text
                        x="${x}"
                        y="${y + 26}"
                        text-anchor="middle"
                        font-size="10"
                        font-weight="650"
                        fill="#334e4c"
                        stroke="#e6eee8"
                        stroke-width="2.6"
                        paint-order="stroke">

                        ${esc(name)}

                    </text>
                </g>
            `;
        }
    ).join('');
}


// SELECTED INCIDENT DETAILS

function renderDetail() {

    const incident = incidents.find(
        item => item.id === selected
    );

    $('#selectedId').textContent = incident?.id || '';

    if (!incident) {
        $('#detail').innerHTML = `
            <div class="empty">
                Select an open incident to review.
            </div>
        `;
        return;
    }

    const matching = resources
        .filter(resource =>
            resource.type === incident.type &&
            resource.status === 'Available' &&
            (
                incident.type !== 'Medical' ||
                resource.label === 'Ground ambulance'
            )
        )
        .sort((a, b) =>
            Number(b.zone === incident.zone) -
            Number(a.zone === incident.zone)
        );

    const next = {
        Dispatched: 'En route',
        'En route': 'On scene',
        'On scene': 'Resolved'
    }[incident.status];

    const assignmentControls = `
        <label class="muted" for="unitSelect">
            Select sample resource
        </label>

        <select id="unitSelect"
                style="width:100%;padding:9px;
                border:1px solid var(--line);
                border-radius:6px;margin-top:4px">

            ${matching.length
                ? matching.map(resource => `
                    <option value="${resource.id}">
                        ${esc(
                            resource.id + ' · ' +
                            resource.label + ' · ' +
                            resource.zone
                        )}
                    </option>
                `).join('')
                : '<option value="">No matching available sample resource</option>'
            }

        </select>

        <div class="actions">
            <button class="primary" id="dispatch"
                    ${matching.length ? '' : 'disabled'}>
                Simulate assignment
            </button>
        </div>
    `;

    const statusControls = `
        <div class="actions">
            ${next ? `
                <button class="primary" id="advance">
                    ${next === 'Resolved'
                        ? 'Resolve simulation'
                        : 'Mark ' + next.toLowerCase()}
                </button>
            ` : ''}
        </div>
    `;

    $('#detail').innerHTML = `

        <div class="row">
            ${pri(incident.priority)}
            ${stat(incident.status)}
        </div>

        <h3 style="margin-top:10px">
            ${esc(incident.title)}
        </h3>

        <div class="details">

            <div>
                <div class="muted">Planning zone</div>
                <div class="value">${esc(incident.zone)}</div>
            </div>

            <div>
                <div class="muted">Service</div>
                <div class="value">${esc(incident.type)}</div>
            </div>

            <div>
                <div class="muted">Assigned resource</div>
                <div class="value">
                    ${esc(incident.unit || 'Unassigned')}
                </div>
            </div>

            <div>
                <div class="muted">Record source</div>
                <div class="value">Simulation</div>
            </div>

        </div>

        ${incident.status === 'New'
            ? assignmentControls
            : statusControls}

        <div class="log">

            <strong class="muted">Case activity</strong>

            ${events
                .filter(event => event.msg.includes(incident.id))
                .slice(0, 4)
                .map(event => `
                    <div>
                        ${esc(event.t)} · ${esc(event.msg)}
                    </div>
                `).join('')
                || '<div>No new session activity.</div>'}

        </div>
    `;
}


// RESOURCE MANAGEMENT

function renderResources() {

    $('#quickResources').innerHTML = resources
        .slice(0, 6)
        .map(resource => `
            <div class="resrow">
                <div>
                    <b>${esc(resource.label)}</b>
                    <small>
                        ${resource.id} · ${esc(resource.zone)}
                    </small>
                </div>
                ${stat(resource.status)}
            </div>
        `).join('');

    $('#resourceCards').innerHTML = resources.map(resource => `

        <div class="resource-card">

            ${stat(resource.status)}

            <h3>${esc(resource.label)}</h3>

            <div class="muted">
                ${resource.id} · ${esc(resource.zone)}
            </div>

            <div class="muted" style="margin-top:6px">
                ${esc(resource.type)} · simulated
            </div>

            ${resource.status === 'Assigned' ? '' : `
                <button
                    style="margin-top:10px;font-size:11px"
                    data-resource="${resource.id}">

                    ${resource.status === 'Available'
                        ? 'Mark offline'
                        : 'Mark available'}

                </button>
            `}

        </div>

    `).join('');
}


// INCIDENT REGISTER

function renderIncidentTable() {

    $('#incidentTable').innerHTML = `

        <table class="datatable">

            <thead>
                <tr>
                    <th>Incident</th>
                    <th>Service</th>
                    <th>Zone</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>

                ${incidents.map(incident => `
                    <tr>

                        <td>
                            <b>${incident.id}</b>
                            <br>
                            ${esc(incident.title)}
                        </td>

                        <td>${esc(incident.type)}</td>
                        <td>${esc(incident.zone)}</td>
                        <td>${pri(incident.priority)}</td>
                        <td>${stat(incident.status)}</td>

                        <td>
                            ${incident.status === 'Resolved'
                                ? '—'
                                : `
                                    <button data-open="${incident.id}">
                                        Open
                                    </button>
                                `
                            }
                        </td>

                    </tr>
                `).join('')}

            </tbody>

        </table>
    `;
}


// GEOGRAPHICAL COVERAGE REGISTER

function renderZones(open) {

    $('#zoneCards').innerHTML = Z.map(
        ([name, lgas], index) => {

            const incidentCount = open.filter(
                incident => incident.zone === name
            ).length;

            const resourceCount = resources.filter(
                resource =>
                    resource.zone === name &&
                    resource.status === 'Available'
            ).length;

            return `
                <div class="zonecard">

                    <div class="eyebrow">
                        Zone ${String(index + 1).padStart(2, '0')}
                    </div>

                    <h3>${esc(name)}</h3>

                    <div class="muted">
                        ${esc(lgas)}
                    </div>

                    <p>
                        <b>${incidentCount}</b> open incidents ·
                        <b>${resourceCount}</b> sample resources available
                    </p>

                    <button data-zoneopen="${esc(name)}">
                        View queue
                    </button>

                </div>
            `;
        }
    ).join('');
}


// HOSPITAL COORDINATION

const demoHospitals = [
    ['Demo Hospital A', 'Ikeja', 'Trauma & emergency care', 4],
    ['Demo Hospital B', 'Mainland', 'General emergency care', 0],
    ['Demo Hospital C', 'Lekki', 'Cardiac & emergency care', 3],
    ['Demo Hospital D', 'Ikorodu', 'General emergency care', 2]
];

$('#hospitalRows').innerHTML = demoHospitals.map(hospital => `
    <tr>
        <td><b>${hospital[0]}</b></td>
        <td>${hospital[1]}</td>
        <td>${hospital[2]}</td>
        <td>${hospital[3]}</td>
        <td>
            ${pill(
                hospital[3] ? 'Accepting (demo)' : 'At capacity',
                hospital[3] ? 'ready' : 'critical'
            )}
        </td>
    </tr>
`).join('');


// POPULATE ZONE SELECTIONS

$('#zoneSelect').innerHTML =
    '<option>All</option>' +
    Z.map(([name]) =>
        `<option>${esc(name)}</option>`
    ).join('');

$('#formZone').innerHTML =
    Z.map(([name]) =>
        `<option>${esc(name)}</option>`
    ).join('');


// SIMULATED DISPATCH

function dispatchIncident() {

    const incident = incidents.find(
        item => item.id === selected
    );

    const selectedResource = $('#unitSelect')?.value;

    const resource = resources.find(
        item => item.id === selectedResource
    );

    if (
        !incident ||
        !resource ||
        incident.status !== 'New' ||
        resource.status !== 'Available' ||
        resource.type !== incident.type
    ) {
        toast('No matching available resource.');
        return;
    }

    if (
        incident.type === 'Medical' &&
        resource.label !== 'Ground ambulance'
    ) {
        toast('Select an appropriate simulated ambulance.');
        return;
    }

    incident.unit = resource.id;
    incident.status = 'Dispatched';
    resource.status = 'Assigned';

    log(`${incident.id}: simulated assignment to ${resource.id}.`);

    render();

    toast('Assignment simulated. No real resource contacted.');
}


// UPDATE INCIDENT STATUS

function advanceIncident() {

    const incident = incidents.find(
        item => item.id === selected
    );

    const next = {
        Dispatched: 'En route',
        'En route': 'On scene',
        'On scene': 'Resolved'
    }[incident?.status];

    if (!incident || !next) return;

    incident.status = next;

    log(`${incident.id}: status changed to ${next}.`);

    if (next === 'Resolved') {

        const resource = resources.find(
            item => item.id === incident.unit
        );

        if (resource) {
            resource.status = 'Available';
        }
    }

    render();
    toast('Simulation status: ' + next);
}


// EVENT HANDLERS

document.addEventListener('click', event => {

    const button = event.target.closest('button,[data-zone]');

    if (!button) return;

    if (button.dataset.view) {

        switchView(button.dataset.view);

    } else if (button.dataset.jump) {

        switchView(button.dataset.jump);

    } else if (button.dataset.filter) {

        filter = button.dataset.filter;
        render();

    } else if (button.dataset.incident) {

        choose(button.dataset.incident);

    } else if (button.dataset.zone) {

        setZone(button.dataset.zone);

    } else if (button.dataset.zoneopen) {

        setZone(button.dataset.zoneopen);
        switchView('overview');

    } else if (button.dataset.open) {

        zone = 'All';
        filter = 'All';
        selected = button.dataset.open;
        switchView('overview');

    } else if (button.dataset.resource) {

        const resource = resources.find(
            item => item.id === button.dataset.resource
        );

        if (!resource || resource.status === 'Assigned') return;

        resource.status =
            resource.status === 'Available'
                ? 'Offline'
                : 'Available';

        log(
            `${resource.id}: readiness changed to ${resource.status}.`
        );

        render();

        toast('Demo resource updated.');

    } else if (button.id === 'clearZone') {

        setZone('All');

    } else if (
        button.id === 'newIncident' ||
        button.id === 'newIncident2'
    ) {

        $('#incidentDialog').showModal();

    } else if (button.id === 'cancel') {

        $('#incidentDialog').close();

    } else if (button.id === 'reset') {

        reset();
        toast('Demo reset.');

    } else if (button.id === 'dispatch') {

        dispatchIncident();

    } else if (button.id === 'advance') {

        advanceIncident();

    }
});


// ACCESSIBLE MAP NAVIGATION

$('#map').addEventListener('keydown', event => {

    if (
        (event.key === 'Enter' || event.key === ' ') &&
        event.target.dataset.zone
    ) {
        event.preventDefault();
        setZone(event.target.dataset.zone);
    }

});

$('#zoneSelect').addEventListener('change', event => {
    setZone(event.target.value);
});


// CREATE EMERGENCY INCIDENT

$('#incidentForm').addEventListener('submit', event => {

    event.preventDefault();

    const data = new FormData(event.target);

    const incident = {
        id: 'LG-' + nextId++,
        type: data.get('type'),
        zone: data.get('zone'),
        title: data.get('title').trim(),
        priority: data.get('priority'),
        status: 'New',
        unit: null
    };

    if (!incident.title) return;

    incidents.unshift(incident);

    log(`${incident.id}: simulated incident created.`);

    selected = incident.id;
    zone = 'All';
    filter = 'All';

    $('#incidentDialog').close();
    event.target.reset();

    switchView('overview');

    toast('Demo incident created. No emergency request sent.');

});


// INITIALISE APPLICATION

reset();
