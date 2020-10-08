#TODO
* Rework system so drag&drop list display/progress/work window is a separate BrowserWindow() rather than via `window.open()`
* Rework system so preview window is also a standard BrowserWindow() rather than the current `window.open()`
* Make `window chrome` setup more uniform so all windows share similar display
* Look into customizing save-file dialog - likely not possible, but it'd be nice to have it match things

#Progression
* Rework setup to pure drag&drop with S3-like display for file list in a separate window
* Add IPC or top-level `window` hooks for doing merge and save completely in-app
* Replace `stack menu` with toolbar-like buttons for merge/load zip/save
* Can rework merge process to allow for progress bar (thanks Promises!)
* Figure out PDF.js so we can view a buffer (if not possible use mkstemp or similar to output to a temp file for preview)
