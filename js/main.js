// main script

ShuffleArray = array => array.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);

const log = console.log

// al html elements that we need
const MainEl = document.querySelector('.content .main')
const InfoEl = document.querySelector('.content .info')
const MainBtn = document.querySelector('.main-btn')
const AddPlayer = document.querySelector('.add-players .add')
const RemovePlayer = document.querySelector('.add-players .remove')
const players = document.querySelectorAll('.info .add-players, .info .players')
const ScoreList = document.querySelector('.info .score')

class Game {
  constructor(input) {

    // setup all class variables
    this.players = ['Speler 1','Speler 2']
    this.GameRunning = false
    this.rows = []
    this.playercardsselected = [undefined, undefined]
    this.ActivePlayer = 0
    this.CardList = document.querySelectorAll('.cards')

    // run the setup
    this.setup()

  }

  ShowGame(status) {
    // status = <boolean>
    // show the game
    MainEl.style.opacity = (status) ? 1 : 0
  }

  setup() {
    // all function to run to setup the game
    this.RePlayers()
    this.MakeItems()
    this.render()
  }

  RePlayers() {
    // update this.players from the input boxes on screen
    let el = document.querySelectorAll('input.player-name-js')
    let newplayers = []
    for (let i = 0; i < el.length; i++) {
      newplayers.push({
        name: el[i].value,
        score: 0
      })
    }
    this.players = newplayers
  }

  PlayersAddRemove(input) {
    // input = <boolean>
    // Add a input for a new player or remove a input for a player
    let el = document.querySelectorAll('input.player-name-js')
    let elholder = document.querySelector('div.info > div.players')
    if (input) {
      if (el.length < 6) {
        let addinput = document.createElement('input')
        addinput.classList.add('player-name-js')
        addinput.classList.add('player')
        addinput.type = 'text'
        addinput.value = `Speler ${el.length + 1}`
        elholder.appendChild(addinput)
      }
    } else {
      if (el.length > 1) {
        el[el.length - 1].remove()
      }
    }
    this.RePlayers()
  }

  CardClick(ev) {
    let vm = this
    if (this.GameRunning) {
      let card = {
        id: undefined, // the id of the card
        el: undefined // the element itself
      }
      let blockcard = false
      for (let i = 0; i < ev.path.length; i++) {
        let classList = ev.path[i].classList
        for (let j in classList) {
          // for some wired reason i can't iterated with a normal for loop over a DOMTokenList
          // bug: https://github.com/angular/angular.js/issues/11665
          if (classList.hasOwnProperty(j)) {
            let thisClass = classList[j]
            if (thisClass == 'open') {
              // check if the card has a `open` class if so stop this card from being used
              blockcard = true
            } else if (thisClass.startsWith('card-') && thisClass != 'card-back' && thisClass != 'card-container') {
              // get the number from the card-{{some number}} and use that to determine which card is clicked
              log(thisClass)
              card.id = Number(thisClass.slice(5,thisClass.lenght))
              card.el = ev.path[i]
            }
          }
        }
        // check if the card.id is set if so stop this for loop
        if (typeof card.id == 'number') {
          break;
        }
      }

      if (!blockcard) {
        card.el.classList.add('open')
        let topush = (typeof this.playercardsselected[0] == 'undefined') ? 0 : 1
        this.playercardsselected[topush] = {
          id: card.id,
          el: card.el
        }
        if (topush == 1) {
          if (this.rows[this.playercardsselected[0].id] == this.rows[this.playercardsselected[1].id]) {
            // plyer goes again and tries to get more points
            this.playercardsselected[0] = undefined
            this.playercardsselected[1] = undefined
            this.players[this.ActivePlayer].score = this.players[this.ActivePlayer].score + 1
          } else {
            // next player
            vm.NextPlayer()
            vm.GameRunning = false
            setTimeout(() => {
              vm.playercardsselected[0].el.classList.remove('open')
              vm.playercardsselected[1].el.classList.remove('open')
              vm.playercardsselected[0] = undefined
              vm.playercardsselected[1] = undefined
              vm.GameRunning = true
            }, 1000);
          }
        }
        this.UpdateScore()
      }

    }
  }

  NextPlayer() {
    // go to the next player
    if (this.players[this.ActivePlayer + 1]) {
      this.ActivePlayer = this.ActivePlayer + 1
    } else {
      this.ActivePlayer = 0
    }
  }

  UpdateScore() {
    // update the scores on screen
    ScoreList.innerHTML = ''
    for (var i = 0; i < this.players.length; i++) {
      let player = this.players[i]
      let PlayerEl = document.createElement('div')
      PlayerEl.classList.add('player-info')
      PlayerEl.classList.add(`player-${i}`)

      if (this.ActivePlayer == i) {
        PlayerEl.classList.add(`ActivePlayer`)
      }
      let name = document.createElement('div')
      name.innerText = player.name
      let score = document.createElement('div')
      score.innerText = player.score

      PlayerEl.appendChild(name)
      PlayerEl.appendChild(score)

      ScoreList.appendChild(PlayerEl)
    }

    // reset the game if all cards are turned
    (document.querySelectorAll('.card.open').length == 16) ?
      InitButtonPressed(false) :
      true

  }

  InitButtonPressed(ev) {
    // start / reset button pressed handeler
    if (!this.GameRunning) {
      // start the game
      this.GameRunning = true
      MainBtn.innerText = 'Reset'
    } else {
      // reset the game
      this.setup()
    }
    for (let i = 0; i < players.length; i++) {
      players[i].style.display = 'none'
    }
    ScoreList.style.display = 'inline-block'
    this.UpdateScore()
    this.ShowGame(true)
  }

  MakeItems() {
    // make a lit of cards and shuffle them
    let rows = []
    for (var i = 0; i < 8; i++) {
      rows.push(i + 1)
    }
    rows = rows.concat(rows) // duplicate the array
    rows = ShuffleArray(rows) // shuffel the array
    this.rows = rows
  }

  render() {

    // make all card items and place htem on screen
    const cards = document.createElement("div")
    cards.classList.add('cards')

    for (var i = 0; i < this.rows.length; i++) {
      let card = document.createElement("div")
      card.classList.add('card')
      card.classList.add(`card-${i}`)
      card.onclick = (ev) => this.CardClick(ev)

      let CardFront = document.createElement("div")
      CardFront.classList.add('card-front')
      CardFront.style.backgroundImage = `url(img/${this.rows[i]}.jpg)`

      let CardBack = document.createElement("div")
      CardBack.classList.add('card-back')

      let container = document.createElement("div")
      container.classList.add('card-container')

      container.appendChild(CardBack)
      container.appendChild(CardFront)
      card.appendChild(container)

      cards.appendChild(card)
    }

    MainEl.innerHTML = ''
    MainEl.appendChild(cards)
  }
}

// make a new game
game = new Game({})

// bind the start/reset button from the game to the game object
MainBtn.onclick = (e) => game.InitButtonPressed(e)

// bind add player and remove player button to `game.PlayersAddRemove()`
AddPlayer.onclick = (e) => game.PlayersAddRemove(true)
RemovePlayer.onclick = (e) => game.PlayersAddRemove(false)
