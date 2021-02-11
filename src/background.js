var arr = []
var intTime = 10;
var canceledItem = false;

function timeBounder(t) {
  ret = Number(t);
  if(ret <= 0) {
    ret = 0;
  }
  else if(ret > 10000){
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
    results.forEach((item) => {
      if (item.canResume) {
        chrome.downloads.resume(item.id, function() {});
      }
    });
  });
}

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log(msg);
    intTime = timeBounder(msg.sec);
    canceledItem = msg.canceled;

    chrome.storage.sync.set({
      canceled: canceledItem,
      sec : intTime
    });

    if (msg.turnOn == true) {
      arr = stopAllInterval(arr);
      console.log("auto resume started");

      chrome.storage.sync.set({
        turnOn: true
      });

      runFunc = setInterval(restartDownload, 1000);
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
