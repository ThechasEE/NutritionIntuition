import React, { useState } from 'react';
import './LoginRegister.css';

// Media
import logo from '../media/logo.png';

function LoginRegister()
{    
    const bp = require('./bp.js');
    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");

    var loginEmail;
    var loginPassword;

    var registerLogin;
    var registerPassword; 
    var registerFname;
    var registerLname;
    var registerEmail;

    const [loginMessage, setLoginMessage] = useState('');
    const [registerMessage, setRegisterMessage] = useState('');
    const [toggleForm, setToggleForm] = useState(true);

    const onClick = () => {
        if (toggleForm)
            setToggleForm(false)
        else
            setToggleForm(true)
    }

    const doLogin = async event =>
    {
        event.preventDefault();

        var obj = {email:loginEmail.value, password:loginPassword.value};
        var json = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath('api/login'), {method:'POST', body:json,headers:{'Content-Type': 'application/json'}});
            var res = JSON.parse(await response.text());
            
            if( res.id <= 0 )
            {                
                setLoginMessage('User/Password combination incorrect');
            }
            else
            {
                //var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
                //localStorage.setItem('user_data', JSON.stringify(user));
                //console.log(res);
                storage.storeToken(res);
                setLoginMessage('');
                window.location.href = '/cards';
            }
        }
        catch(e)
        {
            setLoginMessage(e.toString());
            return;
        }
    };

    const doRegister = async event =>     
    {
        event.preventDefault();
        var obj = {email:registerEmail.value,password:registerPassword.value,firstName:registerFname.value,lastName:registerLname.value};
        var js = JSON.stringify(obj);
        try
        {
            const response = await fetch(bp.buildPath('api/register'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            var res = JSON.parse(await response.text());
            if( res.id <= 0 )
            {
                setRegisterMessage('User Exists');
            }
        }
        catch(e)
        {
            setRegisterMessage(e.toString());
            return;
        }
    };

    const Login = () =>
    (
        <form id="login-form" onSubmit={doLogin}>
            <img id="login-image" src={logo}/>
            <input class="input" type="text" placeholder="Email" ref={(c) => loginEmail = c}/>
            <input class="input" type="password" placeholder="Password" ref={(c) => loginPassword = c}/>
            <button id="login-submit" type="submit" onClick={doLogin}>Log In</button>
            <div class="form-error-text">{loginMessage}</div>
            <div class="form-text">Don't have an account? Register below and look forward to a healthier furture!</div>
            <button class="change-form-button" type="submit" onClick={onClick}>Register</button>
        </form>
    )

    const Register = () =>
    (
        <form id="register-form" onSubmit={doRegister}>
            <div>
                <img id="register-image" src={logo}/>
            </div>
            <section id="register-fields">
                <div>
                    <input type="text" class="input button-wide" placeholder="Username"/>
                    <input type="text" class="input button-wide" placeholder="First Name" ref={(c) => registerFname = c}/>
                    <input type="text" class="input button-wide" placeholder="Last Name" ref={(c) => registerLname = c}/>
                    <input type="text" class="input button-wide" placeholder="Calorie Goal"/>
                    <input type="text" class="input button-wide" placeholder="Age"/>
                </div>
                <div>
                    <input type="text" class="input button-wide" placeholder="Weight"/>
                    <input type="text" class="input button-wide" placeholder="Gender"/>
                    <input type="text" class="input button-wide" placeholder="Email" ref={(c) => registerEmail = c}/>
                    <input type="password" class="input button-wide" placeholder="Password" ref={(c) => registerPassword = c}/>
                    <input type="password" class="input button-wide" placeholder="Confirm Password"/>
                </div>
            </section>
            <div class="form-error-text">{registerMessage}</div>
            <input type="submit" id="register-submit" value="Register" onClick={doRegister}/>
            <button class="change-form-button" type="submit" onClick={onClick}>Back to Login</button>
        </form>
    )

    return (
        <div>
            { toggleForm ? <Login /> : <Register /> }
        </div>
    )
};

export default LoginRegister;