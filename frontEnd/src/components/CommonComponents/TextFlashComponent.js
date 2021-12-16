import React, {useEffect, useState} from "react";


function TextFlashComponent() {

    /*--[CUSTOMIZATION PARAMETERS]--*/
    /*Edit those to customize the widget*/
    const [text, setText] = useState("WINNER!")/*Text that is to be flashed */
    const [minRepetitions, setMinRepetiotions] = useState(3); /*Minimum number the text repeats on screen */
    const [displacement, setDisplacement] = useState(0.2); /*Margin for text jumbling [0-1]*/
    const [newTextFlag, setNewTextFlag] = useState(true);
    let textItems = []; //array holding all displayed text

    useEffect(() => {

        /*--[CREATING FROM PARAMETERS]--*/
        let repetitions = calcRepetitions(minRepetitions, displacement);
        populateTextFlash(textItems, text, repetitions, displacement);
    }, [text])

    //on widnow resize


    function populateTextFlash(textItems, textFlashText, repetitions, displacement) {
        textFlashText = textFlashText.toUpperCase();
        //update css variables basing on js custom parameters
        document.documentElement.style.setProperty('--swidget--textFlash-repetitions', repetitions);
        var displacementAsString = String(displacement * 100) + 'vw';
        document.documentElement.style.setProperty('--swidget--textFlash-displacement', displacementAsString);

        for (var i = 0; i < repetitions; i++) {
            let testTextElement = React.createElement('div', {className: 'text'}, textFlashText);

            //add alternating displacement to left and right
            if (i % 2 === 0) {
                testTextElement =
                    React.createElement('div',
                        {className: 'text swidget--textFlash-displacedLeft'},
                        textFlashText);
            } else {
                testTextElement =
                    React.createElement('div',
                        {className: 'text swidget--textFlash-displacedRight'},
                        textFlashText);
            }

            textItems.push(testTextElement);
        }

    }

//calculate appropriate ammount of repetition so that text fits the screen
    function calcRepetitions(minRepetitions, displacement) {
        let repetitions = minRepetitions;

        //create test text, to messure its width
        let testTextElement = React.createElement('div');
        textItems.push(testTextElement);

        //so long as text_width+margin>screen_width, up the number of repetitions
        let marginSize = displacement * window.innerWidth;
        console.log(marginSize);
        do {
            repetitions += 1;
            document.documentElement.style.setProperty('--swidget--textFlash-repetitions', repetitions);
        }
        while (testTextElement.clientWidth + marginSize > window.innerWidth);

        //delete test text
        textItems.pop();
        //if calculated ammount is lower then minimal, return minimal
        return repetitions < minRepetitions ? minRepetitions : repetitions;
    }


    return (
        <div className="swidget--textFlash">{textItems}</div>
    );
}

export default (TextFlashComponent)