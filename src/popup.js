/*
local storage values
--------------------------------------
running : (bool) true => Auto resume running
paused : (bool) true => resume paused items too
sec : (int) check download items interval
localSavedLog : (string) log text in textarea (css id = log-textarea)
*/

function sendStateToBackground(_startSwitch, _pausedSetting, _intervalSetting) {
  var port = chrome.extension.connect({
    name: "connect from popup"
  });
  port.postMessage({
    running: _startSwitch.checked,
    paused: _pausedSetting.checked,
    sec: _intervalSetting.value
  });
}

function logging(str, _logTextArea) {
  let today = new Date();
  var newLogText = today.toLocaleString() + "\n" + str + "\n\n";

  _logTextArea.value += newLogText;
  _logTextArea.scrollTop = _logTextArea.scrollHeight;

  chrome.storage.sync.set({
    localSavedLog: _logTextArea.value
  });
}

window.onload = function() {
  var startSwitch = document.getElementById("start-switch");
  var applyButton = document.getElementById("apply-button");
  var clearButton = document.getElementById("clear-button");
  var pausedSetting = document.getElementById("paused-item");
  var intervalSetting = document.getElementById("interval-time");
  var logTextArea = document.getElementById("log-textarea");

  startSwitch.addEventListener("click", function() {
    sendStateToBackground(startSwitch, pausedSetting, intervalSetting);
    if(startSwitch.checked) {
      logging("auto resume running");
    }
    else {
      logging("auto resume stopped");
    }
  });

  applyButton.addEventListener("click", function() {
    sendStateToBackground(startSwitch, pausedSetting, intervalSetting);
    logging("Settings applied");
  });

  clearButton.addEventListener("click", function() {
    logTextArea.value = "";
    chrome.storage.sync.set({
      localSavedLog: logTextArea.value
    });
  });

  //Load values in local storage
  chrome.storage.sync.get(['paused'], function(result) {
    if (result.paused) {
      pausedSetting.checked = true;
    } else {
      pausedSetting.checked = false;
    }
  });

  chrome.storage.sync.get(['sec'], function(result) {
    if (typeof result.sec == "undefined") {
      result.sec = 3;
    }
    intervalSetting.value = result.sec;
  });

  chrome.storage.sync.get(['running'], function(result) {
    if (result.running) {
      startSwitch.checked = true;
    } else {
      startSwitch.checked = false;
    }
  });

  chrome.storage.sync.get(['localSavedLog'], function(result) {
    if (typeof result.localSavedLog == "undefined") {
      result.localSavedLog = "";
    }
    logTextArea.value = result.localSavedLog;
    logTextArea.scrollTop = logTextArea.scrollHeight;
  });
}
