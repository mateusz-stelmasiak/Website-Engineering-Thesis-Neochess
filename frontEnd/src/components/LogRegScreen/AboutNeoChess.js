import FenDisplayingBoard from "../CommonComponents/FENDisplayingBoard/FenDisplayingBoard";
import React from "react";
import "./AboutNeoChess.css"

export default function AboutNeoChess(){
    return (
        <div className="AboutNeoChess">
            <h3>WELCOME TO NEOCHESS</h3>
            <p>This site was created on <span>22-06-2021</span> as a part of a thesis project at PUT (pl. <i>Poznań University of
                Technology</i>).Please enjoy your stay, and grade us gently.
            </p>
            <FenDisplayingBoard/>
            <span>To play a game, you must register an account.</span>
        </div>
    );
}