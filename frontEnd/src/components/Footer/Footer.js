import "./Footer.css"
import {Link} from "react-router-dom";

function Banner(){
    return (
        <footer>
            <div className="moreinfoContainer">
                <a href="https://www.put.poznan.pl/">Politechnika Poznańska - praca dyplomowa</a>
            </div>
            <div className="hyperlinksContainer">
                <Link to={'/about'}> About </Link>
                <Link to={'/cookies'}> Cookies </Link>
            </div>
        </footer>
    );
}
export default Banner;