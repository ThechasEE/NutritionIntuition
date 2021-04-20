import Navbar from "./navbar";
import DailyMealList from "./DailyMealList";
import {BrowserRouter as Router, Link} from "react-router-dom";
import { useParams } from 'react-router-dom';
import CreateMeal from "./AddMeal";
import MealManagementComponent from "./addMealDay";
import bp from "./bp";
import React, {useEffect, useState} from "react";
import CanvasJSReact from '../canvasjs.react.js';

class Dash extends React.Component
{
    static graphs = {
        propertiesDaily: null,
        propertiesWeekly: null
    }
}

const Dashboard = () =>
{
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete: true});
    const [error, setError] = useState(null);
    const [graphs, setGraphs] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [todayMealExists, setTodayMealExists] = useState(false);
    const firstName = ud.payload.firstName;
    const[meals, setMeals] = useState('');

    if (ud != null)
    {
        const userId = ud.payload.userId;
        const bp = require("./bp.js");

        //implement search by id
        const getMealHistory = () =>
        {
            //collect data for components
            var requestObj = {
                userId: userId,
                range: 1,
                jwtToken: tok
            };
            var requestObjTwo = {
                userId: userId,
                range: 7,
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
                if (!res.ok)
                {
                    throw Error('could not fetch the data from that resource');
                    //is thrown to our catch below
                }
                //resolution of the promise
                return res.json();
            }).then(data => {
                if (data.error === '')
                {
                    fetch(bp.buildPath("api/searchmealtime"), {
                        method: 'POST',
                        //we are sending json data
                        headers: {"Content-Type": "application/json"},
                        //actual data we are sending with this request
                        body: JSON.stringify(requestObjTwo)
                        }).then(res => {
                            if (!res.ok)
                            {
                                throw Error('could not fetch the data from that resource');
                            //is thrown to our catch below
                            }
                            //resolution of the promise
                            return res.json();
                        }).then(data => {
                            if(data.error === '')
                            {
                                var temp = data.results;
                                var carbs = 0;
                                var protein = 0;
                                var fat = 0;
                                var total = 0;
                                var meals = 0;
        
                                temp.forEach(element => {
                                    carbs += element.totalCarbCount;
                                    protein += element.totalProteinCount;
                                    fat += element.totalFatCount;
                                    total += element.totalFatCount + element.totalProteinCount + element.totalCarbCount;
                                    meals += 1;
                                });
        
                                Dash.graphs.propertiesWeekly = {
                                    exportEnabled: true,
                                    animationEnabled: true,
                                    title: {
                                        text: "Week"
                                    },
                                    data: [{
                                        type: "pie",
                                        startAngle: 75,
                                        toolTipContent: "<b>{label}</b>: {y}%",
                                        showInLegend: "true",
                                        legendText: "{label}",
                                        indexLabelFontSize: 16,
                                        indexLabel: "{label} - {y}%",
                                        dataPoints: [
                                            { y: parseFloat(((total <= 0) ? 0 : (carbs / total) * 100).toFixed(3)), label: "Carbohydrates" },
                                            { y: parseFloat(((total <= 0) ? 0 : (fat / total) * 100).toFixed(3)), label: "Fat" },
                                            { y: parseFloat(((total <= 0) ? 0 : (protein / total) * 100).toFixed(3)), label: "Protein" }
                                        ]
                                    }]
                                };

                                if (total != 0)
                                    setGraphs(true);
                                setError("");
                            }
                        })

                        var temp = data.results[0];
                        var carbs = (temp.length === 0) ? 0 : temp.totalCarbCount;
                        var protein = (temp.length === 0) ? 0 : temp.totalProteinCount;
                        var fat = (temp.length === 0) ? 0 : temp.totalFatCount;
                        var total = carbs + protein + fat;

                        console.log(temp);

                        Dash.graphs.propertiesDaily = {
                            exportEnabled: true,
                            animationEnabled: true,
                            title: {
                                text: "Day"
                            },
                            data: [{
                                type: "pie",
                                startAngle: 75,
                                toolTipContent: "<b>{label}</b>: {y}%",
                                showInLegend: "true",
                                legendText: "{label}",
                                indexLabelFontSize: 16,
                                indexLabel: "{label} - {y}%",
                                dataPoints: [
                                    { y: parseFloat(((total <= 0) ? 0 : (carbs / total) * 100).toFixed(3)), label: "Carbohydrates" },
                                    { y: parseFloat(((total <= 0) ? 0 : (fat / total) * 100).toFixed(3)), label: "Fat" },
                                    { y: parseFloat(((total <= 0) ? 0 : (protein / total) * 100).toFixed(3)), label: "Protein" }
                                ]
                            }]
                        };

                        console.log(data.results);
                        setMeals(data.results);
                    }
                    else
                    {
                        setMeals('');
                    }//store the meal data

                    setIsPending(false);
                    setError(null);
                }).catch((err) => {
                    //check for our abort check
                    setIsPending(false);
                    setError(err.message);
                    setMeals('');
                });
        }

        function LoadMealHistory()
        {
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

        const DisplayStatistics = () =>
        (
            <div>
                <div className="graph-padding">
                    <CanvasJSReact.CanvasJSChart options={Dash.graphs.propertiesDaily} />
                </div>
                <div className="graph-padding">
                    <CanvasJSReact.CanvasJSChart options={Dash.graphs.propertiesWeekly} />
                </div>
            </div>
        )


        return (
            <div className="App">
                {<Navbar/>}
                <div className="dashboard">
                        <div class="first-div">
                            {
                                (graphs) ? <DisplayStatistics/> : <div className="no-meal-text"></div>
                            }
                        </div>
                        <div class="second-div">
                        <h1>Hello, {firstName}</h1>
                        <h2>Here are today's stats.</h2>
                            {meals && meals.map((meal) => (
                                <div class="today-preview" key={meal.id}>
                                    {/*template string ` ` allows variables (JS) using $*/}
                                        <h2>{meal.date}</h2>
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