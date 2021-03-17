import React, { useState } from 'react';
function Register()
{    
    const bp = require('./bp.js');

    var registerLogin;    
    var registerPassword; 
    var registerFname;
    var registerLname;
    var registerEmail;  
    const [message,setMessage] = useState('');

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
                setMessage('User Exists');            
            }        
        }        
        catch(e)        
        {            
            alert(e.toString());            
            return;        
        }        
    };   
    return(      
        <div id="registerDiv">        
            <form onSubmit={doRegister}>        
            <span id="inner-title">PLEASE REGISTER</span><br />
            <input type="text" id="registerEmail" placeholder="Email"   ref={(c) => registerEmail = c} />
            <input type="password" id="registerPassword" placeholder="Password"   ref={(c) => registerPassword = c} />
            <input type="text" id="registerFname" placeholder="Firstname"   ref={(c) => registerFname = c} />
            <input type="text" id="registerLname" placeholder="Lastname"   ref={(c) => registerLname = c} />
            <input type="submit" id="registerButton" class="buttons" value = "Do It"          
                onClick={doRegister} /> 
            </form>        
            <span id="registerResult">{message}</span>
        </div>    
    );
};

export default Register;