// --- CATEGORY CONFIGURATION ---
const categories = [
  {
    key: "serviceUsers",
    totalId: "serviceUsers-total",
    meetings: [
      { key: "careConsultation", label: "Care Consultation" },
      { key: "serviceReview", label: "Service Review" },
      { key: "qa", label: "QA" },
      { key: "supportVisit", label: "Support Visit" },
      { key: "investigations", label: "Investigations" }
    ]
  },
  {
    key: "recruitment",
    totalId: "recruitment-total",
    meetings: [
      { key: "screeningCall", label: "Screening Call" },
      { key: "interview", label: "Interview" }
    ]
  },
  {
    key: "employment",
    totalId: "employment-total",
    meetings: [
      { key: "supervision", label: "Supervision" },
      { key: "appraisal", label: "Appraisal" },
      { key: "probationReview", label: "Probation Review" },
      { key: "disciplinary", label: "Disciplinary" },
      { key: "backToWork", label: "Back to Work" }
    ]
  },
  {
    key: "officeOperations",
    totalId: "officeOperations-total",
    meetings: [
      { key: "teamMeetings", label: "Team Meetings" }
    ]
  }
  // CARE PROFESSIONALS handled separately (dynamic)
];

// --- UTILITIES ---
function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? 0 : n;
}
function formatHours(n) {
  return n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// --- CALCULATION LOGIC ---
function calculateCategory(meetings, prefix = '') {
  let total = 0;
  meetings.forEach(mtg => {
    // Compose IDs
    const idHours = `${prefix}${mtg.key}-hours`;
    const idCount = `${prefix}${mtg.key}-count`;
    const hours = safeNum(document.getElementById(idHours)?.value);
    const count = safeNum(document.getElementById(idCount)?.value);
    total += hours * count;
  });
  return total;
}

function calculateCareProfessionals() {
  const wrapper = document.getElementById('careProfessionals-wrapper');
  let total = 0;
  wrapper.querySelectorAll('.cp-row').forEach(row => {
    const hours = safeNum(row.querySelector('.cp-hours')?.value);
    const count = safeNum(row.querySelector('.cp-count')?.value);
    total += hours * count;
  });
  return total;
}

function updateTotals() {
  let grand = 0;
  categories.forEach(cat => {
    const sum = calculateCategory(cat.meetings);
    document.getElementById(cat.totalId).textContent = `Total: ${formatHours(sum)} hours`;
    grand += sum;
  });
  // Care Professionals (dynamic)
  const cpTotal = calculateCareProfessionals();
  document.getElementById('careProfessionals-total').textContent = `Total: ${formatHours(cpTotal)} hours`;
  grand += cpTotal;
  document.getElementById('grandTotalValue').textContent = formatHours(grand);
}

// --- EVENT BINDING ---
function bindInputEvents() {
  // Static categories
  categories.forEach(cat => {
    cat.meetings.forEach(mtg => {
      ['hours', 'count'].forEach(suffix => {
        const id = `${mtg.key}-${suffix}`;
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateTotals);
      });
    });
  });
  // Care Professionals handled dynamically
}

// --- CARE PROFESSIONALS (DYNAMIC) ---
let cpIdCounter = 0;
function createCareProfessionalRow(labelValue = '', hoursValue = '', countValue = '') {
  cpIdCounter++;
  const row = document.createElement('div');
  row.className = 'cp-row meetings-grid';
  row.style.marginBottom = '8px';

  // Meeting label (free text)
  const labelDiv = document.createElement('div');
  labelDiv.style.display = "flex";
  labelDiv.style.alignItems = "center";
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.placeholder = 'Meeting Type';
  labelInput.className = 'cp-label';
  labelInput.value = labelValue;
  labelInput.setAttribute('aria-label', 'Care Professionals meeting type label');
  labelInput.style.width = '120px';
  labelInput.style.marginRight = '8px';
  labelInput.required = true;
  labelDiv.appendChild(labelInput);

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.title = 'Remove meeting type';
  removeBtn.innerHTML = '&times;';
  removeBtn.addEventListener('click', () => {
    row.remove();
    updateTotals();
  });
  labelDiv.appendChild(removeBtn);

  // Hours input
  const hoursDiv = document.createElement('div');
  const hoursInput = document.createElement('input');
  hoursInput.type = 'number';
  hoursInput.min = '0';
  hoursInput.step = '0.01';
  hoursInput.className = 'cp-hours';
  hoursInput.placeholder = 'Hours';
  hoursInput.inputMode = 'decimal';
  hoursInput.setAttribute('aria-label', 'Hours per meeting');
  hoursInput.value = hoursValue;
  hoursDiv.appendChild(hoursInput);

  // Count input
  const countDiv = document.createElement('div');
  const countInput = document.createElement('input');
  countInput.type = 'number';
  countInput.min = '0';
  countInput.step = '1';
  countInput.className = 'cp-count';
  countInput.placeholder = 'Meetings';
  countInput.inputMode = 'numeric';
  countInput.setAttribute('aria-label', 'Meetings per month');
  countInput.value = countValue;
  countDiv.appendChild(countInput);

  // Compose grid
  row.appendChild(labelDiv);
  row.appendChild(hoursDiv);
  row.appendChild(countDiv);

  // Event binding
  [labelInput, hoursInput, countInput].forEach(el => {
    el.addEventListener('input', updateTotals);
  });

  return row;
}

function addCareProfessionalRow() {
  const wrapper = document.getElementById('careProfessionals-wrapper');
  const row = createCareProfessionalRow();
  wrapper.appendChild(row);
  // Focus label for quick entry
  row.querySelector('.cp-label').focus();
  updateTotals();
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  bindInputEvents();

  // Add button for dynamic rows
  document.getElementById('add-care-professional-btn')
    .addEventListener('click', addCareProfessionalRow);

  // Add one empty row by default for Care Professionals
  addCareProfessionalRow();

  // First calculation
  updateTotals();

  // Prevent form submission
  document.getElementById('hours-calculator').addEventListener('submit', e => e.preventDefault());
});