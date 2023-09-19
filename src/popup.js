/* default download resume time interval (in seconds) */
const DEFAULT_CHECK_TIME = 3;

/* maximum length of log (in bytes) */
const MAX_LOG_BYTE = 7000;


/**
 * sendStateToBackground :         notifies background.js of the current extension status
 * @param {Object} startSwitch     toggle button document element
 * @param {Object} pausedSetting   setting checkbox document element
 * @param {Object} intervalSetting time interval input document element
 */
function sendStateToBackground(startSwitch, pausedSetting, intervalSetting) {
    const port = chrome.runtime.connect({
        name: "connect from popup"
    });

    port.postMessage({
        running: startSwitch.checked,
        paused: pausedSetting.checked,
        sec: intervalSetting.value
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
    let byteLength = (function (s, b, i, c) {
        for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1) ;
        return b;
    })(str);

    /*
     * The download resume log is recorded by 3 lines,
     * and when the limit is exceeded,
     * 3 lines are discarded from the front
     */
    if (byteLength > MAX_LOG_BYTE) {
        str = str.substring(str.indexOf('\n') + 1);
        str = str.substring(str.indexOf('\n') + 1);
        str = str.substring(str.indexOf('\n') + 1);
    }

    return str;
}

/**
 * logging :                        record the log with the current time
 * @param {String} str              string to append to log
 * @param {Object} logTextArea      document element to log
 */
function logging(str, logTextArea) {
    const today = new Date();
    const newLogText = today.toLocaleString() + "\n" + str + "\n\n";

    chrome.storage.local.get(['localSavedLog'], result => {
        if (typeof result.localSavedLog === "undefined") {
            result.localSavedLog = "";
        }

        result.localSavedLog += newLogText;
        logTextArea.value = getLimitedByteLog(result.localSavedLog);
        logTextArea.scrollTop = logTextArea.scrollHeight;

        chrome.storage.local.set({
            localSavedLog: logTextArea.value
        });
    });
}

/* a function that is called whenever popup.html is opened. */
window.onload = function () {
    const $startSwitch = document.getElementById("start-switch");
    const $applyButton = document.getElementById("apply-button");
    const $clearButton = document.getElementById("clear-button");
    const $pausedSetting = document.getElementById("paused-item");
    const $intervalSetting = document.getElementById("interval-time");
    const $logTextArea = document.getElementById("log-textarea");

    $startSwitch.addEventListener("click", () => {
        sendStateToBackground($startSwitch, $pausedSetting, $intervalSetting);
        if ($startSwitch.checked) {
            logging("auto resume running", $logTextArea);
        } else {
            logging("auto resume stopped", $logTextArea);
        }
    });

    $applyButton.addEventListener("click", () => {
        sendStateToBackground($startSwitch, $pausedSetting, $intervalSetting);
        logging("Settings applied", $logTextArea);
    });

    $clearButton.addEventListener("click", () => {
        $logTextArea.value = "";
        chrome.storage.local.set({
            localSavedLog: $logTextArea.value
        });
    });

    /* load an option for resuming paused downloads */
    chrome.storage.local.get(['paused'], result => {
        if (result.paused) {
            $pausedSetting.checked = true;
        } else {
            $pausedSetting.checked = false;
        }
    });

    /* load an option for download resume time interval */
    chrome.storage.local.get(['sec'], result => {
        if (typeof result.sec === "undefined") {
            result.sec = DEFAULT_CHECK_TIME;
        }
        $intervalSetting.value = result.sec;
    });

    /* load an option for whether auto-resume-download works */
    chrome.storage.local.get(['running'], result => {
        if (result.running) {
            $startSwitch.checked = true;
        } else {
            $startSwitch.checked = false;
        }
    });

    /* load the current log. */
    chrome.storage.local.get(['localSavedLog'], result => {
        if (typeof result.localSavedLog === "undefined") {
            result.localSavedLog = "";
        }
        $logTextArea.value = result.localSavedLog;
        $logTextArea.scrollTop = $logTextArea.scrollHeight;
    });
}
