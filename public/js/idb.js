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
    uploadBudgetItems();
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
};

// function to upload data once connection restored
function uploadBudgetItems() {
  // open transaction on db
  const transaction = db.transaction(['budget_items'], 'readwrite');

  // access object store
  const budgetObjectStore = transaction.objectStore('budget_items');

  // get all records
  const getAll = budgetObjectStore.getAll();

  // upons successful .getAll() execution
  getAll.onsuccess = function() {
    // if there was data in store, send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => { 
        if(serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open one more transaction
        const transaction = db.transaction(['budget_items'], 'readwrite');
        // access budget_items object store
        const budgetObjectStore = transaction.objectStore('budget_items');
        // clear object store of all items
        budgetObjectStore.clear();

        alert('All budget items have been submitted');
      })
      .catch(err => {
        console.log(err);
      });
    }
  };
};

// listen for app coming back online
window.addEventListener('online', uploadBudgetItems);