import "./OrbitContainer.css"


export default function OrbitContainer(props) {


    return (
        <div className="OrbitContainer">

            <div className="static-orbit">
                {props.center}
            </div>


            <div id="circle-orbit-container">

                {/*<div id="inner-orbit">{props.inner}</div>*/}

                <div id="middle-orbit"/>

                <div id="outer-orbit">
                    <div id="outer-orbit-circles">   {props.outer}</div>
                </div>

            </div>
        </div>

    );
}


