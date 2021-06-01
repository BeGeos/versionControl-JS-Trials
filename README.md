## Changes Control

First attempt with version control. It works fine with _.txt_ files, the goal is having it work with all file.

I know that there is git for version control but I have always been interested in what goes on behind the curtain, and how something similar could be implemented.

#### Main Logic

So far the name of the file that needs to be watched has to be hard-coded, but with furthere implementation I plan to create a simple VS extension. Each time the file is changed, the script will look for a _saved.txt_ file, if it doesn't find, it will create it and put it in the current working directory. Then, the original file and the saved file will be matched and and the outcome will be an object with what was removed and what was added and at what line.

Finally, this object is transcribed to a changes.log file, again, if it doesn't exist the script will create it, with a date of when the change was saved. The _saved.txt_ file will be updated to the most current version of the watched file.

#### TODO:

- Watch the file with global/input variable
- VS extension
- Improved recognition for changes, so far the individual new lines are correctly identified. However, since the script moves downwards, line by line, if something were added, 2 lines of code for instance, the match would see the 2 new lines but point as new lines the one that were there before but now have been moved downwards. WHich is the expected behaviour for how the script is written. But there's definitely room for improvement there
