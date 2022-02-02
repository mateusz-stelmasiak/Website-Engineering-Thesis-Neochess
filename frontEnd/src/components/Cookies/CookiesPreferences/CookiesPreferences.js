import "./CookiesPreferences.css"
import { Link } from "react-router-dom";
import Switch from "react-switch";
import { cookies } from "../CookiesPage/CookiesPage";
import ShowOnClick from "../../CommonComponents/Scroll/ShowOnClick.js"
import CookieTable from "../CookieTable/CookieTable";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { setPreferencesOpen, toogleConsent, updateBehaviour } from "../../../redux/actions/cookieActions";


function CookiesPreferences({ dispatch, prefOpen, consented }) {
    const [analysisConsent, setAnalysisConsent] = useState(false);

    let closeCookiePref = () => {
        dispatch(setPreferencesOpen(false));
        dispatch(updateBehaviour());
    }
    useEffect(() => {
        setAnalysisConsent(consented.includes('analizy'));
    }, [prefOpen])

    let crossIcon = <FontAwesomeIcon icon={faTimes} onClick={closeCookiePref} />;

    const handleChange = nextChecked => {
        setAnalysisConsent(nextChecked);
        dispatch(toogleConsent('analizy'));
        dispatch(updateBehaviour());
    }

    return (
        <>
            {prefOpen &&
                <>
                    <div className='CookiePreferences-overlay' onClick={closeCookiePref} />
                    <div className='CookiePreferences'>
                        {crossIcon}
                        <h1>COOKIE PREFERENCES</h1>
                        <p>
                            This website uses cookies to optimize website functionality, analyze website performance, and
                            provide personalized experience and advertisement to you. Some cookies are necessary and
                            essential to make the website operate and function correctly. Those cookies cannot be disabled.
                            This Cookie Preference will help you to manage your preference of analytic/performance cookies
                            and advertising cookies.
                            <br /><br />
                            <Link to={'/cookies'}>Cookie policy</Link>
                        </p>

                        <div className='CookiePrefContainer'>
                            <div className='cookietype-and-switch'>

                                <h2>Necessary</h2>
                                <Switch
                                    checked={true}
                                    disabled={true}
                                />
                            </div>
                            <p>
                                {cookies.necessary.desc}
                            </p>

                            <ShowOnClick
                                toShow={<CookieTable cookies={cookies.necessary.list} />}
                                text={'Show cookies'}
                            />
                            <div className='cookietype-and-switch'>

                                <h2>Performance</h2>
                                <Switch
                                    checked={analysisConsent}
                                    onChange={handleChange}
                                />
                            </div>
                            <p>
                                {cookies.performance.desc}
                            </p>

                            <ShowOnClick
                                toShow={<CookieTable cookies={cookies.performance.list} />}
                                text={'Show cookies'}
                            />
                        </div>


                    </div>
                </>
            }
        </>);
}

const mapStateToProps = (state) => {
    return {
        prefOpen: state.cookie.prefOpen,
        consented: state.cookie.consented
    };
};

export default connect(mapStateToProps)(CookiesPreferences);
