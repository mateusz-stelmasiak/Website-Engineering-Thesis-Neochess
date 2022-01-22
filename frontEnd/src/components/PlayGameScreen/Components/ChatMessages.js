import React from "react";

export default function ChatMessages({messages}){
    //styles
    let selfMessageStyle = {
        color: 'var(--primary-color-dark)'
    }
    let opponentMessageStyle = {
        color: 'var(--sec-color)'
    }
    let messageStyles = [selfMessageStyle, opponentMessageStyle];

    return (
        <>
            {messages && messages.map((msg)=>{
                return(
                    <p className="Chat-messageItem">
                        <span style={messageStyles[msg.sender]} className="Chat-messageItem-name">
                            {msg.sender===0 ? "You" :msg.name}:&nbsp;
                        </span>
                        <span>{msg.text}</span>
                    </p>
                )
            })}
        </>
    );

}