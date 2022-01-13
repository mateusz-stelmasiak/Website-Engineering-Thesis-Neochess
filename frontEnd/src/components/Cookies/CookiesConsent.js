import './CookiesConsent.css'
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {getCookie} from "../../Redux/Reducers/cookieReducer";
import {acceptAllCookies, setPreferencesOpen, updateBehaviour} from "../../Redux/Actions/cookieActions";
import CookiesPreferences from "./CookiesPreferences";


export class Cookie {
    constructor(name, link, purpose, party, expiration) {
        this.name = name;
        this.link = link;
        this.purpose = purpose;
        this.party = party;
        this.expiration = expiration;
    }

}

function CookiesConsent({dispatch}) {
    const [showBar, setShowBar] = useState(false);

    let infoText = <span>Ta witryna przechowuje dane, w tym m.in.
        pliki cookie, aby zapewnić dostęp do podstawowych funkcjonalności
        witryny, a także na potrzeby marketingu i analiz.
        W każdej chwili możesz zmienić swoje ustawienia lub zaakceptować
        ustawienia domyślne.  <Link to={'/pliki-cookie'}>Polityka Cookie</Link>
    </span>;


    //show popup if no cookie_consent cookie is set
    useEffect(() => {
        let consentCookie = getCookie('cookie_consent');
        if (!consentCookie) setShowBar(true);
    }, [])


    let acceptAll = () => {
        dispatch(acceptAllCookies());
        dispatch(updateBehaviour());
        setShowBar(false);
    }
    let openPreferences = ()=>{
        setShowBar(false);
        dispatch(setPreferencesOpen(true));
    }


    return (
        <>
            <CookiesPreferences/>

            {showBar &&
            <div className='CookiesConsent'>
                {infoText}

                <div className='buttons-container'>
                    <button id='acc' onClick={acceptAll}>
                        Zaakceptuj wszystkie
                    </button>

                    <button id='man' onClick={openPreferences}>
                        Zarządzaj preferencjami
                    </button>
                </div>

            </div>
            }
        </>
    );
}
export default connect()(CookiesConsent);

//TODO fix modular version??

