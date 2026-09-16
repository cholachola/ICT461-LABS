// ---------------------------------------------------------------
// Element references
// ---------------------------------------------------------------
const form = document.getElementById('registrationForm');

const nameInput = document.getElementById('studentName');
const idInput = document.getElementById('studentId');
const programmeSelect = document.getElementById('programme');
const courseInputs = Array.from(document.querySelectorAll('input[name="courses"]'));

const welcomeMsg = document.getElementById('welcomeMsg');
const formStatus = document.getElementById('formStatus');

const errors = {
  studentName: document.getElementById('studentNameError'),
  studentId: document.getElementById('studentIdError'),
  programme: document.getElementById('programmeError'),
  courses: document.getElementById('coursesError'),
};

const STUDENT_ID_PATTERN = /^\d{6,10}$/;

// ---------------------------------------------------------------
// Live header: greets the student by name/ID as they type,
// before the form is even submitted.
// ---------------------------------------------------------------
function updateWelcomeMessage() {
  const name = nameInput.value.trim();
  const id = idInput.value.trim();

  if (!name && !id) {
    welcomeMsg.textContent = 'Welcome, future graduate.';
    return;
  }

  const namePart = name || 'future graduate';
  welcomeMsg.innerHTML = id
    ? `Welcome, ${escapeHtml(namePart)} <span class="student-id">(#${escapeHtml(id)})</span>`
    : `Welcome, ${escapeHtml(namePart)}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

nameInput.addEventListener('input', updateWelcomeMessage);
idInput.addEventListener('input', updateWelcomeMessage);

// ---------------------------------------------------------------
// Field-level validation helpers
// ---------------------------------------------------------------
function setError(field, input, message) {
  errors[field].textContent = message;
  if (input) input.classList.toggle('invalid', Boolean(message));
}

function clearError(field, input) {
  setError(field, input, '');
}

function validateName() {
  const value = nameInput.value.trim();
  if (!value) {
    setError('studentName', nameInput, 'Enter your full name.');
    return false;
  }
  clearError('studentName', nameInput);
  return true;
}

function validateStudentId() {
  const value = idInput.value.trim();
  if (!value) {
    setError('studentId', idInput, 'Enter your student ID.');
    return false;
  }
  if (!STUDENT_ID_PATTERN.test(value)) {
    setError('studentId', idInput, 'Student ID must be 6 to 10 digits, numbers only.');
    return false;
  }
  clearError('studentId', idInput);
  return true;
}

function validateProgramme() {
  if (!programmeSelect.value) {
    setError('programme', programmeSelect, 'Select your programme.');
    return false;
  }
  clearError('programme', programmeSelect);
  return true;
}

function validateCourses() {
  const anyChecked = courseInputs.some((input) => input.checked);
  if (!anyChecked) {
    setError('courses', null, 'Select at least one course.');
    return false;
  }
  clearError('courses', null);
  return true;
}

// Validate as the student fixes each field, not just on submit
nameInput.addEventListener('blur', validateName);
idInput.addEventListener('blur', validateStudentId);
programmeSelect.addEventListener('change', validateProgramme);
courseInputs.forEach((input) => input.addEventListener('change', validateCourses));

// ---------------------------------------------------------------
// Submit handling
// ---------------------------------------------------------------
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const validations = [
    validateName(),
    validateStudentId(),
    validateProgramme(),
    validateCourses(),
  ];

  const isValid = validations.every(Boolean);

  if (!isValid) {
    formStatus.textContent = 'Please fix the highlighted fields before submitting.';
    formStatus.className = 'form-status error';

    // Move focus to the first invalid field for accessibility
    const firstInvalid = form.querySelector('.invalid, .course-list.invalid');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const selectedCourses = courseInputs
    .filter((input) => input.checked)
    .map((input) => input.value);

  // NOTE FOR THE LAB WRITE-UP:
  // This is client-side validation only — it's a convenience for the
  // student, not a security control. Everything checked here must be
  // re-checked on the server before the registration is saved, because
  // a request can bypass the browser entirely (curl, Postman, disabled
  // JS, a modified client). At minimum, the server must re-validate:
  //   - required fields are present and non-empty
  //   - studentId matches the expected format/length AND actually
  //     exists / belongs to the requesting user (auth check)
  //   - programme is one of the allowed values (not just "not empty")
  //   - each submitted course code exists, is open for registration,
  //     and the student meets any prerequisites
  //   - no duplicate registration for the same course/semester
  //   - input is sanitised/escaped before storage or display to
  //     prevent injection (SQL injection, stored XSS, etc.)
  console.log('Registration submitted:', {
    name: nameInput.value.trim(),
    studentId: idInput.value.trim(),
    programme: programmeSelect.value,
    courses: selectedCourses,
  });

  formStatus.textContent = `Registered! ${selectedCourses.length} course(s) submitted for ${nameInput.value.trim()}.`;
  formStatus.className = 'form-status success';
});
