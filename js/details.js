/* ============================================
   CampusFix - Complaint Details Page JavaScript
   Reads complaint ID from URL, retrieves the
   complaint from localStorage, and renders
   full details with a visual status timeline
   ============================================ */

(function () {
  'use strict';

  // ----- Get complaint ID from URL query string -----
  // URL format: details.html?id=CF001
  // Falls back to localStorage if URL param is missing
  function getComplaintIdFromURL() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id'); // Returns null if 'id' is not present
    if (!id) {
      // Fallback: read the ID stored by the dashboard button click
      id = localStorage.getItem('campusfix_selected_complaint');
    }
    return id;
  }

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

  // ----- Find a complaint by its ID -----
  function findComplaint(id) {
    var complaints = getComplaints();
    return complaints.find(function (c) {
      return c.complaintId === id;
    });
  }

  // ----- Format date for display -----
  function formatDate(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }

  // ----- Create a status badge element -----
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

  // ----- Create a priority badge element -----
  function createPriorityBadge(priority) {
    var badge = document.createElement('span');
    badge.className = 'badge badge--' + priority.toLowerCase();
    badge.textContent = priority;
    return badge;
  }

  // ----- Save complaints back to localStorage -----
  function saveComplaints(complaints) {
    localStorage.setItem('campusfix_complaints', JSON.stringify(complaints));
  }

  // ----- Update a single complaint's status in localStorage -----
  function updateComplaintStatus(id, newStatus) {
    var complaints = getComplaints();
    for (var i = 0; i < complaints.length; i++) {
      if (complaints[i].complaintId === id) {
        complaints[i].status = newStatus;
        saveComplaints(complaints);
        return complaints[i];
      }
    }
    return null;
  }

  // ----- Build the status management section -----
  function createStatusManagement(complaint) {
    var section = document.createElement('div');
    section.className = 'status-mgmt';
    section.id = 'statusMgmtSection';

    var heading = document.createElement('h3');
    heading.className = 'status-mgmt__heading';
    heading.textContent = 'Complaint Status Management';
    section.appendChild(heading);

    var desc = document.createElement('p');
    desc.className = 'status-mgmt__desc';
    desc.textContent = 'Update the complaint status as the issue progresses from reporting to resolution.';
    section.appendChild(desc);

    // Success message (hidden by default)
    var successMsg = document.createElement('div');
    successMsg.className = 'alert alert--success';
    successMsg.id = 'statusSuccessAlert';
    var successTitle = document.createElement('div');
    successTitle.className = 'alert__title';
    successTitle.textContent = '✅ Status Updated Successfully!';
    successMsg.appendChild(successTitle);
    var successBody = document.createElement('div');
    successBody.id = 'statusSuccessText';
    successMsg.appendChild(successBody);
    section.appendChild(successMsg);

    // Current status display
    var currentRow = document.createElement('div');
    currentRow.className = 'status-mgmt__current';
    var currentLabel = document.createElement('span');
    currentLabel.className = 'status-mgmt__current-label';
    currentLabel.textContent = 'Current Status:';
    currentRow.appendChild(currentLabel);
    var currentBadge = document.createElement('span');
    currentBadge.id = 'currentStatusBadge';
    currentBadge.appendChild(createStatusBadge(complaint.status));
    currentRow.appendChild(currentBadge);
    section.appendChild(currentRow);

    // Controls row: dropdown + button
    var controls = document.createElement('div');
    controls.className = 'status-mgmt__controls';

    var selectWrapper = document.createElement('div');
    selectWrapper.className = 'status-mgmt__select-wrapper';
    var selectLabel = document.createElement('label');
    selectLabel.setAttribute('for', 'statusSelect');
    selectLabel.textContent = 'New Status';
    selectWrapper.appendChild(selectLabel);
    var select = document.createElement('select');
    select.className = 'form-control';
    select.id = 'statusSelect';
    var statuses = ['Pending', 'In Progress', 'Resolved'];
    statuses.forEach(function (s) {
      var opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (s === complaint.status) opt.selected = true;
      select.appendChild(opt);
    });
    selectWrapper.appendChild(select);
    controls.appendChild(selectWrapper);

    var updateBtn = document.createElement('button');
    updateBtn.className = 'btn btn--primary';
    updateBtn.id = 'updateStatusBtn';
    updateBtn.textContent = 'Update Status';
    controls.appendChild(updateBtn);

    section.appendChild(controls);

    // Click handler for the Update Status button
    updateBtn.addEventListener('click', function () {
      var newStatus = select.value;
      var id = complaint.complaintId;

      // If no change, show a message and return
      if (newStatus === complaint.status) {
        successTitle.textContent = 'ℹ️ No Change';
        successBody.textContent = 'The status is already "' + newStatus + '".';
        successMsg.classList.add('show');
        return;
      }

      // Update the complaint in localStorage
      var updated = updateComplaintStatus(id, newStatus);
      if (!updated) {
        return;
      }

      // Update the local complaint object so other parts of the page stay in sync
      complaint.status = newStatus;

      // Update the current status badge on the page
      var badgeContainer = document.getElementById('currentStatusBadge');
      badgeContainer.innerHTML = '';
      badgeContainer.appendChild(createStatusBadge(newStatus));

      // Update the status badge in the ID banner
      var bannerBadge = document.getElementById('bannerStatusBadge');
      if (bannerBadge) {
        bannerBadge.innerHTML = '';
        bannerBadge.appendChild(createStatusBadge(newStatus));
      }

      // Update the status in the Issue Information card
      var issueStatusValue = document.getElementById('issueStatusValue');
      if (issueStatusValue) {
        issueStatusValue.innerHTML = '';
        issueStatusValue.appendChild(createStatusBadge(newStatus));
      }

      // Replace the timeline with the updated one
      var oldTimeline = document.getElementById('timelineContainer');
      if (oldTimeline) {
        oldTimeline.innerHTML = '';
        oldTimeline.appendChild(createTimeline(newStatus));
      }

      // Show the success message
      successTitle.textContent = '✅ Status Updated Successfully!';
      successBody.innerHTML = 'Complaint <span class="complaint-id">' + id + '</span> status changed to <strong>' + newStatus + '</strong>. The dashboard will reflect this change when you return.';
      successMsg.classList.add('show');

      // Scroll to the success message so the user sees it
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    return section;
  }

  // ----- Build the status timeline -----
  // Stages: Reported → Under Review → In Progress → Resolved
  function createTimeline(currentStatus) {
    var stages = ['Reported', 'Under Review', 'In Progress', 'Resolved'];
    var icons = ['📝', '🔍', '🔧', '✅'];

    // Determine which stages are completed based on current status
    var currentIndex = stages.indexOf(currentStatus);
    // If status is "Pending", it maps to "Reported" stage (index 0)
    if (currentStatus === 'Pending') currentIndex = 0;

    var timeline = document.createElement('div');
    timeline.className = 'timeline';

    var heading = document.createElement('h3');
    heading.textContent = 'Status Timeline';
    timeline.appendChild(heading);

    var track = document.createElement('div');
    track.className = 'timeline__track';

    stages.forEach(function (stage, i) {
      var step = document.createElement('div');
      step.className = 'timeline__step';

      if (i < currentIndex) {
        step.classList.add('completed');
      } else if (i === currentIndex) {
        step.classList.add('current');
      }

      var dot = document.createElement('div');
      dot.className = 'timeline__dot';
      dot.textContent = icons[i];
      step.appendChild(dot);

      var label = document.createElement('div');
      label.className = 'timeline__label';
      label.textContent = stage;
      step.appendChild(label);

      track.appendChild(step);
    });

    timeline.appendChild(track);
    return timeline;
  }

  // ----- Create a detail row (label + value) -----
  function createDetailRow(label, valueNode) {
    var row = document.createElement('div');
    row.className = 'detail-row';

    var labelEl = document.createElement('span');
    labelEl.className = 'detail-row__label';
    labelEl.textContent = label;
    row.appendChild(labelEl);

    var valueEl = document.createElement('span');
    valueEl.className = 'detail-row__value';
    if (typeof valueNode === 'string') {
      valueEl.textContent = valueNode;
    } else {
      valueEl.appendChild(valueNode);
    }
    row.appendChild(valueEl);

    return row;
  }

  // ----- Render the full complaint details -----
  function renderComplaint(complaint) {
    var container = document.getElementById('detailContent');
    container.innerHTML = ''; // Clear loading placeholder

    // --- Complaint ID banner ---
    var idBanner = document.createElement('div');
    idBanner.style.cssText = 'background:var(--blue-50); border:1px solid var(--blue-100); border-radius:var(--radius); padding:var(--space-2) var(--space-3); margin-bottom:var(--space-3); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-1);';

    var idText = document.createElement('div');
    idText.innerHTML = '<span style="color:var(--gray-500); font-size:0.9rem;">Complaint ID:</span> <span style="font-family:var(--font-mono); font-weight:700; color:var(--blue-600); font-size:1.2rem;">' + complaint.complaintId + '</span>';
    idBanner.appendChild(idText);

    var bannerBadgeWrap = document.createElement('span');
    bannerBadgeWrap.id = 'bannerStatusBadge';
    bannerBadgeWrap.appendChild(createStatusBadge(complaint.status));
    idBanner.appendChild(bannerBadgeWrap);

    container.appendChild(idBanner);

    // --- Detail grid (two cards side by side) ---
    var grid = document.createElement('div');
    grid.className = 'detail-grid';

    // Card 1: Reporter Information
    var card1 = document.createElement('div');
    card1.className = 'detail-card';
    var h1 = document.createElement('h3');
    h1.textContent = '👤 Reporter Information';
    card1.appendChild(h1);

    var list1 = document.createElement('div');
    list1.className = 'detail-list';
    list1.appendChild(createDetailRow('Full Name', complaint.name));
    list1.appendChild(createDetailRow('Email', complaint.email));
    list1.appendChild(createDetailRow('Department', complaint.department));
    card1.appendChild(list1);
    grid.appendChild(card1);

    // Card 2: Issue Information
    var card2 = document.createElement('div');
    card2.className = 'detail-card';
    var h2 = document.createElement('h3');
    h2.textContent = '🔧 Issue Information';
    card2.appendChild(h2);

    var list2 = document.createElement('div');
    list2.className = 'detail-list';
    list2.appendChild(createDetailRow('Location', complaint.location));
    list2.appendChild(createDetailRow('Category', complaint.category));
    list2.appendChild(createDetailRow('Priority', createPriorityBadge(complaint.priority)));
    list2.appendChild(createDetailRow('Date', formatDate(complaint.date)));
    var statusValueWrap = document.createElement('span');
    statusValueWrap.id = 'issueStatusValue';
    statusValueWrap.appendChild(createStatusBadge(complaint.status));
    list2.appendChild(createDetailRow('Status', statusValueWrap));
    card2.appendChild(list2);
    grid.appendChild(card2);

    container.appendChild(grid);

    // --- Description block ---
    var descSection = document.createElement('div');
    descSection.style.marginBottom = 'var(--space-4)';

    var descTitle = document.createElement('h3');
    descTitle.textContent = '📄 Description';
    descTitle.style.marginBottom = 'var(--space-1)';
    descSection.appendChild(descTitle);

    var descBlock = document.createElement('div');
    descBlock.className = 'desc-block';
    var descP = document.createElement('p');
    descP.textContent = complaint.description;
    descBlock.appendChild(descP);
    descSection.appendChild(descBlock);

    container.appendChild(descSection);

    // --- Status Timeline (inside a container so it can be re-rendered) ---
    var timelineContainer = document.createElement('div');
    timelineContainer.id = 'timelineContainer';
    timelineContainer.style.marginBottom = 'var(--space-4)';
    timelineContainer.appendChild(createTimeline(complaint.status));
    container.appendChild(timelineContainer);

    // --- Complaint Status Management section ---
    container.appendChild(createStatusManagement(complaint));

    // --- Action buttons ---
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex; gap:var(--space-2); margin-top:var(--space-4); flex-wrap:wrap;';

    var backBtn = document.createElement('a');
    backBtn.href = '/dashboard.html';
    backBtn.className = 'btn btn--secondary';
    backBtn.textContent = '← Back to Dashboard';
    actions.appendChild(backBtn);

    var reportBtn = document.createElement('a');
    reportBtn.href = '/report.html';
    reportBtn.className = 'btn btn--primary';
    reportBtn.textContent = 'Report Another Issue';
    actions.appendChild(reportBtn);

    container.appendChild(actions);
  }

  // ----- Show "not found" state -----
  function showNotFound() {
    document.getElementById('notFoundState').style.display = 'block';
  }

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
    var id = getComplaintIdFromURL();

    if (!id) {
      showNotFound();
      return;
    }

    var complaint = findComplaint(id);

    if (!complaint) {
      showNotFound();
      return;
    }

    // Set the page title to include the complaint ID
    document.title = complaint.complaintId + ' – Complaint Details – CampusFix';

    renderComplaint(complaint);
  });
})();
