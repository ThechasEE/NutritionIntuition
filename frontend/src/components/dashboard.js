import Navbar from "./navbar";
import dataFetcher from "./dataFetcher";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router} from "react-router-dom";

const Dashboard = () => {
    //collect data for components
    const { data: meals, isPending, error} = dataFetcher('http://localhost:8000/dates');



    return (
        <div className="App">
            {<Navbar></Navbar>}
        <div className="dashboard">
            WIP
            { error && <div> { error } </div>}
            { isPending && <div>Loading...</div> }
            { meals && <DailyMealList meals={meals.filter((meal) => meal.userId === 'something' )} title="Meals Test"/>}

        </div>
        </div>
    );
}

export default Dashboard;