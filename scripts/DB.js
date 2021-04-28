//import("./time.js")

console.log("DB_");
const server = "https://v2202102140391141863.powersrv.de:8000";
//const server = "https://192.168.0.133:8000"
const port = "3000";

var db;
var alldata="";
var all_content=[];

var open = indexedDB.open("Daten");

open.onupgradeneeded = function() { //erstellen einer neuen Indexed DB fals keine existiert
  console.log("erstelle");
  // The database did not previously exist, so create object stores and indexes.
  var db = open.result;
  var store = db.createObjectStore("Akku", {autoIncrement:true});
  store.createIndex("by_time", "time");
  store.createIndex("by_date", "date");
  store.createIndex("by_level", "level"); //curent level of charging in percent
  store.createIndex("by_state", "state"); //charging/discharging

  var store = db.createObjectStore("Network", {autoIncrement:true});
  store.createIndex("by_time", "time");
  store.createIndex("by_date", "date");
  store.createIndex("by_type", "type"); //type of connection to the Internet (e.g. wifi)
  store.createIndex("by_state", "state"); //online/offline
};

open.onsuccess = function() {
  db = open.result;
};

function check_alive(){ //Synker (modified)
  var a;
  $.ajax({
    url: server+"/ping",
    type: 'GET',
    async: false,
    success: function(){
      //Ready for MySQL insertion.
      console.log("MySQL is UP");
      a=true;
    },
    error: function() {
      //Go in the indexDB
      a=false;
    }
  });
  return a;
}

function newUserID() { //fragt eine neue UserID beim Server an
  var a;
  $.ajax({
    url: `${server}/new`,
    type: 'GET',
    async: false,
    success: function (data) {
      a=data;
    },
    error: function (data) {
      console.log("Can't get user_id");
    }
  });
  return a;
}


function saveAkku(level, state) { //speichert in die Netzwerkdadatenbanken
  console.log("Speichere Akku");
  if (navigator.onLine&&check_alive()) { //wenn der Client online ist, speichere direkt in mySQL
    console.log("mysql");
    $.ajax({
      url: `${server}/upload`,
      type: 'POST',
      data: `db=akku&date=${getTime().Datum}&time=${getTime().Uhrzeit}&level=${level}&state=${state}&user=${getCookie("user_id")}`
    });
  }
  else { //wenn der Client offline ist, speichere in IndexDB
    var tx = db.transaction("Akku", "readwrite");
    var store = tx.objectStore("Akku");
    store.put({date: getTime().Datum, time: getTime().Uhrzeit, level: level , state: state});
    document.cookie = `ofline=true; max-age=315360000;`;
  }

}

function saveNetwork(type, state) { //speichert in die Netzwerkdadatenbanken
  console.log("Speichere Netzwerk");
  if (navigator.onLine&&check_alive()){ //wenn der Client online ist, speichere direkt in mySQL
    console.log("mysql");
    $.ajax({
      url: `${server}/upload`,
      type: 'POST',
      data: `db=network&date=${getTime().Datum}&time=${getTime().Uhrzeit}&type=${type}&state=${state}&user=${getCookie("user_id")}`
    });
  }
  else { //wenn der Client offline ist, speichere in IndexDB
    var tx = db.transaction("Network", "readwrite");
    var store = tx.objectStore("Network");
    store.put({date: getTime().Datum, time: getTime().Uhrzeit, type: type , state: state});
    document.cookie = `ofline=true; max-age=315360000;`;
  }
}

async function sync() { //wird ausgeführt wenn der Client wieder online geht um die Daten zu synchronisieren
  if (getCookie("ofline")=="true"&&check_alive()) { //Daten werden nur hochgeladen, wenn der Server online ist
    console.log("sync");
    all_content=[]
    alldataN=getData("Network");
    setTimeout(() => { //warte darauf, dass die Daten aus der indexed DB geholt worden sind
      all_content=[];
      alldataA=getData("Akku");
      setTimeout(() => {
        alljsonN=JSON.stringify(alldataN);
        alljsonA=JSON.stringify(alldataA);
        alljson=`${alljsonN}|${alljsonA}|${getCookie("user_id")}`;
        console.log(alljson);
        $.ajax({
          url: `${server}/sync`,
          type: 'POST',
          data: alljson,
          success: function (data) {
            document.cookie = `ofline=false;  max-age=315360000;`;
            db.transaction("Akku", "readwrite").objectStore("Akku").clear();
            db.transaction("Network", "readwrite").objectStore("Network").clear();
          },
          error: function (data) {
            console.log("Cant Sync data!");
            setTimeout(sync(), 1000); //wiederhole den sync, wenn er fehlschlägt
          }
        });
      }, 10);

  },10);
  }
  
}

function getData(table) {
  var tx = db.transaction(table, "readonly");
  var store = tx.objectStore(table);

  var request = store.openCursor();
  request.onsuccess = function() {
    var cursor = request.result;
    if (cursor) {
      all_content.push(cursor.value);
      cursor.continue();
    }
  };
  return all_content;
}

document.onreadystatechange = function () { 
  if (document.readyState == "complete") { //wenn alles geladen ist, schaue nach, ob dieser Client schon einen Benutzer hat 
  if (document.cookie.indexOf("user_id=")==-1) {
    console.log("new User"); //der Client hat keinen Benutzer
    id=newUserID(); //frage neuen Benutzer an
    while (id=="undefined") { //fals der Server nicht antwortet, warte 10s und frage erneut an
      setTimeout(() => {
        console.log("timeout");
        id=newUserID();
      }, 1000);          
    }
    document.cookie = `user_id=${id}; max-age=315360000;`;
  }
  }
}

window.addEventListener('online', sync);

//https://github.com/codeforgeek/Synker/