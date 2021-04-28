function getTime(){
  var time=new Date(); //gats the Date and Time in utc
  var today=new Date(time.getTime() - (time.getTimezoneOffset() * 60000)).toISOString().replace(/T/, ' ').replace(/\..+/, ''); //sets the Time to the users timezone
  var Datum = today.slice(0,10).replace(/-/g,"."); //gets only the Parts for Date/Time
  var Uhrzeit = today.slice(11,19);
  return {Datum, Uhrzeit,}
}

function getCookie(name) { //cookie
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function ChangeN() {
    console.log("change");
    saveNetwork(navigator.connection.type, navigator.onLine);
  }
  
navigator.connection.addEventListener('typechange', ChangeN);

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