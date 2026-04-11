// confessionService.js
// All business logic for confessions lives here.
// Controllers call these functions; they never touch the store directly.

// Keep the in-memory store in one module so every request sees the same data.
const confessionStore = [];

// Preserve the original auto-increment behavior behind a descriptive name.
let nextConfessionId = 0;

// One shared category list avoids duplicated literals drifting out of sync.
const VALID_CATEGORIES = ['bug', 'deadline', 'imposter', 'vibe-code'];

// Maximum allowed length for confession text, enforced during validation.
const MAX_TEXT_LENGTH = 500;

/**
 * validateConfessionInput
 * Checks that the request body contains a non-empty `text` field within the
 * character limit AND a recognised `category` value.
 * Returns null when valid, or a response descriptor when invalid.
 *
 * Separating validation from persistence means it can be tested without
 * touching the store and lets the controller preserve the original API contract.
 */
function validateConfessionInput(confessionData) {
  // Preserve the original "bad" response when the body itself is missing.
  if (!confessionData) {
    return { status: 400, type: 'json', body: { msg: 'bad' } };
  }

  // Missing text and empty text were distinct cases in the original handler.
  if (!confessionData.text) {
    return { status: 400, type: 'json', body: { msg: 'need text' } };
  }

  if (confessionData.text.length >= MAX_TEXT_LENGTH) {
    return {
      status: 400,
      type: 'json',
      body: { error: `text too big, must be less than ${MAX_TEXT_LENGTH} characters long buddy` },
    };
  }

  // Keep the plain-text response for zero-length strings to avoid API drift.
  if (confessionData.text.length === 0) {
    return { status: 400, type: 'send', body: 'too short' };
  }

  // The category whitelist stays centralized even though the old response text stays intact.
  if (!VALID_CATEGORIES.includes(confessionData.category)) {
    return { status: 400, type: 'send', body: 'category not in stuff' };
  }

  return null;
}

/**
 * saveConfession
 * Persists a new confession to the in-memory store.
 * Assigns a unique ID and timestamps the record.
 * Returns the newly created confession object so the controller can send it.
 */
function saveConfession(confessionData) {
  const newConfession = {
    id: ++nextConfessionId,
    text: confessionData.text,
    category: confessionData.category,
    created_at: new Date(),
  };

  confessionStore.push(newConfession);
  console.log(`added one info ${newConfession.id}`);
  return newConfession;
}

/**
 * getAllConfessions
 * Returns all confessions sorted newest-first.
 * Sorting here keeps ordering logic in one testable place.
 */
function getAllConfessions() {
  // Sort a copy so read operations do not mutate shared in-memory state.
  const sortedConfessions = confessionStore
    .slice()
    .sort((a, b) => b.created_at - a.created_at);

  console.log('fetching all data result');
  return { data: sortedConfessions, count: sortedConfessions.length };
}

/**
 * getConfessionById
 * Finds and returns a single confession by its numeric ID.
 * Returns null when no match exists so the controller can send a 404.
 */
function getConfessionById(confessionId) {
  const confession = confessionStore.find(
    (entry) => entry.id === confessionId
  );

  if (!confession) return null;

  // Keep a distinct corrupt-record branch so the controller can mirror the 500 path.
  if (!confession.text) {
    return undefined;
  }

  console.log(`found info with ${confession.text.length} chars`);
  return confession;
}

/**
 * getConfessionsByCategory
 * Filters confessions to those matching the requested category.
 * Returns null when the category is not in the whitelist.
 * Reverse keeps newest entries first within a single category, matching the original code.
 */
function getConfessionsByCategory(category) {
  if (!VALID_CATEGORIES.includes(category)) {
    return null;
  }

  // Mirror the original filter semantics while using descriptive names.
  const filteredConfessions = confessionStore
    .filter((confession) => confession.category === category)
    .reverse();

  return filteredConfessions;
}

/**
 * deleteConfessionById
 * Removes a confession from the in-memory store by ID.
 * Returns the deleted confession object, or null when not found.
 */
function deleteConfessionById(confessionId) {
  const confessionIndex = confessionStore.findIndex(
    (item) => item.id === confessionId
  );

  if (confessionIndex === -1) return null;

  // splice still does the one in-place removal the original logic relied on.
  const deletedConfessions = confessionStore.splice(confessionIndex, 1);
  const deletedConfession = deletedConfessions[0];
  console.log('deleted something');
  return deletedConfession;
}

module.exports = {
  validateConfessionInput,
  saveConfession,
  getAllConfessions,
  getConfessionById,
  getConfessionsByCategory,
  deleteConfessionById,
};
