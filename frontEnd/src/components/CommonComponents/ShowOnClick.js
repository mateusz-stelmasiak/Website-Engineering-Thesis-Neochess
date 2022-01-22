import {useState} from "react";
import './ShowOnClick.css'

export default function ShowOnClick({toShow,text}){
    const [show,setShow]=useState(false);


    return (
        <div className='ShowOnClick'>
            <button onClick={()=>setShow(!show)}>
                {text}
            </button>
            {show && toShow}
        </div>
    );
}