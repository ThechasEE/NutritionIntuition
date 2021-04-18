import { Link } from 'react-router-dom'
import {useEffect, useState} from "react";

import LoggedInName from "./LoggedInName";
import React from "react";
import bp from "./bp";
const Navbar = () => {
    //Data

    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");
    //var _ud = localStorage.getItem('user_data');
    //var ud = JSON.parse(_ud);
    const [isPending, setIsPending] = useState(false);

    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    const firstName = ud.payload.firstName;
    const lastName = ud.payload.lastName;

    //do a mealtime check to get todayMealExists

    let todayMealExists;

    const checkIfMealExistForToday = (e) => {

        //prevents page inputs from being refreshed
        //create a meal
        const requestObj = {
            userId: userId,
            tok: tok
        }

        setIsPending(true);

        //TODO change to get most research and not search
        const response = fetch(bp.buildPath("api/searchmealtime"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(requestObj)
        }).then(() => {
            //add error checking for duplicate meal
            setIsPending(false);
        })
        if(response.text != null) {
            todayMealExists = true;
        }else{
            todayMealExists = false;
        }
    }
    //use this when calling functions that can render so many times ;-;
    function LoadToday(){
        useEffect(() => {
            checkIfMealExistForToday();
        }, [])
    }

    //page load logic
    LoadToday();

    const doLogout = event =>
    {
        event.preventDefault();
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <nav className="navbar">
            <h1>Nutrition Intuition</h1>
            <div className="links">

            </div>
            {/*<LoggedInName/>*/}

            <div className="links">
                <li>
                    <Link to={{
                        pathname: '/addMeal/' + todayMealExists,
                        state: {
                            todayMealExists: todayMealExists,
                        },
                    }}
                          style={{
                              color: "gray",
                              borderRadius: '12px'
                          }}
                    >Quick Add</Link>
                </li>

                <li>
                    <Link to="/create" style={{
                        color: "grey",
                        //change to "Link to" instead of "a href" when you don't
                        //want to talk to the server
                    }}>History</Link>
                </li>
                <li>
                    <Link to="/statistics" style={{
                    color: "grey",
                    //change to "Link to" instead of "a href" when you don't
                    //want to talk to the server
                }}>Statistics</Link></li>

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