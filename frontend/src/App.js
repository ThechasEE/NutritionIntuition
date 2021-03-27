import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import './Shared.css';

import LoginRegisterPage from './pages/LoginRegisterPage';
import CardPage from './pages/CardPage';

function App()
{
    return (
        <Router >
            <Switch>
                <Route path="/" exact>
                    <LoginRegisterPage />
                </Route>
                <Route path="/cards" exact>
                    <CardPage />
                </Route>
                <Redirect to="/" />
            </Switch>  
        </Router>
    );
}

export default App;
