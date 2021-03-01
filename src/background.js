var intervalFunctionArray = []
var intervalForCheck = 3;
var pausedOption = false;
var resumeSuccess = false;

function timeBoundary(t) {
  var max = 10000;
  var min = 1;

  ret = Number(t);
  if (ret <= 0) {
    ret = min;
  } else if (ret > max) {
    ret = max;
  }

  return ret;
}

//stop all interval
function stopAllIntervals(functionArray) {
  functionArray.forEach(function(element) {
    clearInterval(element);
  });
  functionArray = []
  return functionArray;
}

function resumeDownload(DownloadItems) {
  DownloadItems.forEach(function(item) {
    if (item.canResume) {
      if (!item.paused || pausedOption) {
        chrome.storage.sync.get(['localSavedLog'], function(result) {
          // sinnce the connection with popup.js may be disconnected, save logs in local storage
          // process when there is no saved log
          if (typeof result.localSavedLog == "undefined") {
            result.localSavedLog = "";
          }
          var updatedLog = result.localSavedLog + ("resume : " + item.filename) + "\n\n";
          chrome.storage.sync.set({
            localSavedLog: updatedLog
          });
        });
        console.log(item);
        chrome.downloads.resume(item.id);
        resumeSuccess = true;
      }
    }
  });
}

function downloadManager() {
  chrome.downloads.search({}, resumeDownload);
}

function autoResume(toggle) {
  if (toggle) {
    intervalFunctionArray = stopAllIntervals(intervalFunctionArray);
    newInterval = setInterval(downloadManager, intervalForCheck * 1000);
    intervalFunctionArray.push(newInterval);
  } else {
    intervalFunctionArray = stopAllIntervals(intervalFunctionArray);
  }

  chrome.storage.sync.set({
    running: toggle
  });
}

function autoResumeRefresher() {
  if (resumeSuccess) {
    console.log("refresh");
    autoResume(false);
    autoResume(true);
    resumeSuccess = false;
  }
}

setInterval(autoResumeRefresher, 3000);

// load options
chrome.storage.sync.get(['paused'], function(result) {
  pausedOption = result.paused;
});

chrome.storage.sync.get(['sec'], function(result) {
  intervalForCheck = timeBoundary(result.sec);
});

// if last state is on, start Auto resume
chrome.storage.sync.get(['running'], function(result) {
  if (result.running) {
    autoResume(true);
  }
});

// connection with popup.js
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    // load values in message
    intervalForCheck = timeBoundary(message.sec);
    pausedOption = message.paused;

    chrome.storage.sync.set({
      paused: pausedOption,
      sec: intervalForCheck
    });

    if (message.running == true) {
      // auto resume start
      autoResume(true);
    } else {
      // auto resume stop
      autoResume(false);
    }
  });
});
