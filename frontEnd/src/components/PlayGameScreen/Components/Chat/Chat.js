import "./Chat.css"
import Form from "react-bootstrap/Form";
import React, {Component, useEffect, useState} from "react";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../../redux/reducers/rootReducer";
import ScrollToBottom from 'react-scroll-to-bottom';
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getCurrentTimestamp} from "../../../../serverCommunication/Utils";
import {emit} from "../../addons/libraries/p5.pre-min";
import ChatMessages from "../ChatMessages";
import DrawProposal from "../DrawProposal";
import {playingAs} from "../../Game/Main";

export let spamInterval = 2000
export let initialSpamCooldown = 1000

function Chat({socket, username, userId, gameId, dispatch, drawProposedColor}) {
    let [messages, setMessages] = useState([]);
    let [typedMsg, setTypedMsg] = useState("");
    let [error, setError] = useState("");
    let [lastMsgTimeStamp, setLastMsgTimeStamp] = useState(undefined);
    let [spamCooldown, setSpamCooldown] = useState(initialSpamCooldown);
    let [showDrawProposal, setShowDrawProposal] = useState(false);

    let sendIcon = <FontAwesomeIcon icon={faPaperPlane}/>

    let addMessageToLog = (msg) => {
        let messageLog = messages;
        setMessages([]); // do not delete, otherwise component won't update
        messageLog.push(msg);
        setMessages(messageLog);
    }

    useEffect(() => {
        //if was disconnected during draw proposal/ reloads page
        if (drawProposedColor !== null && drawProposedColor !== "null" && drawProposedColor !== playingAs) {
            setShowDrawProposal(true);
        }

        socket.on('receive_message', (data) => {
            if (socket === undefined || !socket.is_connected || data === undefined) return;

            let msg = {
                name: data.playerName,
                text: data.text,
                sender: 1
            };
            addMessageToLog(msg);
        })

        socket.on('draw_proposed', (data) => {
            console.log("DRAW PROPOSED");
            if (socket === undefined || !socket.is_connected || data === undefined) return;
            setShowDrawProposal(true);
        })
    }, [])

    let handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        let msg = typedMsg;

        //prevent sending empty msgs
        if (msg.length === 0) {
            return;
        }

        //handle too long messages
        if (msg.length > 150) {
            setError("Message too long!");
            return;
        }

        // if(this.isSpamming) return;
        setLastMsgTimeStamp(getCurrentTimestamp());

        let msgJSON = {
            name: username,
            text: typedMsg,
            sender: 0
        };
        addMessageToLog(msgJSON);

        //send to server
        let sendChatvent = {
            event: 'send_chat_to_server',
            msg: JSON.stringify({username, msg, gameId, userId})
        }

        dispatch(emit(sendChatvent));
        //clear typed msg
        setTypedMsg("");
    }

    let updateTypedMsg = (msg) => {
        if (msg.length > 150) return
        setTypedMsg(msg)
    }


    return (
        <section className="Chat">
            <ScrollToBottom className="Chat-messages" mode="bottom">
                <ChatMessages
                    messages={messages}
                />
                <DrawProposal show={showDrawProposal} setShow={setShowDrawProposal}/>
            </ScrollToBottom>

            <Form onSubmit={handleSubmit}>
                <div className="Chat-input">
                    <Form.Control
                        required
                        placeholder="Your message...."
                        type="text"
                        value={typedMsg}
                        onChange={(e) => updateTypedMsg(e.target.value)}
                    />

                    <button onClick={handleSubmit}>{sendIcon}</button>
                </div>
            </Form>

            {error !== "" && <div className="errorMessage">{error}</div>}
        </section>
    );
}

export default connect(mapAllStateToProps)(Chat);
