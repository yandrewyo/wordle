document.addEventListener('DOMContentLoaded', () => {
  var wordList;

  const howTo = document.getElementById("howto")
  const game = document.getElementById("game")
  const stats = document.getElementById("stats")


  const board = document.getElementById("board")
  const keyboard = document.getElementById("keyboard")
  const rows = ["qwertyuiop", "asdfghjkl", ">zxcvbnm<"]

  // creates table
  for (var i = 0; i < 6; i++) {
    board.children[0].appendChild(document.createElement("tr"))
    board.children[0].children[i].id = "guess-"+(i+1)
    for (var j = 0; j < 5; j++) {
      board.children[0].children[i].appendChild(document.createElement("td"))
    }
  }
  //creates keyboard
  for (var i = 0; i < 3; i++) {
    keyboard.appendChild(document.createElement("div"))
    keyboard.children[i].id = "row-"+(i+1)
    for (var j = 0; j < rows[i].length; j++) {
      keyboard.children[i].appendChild(document.createElement("button"))
      keyboard.children[i].children[j].addEventListener("click", function(){
        if (alphabet.includes(this.innerHTML.toLowerCase())) {
          control(this.innerHTML.toLowerCase())
        } else if (this.innerHTML == "ENTER") {
          control("Enter")
        } else if (this.innerHTML == '<img src="backspace.png">') {
          control("Backspace")
        }
      })
      if (rows[i][j] == ">") {
        keyboard.children[i].children[j].innerHTML = "ENTER"
        keyboard.children[i].children[j].classList.add("key-special")
        keyboard.children[i].children[j].id = "enter"
      } else if (rows[i][j] == "<") {
        keyboard.children[i].children[j].appendChild(document.createElement("img"))
        keyboard.children[i].children[j].children[0].src = "backspace.png"
        keyboard.children[i].children[j].classList.add("key-special")
        keyboard.children[i].children[j].id = "backspace"
      } else {
        keyboard.children[i].children[j].innerHTML = rows[i][j].toUpperCase()
        keyboard.children[i].children[j].classList.add("key")
        keyboard.children[i].children[j].id = rows[i][j]
      }
    }
  }


  const guess1 = document.getElementById("guess-1")
  const guess2 = document.getElementById("guess-2")
  const guess3 = document.getElementById("guess-3")
  const guess4 = document.getElementById("guess-4")
  const guess5 = document.getElementById("guess-5")
  const guess6 = document.getElementById("guess-6")


  const message = document.getElementById("message")

  const guessStatus = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"]

  const guesses = [guess1.children, guess2.children, guess3.children, guess4.children, guess5.children, guess6.children]

  const statList = ["guesses", "losses", "wins", "guessDistribution", "streak", "maxStreak", "played"]
  var word = ""
  var letterCounts = {}
  var imported;
  if (localStorage.getItem("word")) {
    word = localStorage.getItem('word')
    for (var i = 0; i < word.length; i++) {
      if (letterCounts[word[i]]) {
        letterCounts[word[i]]++
      } else {
        letterCounts[word[i]] = 1
      }
    }
    console.log(letterCounts)
    imported = true
  } else {
    imported = false
  }
  var statsInfo = {}
  // localStorage.removeItem('guesses')
  // localStorage.removeItem('word')
  // localStorage.removeItem('losses')
  // localStorage.removeItem('wins')
  // localStorage.removeItem('played')
  // localStorage.removeItem('streak')
  // localStorage.removeItem('maxStreak')
  // localStorage.removeItem('guessDistribution')
  for (var i = 0; i < statList.length; i++) {
    if (localStorage.getItem(statList[i])) {
      if (statList[i] == "guesses" || statList[i] == "guessDistribution") {
        statsInfo[statList[i]] = JSON.parse(localStorage.getItem(statList[i]))
      } else {
        statsInfo[statList[i]] = parseInt(localStorage.getItem(statList[i]))
      }
    } else {
      if (statList[i] == "guesses") {
        statsInfo[statList[i]] = []
      } else if (statList[i] == 'guessDistribution') {
        statsInfo[statList[i]] = [0, 0, 0, 0, 0, 0]
      } else {
        statsInfo[statList[i]] = 0
      }
    }
  }
  var animating = false

  var alphabet = "abcdefghijklmnopqrstuvwxyz"


  
  var howtobtn = document.getElementById("howtobutton");
  var howtospan = document.getElementsByClassName("close")[0];
  var statsspan = document.getElementsByClassName("close")[1]
  var statsbtn = document.getElementById("statsbutton")
  howtobtn.onclick = function() {
    howto.style.display = "block";
  }
  howtospan.onclick = function() {
    howto.style.display = "none";
  }
  
  statsbtn.onclick = function() {
    document.getElementById("played").innerHTML = statsInfo['played']
    if (statsInfo['played'] > 0) {
      document.getElementById('wins').innerHTML = Math.round(statsInfo['wins']/statsInfo['played']*100) + "%"
    } else {
      document.getElementById('wins').innerHTML = "0%"
    }
    document.getElementById('cur-streak').innerHTML = statsInfo['streak']
    document.getElementById('max-streak').innerHTML = statsInfo['maxStreak']
    for (var i = 0; i < statsInfo['guessDistribution'].length; i++) {
      if (statsInfo['guessDistribution'][i] > 0) {
        document.getElementById((i+1).toString()).style.width = (statsInfo['guessDistribution'][i]/Math.max(...statsInfo['guessDistribution'])*100).toString()+"%"
      } else {
        document.getElementById((i+1).toString()).style.width = "15px"
      }
      document.getElementById((i+1).toString()).children[0].innerHTML = statsInfo['guessDistribution'][i]
    }
    stats.style.display = "block";
  }


  
  fetch("words.txt")
  .then(function(response) {
    return response.text()
  })
  .then(function(data) {
    wordList = data.split("\n")
    if (!word) {
      word = wordList[Math.floor(Math.random()*wordList.length)]
      localStorage.setItem('word', word)
    }
    fetch("guesses.txt")
    .then(function(response) {
      return response.text()
    })
    .then(function(data) {
      if (statsInfo['guesses']) {
        if (statsInfo['guesses'].length < 6) {
          for (var i = 0; i < statsInfo['guesses'].length; i++) {
            for (var j = 0; j < 5; j++) {
              guesses[i][j].innerHTML = statsInfo['guesses'][i][j].toUpperCase()
              if (statsInfo['guesses'][i][j] == word[j]) {
                guesses[i][j].classList.add('correct')
                document.getElementById(statsInfo['guesses'][i][j]).classList.add("correct")
              } else {
                if (word.includes(statsInfo['guesses'][i][j])) {
                  guesses[i][j].classList.add('present')
                  document.getElementById(statsInfo['guesses'][i][j]).classList.add("present")
                } else {
                  guesses[i][j].classList.add("absent")
                  document.getElementById(statsInfo['guesses'][i][j]).classList.add("absent")
                }
              }
            }
          }
        } else {
          word = wordList[Math.floor(Math.random()*wordList.length)]
          guess = ""
          row = 0
          letter = 0
        }
      } else {
        word = wordList[Math.floor(Math.random()*wordList.length)]
        guess = ""
        row = 0
        letter = 0
      }
      function checkVictory(guessNum) {
        if (word == guess) {
          displayMessage(guessStatus[guessNum], message)
          gameOver = true
          statsInfo['played'] += 1
          statsInfo['wins'] += 1
          statsInfo['streak'] += 1
          localStorage.setItem('played', statsInfo['played'])
          localStorage.setItem('wins', statsInfo['wins'])
          localStorage.setItem('streak', statsInfo['streak'])
          if (statsInfo['streak'] > statsInfo['maxStreak']) {
            statsInfo['maxStreak'] = statsInfo['streak']
            localStorage.setItem('maxStreak', statsInfo['maxStreak'])
          }
          statsInfo['guessDistribution'][row] += 1
          localStorage.setItem('guessDistribution', JSON.stringify(statsInfo['guessDistribution']))
        } else {
          if (guessNum == 5) {
            displayMessage(word.toUpperCase(), message)
            gameOver = true
            statsInfo['played'] += 1
            statsInfo['losses'] += 1
            statsInfo['streak'] = 0
            localStorage.setItem('played', statsInfo['played'])
            localStorage.setItem('losses', statsInfo['losses'])
          }
        }
        document.getElementById("played").innerHTML = statsInfo['played']
        document.getElementById('wins').innerHTML = Math.round(statsInfo['wins']/statsInfo['played']*100) + "%"
        document.getElementById('cur-streak').innerHTML = statsInfo['streak']
        document.getElementById('max-streak').innerHTML = statsInfo['maxStreak']
        for (var i = 0; i < statsInfo['guessDistribution'].length; i++) {
          if (statsInfo['guessDistribution'][i] > 0) {
            document.getElementById((i+1).toString()).style.width = (statsInfo['guessDistribution'][i]/Math.max(...statsInfo['guessDistribution'])*100).toString()+"%"
          } else {
            document.getElementById((i+1).toString()).style.width = "15px"
          }
          document.getElementById((i+1).toString()).children[0].innerHTML = statsInfo['guessDistribution'][i]
        }
        if (word == guess || guessNum == 5) {
          word = wordList[Math.floor(Math.random()*wordList.length)]
          console.log(word)
          localStorage.setItem('word', word)
          for (var i = 0; i < word.length; i++) {
            if (letterCounts[word[i]]) {
              letterCounts[word[i]]++
            } else {
              letterCounts[word[i]] = 1
            }
          }
          statsInfo['guesses'] = []
          localStorage.setItem('guesses', JSON.stringify(statsInfo['guesses']))
          document.removeEventListener("keyup", control)
          var old_element = document.getElementById("enter");
          var new_element = old_element.cloneNode(true);
          old_element.parentNode.replaceChild(new_element, old_element);
          var timeout = setTimeout(function() {
            stats.style.display = "block"
          }, 3000)
        } else {
          row+=1
          letter = 0
          guess = ""
        }
      }
      function displayMessage(msg, element) {
        element.style.opacity = 0.9
        element.style.display = "inline"
        if (!animating && msg != word.toUpperCase() || msg != element.children[0].innerHTML) {
          element.children[0].innerHTML = msg
          animating = true
          var op = 0.9;  // initial opacity
          var timeout = setTimeout(function() {
            var timer = setInterval(function () {
              if (op <= 0.1){
                clearInterval(timer);
                clearTimeout(timeout)
                element.style.display = 'none';
                animating = false
              }
              element.style.opacity = op;
              element.style.filter = 'alpha(opacity=' + op * 100 + ")";
              op -= op * 0.1;
            }, 20);
          }, 2000)
        }
      }

      function nextGame(key) {
        if (event.key == "Enter" || key == 'Enter') {
          for (var i = 0; i < guesses.length; i++) {
            for (var j = 0; j < guesses[i].length; j++) {
              guesses[i][j].innerHTML = ""
              guesses[i][j].classList.remove("correct")
              guesses[i][j].classList.remove("present")
              guesses[i][j].classList.remove("absent")
            }
          }
          for (var i = 0; i < rows.length; i++) {
            for (var j = 0; j < rows[i].length; j++) {
              keyboard.children[i].children[j].classList.remove("correct")
              keyboard.children[i].children[j].classList.remove("present")
              keyboard.children[i].children[j].classList.remove("absent")
            }
          }
          message.style.display = "none"
          guess = ""
          row = 0
          letter = 0
          document.removeEventListener("keyup", nextGame)
          document.addEventListener("keyup", control)
          var old_element = document.getElementById("enter");
          var new_element = old_element.cloneNode(true);
          old_element.parentNode.replaceChild(new_element, old_element);
          document.getElementById('enter').addEventListener('click', function() {
            control("Enter")
          })
        }
      }

      function control(key) {
        if (typeof(key) != "string") {
          key = event.key
        }
        if (alphabet.includes(key) && guess.length < 5) {
          guess+=key
          guesses[row][letter].innerHTML = key.toUpperCase()
          letter += 1
        } else if (key == "Backspace") {
          if (!gameOver) {
            guess = guess.slice(0, guess.length-1)
            if (letter > 0) {
              letter -= 1
            }
          }
          guesses[row][letter].innerHTML = ""
        } else if (key == "Enter") {
          console.log(word)
          if (guessList.includes(guess) || wordList.includes(guess)) {
            var letterCountCopy = JSON.parse(JSON.stringify(letterCounts))
            console.log(letterCounts)
            for (var i = 0; i < guess.length; i++) {
              if (guess[i] == word[i] && letterCountCopy[guess[i]] > 0) {
                guesses[row][i].classList.add("correct")
                document.getElementById(guess[i].toLowerCase()).classList.add("correct")
                letterCountCopy[guess[i]]--
                console.log(letterCountCopy)
              } else {
                if (word.includes(guess[i]) && letterCountCopy[guess[i]] > 0) {
                  guesses[row][i].classList.add("present")
                  document.getElementById(guess[i].toLowerCase()).classList.add("present")
                  letterCountCopy[guess[i]]--
                  console.log(letterCountCopy)
                } else {
                  guesses[row][i].classList.add("absent")
                  document.getElementById(guess[i].toLowerCase()).classList.add("absent")
                }
              }
            }
            statsInfo["guesses"].push(guess)
            localStorage.setItem("guesses", JSON.stringify(statsInfo["guesses"]))
            checkVictory(row)
          } else if (guess.length < 5) {
            displayMessage("Not enough letters", message)
          } else {
            displayMessage("Not in word list", message)
          }
        }
      }
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < rows[i].length; j++) {
          keyboard.children[i].children[j].addEventListener("click", function(){
            if (alphabet.includes(this.innerHTML.toLowerCase())) {
              control(this.innerHTML.toLowerCase())
            } else if (this.innerHTML == "ENTER") {
              control("Enter")
            } else if (this.innerHTML == '<img src="backspace.png">') {
              control("Backspace")
            }
          })
        }
      }

      var guessList = data.split('","')
      var guess = ""
      var row = statsInfo['guesses'].length;
      var gameOver = false;
      console.log(word)
      if (!imported) {
        for (var i = 0; i < word.length; i++) {
          if (letterCounts[word[i]]) {
            letterCounts[word[i]]++
          } else {
            letterCounts[word[i]] = 1
          }
        }
      }
      console.log(statsInfo['guesses'][statsInfo['guesses'].length-1] == word)
      if (row == 6) {
        statsInfo['guesses'] = []
        localStorage.setItem('guesses', statsInfo['guesses'])
        localStorage.setItem('word', word)
        message.style.display = "none"
        guess = ""
        row = 0
        letter = 0
      }
      var letter = 0
      document.addEventListener('keyup', control);
      window.onclick = function(event) {
        if (event.target == howto) {
          howto.style.display = "none";
        } else if (event.target == stats) {
          stats.style.display = "none"
          if (gameOver) {
            document.addEventListener("keyup", nextGame)
            document.removeEventListener("keyup", control)
            document.getElementById('enter').removeEventListener('click', control)
            document.getElementById('enter').addEventListener('click', function() {
              nextGame("Enter")
            })
          }
          gameOver = false
        }
      }
      statsspan.onclick = function() {
        stats.style.display = "none"
        if (gameOver) {
          document.addEventListener("keyup", nextGame)
          document.removeEventListener("keyup", control)
          document.getElementById('enter').removeEventListener('click', control)
          document.getElementById('enter').addEventListener('click', function() {
            nextGame("Enter")
          })
        }
        gameOver = false
      }
    })

  })
})