// import './CookiesConsent.css'
// import ReactPixel from 'react-facebook-pixel';
// import React, {useEffect, useState} from "react";
// import {Link} from "react-router-dom";
// import CookieTable from "./CookieTable";
// import {cookies, cookieTypes} from "./CookiesPage";
// import ShowOnClick from "../Common/ShowOnClick";
// import Switch from "react-switch";
// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// import {faTimes} from "@fortawesome/free-solid-svg-icons";
//
//
// // Set a Cookie
// export function setCookie(cName, cValue, expDays) {
//     let date = new Date();
//     date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
//     const expires = "expires=" + date.toUTCString();
//     document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
// }
//
// export function getCookie(cName) {
//     const name = cName + "=";
//     const cDecoded = decodeURIComponent(document.cookie); //to be careful
//     const cArr = cDecoded.split('; ');
//     let res;
//     cArr.forEach(val => {
//         if (val.indexOf(name) === 0) res = val.substring(name.length);
//     })
//     return res;
// }
//
// export class Cookie {
//     constructor(name, link, purpose, party, expiration) {
//         this.name = name;
//         this.link = link;
//         this.purpose = purpose;
//         this.party = party;
//         this.expiration = expiration;
//     }
//
// }
//
// export default function CookiesConsent() {
//     const [showBar, setShowBar] = useState(false);
//     const [showPref, setShowPref] = useState(false);
//     //array of all consented to cookie types
//     const [consented, setConsented] = useState(['podstawowe']);
//     const [prefControls,] = useState([]);
//     const [analysisConsent,setAnalysisConsent]=useState(false);
//
//     let infoText = <span>Ta witryna przechowuje dane, w tym m.in.
//         pliki cookie, aby zapewnić dostęp do podstawowych funkcjonalności
//         witryny, a także na potrzeby marketingu i analiz.
//         W każdej chwili możesz zmienić swoje ustawienia lub zaakceptować
//         ustawienia domyślne.  <Link to={'/pliki-cookie'}>Polityka Cookie</Link>
//     </span>;
//
//     let toggleConsent = (cookieType) => {
//         //remove if it's in
//         let index = consented.indexOf(cookieType);
//         if (index !== -1) {
//             consented.splice(index, 1);
//             return;
//         }
//         consented.push(cookieType);
//     }
//
//     //update page behaviour on consent change
//     useEffect(() => {
//         console.log('halo');
//         let turnOnAnalysis = consented.includes('analizy');
//         turnOnAnalysis ? ReactPixel.grantConsent() : ReactPixel.revokeConsent();
//     }, )
//
//     //show popup if no cookie_consent cookie is set
//     useEffect(() => {
//         let consentCookie = getCookie('cookie_consent');
//         consentCookie ?  setConsented(consentCookie.split(',')):setShowBar(true);
//
//         for (const [cookieType, cookieContents] of Object.entries(cookies)) {
//             prefControls.push(
//                 <div className='CookiePrefContainer'>
//                     <div className='cookietype-and-switch'>
//                         <h2>{cookieType.charAt(0).toUpperCase() + cookieType.slice(1)}</h2>
//                         <Switch
//                             onChange={() => toggleConsent(cookieType)}
//                             checked={consented.includes(cookieType)}
//                             disabled={cookieType === 'podstawowe'}
//                         />
//                     </div>
//                     <p>
//                         {cookieContents.desc}
//                     </p>
//
//                     <ShowOnClick
//                         toShow={<CookieTable cookies={cookieContents.list}/>}
//                         text={'Pokaż ciasteczka'}
//                     />
//                 </div>
//             );
//         }
//     }, [])
//
//
//     let acceptAll = () => {
//         setConsented(cookieTypes);
//         setCookie('cookie_consent', cookieTypes.join(','), 30);
//         setShowBar(false);
//     }
//
//     let openCookiePref = () => {
//         setShowBar(false);
//         setShowPref(true);
//     }
//     let closeCookiePref = () => {
//         setShowPref(false);
//     }
//
//     let crossIcon = <FontAwesomeIcon icon={faTimes} onClick={closeCookiePref}/>;
//
//     return (
//         <>
//             {showPref &&
//             <>
//                 <div className='CookiePreferences-overlay' onClick={closeCookiePref}/>
//                 <div className='CookiePreferences'>
//                     {crossIcon}
//                     <h1>Preferencje dotyczące przechowywania danych</h1>
//                     <p>
//                         Kiedy odwiedzasz witryny, mogą one przechowywać lub pobierać dane w Twojej przeglądarce. Takie
//                         przechowywanie danych jest często niezbędne, by zapewnić dostęp do podstawowych funkcjonalności
//                         witryny. Przechowywanie to może być też wykorzystywane na potrzeby marketingu, analiz i
//                         personalizacji witryny (na przykład do przechowywania informacji o Twoich preferencjach).
//                         Prywatność
//                         jest dla nas ważna, masz zatem możliwość wyłączenia niektórych opcji przechowywania, które nie
//                         są
//                         niezbędne do zapewnienia podstawowych funkcjonalności witryny. Blokowanie kategorii może wpłynąć
//                         na
//                         Twoje wrażenia dotyczące korzystania z witryny.
//                         <br/><br/><Link to={'/pliki-cookie'}>Polityka Cookie</Link>
//                     </p>
//                     {prefControls}
//                 </div>
//             </>
//             }
//
//             {showBar &&
//             <div className='CookiesConsent'>
//                 {infoText}
//
//                 <div className='buttons-container'>
//                     <button id='acc' onClick={acceptAll}>
//                         Zaakceptuj wszystkie
//                     </button>
//
//                     <button id='man' onClick={openCookiePref}>
//                         Zarządzaj preferencjami
//                     </button>
//                 </div>
//
//             </div>
//             }
//         </>
//     );
// }
//
