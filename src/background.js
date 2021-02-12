var arr = []
var intTime = 10;
var pausedItem = false;

function sendLog(str) {
  var port = chrome.extension.connect({
    name: "connect popup"
  });
  port.postMessage({
    myLog : str
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
  arr.forEach(function(element) {
    clearInterval(element);
  });
  arr = []
  return arr;
}

function restartDownload() {
  console.log("running");

  var showMax = 100;

  chrome.downloads.search({
    orderBy: ['-startTime'],
    limit: showMax
  }, function(results) {
    console.log(results);
    results.forEach((item) => {
      if (item.canResume) {
        console.log(results);
        console.log("resume id : " + item.id);
        chrome.downloads.resume(item.id, function() {});
      }
    });
  });
}

// load last state
chrome.storage.sync.get(['paused'], function(result) {
  pausedItem = result.paused;
  console.log(pausedItem);
});

chrome.storage.sync.get(['sec'], function(result) {
  intTime = timeBoundary(result.sec);
  console.log(intTime);
});

chrome.storage.sync.get(['turnOn'], function(result) {
  console.log(result.turnOn);
  if (result.turnOn) {
    arr = stopAllInterval(arr);
    console.log("auto resume started");

    runFunc = setInterval(restartDownload, intTime*1000);
    arr.push(runFunc);
  }
});

// main logic
// connection with popup.js
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log(msg);

    intTime = timeBoundary(msg.sec);
    pausedItem = msg.paused;

    chrome.storage.sync.set({
      paused: pausedItem,
      sec: intTime
    });

    if (msg.turnOn == true) {
      arr = stopAllInterval(arr);
      console.log("auto resume started");

      chrome.storage.sync.set({
        turnOn: true
      });

      runFunc = setInterval(restartDownload, intTime*1000);
      arr.push(runFunc);
    } else {
      console.log("auto resume stopped");

      chrome.storage.sync.set({
        turnOn: false
      });

      arr = stopAllInterval(arr);
    }
  });
});
