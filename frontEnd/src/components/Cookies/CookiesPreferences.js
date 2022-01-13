import "./CookiesPreferences.css"
import {Link} from "react-router-dom";
import Switch from "react-switch";
import {cookies} from "./CookiesPage";
import ShowOnClick from "../Common/ShowOnClick";
import CookieTable from "./CookieTable";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {connect} from "react-redux";
import {setPreferencesOpen, toogleConsent, updateBehaviour} from "../../Redux/Actions/cookieActions";


function CookiesPreferences({dispatch,prefOpen,consented}) {
    const [analysisConsent, setAnalysisConsent] = useState(false);

    let closeCookiePref = () => {
        dispatch(setPreferencesOpen(false));
        dispatch(updateBehaviour());
    }
    useEffect(()=>{
        setAnalysisConsent(consented.includes('analizy'));
    },[prefOpen])

    let crossIcon = <FontAwesomeIcon icon={faTimes} onClick={closeCookiePref}/>;

    const handleChange = nextChecked => {
        setAnalysisConsent(nextChecked);
        dispatch(toogleConsent('analizy'));
        dispatch(updateBehaviour());
    }

    return (
        <>
            {prefOpen &&
            <>
                <div className='CookiePreferences-overlay' onClick={closeCookiePref}/>
                <div className='CookiePreferences'>
                    {crossIcon}
                    <h1>Preferencje dotyczące przechowywania danych</h1>
                    <p>
                        Kiedy odwiedzasz witryny, mogą one przechowywać lub pobierać dane w Twojej przeglądarce. Takie
                        przechowywanie danych jest często niezbędne, by zapewnić dostęp do podstawowych funkcjonalności
                        witryny. Przechowywanie to może być też wykorzystywane na potrzeby marketingu, analiz i
                        personalizacji witryny (na przykład do przechowywania informacji o Twoich preferencjach).
                        Prywatność
                        jest dla nas ważna, masz zatem możliwość wyłączenia niektórych opcji przechowywania, które nie
                        są
                        niezbędne do zapewnienia podstawowych funkcjonalności witryny. Blokowanie kategorii może wpłynąć
                        na
                        Twoje wrażenia dotyczące korzystania z witryny.
                        <br/><br/><Link to={'/pliki-cookie'}>Polityka Cookie</Link>
                    </p>

                    <div className='CookiePrefContainer'>
                        <div className='cookietype-and-switch'>

                            <h2>Podstawowe</h2>
                            <Switch
                                checked={true}
                                disabled={true}
                            />
                        </div>
                        <p>
                            {cookies.podstawowe.desc}
                        </p>

                        <ShowOnClick
                            toShow={<CookieTable cookies={cookies.podstawowe.list}/>}
                            text={'Pokaż ciasteczka'}
                        />
                        <div className='cookietype-and-switch'>

                            <h2>Analizy</h2>
                            <Switch
                                checked={analysisConsent}
                                onChange={handleChange}
                            />
                        </div>
                        <p>
                            {cookies.analizy.desc}
                        </p>

                        <ShowOnClick
                            toShow={<CookieTable cookies={cookies.analizy.list}/>}
                            text={'Pokaż ciasteczka'}
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
        consented:state.cookie.consented
    };
};

export default connect(mapStateToProps)(CookiesPreferences);