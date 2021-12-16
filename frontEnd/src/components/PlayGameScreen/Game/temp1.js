function print_board() {


    for (let i = 0; i < 8; i++) {
        let tempxd=""
        for (let j = 0; j < 8; j++) {
            tempxd+= board.grid[i * 8 + j].type_letter + " "


        }
        console.log(tempxd);
        console.log("\n")
    }
}


function print_board2() {

let temp="";
    for (let i = 0; i < board.grid.length; i++) {
        temp+= board.grid[i].type_letter + " ";
    }
    console.log(temp);
}
