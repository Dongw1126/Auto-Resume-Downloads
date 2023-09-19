/* download resume times interval (in seconds) */
const DEFAULT_CHECK_TIME = 3;
const MAX_CHECK_TIME = 10000;
const MIN_CHECK_TIME = 1;

/* maximum length of log (in bytes) */
const MAX_LOG_BYTE = 7000;


/* list of functions running in the background */
let intervals = [];

/* time interval between scanning and resuming downloads */
let checkTime = DEFAULT_CHECK_TIME;

/* whether to resume paused downloads as well */
let resumeForPausedItem = false;


/**
 * getValidTime :                 limit the minimum and maximum values of the time interval
 * @param {Number} t              time value in seconds
 * @returns                       a number between 1 and 10000
 */
function getValidTime(t) {
    let ret = Number(t);

    if (ret <= 0)
        ret = MIN_CHECK_TIME;
    else if (ret > MAX_CHECK_TIME)
        ret = MAX_CHECK_TIME;
    else if (isNaN(ret))
        ret = DEFAULT_CHECK_TIME;

    return ret;
}

/**
 * stopAllIntervals :             stop all Interval functions in the array
 * @param {Array} ids             array of functions
 * @returns                       empty array
 */
function stopAllIntervals(ids) {
    ids.forEach(id => clearInterval(id));
    return [];
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
 * logging :                      save logs to chrome.storage.local
 * @param {String} str            log in string
 *
 * Logs to the key value localSavedLog in chrome.storage.local
 */
function logging(str) {
    chrome.storage.local.get(['localSavedLog'], result => {
        if (typeof result.localSavedLog == "undefined") {
            result.localSavedLog = "";
        }

        let updatedLog = result.localSavedLog + str + "\n\n";
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
    DownloadItems.forEach(item => {
        if (item.canResume) {
            if (!item.paused || resumeForPausedItem) {
                chrome.downloads.resume(item.id, function () {
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
function downloadManager(query = {}) {
    chrome.downloads.search(query, resumeDownload);
}

/**
 * autoResume :                   automatically resumes the downloads according to the toggle value
 * @param {Boolean} toggle        whether Resume Downloads is currently turned on
 */
function autoResume(toggle) {
    if (toggle) {
        intervals = stopAllIntervals(intervals);
        const newInterval = setInterval(downloadManager, checkTime * 1000);
        intervals.push(newInterval);
    } else {
        intervals = stopAllIntervals(intervals);
    }

    /* resave current options */
    chrome.storage.local.set({
        running: toggle
    });
}

/* load an option for resuming paused downloads */
chrome.storage.local.get(['paused'], result => {
    resumeForPausedItem = result.paused;
});

/* load an option for download resume time interval */
chrome.storage.local.get(['sec'], result => {
    checkTime = getValidTime(result.sec);
});

/* loads an option for whether auto-resume-download works */
chrome.storage.local.get(['running'], result => {
    if (result.running) {
        autoResume(true);
    }
});

/* connection with popup.js */
chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(message => {
        /* get options from popup */
        checkTime = getValidTime(message.sec);
        resumeForPausedItem = message.paused;

        /* resave current options */
        chrome.storage.local.set({
            paused: resumeForPausedItem,
            sec: checkTime
        });

        /* auto resume */
        if (message.running) {
            autoResume(true);
        } else {
            autoResume(false);
        }
    });
});
