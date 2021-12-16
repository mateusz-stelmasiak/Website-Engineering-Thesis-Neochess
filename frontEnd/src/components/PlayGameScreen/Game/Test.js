export default function sketch (p) {

    p.setup = function () {
        p.createCanvas(600, 400, p.WEBGL);
    };

    p.draw = function () {
        p.translate(-300,-200)
        p.background(300);
        p.rect(20,20,30,30);
    };
};
