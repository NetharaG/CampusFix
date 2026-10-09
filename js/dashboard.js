/* ============================================
   CampusFix - Dashboard Page JavaScript
   Handles stats, search, filters, sorting,
   and dynamic table generation via DOM manipulation
   ============================================ */

(function () {
  'use strict';

  // ----- State variables -----
  var allComplaints = [];       // Full list from localStorage
  var filteredComplaints = [];  // List after search/filter/sort
  var sortDirection = 'desc';   // Default: newest first

  // ----- DOM references -----
  var tableBody = document.getElementById('complaintTableBody');
  var emptyState = document.getElementById('emptyState');
  var resultCount = document.getElementById('resultCount');
  var searchInput = document.getElementById('searchInput');
  var filterCategory = document.getElementById('filterCategory');
  var filterPriority = document.getElementById('filterPriority');
  var filterStatus = document.getElementById('filterStatus');
  var sortDateSelect = document.getElementById('sortDate');
  var sortDateHeader = document.getElementById('sortDateHeader');

  // ----- localStorage helper -----
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

  // ----- Update the 5 statistics cards -----
  function updateStats(complaints) {
    var total = complaints.length;
    var pending = 0;
    var inProgress = 0;
    var resolved = 0;
    var critical = 0;

    complaints.forEach(function (c) {
      if (c.status === 'Pending') pending++;
      if (c.status === 'In Progress') inProgress++;
      if (c.status === 'Resolved') resolved++;
      if (c.priority === 'Critical') critical++;
    });

    document.getElementById('dashTotal').textContent = total;
    document.getElementById('dashPending').textContent = pending;
    document.getElementById('dashProgress').textContent = inProgress;
    document.getElementById('dashResolved').textContent = resolved;
    document.getElementById('dashCritical').textContent = critical;
  }

  // ----- Helper: create a priority badge element -----
  function createPriorityBadge(priority) {
    var badge = document.createElement('span');
    badge.className = 'badge badge--' + priority.toLowerCase();
    badge.textContent = priority;
    return badge;
  }

  // ----- Helper: create a status badge element -----
  function createStatusBadge(status) {
    var badge = document.createElement('span');
    var statusClass = 'pending';
    if (status === 'Under Review') statusClass = 'review';
    else if (status === 'In Progress') statusClass = 'progress';
    else if (status === 'Resolved') statusClass = 'resolved';
    badge.className = 'badge badge--' + statusClass;
    badge.textContent = status;
    return badge;
  }

  // ----- Helper: format date for display -----
  function formatDate(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }

  // ----- Render complaint rows in the table -----
  function renderTable(complaints) {
    // Clear existing rows
    tableBody.innerHTML = '';

    if (complaints.length === 0) {
      // Show empty state, hide table
      emptyState.style.display = 'block';
      document.getElementById('complaintTable').style.display = 'none';
      resultCount.textContent = '';
      return;
    }

    // Hide empty state, show table
    emptyState.style.display = 'none';
    document.getElementById('complaintTable').style.display = '';

    // Update result count text
    resultCount.textContent = 'Showing ' + complaints.length + ' of ' + allComplaints.length + ' complaints';

    // Create a table row for each complaint using DOM manipulation
    complaints.forEach(function (c) {
      var tr = document.createElement('tr');

      // Complaint ID cell
      var tdId = document.createElement('td');
      tdId.setAttribute('data-label', 'Complaint ID');
      var idSpan = document.createElement('span');
      idSpan.className = 'complaint-id-cell';
      idSpan.textContent = c.complaintId;
      tdId.appendChild(idSpan);
      tr.appendChild(tdId);

      // Category cell
      var tdCat = document.createElement('td');
      tdCat.setAttribute('data-label', 'Category');
      tdCat.textContent = c.category;
      tr.appendChild(tdCat);

      // Location cell
      var tdLoc = document.createElement('td');
      tdLoc.setAttribute('data-label', 'Location');
      tdLoc.textContent = c.location;
      tr.appendChild(tdLoc);

      // Priority cell (with badge)
      var tdPri = document.createElement('td');
      tdPri.setAttribute('data-label', 'Priority');
      tdPri.appendChild(createPriorityBadge(c.priority));
      tr.appendChild(tdPri);

      // Status cell (with badge)
      var tdStatus = document.createElement('td');
      tdStatus.setAttribute('data-label', 'Status');
      tdStatus.appendChild(createStatusBadge(c.status));
      tr.appendChild(tdStatus);

      // Date cell
      var tdDate = document.createElement('td');
      tdDate.setAttribute('data-label', 'Date');
      tdDate.textContent = formatDate(c.date);
      tr.appendChild(tdDate);

      // Description cell (truncated to ~50 chars with ellipsis)
      var tdDesc = document.createElement('td');
      tdDesc.className = 'desc-cell';
      tdDesc.setAttribute('data-label', 'Description');
      var preview = c.description;
      if (preview.length > 50) {
        preview = preview.substring(0, 50) + '...';
      }
      tdDesc.textContent = preview;
      tdDesc.title = c.description; // Show full text on hover
      tr.appendChild(tdDesc);

      // Action cell — View Details button (with click event handling)
      var tdAction = document.createElement('td');
      tdAction.className = 'action-cell';
      tdAction.setAttribute('data-label', 'Actions');
      var btn = document.createElement('button');
      btn.className = 'btn btn--primary btn--sm view-details-btn';
      btn.textContent = 'View Details';
      // Store complaint ID in the button's dataset for the click handler
      btn.setAttribute('data-complaint-id', c.complaintId);
      // Event handler: store selected complaint ID in localStorage, then navigate
      btn.addEventListener('click', function () {
        localStorage.setItem('campusfix_selected_complaint', c.complaintId);
        window.location.href = 'details.html?id=' + encodeURIComponent(c.complaintId);
      });
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);

      // Append the row to the table body
      tableBody.appendChild(tr);
    });
  }

  // ----- Apply search, filters, and sorting -----
  function applyFilters() {
    var searchTerm = searchInput.value.trim().toLowerCase();
    var catFilter = filterCategory.value;
    var priFilter = filterPriority.value;
    var statusFilter = filterStatus.value;

    // Start with all complaints
    filteredComplaints = allComplaints.filter(function (c) {
      // Search: match against complaint ID, location, or description
      var matchesSearch = true;
      if (searchTerm !== '') {
        var searchContent = (
          c.complaintId + ' ' +
          c.location + ' ' +
          c.description + ' ' +
          c.name + ' ' +
          c.category
        ).toLowerCase();
        matchesSearch = searchContent.indexOf(searchTerm) !== -1;
      }

      // Category filter
      var matchesCat = (catFilter === '' || c.category === catFilter);

      // Priority filter
      var matchesPri = (priFilter === '' || c.priority === priFilter);

      // Status filter
      var matchesStatus = (statusFilter === '' || c.status === statusFilter);

      return matchesSearch && matchesCat && matchesPri && matchesStatus;
    });

    // Sort by date
    filteredComplaints.sort(function (a, b) {
      var dateA = new Date(a.date).getTime();
      var dateB = new Date(b.date).getTime();
      if (sortDirection === 'desc') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });

    // Re-render the table with filtered results
    renderTable(filteredComplaints);
  }

  // ----- Update sort header visual indicator -----
  function updateSortHeader() {
    sortDateHeader.classList.remove('sort-asc', 'sort-desc');
    var arrow = sortDateHeader.querySelector('.sort-arrow');
    if (sortDirection === 'desc') {
      sortDateHeader.classList.add('sort-desc');
      arrow.textContent = '▼';
    } else {
      sortDateHeader.classList.add('sort-asc');
      arrow.textContent = '▲';
    }
  }

  // ----- Event listeners for search and filters -----

  // Search input — fires on every keystroke
  searchInput.addEventListener('input', applyFilters);

  // Filter dropdowns — fire when selection changes
  filterCategory.addEventListener('change', applyFilters);
  filterPriority.addEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);

  // Sort dropdown
  sortDateSelect.addEventListener('change', function () {
    sortDirection = sortDateSelect.value;
    updateSortHeader();
    applyFilters();
  });

  // Click on date header also toggles sort
  sortDateHeader.addEventListener('click', function () {
    sortDirection = (sortDirection === 'desc') ? 'asc' : 'desc';
    sortDateSelect.value = sortDirection;
    updateSortHeader();
    applyFilters();
  });

  // ----- Mobile nav toggle -----
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });

  // ----- Navbar scroll effect -----
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ----- Initialize on page load -----
  document.addEventListener('DOMContentLoaded', function () {
    allComplaints = getComplaints();
    updateStats(allComplaints);
    updateSortHeader();
    applyFilters();
  });
})();
