import './App.css';
import LogRegScreen from "./components/LogRegScreen/LogRegScreen/LogRegScreen";
import MainPageScreen from "./components/MainPageScreen/MainPageScreen";
import PlayGameScreen from "./components/PlayGameScreen/PlayGameScreen";
import {Switch, Route, Redirect, useHistory} from 'react-router-dom';
import ScrollToTop from "./components/CommonComponents/Scroll/ScrollToTop";
import React, {useEffect, useState,} from "react";
import {mapAllStateToProps} from './redux/reducers/rootReducer'
import {connect} from 'react-redux'
import PrivateRoute from "./components/CommonComponents/PrivateRouter";
import {getSessionToken} from "./serverCommunication/DataFetcher";
import UserProfileScreen from "./components/UserProfileScreen/UserProfileScreen";
import {Toaster} from "react-hot-toast";
import CookiesPreferences from "./components/Cookies/CookiesPreferences/CookiesPreferences";
import CookiesPage from "./components/Cookies/CookiesPage/CookiesPage";
import SetNewPasswordScreen from "./components/Header/Components/AccountManagement/SetNewPassword/SetNewPasswordScreen";
import InvalidTokenScreen from "./components/InvalidTokenScreen/InvalidTokenScreen";


export const GAME_DEBUGING_MODE = false;


function App({socket, sessionToken, userId, gameId, isInGame}) {
    const [loading, setLoading] = useState(true);

    //try to regenerate the session on reload
    useEffect(() => {
        //try to regenerate the session on reload
        if (sessionToken === 'none' && userId) {
            getSessionToken().then((resp) => {
                    setLoading(false);
                    socket.authorize();
                }
            );
        } else {
            setLoading(false);
        }
        //connect the socket on startup
        socket.connect();
    }, []);

    return (
        <div>
            {!loading &&
                <div className="App">
                    <ScrollToTop/>
                    <Switch>
                        {<PrivateRoute path="/" exact component={MainPageScreen}/>}
                        {<PrivateRoute path="/play" component={PlayGameScreen}/>}
                        {<PrivateRoute path="/profile" component={UserProfileScreen}/>}
                        <Route path="/login" component={LogRegScreen}/>
                        <Route path="/forgotPassword" component={SetNewPasswordScreen}/>
                        <Route path="/cookies" component={CookiesPage}/>
                        <Route path="/invalidToken" component={InvalidTokenScreen}/>
                        <Redirect from="*" to="/"/>
                    </Switch>
                    <CookiesPreferences/>
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
