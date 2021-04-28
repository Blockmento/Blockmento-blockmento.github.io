function getTime(){
  var time=new Date(); //gats the Date and Time in utc
  var today=new Date(time.getTime() - (time.getTimezoneOffset() * 60000)).toISOString().replace(/T/, ' ').replace(/\..+/, ''); //sets the Time to the users timezone
  var Datum = today.slice(0,10).replace(/-/g,"."); //gets only the Parts for Date/Time
  var Uhrzeit = today.slice(11,19);
  return {Datum, Uhrzeit,}
}
