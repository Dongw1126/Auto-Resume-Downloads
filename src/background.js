/** default download resume time interval (in seconds) */  
const DEFAULT_INTERVAL            = 3;

/** maximum length of log (in bytes) */  
const MAX_LOG_BYTE              = 7000;


/** list of functions running in the background */  
var background_function_array     = [];

/** time interval between scanning and resuming downloads */  
var interval_for_check            = DEFAULT_INTERVAL;

/** whether to resume paused downloads as well */  
var resume_on_paused              = false;


/**
 * timeBoundary :                 limit the minimum and maximum values of the time interval
 * @param {Number} t              time value in seconds
 * @returns                       a number between 1 and 10000
 */
function timeBoundary(t) {
  var max = 10000;
  var min = 1;
  ret = Number(t);

  if (ret <= 0)
    ret = min;
  else if (ret > max)
    ret = max;
  else if (isNaN(ret))
    ret = DEFAULT_INTERVAL;

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

/**
 * getLimitedByteLog :            Limited length of download resume history log
 * @param {String} str            string to check
 * @returns 
 * 
 * Due to the limited capacity of chrome.storage.local, 
 * we need to limit the length of the log to less than a certain number of bytes.
 */
function getLimitedByteLog(str) {
  maxByte = MAX_LOG_BYTE;
  
  byteLength = (function(s, b, i, c) {
    for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
    return b;
  })(str);

  /*
   * The download resume log is recorded by 3 lines, 
   * and when the limit is exceeded, 
   * 3 lines are discarded from the front 
   */
  if (byteLength > maxByte) {
    str = str.substring(str.indexOf('\n') + 1);
    str = str.substring(str.indexOf('\n') + 1);
    str = str.substring(str.indexOf('\n') + 1);
  }

  return str;
}

/**
 * logging :                      save logs to chrome.storage.local
 * @param {String} str            log in string
 * 
 * Logs to the key value localSavedLog in chrome.storage.local
 */
function logging(str) {
  chrome.storage.local.get(['localSavedLog'], function(result) {
    if (typeof result.localSavedLog == "undefined") {
      result.localSavedLog = "";
    }

    var updatedLog = result.localSavedLog + str + "\n\n";
    updatedLog = getLimitedByteLog(updatedLog);

    chrome.storage.local.set({
      localSavedLog: updatedLog
    });
  });
}

/**
 * resumeDownload :               function to resume downloads
 * @param {Array} DownloadItems   array of download information
 * 
 * A function to resume downloads that meet the conditions 
 * while checking DownloadItem passed from chrome.downloads.search one by one
 */
function resumeDownload(DownloadItems) {
  DownloadItems.forEach(function(item) {
    console.log(item);
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

/**
 * downloadManager :              search for downloads and call resumeDownload
 * @param {Object} query          Download item search criteria
 */
function downloadManager(query={}) {
  chrome.downloads.search(query, resumeDownload);
}

/**
 * autoResume :                   automatically resumes the downloads according to the toggle value
 * @param {Boolean} toggle        whether Resume Downloads is currently turned on
 */
function autoResume(toggle) {
  if (toggle) {
    background_function_array = stopAllIntervals(background_function_array);
    newInterval = setInterval(downloadManager, interval_for_check * 1000);
    background_function_array.push(newInterval);
  } else {
    background_function_array = stopAllIntervals(background_function_array);
  }

  /* resave current options */
  chrome.storage.local.set({
    running: toggle
  });
}

/* load an option for resuming paused downloads */
chrome.storage.local.get(['paused'], function(result) {
  resume_on_paused = result.paused;
});

/* load an option for download resume time interval */
chrome.storage.local.get(['sec'], function(result) {
  interval_for_check = timeBoundary(result.sec);
});

/* loads an option for whether auto-resume-download works */
chrome.storage.local.get(['running'], function(result) {
  if (result.running) {
    autoResume(true);
  }
});

/* connection with popup.js */
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    /* get options from popup */
    interval_for_check = timeBoundary(message.sec);
    resume_on_paused = message.paused;

    /* resave current options */
    chrome.storage.local.set({
      paused: resume_on_paused,
      sec: interval_for_check
    });

    /* auto resume */
    if (message.running == true) {
      autoResume(true);
    } else {
      autoResume(false);
    }
  });
});
