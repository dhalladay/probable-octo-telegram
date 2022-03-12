// create variable to hold db
let db;

// establish connection tin IndexedDB db
const request = indexedDB.open('budget_tracker', 1);

// emit event if the db version changes
request.onupgradeneeded = function(event) {
  // save reference to the database
  const db = event.target.result;
  // create object store
  db.createObjectStore('budget_items', { autoIncrement: true });
};

// upon a successful request
request.onsuccess = function(event) {
  // when db is successfully created save reference to global variable
  db = event.target.result;

  // check if app is online
  if (navigator.onLine) {
    // upload stored budged items
    // uploadBudgetItems();
  }
};

// if request unsuccessful
request.onerror = function(event) {
  // log error to console
  console.log(event.target.errorCode);
};

// if there is no internet connection execute to save data 
function saveRecord(record) {
  // open transaction with db 
  const transaction = db.transaction(['budget_items'], 'readwrite');

  // access object store
  const budgetObjectStore = transaction.objectStore('budget_items');

  // add record to store
  budgetObjectStore.add(record);
}