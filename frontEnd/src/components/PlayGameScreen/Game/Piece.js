import {pieces_dict, pixel_positions, scalar, textures, size} from "./Main";
import {distanceBetweenPoints, getPixelPositionFromPixelPositionArray} from "./moves";

export default class Piece {

    /*
    Type:

    King - k
    Pawn - p
    Knight - n
    Bishop - b
    Rook - r
    Queen - q
    None - e
    Color:
    Letter case
    Uppercase - White
    Lowercase - Black
     */


    constructor(type, p5, x, y) {
        this.p5 = p5;
        this.did_move = 0;
        this.color = "none";
        this.type_letter = type;
        type = type.toLowerCase();
        this.type = Object.keys(pieces_dict).find(key => pieces_dict[key] === type);
        this.x = x;
        this.y = y;
        this.dragging = false;
        this.scaled_size = size - scalar;
        this.possible_moves = [];
        this.old_x = this.x;
        this.old_y = this.y;
        this.grid_pos = pixel_positions.indexOf(getPixelPositionFromPixelPositionArray([this.x, this.y]));
        // this.myDiv = createDiv(<div>xd</div>);
    }

    get_grid_pos() {
        let pos = [this.x, this.y];
        this.grid_pos = pixel_positions.indexOf(getPixelPositionFromPixelPositionArray(pos));
        return this.grid_pos;
    }


    drag() {
        return this.p5.mouseIsPressed && this.dragging;
    }

    movePiece() {
        if (this.dragging) {
            this.x = this.p5.mouseX + this.offsetX;
            this.y = this.p5.mouseY + this.offsetY;
            return true;
        }
        return false;
    }


    getClosestPosition() {
        let min = size;
        let position = [-1, -1];
        for (let i = 0; i < pixel_positions.length; i++) {
            let dist = distanceBetweenPoints(this.p5.mouseX, this.p5.mouseY, pixel_positions[i][0] + size / 2, pixel_positions[i][1] + size / 2);
            if (dist < min) {
                min = dist;
                position = pixel_positions[i]
            }
        }
        return position
    }

    snap() {
        let position = this.getClosestPosition();
        this.x = position[0];
        this.y = position[1];
        this.old_x = this.x;
        this.old_y = this.y;
    }

    snapBack() {
        this.x = this.old_x
        this.y = this.old_y
        this.old_x = this.x;
        this.old_y = this.y;
    }

    drawPiece() {
        this.p5.push();
        // this.myDiv.style('font-size', '20px');
        let trueType = this.type_letter;
        this.p5.noStroke();
        this.color === "w" ? trueType = this.type_letter.toUpperCase() : trueType = this.type_letter;
        this.p5.texture(textures[trueType])
        this.p5.translate(scalar / 2, scalar / 2);
        this.rect = this.p5.rect(this.x, this.y, this.scaled_size, this.scaled_size);
        this.p5.pop();

    }

    isIntersecting() {
        let px = this.p5.mouseX;
        let py = this.p5.mouseY;
        if (px > this.x && px < this.x + this.scaled_size && py > this.y && py < this.y + this.scaled_size) {
            this.offsetX = this.x - px;
            this.offsetY = this.y - py;
            return true;
        }
        return false;
    }

    getTaken() {
        this.did_move = 0;
        this.color = "none";
        this.type = 'e'
        this.type_letter = 'e';
        this.dragging = false;
        this.scaled_size = size - scalar;
        this.possible_moves = [];
        this.old_x = this.x;
        this.old_y = this.y;
    }
}