function sendMsg(_startSwitch, _pausedSett, _intervalSett) {
  var port = chrome.extension.connect({
    name: "connect background"
  });
  port.postMessage({
    turnOn: _startSwitch.checked,
    paused: _pausedSett.checked,
    sec: _intervalSett.value
  });
}

window.onload = function() {
  var startSwitch = document.getElementById("start");
  var applyButton = document.getElementById("apply-button");
  var pausedSett = document.getElementById("pausedItem");
  var intervalSett = document.getElementById("intervalTime");

  startSwitch.addEventListener("click", function() {
    sendMsg(startSwitch, pausedSett, intervalSett);
  });
  applyButton.addEventListener("click", function() {
    sendMsg(startSwitch, pausedSett, intervalSett);
  });

  chrome.storage.sync.get(['paused'], function(result) {
    if (result.paused) {
      pausedSett.checked = true;
    } else {
      pausedSett.checked = false;
    }
  });

  chrome.storage.sync.get(['sec'], function(result) {
    if(typeof result.sec == "undefined") {
      result.sec = 10;
    }
    intervalSett.value = result.sec;
  });

  chrome.storage.sync.get(['turnOn'], function(result) {
    if (result.turnOn) {
      startSwitch.checked = true;
      sendMsg(startSwitch, pausedSett, intervalSett);
    } else {
      startSwitch.checked = false;
    }
  });
}
