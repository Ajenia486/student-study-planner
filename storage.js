/* ---------------------------------------------------------
   storage.js
   Handles saving and loading tasks using the browser's
   localStorage. This means tasks stay on the page even
   after the user refreshes or closes the browser.
--------------------------------------------------------- */

const STORAGE_KEY = "atu-study-planner-tasks";

/**
 * Load all saved tasks from local storage.
 * Returns an empty array if nothing is saved yet.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved tasks:", error);
    return [];
  }
}

/**
 * Save the full list of tasks to local storage.
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks:", error);
  }
}
