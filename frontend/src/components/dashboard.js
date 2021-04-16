import Navbar from "./navbar";
import dataFetcher from "./dataFetcher";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router} from "react-router-dom";
import { useParams } from 'react-router-dom';
import CreateMeal from "./AddMeal";
import CreateDay from "./addMealDay";

const Dashboard = () =>
{
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    let meals = null;

    if(ud != null) {
        const userId = ud.payload.userId;

        //console.log(userId);

        const bp = require("./bp.js");
        //collect data for components
        //const { data: meals, isPending, error} = dataFetcher();
        //const { data: meals, isPending, error} = dataFetcher(bp.buildPath("api/mealtime"));
        var obj = {
            userId: userId,
            jwtToken: tok
        };
        var json = JSON.stringify(obj);

        try{
            //this should get the user's date object
        const response = fetch(bp.buildPath("api/searchmealuser"), {method:"POST", body:json,headers:{"Content-Type": "application/json"}});
        var responseObj = JSON.parse(response.text);

        meals = responseObj;
        }catch(e){
            console.log("error");
            meals = null;
        }
        //console.log(responseObj);
    }else{
        //redirect to login
    }

    return (
        <div className="App">
            {<Navbar/>}
            <div className="dashboard">
                WIP
                {/*error && <div> {error} </div>}
                {isPending && <div>Loading...</div>*/}
                {meals &&
                <DailyMealList meals={meals.filter((meal) => meal.userId === 'something')} title="Meals Test"/>}
                <CreateDay/>
                {/*<CreateMeal/>*/}

            </div>
        </div>
    );
}

export default Dashboard;