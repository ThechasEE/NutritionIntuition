import Navbar from "./navbar";
import dataFetcher from "./dataFetcher";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router} from "react-router-dom";
import { useParams } from 'react-router-dom';
import CreateMeal from "./AddMeal";
import MealManagementComponent from "./addMealDay";

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
        const response = fetch(bp.buildPath("api/mealtimecheck"), {
            method:"POST",
            body:json,
            headers:{"Content-Type": "application/json"}
        });
        const responseObj = JSON.parse(response.text());

        meals = responseObj;
        }catch(e){
            console.log("error");
            meals = null;
        }
        //console.log(responseObj);
    }else{
        window.location.href = "/login";
        return false;
    }

    return (
        <div className="App">
            {<Navbar/>}
            <div className="dashboard">
                WIP
                {/*error && <div> {error} </div>}
                {isPending && <div>Loading...</div>*/}
                {meals &&
                <DailyMealList title="Meals Test" range={7}/>}
                {/*<DailyMealList meals={meals} title="Meals Test" range={7}/>}*/}
                <MealManagementComponent/>
                {/*<CreateMeal/>*/}

            </div>
        </div>
    );
}

export default Dashboard;