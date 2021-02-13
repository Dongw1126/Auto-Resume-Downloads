var arr = []
var intTime = 10;
var pausedItem = false;

function sendLog(str) {
  var port = chrome.extension.connect({
    name: "connect popup"
  });

  str += "\n";
  port.postMessage({
    logAtBackground: str
  });
}

function timeBoundary(t) {
  ret = Number(t);
  if (ret <= 0) {
    ret = 1;
  } else if (ret > 10000) {
    ret = 10000;
  }

  return ret;
}

function stopAllInterval(arr) {
  //stop all interval functions
  arr.forEach(function(element) {
    clearInterval(element);
  });
  arr = []
  return arr;
}

function restartDownload() {
  //console.log("running");
  chrome.downloads.search({
    // get download list
    orderBy: ['-startTime'],
    limit: 100
  }, function(results) {
    //console.log(results);
    // check items in the list and resume
    results.forEach(function(item) {
      if (item.canResume) {
        if (!item.paused || pausedItem) {
          //console.log(results);
          sendLog(("resume : " + item.filename));
          chrome.downloads.resume(item.id, function(){});
        }
      }
    });
  });
}

// load last state
chrome.storage.sync.get(['paused'], function(result) {
  pausedItem = result.paused;
  //console.log(pausedItem);
});

chrome.storage.sync.get(['sec'], function(result) {
  intTime = timeBoundary(result.sec);
  //console.log(intTime);
});

chrome.storage.sync.get(['turnOn'], function(result) {
  //console.log(result.turnOn);
  if (result.turnOn) {
    // if last state is on, start Auto resume
    arr = stopAllInterval(arr);

    runFunc = setInterval(restartDownload, intTime * 1000);
    arr.push(runFunc);
  }
});

// main logic
// connection with popup.js
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    //console.log(msg);
    // load values in msg
    intTime = timeBoundary(msg.sec);
    pausedItem = msg.paused;

    chrome.storage.sync.set({
      paused: pausedItem,
      sec: intTime
    });

    if (msg.turnOn == true) {
      // auto resume start
      arr = stopAllInterval(arr);
      sendLog("auto resume running");
      chrome.storage.sync.set({
        turnOn: true
      });
      runFunc = setInterval(restartDownload, intTime * 1000);
      arr.push(runFunc);
    } else {
      // auto resume stop
      sendLog("auto resume stopped");
      chrome.storage.sync.set({
        turnOn: false
      });

      arr = stopAllInterval(arr);
    }
  });
});
