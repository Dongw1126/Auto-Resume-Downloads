function sendMsg(_startSwitch, _canceledSett, _intervalSett) {
  var port = chrome.extension.connect({
    name: "connect background"
  });
  port.postMessage({
    turnOn: _startSwitch.checked,
    canceled: _canceledSett.checked,
    sec: _intervalSett.value
  });
}

window.onload = function() {
  var startSwitch = document.getElementById("start");
  var applyButton = document.getElementById("apply-button");
  var canceledSett = document.getElementById("canceledItem");
  var intervalSett = document.getElementById("intervalTime");

  startSwitch.addEventListener("click", function() {
    sendMsg(startSwitch, canceledSett, intervalSett);
  });
  applyButton.addEventListener("click", function() {
    sendMsg(startSwitch, canceledSett, intervalSett);
  });

  chrome.storage.sync.get(['turnOn'], function(result) {
    console.log(result);
    if (result.turnOn) {
      startSwitch.checked = true;
    } else {
      startSwitch.checked = false;
    }
  });

  chrome.storage.sync.get(['canceled'], function(result) {
    if (result.canceled) {
      canceledSett.checked = true;
    } else {
      canceledSett.checked = false;
    }
  });

  chrome.storage.sync.get(['sec'], function(result) {
    intervalSett.value = result.sec;
  });
}
