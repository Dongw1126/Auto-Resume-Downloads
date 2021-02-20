var intervalFunctionArray = []
var intervalForCheck = 3;
var pausedOption = false;

function sendLogToPopup(message) {
  var port = chrome.extension.connect({
    name: "connect from background"
  });

  message += "\n";
  port.postMessage({
    logAtBackground: message
  });
}

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

function stopAllIntervals(functionArray) {
  //stop all interval functions
  functionArray.forEach(function(element) {
    clearInterval(element);
  });
  functionArray = []
  return functionArray;
}

function resumeDownload() {
  //console.log("running");
  // get download lists
  chrome.downloads.search({
    orderBy: ['-startTime'],
    limit: 100
  }, function(searchResults) {
    //console.log(searchResults);
    // check items in the list and resume
    searchResults.forEach(function(item) {
      if (item.canResume) {
        if (!item.paused || pausedOption) {
          //console.log(searchResults);
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
          chrome.downloads.resume(item.id, function() {});
        }
      }
    });
  });
}

// load last state
chrome.storage.sync.get(['paused'], function(result) {
  pausedOption = result.paused;
});

chrome.storage.sync.get(['sec'], function(result) {
  intervalForCheck = timeBoundary(result.sec);
});

chrome.storage.sync.get(['running'], function(result) {
  //console.log(result.running);
  if (result.running) {
    // if last state is on, start Auto resume
    intervalFunctionArray = stopAllIntervals(intervalFunctionArray);

    newInterval = setInterval(resumeDownload, intervalForCheck * 1000);
    intervalFunctionArray.push(newInterval);
  }
});

// main logic
// connection with popup.js
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    //console.log(message);
    // load values in message
    intervalForCheck = timeBoundary(message.sec);
    pausedOption = message.paused;

    chrome.storage.sync.set({
      paused: pausedOption,
      sec: intervalForCheck
    });

    if (message.running == true) {
      // auto resume start
      intervalFunctionArray = stopAllIntervals(intervalFunctionArray);
      sendLogToPopup("auto resume running");
      chrome.storage.sync.set({
        running: true
      });
      newInterval = setInterval(resumeDownload, intervalForCheck * 1000);
      intervalFunctionArray.push(newInterval);
    } else {
      // auto resume stop
      sendLogToPopup("auto resume stopped");
      chrome.storage.sync.set({
        running: false
      });

      intervalFunctionArray = stopAllIntervals(intervalFunctionArray);
    }
  });
});
