function getCookie(name) { //cookie
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

navigator.connection.addEventListener('typechange', saveNetwork(navigator.connection.type, navigator.onLine));
window.addEventListener('offline', saveNetwork(navigator.connection.type, navigator.onLine));

navigator.getBattery().then(function (battery) { //opens stream to Battery API
  
  battery.addEventListener('chargingchange', saveAkku(battery.level, battery.charging));
  battery.addEventListener('levelchange', saveAkku(battery.level, battery.charging));
  
  console.log(battery.level);
  
  });

    //https://stackoverflow.com/questions/10730362/get-cookie-by-name (cookie, 26.3.21)