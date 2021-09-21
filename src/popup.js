/* default download resume time interval (in seconds) */  
const DEFAULT_INTERVAL              = 3;

/* maximum length of log (in bytes) */  
const MAX_LOG_BYTE                  = 7000;


/**
 * sendStateToBackground :          notifies background.js of the current extension status
 * @param {Object} start_switch     toggle button document element
 * @param {Object} paused_setting   setting checkbox document element
 * @param {Object} interval_setting time interval input document element
 */
function sendStateToBackground(start_switch, paused_setting, interval_setting) {
  var port = chrome.extension.connect({
    name: "connect from popup"
  });

  port.postMessage({
    running: start_switch.checked,
    paused: paused_setting.checked,
    sec: interval_setting.value
  });
}

/**
 * getLimitedByteLog :              Limited length of download resume history log
 * @param {String} str              string to check
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
 * logging :                        record the log with the current time
 * @param {String} str              string to append to log
 * @param {Object} log_text_area    document element to log
 */
function logging(str, log_text_area) {
  let today = new Date();
  var new_log_text = today.toLocaleString() + "\n" + str + "\n\n";

  chrome.storage.local.get(['localSavedLog'], function(result) {
    if (typeof result.localSavedLog == "undefined") {
      result.localSavedLog = "";
    }

    result.localSavedLog += new_log_text;
    log_text_area.value = getLimitedByteLog(result.localSavedLog);
    log_text_area.scrollTop = log_text_area.scrollHeight;

    chrome.storage.local.set({
      localSavedLog: log_text_area.value
    });

  });
}

/* a function that is called whenever popup.html is opened. */
window.onload = function() {
  var start_switch_elem = document.getElementById("start-switch");
  var apply_button_elem = document.getElementById("apply-button");
  var clear_button_elem = document.getElementById("clear-button");
  var paused_setting_elem = document.getElementById("paused-item");
  var interval_setting_elem = document.getElementById("interval-time");
  var log_textarea_elem = document.getElementById("log-textarea");

  start_switch_elem.addEventListener("click", function() {
    sendStateToBackground(start_switch_elem, paused_setting_elem, interval_setting_elem);
    if (start_switch_elem.checked) {
      logging("auto resume running", log_textarea_elem);
    } else {
      logging("auto resume stopped", log_textarea_elem);
    }
  });

  apply_button_elem.addEventListener("click", function() {
    sendStateToBackground(start_switch_elem, paused_setting_elem, interval_setting_elem);
    logging("Settings applied", log_textarea_elem);
  });

  clear_button_elem.addEventListener("click", function() {
    log_textarea_elem.value = "";
    chrome.storage.local.set({
      localSavedLog: log_textarea_elem.value
    });
  });

  /* load an option for resuming paused downloads */
  chrome.storage.local.get(['paused'], function(result) {
    if (result.paused) {
      paused_setting_elem.checked = true;
    } else {
      paused_setting_elem.checked = false;
    }
  });

  /* load an option for download resume time interval */
  chrome.storage.local.get(['sec'], function(result) {
    if (typeof result.sec == "undefined") {
      result.sec = DEFAULT_INTERVAL;
    }
    interval_setting_elem.value = result.sec;
  });

  /* load an option for whether auto-resume-download works */
  chrome.storage.local.get(['running'], function(result) {
    if (result.running) {
      start_switch_elem.checked = true;
    } else {
      start_switch_elem.checked = false;
    }
  });

  /* load the current log. */
  chrome.storage.local.get(['localSavedLog'], function(result) {
    if (typeof result.localSavedLog == "undefined") {
      result.localSavedLog = "";
    }
    log_textarea_elem.value = result.localSavedLog;
    log_textarea_elem.scrollTop = log_textarea_elem.scrollHeight;
  });
}
