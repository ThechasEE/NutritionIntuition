import Navbar from "./navbar";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router, Link} from "react-router-dom";
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
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [todayMealExists, setTodayMealExists] = useState(false);
    const firstName = ud.payload.firstName;
    const[meals, setMeals] = useState('');

    if (ud != null) {
        const userId = ud.payload.userId;


        //console.log(userId);

        const bp = require("./bp.js");




        //implement search by id
        const getMealHistory = () => {

            //collect data for components
            var requestObj = {
                userId: userId,
                range: 1,
                jwtToken: tok
            };
            setIsPending(true);

            fetch(bp.buildPath("api/searchmealtime"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(requestObj)
            }).then(res => {
                if(!res.ok){
                    throw Error('could not fetch the data from that resource');
                    //is thrown to our catch below
                }
                //resolution of the promise
                return res.json();
            })
                .then(data => {
                    if(data.error === '') {
                        //setMeals(data.results)
                        console.log(data.results);
                        setMeals(data.results);
                    }
                    else{
                        setMeals('');
                    }//store the meal data

                    setIsPending(false);
                    setError(null);
                })
                .catch((err) => {
                    //check for our abort check
                    setIsPending(false);
                    setError(err.message);
                    setMeals('');

                })

        }
        function LoadMealHistory(){
            useEffect(() => {
                getMealHistory();
            }, [])
        }
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
        LoadMealHistory();
        //console.log("Today exists: " + todayMealExists);

        return (
            <div className="App">
                {<Navbar/>}
                <div className="dashboard">
                        <div class="first-div">

                            WIP - Graphs
                        </div>
                        <div class="second-div">
                        <h1>Hello, {firstName}</h1>
                        <h2>Here are today's stats.</h2>
                            {meals && meals.map((meal) => (
                                <div class="today-preview" key={meal.id}>
                                    {/*template string ` ` allows variables (JS) using $*/}
                                        <h2>{meal.date}</h2>
                                        <img src={"https://media.tenor.com/images/851291ba1b6c8094b74169b70691c72f/tenor.gif"} width={200} height={200}></img>
                                        <h2>Total calories: {meal.totalCalCount}</h2>
                                        <h3>Total Fat: {meal.totalFatCount}g</h3>
                                        <h3>Total Sodium: {meal.totalSodiumCount}mg</h3>
                                        <h3>Total Carbs: {meal.totalCarbCount}g</h3>
                                        <h3>Total Protein: {meal.totalProteinCount}g</h3>
                                        {console.log(meal)}
                                        {/* now we cycle through the meals this day*/}
                                        <br></br>
                                        <h2>Today's Meals:</h2>
                                        {meal.Meals.map((mealConsumed) => (
                                            //search db for this meal id.
                                            <div >
                                                {console.log(mealConsumed)}
                                                <h4>{mealConsumed.Name}</h4>
                                                <p>{mealConsumed.Calories} calories</p>
                                                <p>{mealConsumed.Protein}g Protein</p>
                                                <p>{mealConsumed.TotalFat}g Fat</p>
                                                <p>{mealConsumed.TotalCarbs}g Carbs</p>
                                            </div>
                                        ))}
                                </div>
                            ))}
                        {/*{todayMealExists &&*/}
                        {/*<DailyMealList title="Meals Test" range={1}/>}*/}
                        <MealManagementComponent/>
                        </div>
                        <div class="third-div">
                            <h1>This week's meal cards</h1>
                            <DailyMealList title="Meals Test" range={7}/>
                        </div>

                </div>
            </div>
        );
    }
}
export default Dashboard;