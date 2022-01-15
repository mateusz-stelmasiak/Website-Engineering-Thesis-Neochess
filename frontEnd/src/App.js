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
import CookiesConsent from "./components/Cookies/CookiesConsent";
import RejoinGameWidget from "./components/MainPageScreen/Components/RejoinGameWidget";
import CookiesPreferences from "./components/Cookies/CookiesPreferences";
import CookiesPage from "./components/Cookies/CookiesPage";


export const GAME_DEBUGING_MODE = false;


function App({socket, sessionToken, userId, gameId, isInGame}) {
    const history = useHistory();
    let routeToMain = () => history.push('/');
    const routeToGame = (gameId) => history.push('/play?id=' + gameId);
    const [loading, setLoading] = useState(true);

    //try to regenerate the session on reload
    useEffect(() => {
        //try to regenerate the session on reload
        if (sessionToken === 'none' && userId) {
            getSessionToken().then((resp) => {
                    // if (resp === undefined || !resp.sessionToken) {
                    //
                    // }
                    setLoading(false);
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
                        <Route path="/cookies" component={CookiesPage}/>
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