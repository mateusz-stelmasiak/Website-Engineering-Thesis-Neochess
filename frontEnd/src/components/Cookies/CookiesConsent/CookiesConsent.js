import './CookiesConsent.css'
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getCookie} from "../../../redux/reducers/cookieReducer";
import {acceptAllCookies, setPreferencesOpen, updateBehaviour} from "../../../redux/actions/cookieActions";
import {toast} from "react-hot-toast";


export class Cookie {
    constructor(name, link, purpose, party, expiration) {
        this.name = name;
        this.link = link;
        this.purpose = purpose;
        this.party = party;
        this.expiration = expiration;
    }

}

function CookiesConsent({dispatch}, toastId) {
    const [showBar, setShowBar] = useState(false);

    let infoText =
    <span>
        We use cookies on our websites for a number of purposes,
        including analytics and functionality.
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
        toast.dismiss(toastId);
        toast.success("Accepted all cookies");

    }
    let openPreferences = () => {
        setShowBar(false);
        dispatch(setPreferencesOpen(true));
        toast.dismiss(toastId);
    }

    return (
        <div>

            {showBar &&
            <div className='CookiesConsent'>
                {infoText}

                <div className='buttons-container'>
                    <button id='acc' onClick={acceptAll}>
                        Accept all
                    </button>

                    <button id='man' onClick={openPreferences}>
                        Manage preferences
                    </button>
                </div>

            </div>
            }
        </div>
    );
}

export default connect()(CookiesConsent);
