import React from 'react';
function LoggedInName()
{   
    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");
    //var _ud = localStorage.getItem('user_data');    
    //var ud = JSON.parse(_ud);
    
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    //const userId = ud.payload.userId;
    const firstName = 'john';//ud.payload.firstName;
    const lastName = 'cena';//ud.payload.lastName;
  
    const doLogout = event =>     
    {    
        event.preventDefault();        
        alert('doLogout');    
    };        
    return(      
        <div id="loggedInDiv">        
            <span id="userName">Logged In As {firstName} {lastName}</span><br />        
            <button type="button" id="logoutButton" class="buttons"            
                onClick={doLogout}> Log Out </button>      
        </div>    
    );
}

export default LoggedInName;