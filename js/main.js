/* ============================================
   CampusFix - Home Page JavaScript
   Handles navbar, mobile menu, and live stats
   ============================================ */

(function () {
  'use strict';

  // ----- Navbar scroll effect -----
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ----- Mobile menu toggle -----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });

  // ----- localStorage helper: get all complaints -----
  function getComplaints() {
    // Retrieve complaints array from localStorage, parse from JSON
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

  // ----- Update live statistics on the home page -----
  function updateStats() {
    var complaints = getComplaints();

    var total = complaints.length;
    var pending = 0;
    var inProgress = 0;
    var resolved = 0;
    var critical = 0;

    // Loop through each complaint to tally statuses
    complaints.forEach(function (c) {
      if (c.status === 'Pending') pending++;
      if (c.status === 'In Progress') inProgress++;
      if (c.status === 'Resolved') resolved++;
      if (c.priority === 'Critical') critical++;
    });

    // Update hero card mini-stats
    setText('heroTotal', total);
    setText('heroPending', pending);
    setText('heroProgress', inProgress);
    setText('heroResolved', resolved);

    // Update stats bar cards
    setText('statTotal', total);
    setText('statPending', pending);
    setText('statResolved', resolved);
    setText('statCritical', critical);
  }

  // Helper to safely set textContent of an element
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }

  // Update stats when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', updateStats);
})();
