//import("./DB.js");

navigator.getBattery().then(function (battery) { //opens stream to Battery API

function Change() {
  console.log("change");
  saveAkku(battery.level, battery.charging);
  }

battery.addEventListener('chargingchange', Change);
battery.addEventListener('levelchange', Change);

console.log(battery.level);

//store.clear();

//saveAkku(battery.level, battery.charging)

});
