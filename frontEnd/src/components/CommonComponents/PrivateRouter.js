//redirects to login if user is not authenticated
import {Redirect, Route} from "react-router-dom";
import {connect} from "react-redux";


const PrivateRoute = ({ sessionToken,userId,component: Component, ...rest }) =>
{
    return (
        <Route {...rest} render={props => (
            sessionToken!=='none'
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )} />
    );
}
// Map Redux state to React component props
const mapStateToProps = (state) => {
    return {
        sessionToken: state.user.sessionToken
    };
};
// Connect Redux to React
export default connect(mapStateToProps)(PrivateRoute)