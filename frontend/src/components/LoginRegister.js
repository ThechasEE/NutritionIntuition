import React, { useState } from "react";
import "./LoginRegister.css";
import logo from "../media/logo.png";

class Variables extends React.Component
{
    static loginVars = {
        username: "",
        password: ""
    }

    static registerVars = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        gender: "",
        weight: "",
        age: "",
        height: "",
        calorieGoal: "",
        weightGoal: ""
    }

    static emailVars = {
        login: "",
        newPassword: "",
        newPasswordConfirm: ""
    }
}

function LoginRegister()
{
    const bp = require("./bp.js");
    const storage = require("../tokenStorage.js");
    //const bcrypt = require('bcrypt');

    // Event handlers.
    const [loginMessage, setLoginMessage] = useState("");
    const [registerSetupMessage, setRegisterSetupMessage] = useState("");
    const [registerPersonalMessage, setRegisterPersonalMessage] = useState("");
    const [registerGoalMessage, setRegisterGoalMessage] = useState("");
    const [registerResetMessage, setRegisterResetMessage] = useState("");
    const [registerVerifyMessage, setRegisterVerifyMessage] = useState("");
    const [form, setForm] = useState("Login");

    // Toggle between login and setup forms.
    const toggleFormLoginSetup = async event =>
    {
        event.stopPropagation();
        event.preventDefault();

        // Toggle.
        if (form === "Login")
            setForm("RegisterSetup");
        else
            setForm("Login");
        
        return false;
    }

    // Toggle between login and forgot password forms.
    const toggleFormPasswordSetup = async event =>
    {
        event.stopPropagation();
        event.preventDefault();

        // Toggle.
        if (form === "Login")
            setForm("ForgotPassword");
        else
            setForm("Login");
        
        return false;
    }

    // Back button from personal to setup form.
    const changeFormPersonal = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setForm("RegisterSetup");
        return false;
    }

    // Back button from goal to setup form.
    const changeFormGoal = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setForm("RegisterPersonal");
        return false;
    }

    // Back button from email confirmation to login form.
    const changeFormConfirmation = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setForm("Login");
        return false;
    }

    // Handle logging in.
    const doLogin = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setLoginMessage("");

        // Check for any empty entries.
        if (Variables.loginVars.username.value.trim() === "")
        {
            setLoginMessage("No Username provided");
            return false;
        }
        else if (Variables.loginVars.password.value.trim() === "")
        {
            setLoginMessage("No Password provided");
            return false;
        }

        // Login object to send.
        var obj = {
            login: Variables.loginVars.username.value,
            password: Variables.loginVars.password.value
        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/login"), {method:"POST", body:json,headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());
            
            if (responseObj.error !== "")
            {
                setLoginMessage(responseObj.error)
                return false;
            }

            if (responseObj.id <= 0)
            {                
                setLoginMessage("User/Password combination incorrect");
            }
            else
            {
                storage.storeToken(responseObj.id);
                window.location.href = "/dashboard";
            }
        }
        catch(e)
        {
            setLoginMessage(e.toString());
        }

        return false;
    };

    // Handle when a user has forgotten their password.
    const forgotPassword = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setRegisterResetMessage('');

        // Check for any empty entries.
        if (Variables.emailVars.login.value.trim() === "")
        {
            setRegisterResetMessage("Please enter your Username");
            return false;
        }
        else if (Variables.emailVars.newPassword.value.trim() === "")
        {
            setRegisterResetMessage("Please enter your New Password");
            return false;
        }
        else if (Variables.emailVars.newPasswordConfirm.value.trim() === "")
        {
            setRegisterResetMessage("Please confirm your New Password");
            return false;
        }
        else if (Variables.emailVars.newPassword.value !== Variables.emailVars.newPasswordConfirm.value)
        {
            setRegisterResetMessage("Passwords do not match");
            return false;
        }

        // Registration object to send.
        var obj = {
            login: Variables.emailVars.login.value,
            newPassword: Variables.emailVars.newPassword.value,
        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/resetpassword"), {method:"POST", body:json, headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());

            if (responseObj.error !== "")
            {
                setRegisterResetMessage(responseObj.error);
            }
            else
            {
                setRegisterResetMessage("An email will be sent to the associated username if it exists");
            }
        }
        catch(e)
        {
            setRegisterResetMessage(e.toString());
        }

        return false;
    }

    const resendEmail = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setRegisterVerifyMessage('');

        // Email resending.
        var obj = {
            email: Variables.registerVars.email.value
        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/resendverifyemail"), {method:"POST", body:json, headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());

            if (responseObj.error !== "")
            {
                setRegisterVerifyMessage(responseObj.error);
                return false;
            }

            setRegisterVerifyMessage("Email verification resent");
        }
        catch(e)
        {
            setRegisterVerifyMessage(e.toString());
            return false;
        }
        
        return false;
    }

    // Handle setup information phase of registration.
    const doRegisterSetup = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setRegisterSetupMessage('');

        // Check for any empty entries.
        if (Variables.registerVars.username.value.trim() === "")
        {
            setRegisterSetupMessage("Please enter a Username");
            return false;
        }
        else if (Variables.registerVars.email.value.trim() === "")
        {
            setRegisterSetupMessage("Please enter your Email");
            return false;
        }
        else if (Variables.registerVars.password.value.trim() === "")
        {
            setRegisterSetupMessage("Please enter your Password");
            return false;
        }
        else if (Variables.registerVars.confirmPassword.value.trim() === "")
        {
            setRegisterSetupMessage("Please confirm your Password");
            return false;
        }
        else if (Variables.registerVars.confirmPassword.value !== Variables.registerVars.password.value)
        {
            setRegisterSetupMessage("Passwords do not match");
            return false;
        }

        // Email/username checking.
        var obj = {
            login: Variables.registerVars.username.value,
            email: Variables.registerVars.email.value,
        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/checkusernameemail"), {method:"POST", body:json, headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());

            if (responseObj.id <= 0)
            {
                setRegisterSetupMessage(responseObj.error);
                return false;
            }
        }
        catch(e)
        {
            setRegisterSetupMessage(e.toString());
            return false;
        }
        
        // No errors reported.
        setForm("RegisterPersonal");
        return false;
    }

    // Handle personal information phase of registration.
    const doRegisterPersonal = async event =>
    {
        event.stopPropagation();
        event.preventDefault();
        setRegisterPersonalMessage('');

        // Check for any empty entries.
        if (Variables.registerVars.firstName.value.trim() === "")
        {
            setRegisterPersonalMessage("Please enter your First Name");
            return false;
        }
        else if (Variables.registerVars.lastName.value.trim() === "")
        {
            setRegisterPersonalMessage("Please enter your Last Name");
            return false;
        }
        else if (Variables.registerVars.gender.value === "Choose Gender..")
        {
            setRegisterPersonalMessage("Please select your Gender");
            return false;
        }
        else if (Variables.registerVars.weight.value.trim() === "")
        {
            setRegisterPersonalMessage("Please enter your Weight");
            return false;
        }
        else if (Variables.registerVars.age.value.trim() === "")
        {
            setRegisterPersonalMessage("Please enter your Age");
            return false;
        }
        else if (Variables.registerVars.height.value.trim() === "")
        {
            setRegisterPersonalMessage("Please enter your Height");
            return false;
        }

        // No errors reported.
        setForm("RegisterGoal");
        return false;
    }

    // Handle goal information phase of registration.
    // Also does the final registration.
    const doRegisterGoal = async event =>     
    {
        event.stopPropagation();
        event.preventDefault();
        setRegisterGoalMessage('');

        // Check for any empty entries.
        if (Variables.registerVars.calorieGoal.value.trim() === "")
        {
            setRegisterGoalMessage("Please enter a Calorie Goal");
            return false;
        }
        else if (Variables.registerVars.weightGoal.value.trim() === "")
        {
            setRegisterGoalMessage("Please enter a Weight Goal");
            return false;
        }

        // Registration object to send.
        var obj = {
            login: Variables.registerVars.username.value,
            email: Variables.registerVars.email.value,
            password: Variables.registerVars.password.value,
            firstName: Variables.registerVars.firstName.value,
            lastName: Variables.registerVars.lastName.value,
            age: Number(Variables.registerVars.age.value),
            weight: Number(Variables.registerVars.weight.value),
            goalWeight: Number(Variables.registerVars.weightGoal.value),
            calorieGoal: Number(Variables.registerVars.calorieGoal.value),
            height: Number(Variables.registerVars.height.value),
            gender: Variables.registerVars.gender.value.toLowerCase()
        };
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath("api/register"), {method:"POST", body:json, headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());

            if (responseObj.id <= 0)
            {
                setRegisterGoalMessage(responseObj.error);
                return false;
            }

            setForm("EmailConfirmation");
        }
        catch(e)
        {
            setRegisterGoalMessage(e.toString());
        }

        return false;
    };

    // Render login card.
    const Login = () =>
    (
        <form className="login-register-form">
            <img className="image" src={logo} alt="Not found"/>
            <input className="input" type="text" placeholder="Username" ref={(c) => (c !== null) ? Variables.loginVars.username = c : null} defaultValue={Variables.loginVars.username === null ? "" : Variables.loginVars.username.value}/>
            <input className="input" type="password" placeholder="Password" ref={(c) => (c !== null) ? Variables.loginVars.password = c : null} defaultValue={Variables.loginVars.password === null ? "" : Variables.loginVars.password.value}/>
            <button className="login-register-submit" type="submit" onClick={doLogin}>Log In</button>
            <div><a className="link" href="/#" onClick={toggleFormPasswordSetup}>Forgot Password?</a></div>
            <div className="form-error-text spacing">{loginMessage}</div>
            <div className="form-text">Don't have an account? Register below and look forward to a healthier future!</div>
            <button className="login-register-button-big" type="submit" onClick={toggleFormLoginSetup}>Register</button>
        </form>
    )

    // Render register card (part one).
    const RegisterSetup = () =>
    (
        <form className="login-register-form">
            <img className="image" src={logo} alt="Not found"/>
            <div className="register-header">Register: Step 1</div>
            <input className="input" type="text" placeholder="Username" ref={(c) => (c !== null) ? Variables.registerVars.username = c : null} defaultValue={Variables.registerVars.username === null ? "" : Variables.registerVars.username.value}/>
            <input className="input" type="text" placeholder="Email" ref={(c) => (c !== null) ? Variables.registerVars.email = c : null} defaultValue={Variables.registerVars.email === null ? "" : Variables.registerVars.email.value}/>
            <input className="input" type="password" placeholder="Password" ref={(c) => (c !== null) ? Variables.registerVars.password = c : null} defaultValue={Variables.registerVars.password === null ? "" : Variables.registerVars.password.value}/>
            <input className="input" type="password" placeholder="Confirm Password" ref={(c) => (c !== null) ? Variables.registerVars.confirmPassword = c : null} defaultValue={Variables.registerVars.confirmPassword === null ? "" : Variables.registerVars.confirmPassword.value}/>
            <button className="login-register-submit" type="submit" onClick={doRegisterSetup}>Next Step</button>
            <div className="form-error-text">{registerSetupMessage}</div>
            <button className="login-register-submit register-back" type="submit" onClick={toggleFormLoginSetup}>Go Back</button>
        </form>
    )

    // Render register card (part two).
    const RegisterPersonal = () =>
    (
        <form className="login-register-form">
            <img className="image" src={logo} alt="Not found"/>
            <div className="register-header">Register: Step 2</div>
            <input className="input" type="text" placeholder="First Name" ref={(c) => (c !== null) ? Variables.registerVars.firstName = c : null} defaultValue={Variables.registerVars.firstName === null ? "" : Variables.registerVars.firstName.value}/>
            <input className="input" type="text" placeholder="Last Name" ref={(c) => (c !== null) ? Variables.registerVars.lastName = c : null} defaultValue={Variables.registerVars.lastName === null ? "" : Variables.registerVars.lastName.value}/>
            <select id="register-dropdown" ref={(c) => (c !== null) ? Variables.registerVars.gender = c : null} defaultValue={Variables.registerVars.gender === null ? "" : Variables.registerVars.gender.value}>
                <option selected disabled>Choose Gender..</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
            <input className="input" type="number" placeholder="Weight (lbs)" ref={(c) => (c !== null) ? Variables.registerVars.weight = c : null} defaultValue={Variables.registerVars.weight === null ? "" : Variables.registerVars.weight.value}/>
            <input className="input" type="number" placeholder="Age" ref={(c) => (c !== null) ? Variables.registerVars.age = c : null} defaultValue={Variables.registerVars.age === null ? "" : Variables.registerVars.age.value}/>
            <input className="input" type="number" placeholder="Height (in)" ref={(c) => (c !== null) ? Variables.registerVars.height = c : null} defaultValue={Variables.registerVars.height === null ? "" : Variables.registerVars.height.value}/>
            <button className="login-register-submit" type="submit" onClick={doRegisterPersonal}>Next Step</button>
            <div className="form-error-text">{registerPersonalMessage}</div>
            <button className="login-register-submit register-back" type="submit" onClick={changeFormPersonal}>Go Back</button>
        </form>
    )

    // Render register card (part three).
    const RegisterGoal = () =>
    (
        <form className="login-register-form">
            <img className="image" src={logo} alt="Not found"/>
            <div className="register-header">Register: Step 3</div>
            <input className="input" type="number" placeholder="Calorie Goal" ref={(c) => (c !== null) ? Variables.registerVars.calorieGoal = c : null} defaultValue={Variables.registerVars.calorieGoal === null ? "" : Variables.registerVars.calorieGoal.value}/>
            <input className="input" type="number" placeholder="Weight Goal" ref={(c) => (c !== null) ? Variables.registerVars.weightGoal = c : null} defaultValue={Variables.registerVars.weightGoal === null ? "" : Variables.registerVars.weightGoal.value}/>
            <button className="login-register-button-big" type="submit" onClick={doRegisterGoal}>Finalize Registration</button>
            <div className="form-error-text">{registerGoalMessage}</div>
            <button className="login-register-submit register-back" type="submit" onClick={changeFormGoal}>Go Back</button>
        </form>
    )

    // Email confirmation card.
    const EmailConfirmation = () =>
    (
        <form className="login-register-form">
            <img className="image" src={logo} alt="Not found"/>
            <div className="register-text">Email Confirmation Sent</div>
            <div className="register-subtext">Please check your associated inbox to confirm your email address.</div>
            <button className="login-register-submit" type="submit" onClick={resendEmail}>Resend Email</button>
            <div className="form-error-text">{registerVerifyMessage}</div>
            <button className="login-register-submit register-back" type="submit" onClick={changeFormConfirmation}>Back to login</button>
        </form>
    )

    const ForgotPassword = () =>
    (
        <form className="login-register-form">
            <img className="image" src={logo} alt="Not found"/>
            <div className="register-header">Password Reset</div>
            <input className="input" type="text" placeholder="Account Username" ref={(c) => (c !== null) ? Variables.emailVars.login = c : null} defaultValue={Variables.emailVars.login === null ? "" : Variables.emailVars.login.value}/>
            <input className="input" type="password" placeholder="New Password" ref={(c) => (c !== null) ? Variables.emailVars.newPassword = c : null} defaultValue={Variables.emailVars.newPassword === null ? "" : Variables.emailVars.newPassword.value}/>
            <input className="input" type="password" placeholder="Confirm New Password" ref={(c) => (c !== null) ? Variables.emailVars.newPasswordConfirm = c : null} defaultValue={Variables.emailVars.newPasswordConfirm === null ? "" : Variables.emailVars.newPasswordConfirm.value}/>
            <div className="form-error-text">{registerResetMessage}</div>
            <button className="login-register-submit" type="submit" onClick={forgotPassword}>Send Reset Password Email</button>
            <button className="login-register-submit register-back" type="submit" onClick={toggleFormPasswordSetup}>Back to login</button>
        </form>
    )

    return (
        <div>
            { (form === "Login") ? <Login /> :
                (form === "RegisterSetup") ? <RegisterSetup /> :
                    (form === "RegisterPersonal") ? <RegisterPersonal /> :
                        (form === "RegisterGoal") ? <RegisterGoal /> :
                            (form === "EmailConfirmation") ? <EmailConfirmation /> :
                                <ForgotPassword />
            }
        </div>
    )
};

export default LoginRegister;