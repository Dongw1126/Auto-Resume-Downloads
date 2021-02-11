var startSwitch = document.getElementById("start");

startSwitch.onclick = function () {
  var port = chrome.extension.connect({
        name: "connect background"
   });
   port.postMessage(this.checked);
};

chrome.storage.sync.get(['turnOn'], function(result) {
  console.log(result);
  if(result.turnOn){
    startSwitch.checked = true;
  }
  else {
    startSwitch.checked = false;
  }
});
