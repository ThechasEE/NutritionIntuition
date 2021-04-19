import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import "./Profile.css";

class Update extends React.Component
{
    static vars = {
        firstName: "",
        lastName: "",
        age: "",
        weight: "",
        goalWeight: "",
        calorieGoal: "",
        height: "",
        gender: ""
    }
}

function Profile()
{
    const bp = require("./bp.js");
    const storage = require("../tokenStorage.js");
    const md5 = require("md5");
    const jwt = require("jsonwebtoken");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    
    // Check for token to make sure user is logged in.
    if (ud == null)
    {
        window.location.href = "/login";
        return false;
    }

    // Event handlers.
    //const [updateMessage, setUpdateMessage] = useState("");

    const GetProfile = async event =>
    {
        //setUpdateMessage("");

        var obj = {
            userId: ud.payload.userId,
            jwtToken: tok
        }
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/viewprofile"), {method:"POST", body:json,headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());
            
            if (responseObj.error !== "")
            {
                //setUpdateMessage(responseObj.error);
                return false;
            }

        }
        catch(e)
        {
            //setUpdateMessage(e.toString());
        }

        return false;
    }

    // Handle logging in.
    const UpdateProfile = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        //setUpdateMessage("");

        // Check for any empty entries.


        // Login object to send.
        var obj = {

        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/login"), {method:"POST", body:json,headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());
            
            if (responseObj.error !== "")
            {
                //setUpdateMessage(responseObj.error);
                return false;
            }

        }
        catch(e)
        {
            //setUpdateMessage(e.toString());
        }

        return false;
    };

    function Load()
    {
        useEffect(() => {
            GetProfile();
        }, [])
    }

    Load();

    const ProfileForm = () =>
    (
        <div className="container">
            <form className="profile-update">
                <div>
                    <div>
                        <input type="text" required placeholder="First Name" ref={(c) => (c !== null) ? Update.vars.firstName = c : null} defaultValue={Update.vars.firstName === null ? "" : Update.vars.firstName.value}/>
                        <input type="text" required placeholder="Last Name" ref={(c) => (c !== null) ? Update.vars.lastName = c : null} defaultValue={Update.vars.lastName === null ? "" : Update.vars.lastName.value}/>
                        <input type="number" required placeholder="Age" ref={(c) => (c !== null) ? Update.vars.age = c : null} defaultValue={Update.vars.age === null ? "" : Update.vars.age.value}/>
                        <input type="number" required placeholder="Weight (lbs)" ref={(c) => (c !== null) ? Update.vars.weight = c : null} defaultValue={Update.vars.weight === null ? "" : Update.vars.weight.value}/>
                    </div>
                    <div>
                        <input type="number" required placeholder="Height (in)" ref={(c) => (c !== null) ? Update.vars.height = c : null} defaultValue={Update.vars.height === null ? "" : Update.vars.height.value}/>
                        <input type="number" required placeholder="Weight Goal (lbs)" ref={(c) => (c !== null) ? Update.vars.goalWeight = c : null} defaultValue={Update.vars.goalWeight === null ? "" : Update.vars.goalWeight.value}/>
                        <input type="number" required placeholder="Calorie Goal" ref={(c) => (c !== null) ? Update.vars.calorieGoal = c : null} defaultValue={Update.vars.calorieGoal === null ? "" : Update.vars.calorieGoal.value}/>
                        <select  ref={(c) => (c !== null) ? Update.vars.gender = c : null} defaultValue={Update.vars.gender === null ? "" : Update.vars.gender.value}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </form>
            <form className="profile-reset">
                <div>
                    
                </div>
            </form>
        </div>
    )

    return (
        <div>
            <Navbar />
            <ProfileForm/>
        </div>
    )
};

export default Profile;