/* ============================================
   CampusFix - Report Issue Page JavaScript
   Handles form validation, complaint generation,
   and localStorage storage
   ============================================ */

(function () {
  'use strict';

  // ----- DOM element references -----
  var form = document.getElementById('complaintForm');
  var successAlert = document.getElementById('successAlert');
  var errorAlert = document.getElementById('errorAlert');
  var successMessage = document.getElementById('successMessage');
  var errorMessage = document.getElementById('errorMessage');
  var resetBtn = document.getElementById('resetBtn');
  var descField = document.getElementById('description');
  var descHint = document.getElementById('descHint');
  var dateField = document.getElementById('date');

  // Set today's date as the default and max for the date field
  var today = new Date().toISOString().split('T')[0];
  dateField.value = today;
  dateField.max = today;

  // ----- Validation rules -----
  // Each function returns an error message string, or empty string if valid

  function validateName(name) {
    if (!name || name.trim() === '') {
      return 'Full name is required.';
    }
    // Allow letters, spaces, and hyphens/apostrophes only
    var namePattern = /^[a-zA-Z\s'-]{2,50}$/;
    if (!namePattern.test(name.trim())) {
      return 'Name must contain only letters, spaces, hyphens (2–50 characters).';
    }
    return '';
  }

  function validateEmail(email) {
    if (!email || email.trim() === '') {
      return 'Email is required.';
    }
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    return '';
  }

  function validateSelect(value, fieldName) {
    if (!value || value === '') {
      return fieldName + ' is required.';
    }
    return '';
  }

  function validateLocation(location) {
    if (!location || location.trim() === '') {
      return 'Campus location is required.';
    }
    return '';
  }

  function validateDescription(desc) {
    if (!desc || desc.trim() === '') {
      return 'Description is required.';
    }
    if (desc.trim().length < 10) {
      return 'Description must be at least 10 characters long.';
    }
    return '';
  }

  function validateDate(date) {
    if (!date || date === '') {
      return 'Date is required.';
    }
    // Check if date is valid and not in the future
    var entered = new Date(date);
    var todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999);
    if (isNaN(entered.getTime())) {
      return 'Please enter a valid date.';
    }
    if (entered > todayDate) {
      return 'Date cannot be in the future.';
    }
    return '';
  }

  // ----- Show / hide error for a single field -----
  function showError(fieldId, message) {
    var errorEl = document.getElementById(fieldId + 'Error');
    var inputEl = document.getElementById(fieldId);
    if (message) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
      inputEl.classList.add('form-control--error');
    } else {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
      inputEl.classList.remove('form-control--error');
    }
  }

  // ----- Validate all fields and return true if all valid -----
  function validateAll() {
    var name = document.getElementById('fullName').value;
    var email = document.getElementById('email').value;
    var dept = document.getElementById('department').value;
    var loc = document.getElementById('location').value;
    var cat = document.getElementById('category').value;
    var pri = document.getElementById('priority').value;
    var desc = document.getElementById('description').value;
    var dt = document.getElementById('date').value;

    var errors = [];

    var eName = validateName(name);       showError('fullName', eName);       if (eName) errors.push('Full Name: ' + eName);
    var eEmail = validateEmail(email);    showError('email', eEmail);          if (eEmail) errors.push('Email: ' + eEmail);
    var eDept = validateSelect(dept, 'Department'); showError('department', eDept); if (eDept) errors.push('Department: ' + eDept);
    var eLoc = validateLocation(loc);     showError('location', eLoc);         if (eLoc) errors.push('Location: ' + eLoc);
    var eCat = validateSelect(cat, 'Issue Category'); showError('category', eCat); if (eCat) errors.push('Category: ' + eCat);
    var ePri = validateSelect(pri, 'Priority');      showError('priority', ePri);  if (ePri) errors.push('Priority: ' + ePri);
    var eDesc = validateDescription(desc); showError('description', eDesc);   if (eDesc) errors.push('Description: ' + eDesc);
    var eDate = validateDate(dt);         showError('date', eDate);            if (eDate) errors.push('Date: ' + eDate);

    return errors;
  }

  // ----- Generate unique complaint ID (CF001, CF002, ...) -----
  function generateComplaintId() {
    var complaints = getComplaints();
    var nextNum = complaints.length + 1;

    // Find the highest existing number to avoid collisions after deletions
    var maxNum = 0;
    complaints.forEach(function (c) {
      var num = parseInt(c.complaintId.replace('CF', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });
    nextNum = maxNum + 1;

    // Pad with leading zeros to 3 digits
    return 'CF' + String(nextNum).padStart(3, '0');
  }

  // ----- localStorage helpers -----
  function getComplaints() {
    var raw = localStorage.getItem('campusfix_complaints');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  function saveComplaints(complaints) {
    localStorage.setItem('campusfix_complaints', JSON.stringify(complaints));
  }

  // ----- Hide alerts -----
  function hideAlerts() {
    successAlert.classList.remove('show');
    errorAlert.classList.remove('show');
  }

  // ----- Form submit event -----
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    hideAlerts();

    var errors = validateAll();

    if (errors.length > 0) {
      // Show error alert with list of errors
      errorMessage.innerHTML = errors.map(function (e) {
        return '• ' + e;
      }).join('<br>');
      errorAlert.classList.add('show');
      // Scroll to top so user sees the error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // All valid — create complaint object
    var complaint = {
      complaintId: generateComplaintId(),
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      department: document.getElementById('department').value,
      location: document.getElementById('location').value.trim(),
      category: document.getElementById('category').value,
      priority: document.getElementById('priority').value,
      description: document.getElementById('description').value.trim(),
      date: document.getElementById('date').value,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    // Save to localStorage
    var complaints = getComplaints();
    complaints.push(complaint);
    saveComplaints(complaints);

    // Show success message with complaint ID
    successMessage.innerHTML =
      'Your complaint has been recorded with ID <span class="complaint-id">' + complaint.complaintId + '</span>.<br>' +
      'You can track its status on the <a href="/dashboard.html">Dashboard</a> or ' +
      '<a href="/details.html?id=' + complaint.complaintId + '">view details now</a>.';
    successAlert.classList.add('show');

    // Reset the form for the next entry
    form.reset();
    dateField.value = today;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ----- Reset button event -----
  resetBtn.addEventListener('click', function () {
    hideAlerts();
    // Clear all field errors
    ['fullName', 'email', 'department', 'location', 'category', 'priority', 'description', 'date'].forEach(function (id) {
      showError(id, '');
    });
    // Restore default date
    setTimeout(function () {
      dateField.value = today;
    }, 0);
  });

  // ----- Real-time description character count hint -----
  descField.addEventListener('input', function () {
    var len = descField.value.trim().length;
    if (len === 0) {
      descHint.textContent = 'Minimum 10 characters required.';
      descHint.style.color = '';
    } else if (len < 10) {
      descHint.textContent = (10 - len) + ' more characters needed.';
      descHint.style.color = 'var(--warning-500)';
    } else {
      descHint.textContent = len + ' characters — looks good!';
      descHint.style.color = 'var(--success-500)';
    }
  });

  // ----- Real-time field validation on blur (when user leaves a field) -----
  function setupLiveValidation() {
    document.getElementById('fullName').addEventListener('blur', function () {
      showError('fullName', validateName(this.value));
    });
    document.getElementById('email').addEventListener('blur', function () {
      showError('email', validateEmail(this.value));
    });
    document.getElementById('location').addEventListener('blur', function () {
      showError('location', validateLocation(this.value));
    });
    document.getElementById('description').addEventListener('blur', function () {
      showError('description', validateDescription(this.value));
    });
  }

  setupLiveValidation();
})();
