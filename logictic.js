//1.Basic Set Up
//2.Determine winner
//3.Basic AI and winner notificatio
//4.MiniMax Algorithm
var origBoard;
const huPlayer="O";
const aiPlayer="X";
const winCombos=[
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
]
const cells=document.querySelectorAll('.cell');
startGame();
function startGame(){
    //display property will be set none during replay,since before replay another result will be there
    //initially result division will be by default none
    if(document.querySelector(".endgame").style.display!="none"){
        document.querySelector(".endgame").style.display="none";
    }
    //create array of 9 element and insert the keys or index to array value(0-8)
    origBoard = Array.from(Array(9).keys());
    //console.log(origBoard);
    //Remove x and O value when restart the game using following loop
    for(let i=0;i<cells.length;i++){
        cells[i].innerText="";
        //removing backround color of cell because colour all winning combination cell after someone won
        cells[i].style.removeProperty('background-color');
        //when start game we need to click cell and some functionality ro be performed. so adding click event
        cells[i].addEventListener('click',turnClick,false);
    }
}

function turnClick(square){
    //square is going to pass the click event
    //console.log(square.target.id);
    //Click only those spot which is not clicked, click spot should not be clicked again, originally origBoard is filled with number but when we click it no more remain
    //number rather fill with X and O, if those spot are number that is no body played in those spot
    if(typeof origBoard[square.target.id]=='number'){
        //Human player is clicking or turning the its own, we don't go to turn function directly because it can be called by human or ai player
        turn(square.target.id,huPlayer);
        //AI player take a turn
        //tie means every square is full and no one has one yet, if not a tie ai player take a turn
        if(!checkTie()) turn(bestSpot(),aiPlayer);
    }
}
function turn(squareId,player){
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    //when ever a turn is taken we will check whether game is own or not, we check whther player won on origboard
    let gameWon=checkWin(origBoard,player);
    if(gameWon) gameOver(gameWon);
}
function checkWin(board,player){
    //Reduce method will go through every single element of board array
    //a stands for accumulator is the value which is given back at the end and we are going to initializing the accumulator
    //e is the element in the board array that we are going through and i is corresponding index
    //This is just a way to find the evry index that a player has played in
    let plays=board.reduce((a,e,i)=>
        (e === player) ? a.concat(i) : a, []);
    let gameWon=null;
    //We are looping through every wining combination, winCombos is 2d array, so index will hold index value and win will hold winning combination in the for loop
    //winCombo.entries() is the way to get index and winning combination value
    for(let [index,win] of winCombos.entries()){
        //Go through every element in win value, has the player played in every spot that counts as win
        if(win.every(elem => plays.indexOf(elem) > -1)){
            gameWon={index: index,player: player};
            break;
        }
    }
    return gameWon;
    //if no body win game won will be null oterwise it will be a dictionary which winner was and which player was
}
function gameOver(gameWon){
    //high light the winning combination
    for(let index of winCombos[gameWon.index]){
        document.getElementById(index).style.backgroundColor = gameWon.player==huPlayer?"blue": "red";
    }
    //stop clicking game board brcause game is over, remove eevent listener
     for(let i=0; i<cells.length; i++){
         cells[i].removeEventListener('click',turnClick, false);
         //in event listener adding and removing, we remove event listener and their corresponding functionality
     }
     declareWinner(gameWon.player == huPlayer ? "You Win" : "You lose");
}
//Set up Ai to play
function declareWinner(who){
    document.querySelector(".endgame").style.display = "block";
    document.getElementById("text").innerText = who;

}
function emptySquares(){
    return origBoard.filter(s => typeof s == 'number')
}
function bestSpot(){
    //return emptySquares()[0]
    return minimax(origBoard, aiPlayer).index;
}
function checkTie(){
    if(emptySquares().length == 0){
        //if every spot is played on and no one won then it is tie
        for(let i=0; i<cells.length; i++){
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click',turnClick,false);
        }
        declareWinner("Tie Game!");
        return true;
    }
    return false;
}
//Now we are going to create unbeatable MiniMax Algorithm
function minimax(newBoard,player){
    //taking all the available spots using emptysquare function
    let availSpots=emptySquares();
    //check for terminal state oe we can say winning places and return value accordingly
    if(checkWin(newBoard,player)){
        //if O win return -10
        return{score: -10};
    }else if(checkWin(newBoard,aiPlayer)){
        //if X win return +10
        return {score: 10};
    }else if(availSpots.length === 0){
        //no spot to play return 0
        return {score: 0};
    }
    //collect the score from each of empty spot to evaluate later
    let moves = [];
    for(let  i=0; i<availSpots.length; i++){
        //create object move
        let move={};
        //set the index number of the empty spot that  store as a number in the origBoard to the index property of the move object
        move.index = newBoard[availSpots[i]];
        //Set the empty spot on the new board to the current player and call minimax function with other player and the newly changed new board
        newBoard[availSpots[i]]=player;
        if(player == aiPlayer){
            let result = minimax(newBoard, huPlayer);
            //store the object result from the minimax function called that includes score property to the score property of the move object
            move.score=result.score;
        }else{
            let result = minimax(newBoard, aiPlayer);
            move.score=result.score; 
        }
        //if the minimax algorithm does not find a terminal state keep recursively going level by level
        //this recursion happen until it reach to a terminal state and return a score one level up and fibally minimax resets new board and puses the move object to
        //the moves array
        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }
    //minimax need to evaluate bestMove in the moves array
    let bestMove;
    if(player===aiPlayer){
        let bestScore=-10000;
        for(let i=0; i<moves.length; i++){
            //if score is more than best score algorithm store that score. in case there are moves with similar score, only the first one will be stored
            if(moves[i].score > bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }else{
        let bestScore=10000;
        for(let i=0; i<moves.length; i++){
            //if score is more than best score algorithm store that score. in case there are moves with similar score, only the first one will be stored
            if(moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}