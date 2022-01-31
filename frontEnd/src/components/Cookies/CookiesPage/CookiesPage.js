import CookieTable from "../CookieTable/CookieTable";
import {Cookie} from "../CookiesConsent/CookiesConsent";
import {connect} from "react-redux";
import {setPreferencesOpen} from "../../../redux/actions/cookieActions";
import FooterHeaderWithMarginsLayout from "../../Layout/FooterHeaderWithMarginsLayout";
import Section from "../../Layout/Section/Section";
import "./CookiesPage.css"
import SectionTitle from "../../Layout/Section/SectionTitle";
import React from "react";

export let cookies =
    {
        necessary:
            {
                desc: 'These Cookies are essential to make our website work correctly.',
                consent_string: 'default',
                list: [
                    new Cookie(
                        'rc::a',
                        'https://cookiedatabase.org/cookie/google-recaptcha/rca/',
                        'Google reCaptcha- distinguishing between humans and bots.',
                        'Third party',
                        'Never'
                    ),
                    new Cookie(
                        'rc::c',
                        'https://cookiedatabase.org/cookie/google-recaptcha/rcc/',
                        'Google reCaptcha- distinguishing between humans and bots.',
                        'Third party',
                        'Session'
                    ),
                    new Cookie(
                        'cookies_consent',
                        null,
                        "Remembers user's cookie preferences.",
                        'First party',
                        '30 days'
                    )
                ]
            }
        ,
        performance:
            {
                desc: 'These Cookies collect and report on aggregate non-identifiable information, ' +
                    'which helps us understand the performance of the website and provides insights on' +
                    'how the site is currently used and how it can be improved for visitors.',
                consent_string: 'analisis',
                list: [
                    new Cookie(
                        '_fbp, _fbc',
                        'https://cookiedatabase.org/cookie/facebook/_fbp/',
                        "Facebook pixel- tracks users' behaviour on the website.",
                        'Third party',
                        '3 months'
                    ),
                    new Cookie(
                        'tr',
                        null,
                        "Facebook pixel- tracks users' behaviour on the website.",
                        'Third party',
                        'session'
                    )
                ]
            }
    };

export let cookieTypes = Object.keys(cookies);

function CookiesPage({dispatch}) {

    return (
        <FooterHeaderWithMarginsLayout>
            <Section>
                <div className="CookiesPage">
                    <SectionTitle>COOKIE POLICY</SectionTitle>
                    <p>
                        This website uses cookies to optimize website functionality, analyze website performance, and
                        provide personalized experience and advertisement to you. Some cookies are necessary and
                        essential to make the website operate and function correctly. Those cookies cannot be disabled.
                        The tables below contain all cookies used on the website:
                    </p>
                    <h2>COOKIE LIST</h2>
                    <p>
                        Cookies are text files with small pieces of data — like a username and password — that are used
                        to identify your computer as you use a computer network. Specific cookies known as HTTP cookies
                        are used to identify specific users and improve your web browsing experience.

                        Data stored in a cookie is created by the server upon your connection. This data is labeled with
                        an ID unique to you and your computer.
                    </p>
                    <h4>NECCESARY COOKIES</h4>
                    <p>
                        {cookies.necessary.desc}
                    </p>

                    <CookieTable cookies={cookies.necessary.list}/>

                    <h4>PERFORMANCE COOKIES</h4>
                    <p>
                        {cookies.performance.desc}
                    </p>

                    <CookieTable cookies={cookies.performance.list}/>
                    <h2>MANAGE COOKIES</h2>
                    <p>
                        To manage your cookie setings, or turn-off cookies of certain categories use our cookie
                        preferences tool -&nbsp;
                        <u>
                            <a onClick={() => dispatch(setPreferencesOpen(true))}>
                                Open cookie preferences
                            </a>
                        </u>.
                    </p>
                    <p>
                        You can also block cookies directly in your web-browser, or set it to ask everytime a website
                        is trying to save a cookie file. You can also delete saved cookies directly from your browser.
                        If you are interested in any of the above, please consult -&nbsp;<a
                        href={'http://www.allaboutcookies.org/manage-cookies/index.html'}>http://www.allaboutcookies.org/manage-cookies/index.html</a>.
                    </p>
                    <p>
                        However, you must remember that disabling cookies on our website may limit some of its functionalities.
                    </p>
                </div>

            </Section>

        </FooterHeaderWithMarginsLayout>
    );
}

export default connect()(CookiesPage);
