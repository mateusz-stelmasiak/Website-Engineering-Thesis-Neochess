import './App.css';
import LogRegScreen from "./components/LogRegScreen/LogRegScreen";
import MainPageScreen from "./components/MainPageScreen/MainPageScreen";
import PlayGameScreen from "./components/PlayGameScreen/PlayGameScreen";
import {Switch, Route, Redirect, useHistory} from 'react-router-dom';
import ScrollToTop from "./components/CommonComponents/ScrollToTop";
import React, {useEffect, useState,} from "react";
import {mapAllStateToProps} from './redux/reducers/rootReducer'
import {connect} from 'react-redux'
import PrivateRoute from "./components/CommonComponents/PrivateRouter";
import {getSessionToken} from "./serverLogic/DataFetcher";
import NavBar from "./components/Navigation/NavBar";
import ForgotPasswordForm from "./components/LogRegScreen/Components/ForgotPassword/ForgotPasswordForm";
import SetNewPasswordScreen from "./components/LogRegScreen/Components/SetNewPassword/SetNewPasswordScreen";


export const GAME_DEBUGING_MODE=false;

function App({socket,sessionToken,userId,gameId,isInGame}) {
    const history = useHistory();
    let routeToMain = () => history.push('/');
    const routeToGame = (gameId) => history.push('/play?id=' + gameId);
    const [loading,setLoading]=useState(true);


    useEffect(() => {
        //try to regenerate the session on reload
        if(sessionToken==='none' && userId){
            getSessionToken().then( (resp)=>{
                if(resp===undefined || !resp.sessionToken){
                    setLoading(false);
                    return;
                }
                if(isInGame==="true"){ routeToGame(gameId);}
                else{ routeToMain();}
                setLoading(false);
            }
            );
        }
        else{
            setLoading(false);
        }
        //connect the socket on startup
        socket.connect();
    }, []);

  return (
      <div>
          {!loading &&
              <div className="App">
                  <ScrollToTop />
                  <Switch>
                      {<PrivateRoute path="/" exact component={MainPageScreen} /> }
                      {<PrivateRoute path="/play" component={PlayGameScreen} />}
                      <Route path="/login" component={LogRegScreen} />
                      <Route path="/forgotPassword" component={SetNewPasswordScreen}/>
                      <Redirect from="*" to="/" />
                  </Switch>
              </div>
          }
      </div>

      );

}

export default connect(mapAllStateToProps)(App);

// function checkIfIsInGame(){
//     let resp= getGameIsInGame(userId,sessionToken);
//     if (resp === undefined) return
//
//     //if not in game REROUTE back
//     if(!resp.inGame && !GAME_DEBUGING_MODE){
//         dispatch(setIsInGame(false));
//         return;
//     }
//     dispatch(setGameId(resp.gameId));
//     dispatch(setPlayingAs(resp.playingAs));
//     dispatch(setGameMode(resp.gameMode));
//     dispatch(setIsInGame(true));
//
// }
