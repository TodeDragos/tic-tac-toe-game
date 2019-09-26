<template>
<div>
    <div>
		<div class="gameStatus" :class="gameStatusColor">
			{{ gameStatusMessage }}
		</div>
        <table class="grid">
            <tr>
                <td class="cell" @click="strike(1)">{{ cells[1] }}</td>
                <td class="cell" @click="strike(2)">{{ cells[2] }}</td>
                <td class="cell" @click="strike(3)">{{ cells[3] }}</td>
            </tr>
            <tr>
                <td class="cell" @click="strike(4)">{{ cells[4] }}</td>
                <td class="cell" @click="strike(5)">{{ cells[5] }}</td>
                <td class="cell" @click="strike(6)">{{ cells[6] }}</td>
            </tr>
            <tr>
                <td class="cell" @click="strike(7)">{{ cells[7] }}</td>
                <td class="cell" @click="strike(8)">{{ cells[8] }}</td>
                <td class="cell" @click="strike(9)">{{ cells[9] }}</td>
            </tr>
        </table>
    </div>
</div>
</template>

<script>
import io from 'socket.io-client'

export default {
    data() {
        return {
            player: undefined,
            freeze: false,
            // can be: turn or win or draw
            gameStatus: 'turn',
            // status color is used as background color in the status bar
            // it can hold the name of either of the following CSS classes
                // statusTurn (default) is yellow for a turn
                // statusWin is green for a win
                // statusDraw is purple for a draw
            gameStatusColor: 'statusTurn',
            gameStatusMessage: '',
            // maxim number of moves made by both players = 9
            moves: 0,
    	    // stores the placement of X and O in cells by their cell number
            cells: {
                1: '', 2: '', 3: '',
                4: '', 5: '', 6: '',
                7: '', 8: '', 9: ''
            },
            // 8 possible winning conditions
            winConditions: [
                    [1, 2, 3], [4, 5, 6], [7, 8, 9], // rows
                    [1, 4, 7], [2, 5, 8],	[3, 6, 9], // columns
                    [1, 5, 9], [3, 5, 7]             // diagonals
                ],
        }
    },
    created() {
        this.socket = io('http://localhost:3000');

        this.socket.on('connected', (player) => {
            this.player = player
            this.gameStatusMessage = `Player ${this.player}`
            if(player.toString().includes('Maximum'))
                alert(this.player)
        })

        // listen for strike that one of the players emited
        this.socket.on('strike', (cellNumber)=> {
            // increments the number of moves
            this.moves++
            this.freeze = false
            
            // sets either X or O in the clicked cell of the cells array
            if(this.player === 1)
                this.cells[cellNumber] = 'X'
            else
                this.cells[cellNumber] = 'O'

			if (this.checkForWin()) {
                this.gameStatusMessage = `Player ${this.player === 1 ? 2 : 1 } Won !`
                this.gameStatus = 'win'
                
                this.freeze = true
			} else if (this.moves === 9) {
                this.freeze = true
				this.gameStatus = 'draw'
			}
        })
        this.socket.on('restart', () => {
            this.reset();
        })
        // called when reset button was pressed
        Event.$on('gridReset', () => {
            this.socket.emit('restart')
            this.reset()
  	    })
    },
    watch: {
        // watches for change in the value of gameStatus and changes the status 
        // message and color accordingly
        gameStatus () {
            if (this.gameStatus === 'win') {
                this.gameStatusColor = 'statusWin'
                return
            } else if (this.gameStatus === 'draw') {
                this.gameStatusColor = 'statusDraw'
                this.gameStatusMessage = 'Draw !'
                return
            }
        },
    },
    methods: {
  	    // it is called by the on-click event
        strike(cellNumber) {
            if(!this.freeze) {
                this.socket.emit('strike', cellNumber)
                this.moves++
                if(this.player === 1)
                    this.cells[cellNumber] = 'O'
                else
                    this.cells[cellNumber] = 'X'
                
                if (this.checkForWin()) {
                    this.gameStatusMessage = `Player ${this.player === 1 ? 1 : 2 } Won !`
                    this.gameStatus = 'win'
                } else if (this.moves === 9) {
                    this.gameStatus = 'draw'
                }

                this.freeze = true
            }
        },
		changeGameStatus () {
			if (this.checkForWin()) {
                this.gameStatusMessage = `${this.player} Wins !`
				return 'win'
			} else if (this.moves === 9) {
				return 'draw'
			}
			return 'turn'
        },
        // checks for possible win conditions from the data
        checkForWin() {
            var isWinner = false;
            this.winConditions.forEach((condition) => {
                if(this.cells[condition[0]] === this.cells[condition[1]] && this.cells[condition[1]] === this.cells[condition[2]] && this.cells[condition[0]] !== '')
                    isWinner = true;
                
            })
            return isWinner;
        },
        reset() {
            this.cells = {
                1: '', 2: '', 3: '',
                4: '', 5: '', 6: '',
                7: '', 8: '', 9: ''
            }
            this.moves = 0
            this.freeze = false
            this.gameStatus = 'turn'
            this.gameStatusColor = 'statusTurn'
            this.gameStatusMessage = `Player ${this.player}`
        }
    }
}
</script>



<style>

    .cell {
        width: 33.333%;
        height: 90px;
        border: 6px solid #2c3e50;
        font-size: 3.5em;
        font-family: 'Gochi Hand', sans-serif;
    }

    .cell:hover {
        background-color: #7f8c8d;
    }

    .grid {
        background-color: #34495e;
        color: #fff;
        width: 100%;
        border-collapse: collapse;
    }

    .gameStatus {
        margin: 0px;
        padding: 15px;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        background-color: #f1c40f;
        color: #fff;	
        font-size: 1.4em;
        font-weight: bold;
    }

    .statusTurn {
        background-color: #f1c40f;
    }

    .statusWin {
        background-color: #2ecc71;
    }

    .statusDraw {
        background-color: #9b59b6;
    }
</style>