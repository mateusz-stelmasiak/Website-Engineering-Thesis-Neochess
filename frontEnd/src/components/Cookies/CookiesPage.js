import CookieTable from "./CookieTable";
import {Cookie} from "./CookiesConsent";
import {connect} from "react-redux";
import {setPreferencesOpen} from "../../redux/actions/cookieActions";
import FooterHeaderWithMarginsLayout from "../Layouts/FooterHeaderWithMarginsLayout";
import Section from "../Layouts/Section";
import "./CookiesPage.css"
import SectionTitle from "../CommonComponents/SectionTitle";

export let cookies =
    {
        podstawowe:
            {
                desc: 'Wymagane do obsługi podstawowych funkcji witryny.',
                consent_string: 'default',
                list: [
                    new Cookie(
                        'rc::a',
                        'https://cookiedatabase.org/cookie/google-recaptcha/rca/',
                        'Google reCaptcha- rozpoznawanie między użytkownikami a botami.',
                        'Third party',
                        'Stałe'
                    ),
                    new Cookie(
                        'rc::c',
                        'https://cookiedatabase.org/cookie/google-recaptcha/rcc/',
                        'Google reCaptcha- rozpoznawanie między użytkownikami a botami.',
                        'Third party',
                        'Sesja'
                    ),
                    new Cookie(
                        'cookies_consent',
                        null,
                        'Zapamiętuje wybrane przez użytkownika ustawienia plików cookie.',
                        'First party',
                        '30 dni'
                    )
                ]
            }
        ,
        analizy:
            {
                desc: 'Pomagają operatorowi witryny internetowej zrozumieć, jak działa jego witryna, ' +
                    'jak odwiedzający wchodzą w interakcję z witryną i czy mogą wystąpić problemy techniczne.' +
                    ' W ramach tego typu przechowywania zazwyczaj nie zbiera się informacji identyfikujących gościa.',
                consent_string: 'analisis',
                list: [
                    new Cookie(
                        '_fbp, _fbc',
                        'https://cookiedatabase.org/cookie/facebook/_fbp/',
                        'Facebook pixel- śledzenie zachowań użytkowników na stronie w celu określenia wydajności reklam.',
                        'Third party',
                        '3 miesiące'
                    ),
                    new Cookie(
                        'tr',
                        null,
                        'Facebook pixel- śledzenie zachowań użytkowników na stronie w celu określenia wydajności reklam.',
                        'Third party',
                        'Sesja'
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
                    <SectionTitle>Polityka Cookies</SectionTitle>
                    <p>
                        Ta strona wykorzystuje pliki cookie. Użytkownik wyraża zgodę na wykorzystanie plików cookie,
                        jeśli
                        korzysta z naszej strony internetowej. Pliki cookie to małe pliki tekstowe, które mogą być
                        używane
                        przez strony internetowe w celu zwiększenia wygody korzystania z witryny.
                        Poniższe tabele przedstawiają pliki cookie, których używamy na tej stronie:
                    </p>
                    <h2>LISTA PLIKÓW COOKIE</h2>
                    <p>
                        Plik cookie to niewielka część danych (plik tekstowy), którą witryna internetowa - gdy jest
                        odwiedzana przez użytkownika - prosi przeglądarkę użytkownika o zapisanie na jego urządzeniu
                        w celu
                        zapamiętania informacji o użytkowniku, takich jak preferowany język lub dane logowania. Te
                        pliki
                        cookie są przez nas ustawiane i nazywane plikami cookie pierwszej strony (pliki cookie tej
                        samej
                        firmy). Do celów reklamowych i marketingowych stosujemy również pliki cookie innych firm -
                        które
                        pochodzą z innej domeny niż domena odwiedzanej strony internetowej. Dokładniej mówiąc,
                        używamy
                        plików cookie i innych technologii śledzenia do następujących celów:
                    </p>
                    <h4>ŚĆIŚLE NIEZBĘDNE PLIKI COOKIE</h4>
                    <p>
                        Te pliki cookie są niezbędne dla funkcjonowania strony internetowej i nie mogą być wyłączone
                        w
                        naszych systemach. Są one zazwyczaj ustawiane tylko w odpowiedzi na działania podejmowane
                        przez
                        użytkownika, które sprowadzają się do zapytania o usługi, takie jak ustawienie preferencji
                        prywatności, logowanie lub wypełnianie formularzy. Można ustawić przeglądarkę tak, aby
                        blokowała lub
                        ostrzegała o tych plikach cookie, ale niektóre części witryny nie będą wtedy działały. Te
                        pliki
                        cookie nie przechowują żadnych danych osobowych.
                    </p>

                    <CookieTable cookies={cookies.podstawowe.list}/>

                    <h4>PLIKI COOKIE WYDAJNOŚCI</h4>
                    <p>
                        Te pliki cookie umożliwiają nam zliczanie wizyt i źródeł ruchu, dzięki czemu możemy mierzyć
                        i
                        poprawiać wydajność naszej witryny. Pomagają one ustalić, które strony są najbardziej i
                        najmniej
                        popularne i zobaczyć, jak odwiedzający poruszają się po stronie. Wszystkie informacje
                        zbierane przez
                        te pliki cookie są agregowane i tym samym anonimowe. Jeśli użytkownik nie zezwoli na
                        stosowanie tych
                        plików cookie, nie będziemy wiedzieć, kiedy odwiedził naszą stronę internetową.
                    </p>

                    <CookieTable cookies={cookies.analizy.list}/>
                    <h2>REZYGNACJA</h2>
                    <p>
                        Aby zarządzać ustawieniami plików cookie w tej witrynie lub zrezygnować z określonych
                        kategorii
                        plików cookie, otwórz okno dialogowe <a onClick={() => dispatch(setPreferencesOpen(true))}>Ustawienia
                        plików cookie</a>.
                    </p>
                    <p>
                        Możesz również zablokować korzystanie z plików cookie za pomocą przeglądarki. Jeśli nie
                        chcesz
                        akceptować plików cookie, przeglądarkę można ustawić tak, aby automatycznie odmawiała
                        przechowywania
                        plików cookie lub informowała za każdym razem, gdy witryna żąda przechowywania plików
                        cookie. W
                        przeglądarce można również usunąć wcześniej zapisane pliki cookie. Więcej informacji można
                        znaleźć
                        na stronach pomocy przeglądarki.
                    </p>
                    <p>
                        W celu uzyskania informacji o powszechnie używanych przeglądarkach prosimy zapoznać się z <a
                        href={'http://www.allaboutcookies.org/manage-cookies/index.html'}>http://www.allaboutcookies.org/manage-cookies/index.html</a>.
                        Jeśli jednak zdecydują się Państwo nie
                        akceptować plików cookie, może to ograniczyć dostępne funkcje na naszych stronach
                        internetowych.
                    </p>
                </div>

            </Section>

        </FooterHeaderWithMarginsLayout>
    );
}

export default connect()(CookiesPage);