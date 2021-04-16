import React from 'react';
function LoggedInName()
{   
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
    return(      
        <div id="loggedInDiv">
            <div>Logged In as {firstName} {lastName}
            </div>
        </div>

    );
}

export default LoggedInName;