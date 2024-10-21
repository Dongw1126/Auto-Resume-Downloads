# Auto Resume Downloads
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)    
<br> 
<img src="https://user-images.githubusercontent.com/48395704/108146248-2a6af480-7110-11eb-8c14-a04658488ce5.png" width="42%" height="42%">     
  
Auto Download Resume Chrome extension  
(⚠️ In some cases, Auto Resume Downloads are disabled by the Chrome browser API spec. Sorry, but in that case, please toggle the extension's switch off and on to resume your downloads.)

## Features
* Automatically resume downloading
* Time interval to trigger resumption can be manually set 
* Checking the log while the program is running  

## Installation Instructions
#### Download in Chrome Web Store
1. Download Auto Resume Downloads from [chrome web store](https://chrome.google.com/webstore/detail/auto-resume-downloads/pifbhionjpacnpjoaomhdpbekkdphdgd).
2. Available immediately after installation.
#### Download from GitHub
1. Download a [ZIP file](https://github.com/Dongw1126/Auto-Resume-Download/archive/main.zip) from GitHub and uncompress to local.
2. In Chrome, go to the extensions page (<code>chrome://extensions</code>).
3. Enable Developer Mode.
4. Choose <code>Load unpacked</code> and click <code>src</code> folder
## Usage
<img src="https://user-images.githubusercontent.com/48395704/107906106-aee43880-6f93-11eb-8cd1-caafeec574bb.gif" width="40%" height="40%">   
<br>

1. Tap the icon to open the window.  
2. Turn on the switch to run the program.   
  The program will resume automatically stopped downloads in the background  
  (⚠️If the program does not work properly, click the toggle button a few times and try again)
3. Checking <code>Apply to paused items</code> setting will automatically resume the download that you paused.
4. <code>Check time interval</code> sets the time interval for scanning stopped downloads.
5. Settings take effect when the apply button is pressed.
6. All events are recorded and visible on the log tab.  

## Contribution
### Reporting bugs
Bugs are tracked as [GitHub issues](https://github.com/Dongw1126/Auto-Resume-Downloads/issues).  
Create an issue on this repository and if possible, please provide the following information.  
* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Include screenshots and animated GIFs  
  
### Suggesting Enhancements
Enhancement suggestions are tracked as [GitHub issues](https://github.com/Dongw1126/Auto-Resume-Downloads/issues).  
Create an issue on this repository and if possible, please provide the following information.  
* Describe the current behavior and explain which behavior you expected to see instead and why
* Include screenshots and animated GIFs
* Explain why this enhancement would be useful  

### Open Pull Requests 
A [Pull Requests](https://github.com/Dongw1126/Auto-Resume-Downloads/pulls) (PR) is the step where you submit patches to this repository.   
(e.g. adding features, renaming a variable for clarity, translating into a new language)  
  
If you're not familiar with pull requests, you can follow these steps.  
1. Fork this project and clone your fork    
~~~
git clone https://github.com/<user-name>/Auto-Resume-Downloads.git
cd Auto-Resume-Downloads
~~~
2. Create a new topic branch (off the main project development branch) to contain your feature, change, or fix
~~~
git checkout -b <topic-branch-name>
git pull
~~~
3. Developing a new feature
4. Push the feature to your fork
~~~
git push origin <topic-branch-name>
~~~
5. Open a [Pull Requests](https://github.com/Dongw1126/Auto-Resume-Downloads/pulls) with a description
