import "./Loading.css"
import {useEffect, useState} from "react";

let LOADING_ON=false;
export default function Loading(props) {
    const [loaded, setLoaded] = useState(!LOADING_ON);


    useEffect(()=>{
        window.setTimeout(()=>{
            setLoaded(true)
        },0)
    },[])
    return (
        <div className="Loading">
            {loaded && props.children}

            {!loaded &&
            <div className="container">
                <span>LOADING</span>
                <div className="dot one"><br/></div>
                <div className="dot two"><br/></div>
                <div className="dot three"><br/></div>
                <div className="dot four"><br/></div>
                <div className="dot five"><br/></div>
                <div className="dot six"><br/></div>
                <div className="dot seven"><br/></div>
                <div className="dot eight"><br/></div>
                <div className="dot nine"><br/></div>
                <div className="dot ten"><br/></div>
                <div className="dot eleven"><br/></div>
                <div className="dot twelve"><br/></div>
                <div className="dot thirteen"><br/></div>
                <div className="dot fourteen"><br/></div>
                <div className="dot fifteen"><br/></div>
                <div className="dot sixteen"><br/></div>
                <div className="dot seventeen"><br/></div>
                <div className="dot eighteen"><br/></div>
                <div className="dot nineteen"><br/></div>
                <div className="dot twenty"><br/></div>
            </div>}

        </div>

    );
}
