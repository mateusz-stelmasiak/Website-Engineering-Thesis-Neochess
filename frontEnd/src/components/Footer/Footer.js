import "./Footer.css"
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {setPreferencesOpen} from "../../redux/actions/cookieActions";

function Footer({dispatch}){
    return (
        <footer>
            <div className="moreinfoContainer">
                <a href="https://www.put.poznan.pl/">Politechnika Poznańska - praca dyplomowa</a>
            </div>
            <div className="hyperlinksContainer">
                <Link to={'/about'}> About </Link>
                <Link to={'/cookies'}> Cookies </Link>
                <a onClick={()=>dispatch(setPreferencesOpen(true))}>Cookie Preferences</a>
            </div>
        </footer>
    );
}
export default  connect()(Footer);