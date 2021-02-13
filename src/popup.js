/*
local storage values
--------------------------------------
turnOn : (bool) true => Auto resume on
paused : (bool) true => resume paused items
sec : (int) check download items interval
logText : (string) log text in textarea (id = downloadLog)
*/

function sendMsg(_startSwitch, _pausedSett, _intervalSett) {
  var port = chrome.runtime.connect({
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
  var clearButton = document.getElementById("clear-button");
  var pausedSett = document.getElementById("pausedItem");
  var intervalSett = document.getElementById("intervalTime");
  var logTextArea = document.getElementById("downloadLog");

  startSwitch.addEventListener("click", function() {
    sendMsg(startSwitch, pausedSett, intervalSett);
  });

  applyButton.addEventListener("click", function() {
    sendMsg(startSwitch, pausedSett, intervalSett);
    logTextArea.value += "Settings applied\n";
    chrome.storage.sync.set({
      logText: logTextArea.value
    });
  });

  clearButton.addEventListener("click", function() {
    logTextArea.value = "";
    chrome.storage.sync.set({
      logText: logTextArea.value
    });
  });

  //Load values in local storage
  chrome.storage.sync.get(['paused'], function(result) {
    if (result.paused) {
      pausedSett.checked = true;
    } else {
      pausedSett.checked = false;
    }
  });

  chrome.storage.sync.get(['sec'], function(result) {
    if (typeof result.sec == "undefined") {
      result.sec = 10;
    }
    intervalSett.value = result.sec;
  });

  chrome.storage.sync.get(['turnOn'], function(result) {
    if (result.turnOn) {
      startSwitch.checked = true;
      //sendMsg(startSwitch, pausedSett, intervalSett);
    } else {
      startSwitch.checked = false;
    }
  });

  chrome.storage.sync.get(['logText'], function(result) {
    if (typeof result.logText == "undefined") {
      result.logText = "";
    }
    logTextArea.value = result.logText;
    logTextArea.scrollTop = logTextArea.scrollHeight;
  });
}

// connection with background.js
chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    // listen log in background
    let today = new Date();
    var logTextArea = document.getElementById("downloadLog");
    var logStr = today.toLocaleString() + "\n" + msg.logAtBackground + "\n";

    logTextArea.value += logStr;
    logTextArea.scrollTop = logTextArea.scrollHeight;

    chrome.storage.sync.set({
      logText: logTextArea.value
    });
  })
});
