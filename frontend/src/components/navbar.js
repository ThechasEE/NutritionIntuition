import { Link } from 'react-router-dom'
import LoggedInName from "./LoggedInName";
import React from "react";
const Navbar = () => {
    //Data

    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");
    //var _ud = localStorage.getItem('user_data');
    //var ud = JSON.parse(_ud);

    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    const firstName = ud.payload.firstName;
    const lastName = ud.payload.lastName;


    const doLogout = event =>
    {
        event.preventDefault();
        alert('doLogout');
    };
    return (
        <nav className="navbar">
            <h1>Nutrition Intuition</h1>
            {/*<div className="links">*/}
            {/*    <Link to="/create" style={{*/}
            {/*        color: "white",*/}
            {/*        backgroundColor: '#13ae1d',*/}
            {/*        borderRadius: '12px'*/}
            {/*        //change to "Link to" instead of "a href" when you don't*/}
            {/*        //want to talk to the server*/}
            {/*    }}>Add New Meal</Link>*/}


            {/*</div>*/}
            {/*<LoggedInName/>*/}

            <div className="links">

                <li>Quick Add</li>
                <li>See History</li>
                <li>View Statistics</li>

                <li><button type="button" onClick={doLogout} id="logoutButton"
                        style={{
                            color: "white",
                            backgroundColor: '#13ae1d',
                            borderRadius: '12px'
                            //change to "Link to" instead of "a href" when you don't
                            //want to talk to the server
                        }}> Log Out </button>
                </li>
            </div>
        </nav>
    );
}

export default Navbar;