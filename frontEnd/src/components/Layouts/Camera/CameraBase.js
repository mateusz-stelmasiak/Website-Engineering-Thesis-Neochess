import "./Camera.css"
import {useState} from "react";

export function CameraBase(props) {
    const [zoomed, setZoomed] = useState(1);

    let inside = <>{props.children}</>;


    const zoom = (ammount)=>{
        toogleZoom();
        document.body.style.transform = 'scale(1.3)';
    }

    let toogleZoom = ()=>{
        setZoomed(!zoomed);
    }



    return (
        <div className="CameraBase">
            <div onClick={toogleZoom}>  {inside}</div>
        </div>
    );
}