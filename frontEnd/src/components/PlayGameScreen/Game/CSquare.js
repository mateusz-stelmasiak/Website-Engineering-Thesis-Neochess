import {cols, rows,size,playingAs} from "./Main";

function index(i, j) {
    if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
        return -1;
    }
    return i + j * cols; //changing two dimensional index to one dimensional
}
export default class CSquare {
    constructor(x, y, size,p5) {
        this.p5=p5;
        this.size = size;
        this.i = x;
        this.j = y;
        this.x = x * size;
        this.y = y * size;
        this.y2 = this.y + size;
        this.x2 = this.x + size;
        let parityFlag = this.j % 2;

            if (index(this.i, this.j) % 2 === 0) {
                parityFlag === 0 ? this.state = "white" : this.state = "black";
            } else {
                parityFlag === 0 ? this.state = "black" : this.state = "white";
            }



    }


    drawSquares() {
        if (this.state === "black") {
            this.p5.push();
            this.p5.noStroke();
            this.p5.fill(140, 162, 173, 255);
            this.p5.square(this.x, this.y, size);
            this.p5.pop();
        }
        if (this.state === "white") {
            this.p5.push();
            this.p5.noStroke();
            this.p5.fill(222, 227, 230, 255);
            this.p5.square(this.x, this.y, size);
            this.p5.pop();
        }

    }
}