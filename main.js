function getCookie(name) { //cookie
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function ChangeN() {
    console.log("change");
    saveNetwork(navigator.connection.type, navigator.onLine);
  }
  
window.addEventListener('online', ChangeN);

navigator.getBattery().then(function (battery) { //opens stream to Battery API

  function ChangeB() {
    console.log("change");
    saveAkku(battery.level, battery.charging);
    }
  
  battery.addEventListener('chargingchange', ChangeB);
  battery.addEventListener('levelchange', ChangeB);
  
  console.log(battery.level);
  
  });

    //https://stackoverflow.com/questions/10730362/get-cookie-by-name (cookie, 26.3.21)