var intervalFunctionArray = []
// default value : 3
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

//stop all intervals
function stopAllIntervals(functionArray) {
  functionArray.forEach(function(element) {
    clearInterval(element);
  });
  functionArray = []
  return functionArray;
}

// str must be a 3-line string with three "\n"
function getMaximunLengthString(str) {
  maxByte = 7000;
  byteLength = (function(s, b, i, c) {
    for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
    return b;
  })(str);

  if (byteLength > maxByte) {
    str = str.substring(str.indexOf('\n') + 1);
    str = str.substring(str.indexOf('\n') + 1);
    str = str.substring(str.indexOf('\n') + 1);
  }

  return str;
}

function logging(str) {
  chrome.storage.sync.get(['localSavedLog'], function(result) {
    // since the connection with popup.js may be disconnected, save logs in local storage
    if (typeof result.localSavedLog == "undefined") {
      result.localSavedLog = "";
    }
    var updatedLog = result.localSavedLog + str + "\n\n";
    updatedLog = getMaximunLengthString(updatedLog);
    chrome.storage.sync.set({
      localSavedLog: updatedLog
    });
  });
}

function resumeDownload(DownloadItems) {
  DownloadItems.forEach(function(item) {
    if (item.canResume) {
      if (!item.paused || pausedOption) {
        chrome.downloads.resume(item.id);
        logging(("resume :\n" + item.filename));
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
    // get options from popup
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
