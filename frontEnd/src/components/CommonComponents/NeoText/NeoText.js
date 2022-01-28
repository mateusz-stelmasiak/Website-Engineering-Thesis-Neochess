import "./NeoText.css"

export default function NeoText(props){
    return(
        <span className="NeonText">
            {props.children}
        </span>
    )
}