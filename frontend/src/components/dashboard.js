import Navbar from "./navbar";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router} from "react-router-dom";
import { useParams } from 'react-router-dom';
import CreateMeal from "./AddMeal";
import MealManagementComponent from "./addMealDay";
import bp from "./bp";
import {useEffect, useState} from "react";

const Dashboard = () => {
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete: true});
    let meals = null;
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [todayMealExists, setTodayMealExists] = useState(false);

    if (ud != null) {
        const userId = ud.payload.userId;


        //console.log(userId);

        const bp = require("./bp.js");




        const checkIfMealExistsToday = () => {
            //collect data for components
            var obj = {
                userId: userId,
                jwtToken: tok
            }

            setIsPending(true);

            fetch(bp.buildPath("api/mealtimecheck"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(obj)
            }).then(res => {
                if (!res.ok) {
                    throw Error('could not fetch the data from that resource');
                    //is thrown to our catch below
                }
                //resolution of the promise
                return res.json();
            })
                .then(data => {
                    if ( data.id === -1) {
                        setTodayMealExists(false)
                    } else {
                        //date already exists,
                        setTodayMealExists(true)
                        meals = data.id
                        console.log(data.id)
                        console.log(meals)
                        console.log("Today's date already exists.")
                        console.log(data.error);
                        //console.log("The meal Id we found is: " +  data.id)
                        //setMealId(null)
                    }//store the meal data

                    setIsPending(false);
                    setError(null);
                })
                .catch((err) => {
                    //check for our abort check
                    setIsPending(false);
                    setError(err.message);

                })
        }
        function LoadToday(){
            useEffect(() => {
                checkIfMealExistsToday();
            }, [todayMealExists])
        }
        LoadToday();
        //console.log("Today exists: " + todayMealExists);

        return (
            <div className="App">
                {<Navbar/>}
                <div className="dashboard">
                    WIP
                    {/*error && <div> {error} </div>}
                {isPending && <div>Loading...</div>*/}
                    <MealManagementComponent/>

                    {todayMealExists &&
                    <DailyMealList title="Meals Test" range={7}/>}
                    {/*<DailyMealList meals={meals} title="Meals Test" range={7}/>}*/}
                    {/*<CreateMeal/>*/}

                </div>
            </div>
        );
    }
}
export default Dashboard;