exports.storeToken = function ( tok )
{
    try
    {
      localStorage.setItem('user_data', tok);
      console.log(tok);
    }
    catch(e)
    {
      console.log(e.message);
    }
}

exports.retrieveToken = function ()
{

    var ud;
    try
    {
      ud = localStorage.getItem('user_data');
      console.log(ud);
    }
    catch(e)
    {
      console.log(e.message);
    }
    return ud;
}