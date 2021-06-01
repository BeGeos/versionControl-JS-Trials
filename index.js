const fs = require("fs");
const path = require("path");
const os = require("os");
const chokidar = require("chokidar");

class Word {
  constructor(word, position) {
    this.word = word;
    this.position = position;
    this.removed = false;
    this.added = false;
  }
}

function saveNewVersion(data) {
  return new Promise((resolve, reject) =>
    fs.writeFile("saved.txt", data, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Saved!");
        resolve(data);
      }
    })
  );
}

function insertIntoLog(data) {
  let now = new Date().toString();
  let docs = `Last changed: ${now}\n`;
  // console.log(data);
  Object.keys(data).forEach((key) => {
    // console.log(key);
    docs += `${key} --> Removed: ${data[key].removed}\n${key} --> Added: ${data[key].added}\n\n`;
  });

  docs += "-------------------\n";

  return new Promise((resolve, reject) => {
    fs.writeFile("changes.log", docs, { flag: "a+" }, (err) => {
      if (err) {
        reject(err);
      }
      resolve(docs);
    });
  });
}

function openFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.toString());
    });
  });
}

function spotTheDifference(originalSentence, savedSentence) {
  let output = {
    removed: [],
    added: [],
  };

  if (originalSentence == undefined || originalSentence == "") {
    output.removed.push(savedSentence);
    return output;
  }

  if (savedSentence == undefined || savedSentence == "") {
    output.added.push(originalSentence);
    return output;
  }

  let currentSplitLine = originalSentence
    .split(/\s|(\W)/g)
    .filter((word) => word !== "" && word !== undefined);
  let savedSplitLine = savedSentence
    .split(/\s|(\W)/g)
    .filter((word) => word !== "" && word !== undefined);

  // console.log(currentSplitLine);

  let tmpRemoved = savedSplitLine.map((word, index) => {
    let newWord = new Word(word, index);
    newWord.removed = true;
    return newWord;
  });
  let tmpAdded = new Array();

  // Removed and added part
  currentSplitLine.forEach((word, ind) => {
    let index = savedSplitLine.indexOf(word);
    // console.log(index);
    if (index > -1) {
      savedSplitLine.splice(index, 1);
      tmpRemoved.splice(index, 1);
    } else {
      let addedWord = new Word(word, ind);
      addedWord.added = true;
      tmpAdded.push(addedWord);
    }
  });

  // console.log(tmpRemoved);

  let removed = new Array();
  if (tmpRemoved.length > 0) {
    let tmpRemovedString = tmpRemoved[0].word + " ";
    // console.log(`Temporary Removed: ${tmpRemoved}`);
    // console.log(`Temporary Removed, first element: ${tmpRemoved[0]}`);
    for (let i = 0; i < tmpRemoved.length; i++) {
      // console.log(tmpRemoved[i].word);
      // console.log(i + 1);
      if (i + 1 == tmpRemoved.length) {
        // console.log("I am in last");
        removed.push(tmpRemovedString.trim());
      } else if (tmpRemoved[i].position + 1 == tmpRemoved[i + 1].position) {
        // console.log("I am still concat");
        tmpRemovedString += tmpRemoved[i + 1].word + " ";
      } else {
        // console.log("Not in sequence");
        removed.push(tmpRemovedString.trim());
        tmpRemovedString = tmpRemoved[i + 1].word + " ";
      }
    }
  } else {
    removed = [];
  }

  let added = new Array();
  if (tmpAdded.length > 0) {
    let tmpAddedString = tmpAdded[0].word + " ";
    // console.log(`Temporary Removed: ${tmpRemoved}`);
    // console.log(`Temporary Removed, first element: ${tmpRemoved[0]}`);
    for (let i = 0; i < tmpAdded.length; i++) {
      // console.log(tmpAdded[i].word);
      // console.log(i + 1);
      // if (tmpAdded[i].word == "" || tmpAdded[i].word == undefined) {
      //   continue;
      // }
      if (i + 1 == tmpAdded.length) {
        // console.log("I am in last");
        added.push(tmpAddedString.trim());
      } else if (tmpAdded[i].position + 1 == tmpAdded[i + 1].position) {
        // console.log("I am still concat");
        tmpAddedString += tmpAdded[i + 1].word + " ";
      } else {
        // console.log("Not in sequence");
        added.push(tmpAddedString.trim());
        tmpAddedString = tmpAdded[i + 1].word + " ";
      }
    }
  } else {
    added = [];
  }

  output.removed = removed;
  output.added = added;

  return output;
}

async function changedBits(originalFile, savedFile) {
  let firstFile;
  let secondFile;

  try {
    firstFile = await openFile(originalFile);
    secondFile = await openFile(savedFile);
  } catch (err) {
    console.error(err);
    return;
  }

  let firstFileArray = firstFile.split(/\n/);
  let secondFileArray = secondFile.split(/\n/);

  let maxArray = Math.max(firstFileArray.length, secondFileArray.length);

  let differences = {};

  for (let i = 0; i < maxArray; i++) {
    if (firstFileArray[i] !== secondFileArray[i]) {
      // console.log(firstFileArray[i] + "\t" + secondFileArray[i]);
      // console.log(
      //   `Line: ${i + 1}; Original File: ${firstFileArray[i]}; Saved File: ${
      //     secondFileArray[i]
      //   }`
      // );

      // Helper function to return differences
      differences[`Line ${i + 1}`] = spotTheDifference(
        firstFileArray[i],
        secondFileArray[i]
      );
    }
  }

  // console.log(differences);
  return differences;
}

// fs.watch("test.txt", async (eventType, filename) => {
//   // console.log(eventType);
//   // watchFile variation
//   // let changes = await changedBits("test.txt", "saved.txt");
//   // if (Object.entries(changes).length == 0) {
//   //   return;
//   // } else {
//   //   await insertIntoLog(changes);
//   //   let newVersion = await openFile("test.txt");
//   //   await saveNewVersion(newVersion);
//   // }

//   // watch variation
//   if (eventType == "change") {
//     let changes = await changedBits(filename, "saved.txt");
//     if (Object.entries(changes).length == 0) {
//       return;
//     } else {
//       await insertIntoLog(changes);
//       let newVersion = await openFile(filename);
//       await saveNewVersion(newVersion);
//     }
//   }
//   return;
// });

chokidar.watch("test.txt").on("change", async (path) => {
  // console.log(path);
  let changes = await changedBits(path, "saved.txt");
  if (Object.entries(changes).length == 0) {
    return;
  } else {
    try {
      let newVersion = await openFile(path);
      await insertIntoLog(changes);
      await saveNewVersion(newVersion);
    } catch (err) {
      console.error(err);
      return;
    }
  }
  return;
});

// changedBits("test.txt", "saved.txt");
// console.log(undefined == undefined);
