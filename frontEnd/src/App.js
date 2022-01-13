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
import {getSessionToken} from "./serverCommunication/DataFetcher";
import UserProfileScreen from "./components/UserProfileScreen/UserProfileScreen";
import {toast, Toaster} from "react-hot-toast";
import RejoinGameWidget from "./components/MainPageScreen/Components/RejoinGameWidget";
import {CameraBase} from "./components/Layouts/Camera/CameraBase";



export const GAME_DEBUGING_MODE=false;

function App({socket,sessionToken,userId}) {
    const [loading,setLoading]=useState(true);


    //welcome and regenerate the session on reload
    useEffect(() => {
        if(sessionToken==='none' && userId){
            getSessionToken().then(()=>{
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
                      <CameraBase>
                          {<PrivateRoute path="/" exact component={MainPageScreen} /> }
                          {<PrivateRoute path="/profile" exact component={UserProfileScreen} /> }
                          {<PrivateRoute path="/play" component={PlayGameScreen} />}
                          <Route path="/login" component={LogRegScreen} />
                      </CameraBase>

                      <Redirect from="*" to="/" />
                  </Switch>

                  <Toaster

                      position="top-right"
                      reverseOrder={false}
                  />
              </div>
          }
      </div>

      );

}

export default connect(mapAllStateToProps)(App);