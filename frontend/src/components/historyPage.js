import Navbar from "./navbar";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router, Link} from "react-router-dom";
import { useParams } from 'react-router-dom';
import CreateMeal from "./AddMeal";
import MealManagementComponent from "./addMealDay";
import bp from "./bp";
import React, {useEffect, useState} from "react";

class Variables2 extends React.Component
{
    static mealStuff = {
        mealtimeId: ""
    }
}

const HistoryPage = () => {
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete: true});
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [todayMealExists, setTodayMealExists] = useState(false);
    const firstName = ud.payload.firstName;
    const [localRange, setLocalRange] = useState('');
    const[meals, setMeals] = useState('');





    if (ud != null) {
        const userId = ud.payload.userId;

        //implement search by id
        const getMealHistory = () => {

            return(
            <div className="meal-list">
            </div>
            )


    }

        //console.log(userId);

        const bp = require("./bp.js");

        return (
            <div className="App">
                {<Navbar/>}
                <div className="dashboard">
                    <h1>Hello, {firstName}</h1>
                    <h2>Here are your meal cards for the last 30 days.</h2>
                    {/*<form>*/}
                    {/*    <label>Please let us know how many days you want to view:</label>*/}
                    {/*    <br/>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        required*/}
                    {/*        value={localRange}*/}
                    {/*        //allows us to get the html data and save it in our title*/}
                    {/*        onChange={(e) => setLocalRange(e.target.value)}*/}
                    {/*    />*/}

                    {/*    {<button>Submit</button>}*/}

                    {/*</form>*/}
                    {<DailyMealList title="Meals Test" range={30}/>}


                </div>
            </div>
        );
    }
}
export default HistoryPage;