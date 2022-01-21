import React, {useEffect, useState} from "react";
import "./CircleWidget.css"

export default function CircleWidget(props) {
    let [currentView, setCurrentView] = useState(-1);
    let [navigationObj, setNavigationObj] = useState([]);

    let changeView = (index) => {
        setCurrentView(index)
    }


    //BAND COLOR CONTROl
    let borderGlowStyle = {
        'boxShadow': 'inset 0 0 13px 6px ' + props.basecolor
    }

    //EXAMPLE modify ring speed depending on status
    // if (props.status===PHONE_STATUS.REGISTERED){
    //     root.style.setProperty('--ring-speed', '2s');
    // }
    // if (props.status===PHONE_STATUS.IN_CALL || status===PHONE_STATUS.CONNECTED){
    //     root.style.setProperty('--ring-speed', '10s');
    // }
    // if (props.status===PHONE_STATUS.CALLING ||status===PHONE_STATUS.INCOMING_CALL  ){
    //     root.style.setProperty('--ring-speed', '0.7s');
    // }

    let sizeStyle = {
        small: {
            width: 'min(10rem,40vw)',
            height: 'min(10rem,40vw)',
            fontSize: '0.3rem',
            color: props.basecolor
        },
        large: {
            width: 'min(30rem,80vw)',
            height: 'min(30rem,80vw)',
            fontSize: '1rem',
            color: props.basecolor
        },
        focused: {
            width: 'min(55rem,70vw)',
            height: 'min(55rem,70vw)',
            fontSize: '1rem',
            color: props.basecolor
        }
    }

    let colorStyle = {
        unfocused: {
            backgroundColor: props.basecolor,
            color: props.basecolor,
        },
        focused: {
            backgroundColor: props.secColor,
            color: props.secColor,
        }
    }


    let goBackArrow = <a onClick={() => changeView(-1)}>{"< BACK TO MENU >"}</a>


    //assing on click change view on widget load
    useEffect(() => {
        if (!props.navigation) return;
        console.log("VIEWS")
        console.log(props.views)
        let tmp = props.navigation.map((navButton, index) => {
                return (
                    <a onClick={() => changeView(index)}>
                        {navButton}
                    </a>
                );

            }
        )
        setNavigationObj(tmp);

    }, [])


    return (
        <div className="CircleWidget" style={{transform: 'translateY(' + props.translate + ')'}}>
            <div className="CircleWidget-container">
                <div className="CircleStatus" style={
                    currentView !== -1 ? sizeStyle.focused :
                        props.size === 'small' ? sizeStyle.small : sizeStyle.large
                }>
                    <div className="statusBand" style={currentView === -1 ? colorStyle.unfocused : colorStyle.focused}>
                        <div className="contentContainer">

                            {currentView === -1 &&
                            <>
                                <h1>{props.title} </h1>
                                <div className="navContainer">
                                    {navigationObj}
                                </div>
                            </>
                            }
                            {props.views &&
                            <>
                                {currentView !== -1 && goBackArrow}
                                <>{props.views[currentView]}</>
                            </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

