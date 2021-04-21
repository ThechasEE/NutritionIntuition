import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import "./Profile.css";
import DailyMealList from "./DailyMealList";

class Update extends React.Component
{
    static vars = {
        login: "",
        firstName: "",
        lastName: "",
        age: "",
        weight: "",
        goalWeight: "",
        calorieGoal: "",
        height: "",
        gender: ""
    }

    static form = {
        firstName: null,
        lastName: null,
        age: null,
        weight: null,
        goalWeight: null,
        calorieGoal: null,
        height: null,
        gender: null
    }

    static password = {
        password: "",
        passwordConfirm: ""
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

    // Event handlers.
    const [updateMessage, setUpdateMessage] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [whenLoaded, setWhenLoaded] = useState(false);
    
    // Check for token to make sure user is logged in.
    if (ud == null)
    {
        window.location.href = "/login";
        return false;
    }

    const GetProfile = async event =>
    {
        setUpdateMessage("");

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
                setUpdateMessage(responseObj.error);
                return false;
            }

            Update.vars.login = responseObj.login;
            Update.vars.firstName = responseObj.firstName;
            Update.vars.lastName = responseObj.lastName;
            Update.vars.age = responseObj.age;
            Update.vars.weight = responseObj.weight;
            Update.vars.goalWeight = responseObj.goalWeight;
            Update.vars.calorieGoal = responseObj.calorieGoal;
            Update.vars.height = responseObj.height;
            Update.vars.gender = responseObj.gender;
            setWhenLoaded(true);
        }
        catch(e)
        {
            setUpdateMessage(e.toString());
        }

        return false;
    }

    const UpdateProfile = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setProfileMessage("");

        // Login object to send.
        var obj = {
            userId: ud.payload.userId,
            firstName: Update.form.firstName.value,
            lastName: Update.form.lastName.value,
            age: parseFloat(Update.form.age.value),
            weight: parseFloat(Update.form.weight.value),
            goalWeight: parseFloat(Update.form.goalWeight.value),
            calorieGoal: parseFloat(Update.form.calorieGoal.value),
            height: parseFloat(Update.form.height.value),
            gender: Update.form.gender.value,
            jwtToken: tok
        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/updateprofile"), {method:"POST", body:json,headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());
            
            if (responseObj.error !== "")
            {
                setProfileMessage(responseObj.error);
                return false;
            }

            Update.vars.firstName = Update.form.firstName.value;
            Update.vars.lastName = Update.form.lastName.value;
            Update.vars.age = Update.form.age.value;
            Update.vars.weight = Update.form.weight.value;
            Update.vars.goalWeight = Update.form.goalWeight.value;
            Update.vars.calorieGoal =Update.form.calorieGoal.value;
            Update.vars.height = Update.form.height.value;
            Update.vars.gender = Update.form.gender.value;
            setProfileMessage("Profile successfully updated!");
        }
        catch(e)
        {
            setProfileMessage(e.toString());
        }

        return false;
    };

    const ResetPassword = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setPasswordMessage("");

        if (Update.password.password.value !== Update.password.passwordConfirm.value)
        {
            setPasswordMessage("Passwords do not match");
            return false;
        }

        var obj = {
            login: Update.vars.login,
            newPassword: md5(Update.password.password.value),
        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/resetpassword"), {method:"POST", body:json, headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());

            if (responseObj.error !== "")
            {
                setPasswordMessage(responseObj.error);
            }
            else
            {
                setPasswordMessage("An email containing the password resent link was sent");
            }
        }
        catch(e)
        {
            setPasswordMessage(e.toString());
        }

        return false;
    }

    function Load()
    {
        useEffect(() => {
            GetProfile();
        }, [])
    }

    Load();

    const ProfileForm = () =>
    (
        <div className="profile-contraint">
            <div className="profile-title">{Update.vars.firstName}'s Profile</div>
            <div className="profile-title-error">{updateMessage}</div>
            <div className="profile-container">
                <div>
                <form onSubmit={UpdateProfile}>
                    <div className="profile-update">
                        <div className="profile-flex">
                            <div className="profile-text">First Name</div>
                            <input className="input profile-input-constraint" type="text" required placeholder="First Name" ref={(c) => (c !== null) ? Update.form.firstName = c : null} defaultValue={Update.vars.firstName}/>
                            <div className="profile-text">Last Name</div>
                            <input className="input profile-input-constraint" type="text" required placeholder="Last Name" ref={(c) => (c !== null) ? Update.form.lastName = c : null} defaultValue={Update.vars.lastName}/>
                            <div className="profile-text">Age</div>
                            <input className="input profile-input-constraint" type="number" step="1" required placeholder="Age" ref={(c) => (c !== null) ? Update.form.age = c : null} defaultValue={Update.vars.age}/>
                            <div className="profile-text">Weight (lbs)</div>
                            <input className="input profile-input-constraint" type="number" step="1" required placeholder="Weight (lbs)" ref={(c) => (c !== null) ? Update.form.weight = c : null} defaultValue={Update.vars.weight}/>
                        </div>
                        <div className="profile-flex">
                            <div className="profile-text">Height (in)</div>
                            <input className="input profile-input-constraint" type="number" step="1" required placeholder="Height (in)" ref={(c) => (c !== null) ? Update.form.height = c : null} defaultValue={Update.vars.height}/>
                            <div className="profile-text">Weight Goal (lbs)</div>
                            <input className="input profile-input-constraint" type="number" step="1" required placeholder="Weight Goal (lbs)" ref={(c) => (c !== null) ? Update.form.goalWeight = c : null} defaultValue={Update.vars.goalWeight}/>
                            <div className="profile-text">Calorie Goal</div>
                            <input className="input profile-input-constraint" type="number" step="1" required placeholder="Calorie Goal" ref={(c) => (c !== null) ? Update.form.calorieGoal = c : null} defaultValue={Update.vars.calorieGoal}/>
                            <div className="profile-text">Gender</div>
                            <select className="profile-dropdown profile-select-constraint"  ref={(c) => (c !== null) ? Update.form.gender = c : null} defaultValue={Update.vars.gender}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="profile-text-error">{profileMessage}</div>
                    <button className="login-register-submit profile-button-spacing" type="submit">Update Profile</button>
                </form>
                <form className="profile-reset" onSubmit={ResetPassword}>
                    <div>
                        <div className="profile-password-header profile-text-spacing">Password Reset:</div>
                        <input required className="input profile-input-constraint profile-spacing" type="password" placeholder="New Password" ref={(c) => (c !== null) ? Update.password.password = c : null} defaultValue={Update.password.password === null ? "" : Update.password.password.value}/>
                        <input required className="input profile-input-constraint profile-spacing" type="password" placeholder="Confirm New Password" ref={(c) => (c !== null) ? Update.password.passwordConfirm = c : null} defaultValue={Update.password.passwordConfirm === null ? "" : Update.password.passwordConfirm.value}/>
                        <div className="profile-text-error">{passwordMessage}</div>
                        <button className="login-register-submit profile-button-spacing" type="submit">Reset Password</button>
                    </div>
                </form>
                </div>
                <div>
                    <div className="profile-history-header">Meal History</div>
                    <div className="profile-scroll">
                        {<DailyMealList title="Meals Test" range={30}/>}
                    </div>
                </div>
            </div>
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