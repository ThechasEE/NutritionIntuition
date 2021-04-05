import Navbar from "./navbar";
import dataFetcher from "./dataFetcher";
import MealList from "./MealList";

const Dashboard = () => {
    //collect data for components
    const { data: meals, isPending, error} = dataFetcher('http://localhost:8000/meals');



    return (
        <div className="dashboard">
            WIP
            { error && <div> { error } </div>}
            { isPending && <div>Loading...</div> }
            { meals && <MealList meals={meals.filter((meal) => meal.userId === 'something' )} title="Meals Test"/>}

        </div>
    );
}

export default Dashboard;