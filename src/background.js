/** 
 * list of functions running in the background 
 * @type {Array} 
 */  
var background_function_array     = []


/** 
 * time interval between scanning and resuming downloads
 * @type {Number} 
 */  
var interval_for_check          = 3;


/** 
 * whether to resume paused downloads as well  
 * @type {Boolean}
 */  
var resume_on_paused               = false;




/**
 * timeBoundary :                 limit the minimum and maximum values of the time interval
 * @param {Number} t              time value in seconds
 * @returns                       a number between 1 and 10000
 */
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




/**
 * stopAllIntervals :             stop all Interval functions in the array
 * @param {Array} functionArray   array of functions
 * @returns                       empty array
 */
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
  chrome.storage.local.get(['localSavedLog'], function(result) {
    // since the connection with popup.js may be disconnected, save logs in local storage
    if (typeof result.localSavedLog == "undefined") {
      result.localSavedLog = "";
    }
    var updatedLog = result.localSavedLog + str + "\n\n";
    updatedLog = getMaximunLengthString(updatedLog);
    chrome.storage.local.set({
      localSavedLog: updatedLog
    });
  });
}

function resumeDownload(DownloadItems) {
  DownloadItems.forEach(function(item) {
    crxd = chrome.downloads.resume;
    if (item.canResume) {
      if (!item.paused || resume_on_paused) {
        chrome.downloads.resume(item.id, function(){
          logging(("resume :\n" + item.filename));
        });
      }
    }
  });
}

function downloadManager() {
  chrome.downloads.search({}, resumeDownload);
}

function autoResume(toggle) {
  if (toggle) {
    background_function_array = stopAllIntervals(background_function_array);
    newInterval = setInterval(downloadManager, interval_for_check * 1000);
    background_function_array.push(newInterval);
  } else {
    background_function_array = stopAllIntervals(background_function_array);
  }

  chrome.storage.local.set({
    running: toggle
  });
}

// load options
chrome.storage.local.get(['paused'], function(result) {
  resume_on_paused = result.paused;
});

chrome.storage.local.get(['sec'], function(result) {
  interval_for_check = timeBoundary(result.sec);
});

// if last state is on, start Auto resume
chrome.storage.local.get(['running'], function(result) {
  if (result.running) {
    autoResume(true);
  }
});

// connection with popup.js
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    // get options from popup
    interval_for_check = timeBoundary(message.sec);
    resume_on_paused = message.paused;

    chrome.storage.local.set({
      paused: resume_on_paused,
      sec: interval_for_check
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
