#TODO
* Examine React for inclusion for display
* Find decent PDF.js for inclusion for item view
* Examine Electron IPC for use for communicating with NodeJS code doing PDF merger
* Turn off all possiblity of developer tools

#Progression
* Rework setup to pure drag&drop with S3-like display for file list in a separate window
* Add IPC or top-level `window` hooks for doing merge and save completely in-app
* Replace `stack menu` with toolbar-like buttons for merge/load zip/save
* Can rework merge process to allow for progress bar (thanks Promises!)
* Figure out PDF.js so we can view a buffer (if not possible use mkstemp or similar to output to a temp file for preview)
