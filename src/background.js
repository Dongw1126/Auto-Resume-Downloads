var arr = []

function restartDownload() {
  console.log("running");

  var showMax = 100;

  chrome.downloads.search({
    orderBy: ['-startTime'],
    limit: showMax
  }, function(results) {
    results.forEach((item) => {
      if(item.canResume) {
        chrome.downloads.resume(item.id, function(){});
      }
    });
  });
}

chrome.extension.onConnect.addListener(function(port) {
  console.log("background : connected");

  port.onMessage.addListener(function(msg) {
    if (msg == true) {
      console.log("auto resume started");

      chrome.storage.sync.set({turnOn: true});

      runFunc = setInterval(restartDownload, 1000);
      arr.push(runFunc);
    }

    else {
      console.log("auto resume stopped");

      chrome.storage.sync.set({turnOn: false});

      arr.forEach(function(element){
          clearInterval(element);
      });
      arr = []
    }
  });
});
