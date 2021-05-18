function getCookie(name) { //cookie
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

//navigator.connection.addEventListener('typechange', ChangeN);

navigator.getBattery().then(function (battery) { //opens stream to Battery API

  let akku_level = battery.level;
  let akku_state = battery.charging;

  function ChangeB() {
    console.log("change");
    saveAkku(battery.level, battery.charging);
    }

  //battery.addEventListener('chargingchange', ChangeB);
  //battery.addEventListener('levelchange', ChangeB);

  console.log(battery.level);

  async function check_akku() {
    if (akku_level!=battery.level||akku_state!=battery.charging) ChangeB();
    akku_level = battery.level;
    akku_state = battery.charging;
    setTimeout(check_akku, 1000)
  }

  check_akku()
  });

    //https://stackoverflow.com/questions/10730362/get-cookie-by-name (cookie, 26.3.21)
