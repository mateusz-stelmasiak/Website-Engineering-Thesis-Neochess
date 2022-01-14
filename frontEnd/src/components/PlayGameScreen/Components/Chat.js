import "./Chat.css"
import Form from "react-bootstrap/Form";
import React, {Component} from "react";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../redux/reducers/rootReducer";
import ScrollToBottom from 'react-scroll-to-bottom';
import {getCurrentTimestamp} from "../../../serverCommunication/Utils";

export let spamInterval=2000
export let initialSpamCooldown=1000

class Chat extends Component{
    constructor(props) {
        super(props);
        this.socket = this.props.socket;
        this.playerName=this.props.username;
        this.playerId = this.props.userId;
        this.gameId= this.props.gameId;

        let selfMessageStyle={
            color:'var(--sec-color)'
        }
        let opponentMessageStyle={
            color:'var(--primary-color)'
        }
        this.messageStyles= [selfMessageStyle,opponentMessageStyle]

        this.state={
            messages:[],
            typedMsg:"",
            error:"",
            lastMsgTimeStamp:undefined,
            spamCooldown:initialSpamCooldown
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.socket.on('receive_message',(data)=>{
            if (this.socket === undefined || !this.socket.is_connected || data===undefined)  return;

            console.log(data)
            let msg= {
                name:data.playerName,
                text:data.text,
                sender:1
            };
            this.addMessageToLog(msg);
        })
    }


    addMessageToLog(msg){
        let updatedMsgs= this.state.messages;
        updatedMsgs.push(msg);
        //add msg and clear field
        this.setState({messages:updatedMsgs});
    }

    // isSpamming(){
    //     //it's the first message
    //     if(!this.state.lastMsgTimeStamp) return false;
    //
    //     let timeSinceLastMsg=getCurrentTimestamp()-this.state.lastMsgTimeStamp;
    //     if(timeSinceLastMsg){
    //
    //     ){
    //
    //
    //         return false;
    //     }
    //
    //     return true;
    // }

    handleSubmit(event){
        event.preventDefault();
        this.setState({error:""});
        let playerName=this.playerName;
        let text=this.state.typedMsg;

        //handle too long messages
        if (text.length>250){
            this.setState({error:"Message too long!"});
            return;
        }
        // if(this.isSpamming) return;

        this.setState({lastMsgTimeStamp:getCurrentTimestamp()});
        let gameId=this.gameId
        let playerId=this.playerId;
        let msg= {
            name:playerName,
            text:text,
            sender:0
        };
        this.addMessageToLog(msg)
        //clear msg field
        this.setState({lastMsgTimeStamp:""});

        //send to server
        this.socket.emit('send_chat_to_server',JSON.stringify({playerName,text,gameId,playerId}));
    }

    render() {

        let messageList= this.state.messages.map((msg)=>{
            return (
                <p  className="Chat-messageItem">
                    <span style={this.messageStyles[msg.sender]} className="Chat-messageItem-name">{msg.name}:&nbsp;</span>
                    <span>{msg.text}</span>
                </p>
            );
        });


        return (
            <section className="Chat">
                <ScrollToBottom className="Chat-messages" mode="bottom">
                        {messageList}
                </ScrollToBottom>

                <Form onSubmit={this.handleSubmit}>
                    <div  className="Chat-input">
                        <Form.Control
                            required
                            placeholder="Your message...."
                            type="text"
                            value={this.state.typedMsg}
                            onChange={(e) => this.setState({typedMsg:e.target.value})}
                        />
                    </div>
                </Form>
                {this.state.error!=="" && <div className="errorMessage">{this.state.error}</div>}
            </section>
        );
    }

}

export default connect(mapAllStateToProps)(Chat);