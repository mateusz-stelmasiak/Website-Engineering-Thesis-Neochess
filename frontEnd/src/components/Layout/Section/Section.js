import React from 'react';
import "./Section.css";

export default function Section(props, sectionID) {
    return (
        <section id={sectionID} className="Section">
            <div className="Section-content">
                {props.children}
            </div>

        </section>
    );
}


