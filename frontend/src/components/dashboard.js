import Navbar from "./navbar";
import dataFetcher from "./dataFetcher";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router} from "react-router-dom";
import { useParams } from 'react-router-dom';

const Dashboard = () =>
{
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    console.log(userId);
    
    const bp = require("./bp.js");
    //collect data for components
    //const { data: meals, isPending, error} = dataFetcher();
    //const { data: meals, isPending, error} = dataFetcher(bp.buildPath("api/mealtime"));
    const meals = null;

    return (
        <div className="App">
            {<Navbar></Navbar>}
            <div className="dashboard">
                WIP
                {/*error && <div> {error} </div>}
                {isPending && <div>Loading...</div>*/}
                {meals &&
                <DailyMealList meals={meals.filter((meal) => meal.userId === 'something')} title="Meals Test"/>}

            </div>
        </div>
    );
}

export default Dashboard;