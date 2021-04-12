import Navbar from "./navbar";
import dataFetcher from "./dataFetcher";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router} from "react-router-dom";
import { useParams } from 'react-router-dom';

const Dashboard = () =>
    {
        const {data} = useParams();
        print(data);
        // const storage = require("../tokenStorage.js");
        // const token = storage.retrieveToken();
        // console.log(token);
        // console.log(token._id);
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