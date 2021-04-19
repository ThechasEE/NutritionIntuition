import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import './Shared.css';

import LoginRegisterPage from './pages/LoginRegisterPage';
import Dashboard from "./components/dashboard";
import AddMeal from "./components/AddMeal";
import Statistics from "./components/Statistics";
import Profile from "./components/Profile";

function App()
{
    return (
        <Router>
            <div className="App">
                {/*<Navbar></Navbar>*/}
                <Router >
                    <Switch>
                        <Route path="/" exact>
                            <LoginRegisterPage />
                        </Route>
                        <Route path="/dashboard" exact>
                            <Dashboard />
                        </Route>
                        <Route path="/addmeal/:todayMealExists" exact>
                            <AddMeal />
                        </Route>
                        <Route path="/statistics" exact>
                            <Statistics />
                        </Route>
                        <Route path="/profile" exact>
                            <Profile />
                        </Route>
                        <Redirect to="/" />
                    </Switch>  
                </Router>
            </div>
        </Router>
    );
}

export default App;
