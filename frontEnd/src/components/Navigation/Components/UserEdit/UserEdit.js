import "./UserEdit.css";
import {connect} from "react-redux";
import Form from "react-bootstrap/Form";
import React, {useState} from "react";
import validator from "validator";
import Button from "react-bootstrap/Button";

function UserEditForm({dispatch}) {

    return <>
        <div className="UserEditForm">
            <h1>User Edit</h1>
            <Form>
                <Form.Control
                    required
                    placeholder="e-mail address..."
                    type="text"
                    // value={email}
                    // onChange={(e) => CheckEmail(e.target.value)}
                />
            </Form>
        </div>
    </>
}

export default connect()(UserEditForm)
