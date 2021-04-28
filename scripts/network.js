//import("./DB.js");

function Change() {
  console.log("change");
  saveNetwork(navigator.connection.type, navigator.onLine);
}

navigator.connection.addEventListener('typechange', Change);
//window.addEventListener('online', Change);
//window.addEventListener('offline', Change);
