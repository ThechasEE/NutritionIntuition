import Navbar from "./navbar";
import React, { useState, useEffect } from "react";
import "./Statistics.css";
import CanvasJSReact from '../canvasjs.react.js';

class Graph extends React.Component
{
    static mealVars = {
        pieProperties: null,
        barProperties: null,
        name: "",
        numMeals: 0,
        total: 0,
        calorieGoal: 0,
        calories: 0,
        fat: 0,
        sodium: 0,
        carbs: 0,
        protein: 0
    }
}

function Statistics()
{
    const bp = require("./bp.js");
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});

    const [statisticsError, setStatisticsError] = useState("");
    const [meals, setMeals] = useState("");

    // Check for token to make sure user is logged in.
    if (ud == null)
    {
        window.location.href = "/login";
        return false;
    }

    const LoadStatistics = async event =>
    {
        // Pie chart statistics variables.
        var meals;
        var mealObj = {
            userId: ud.payload.userId,
            jwtToken: tok
        };
        var mealJSON = JSON.stringify(mealObj);

        // Bar chart statistics variables.
        // Get the range of all meals throughout the week.
        var range;
        var rangeObj = {
            userId: ud.payload.userId,
            range: 7,
            jwtToken: tok
        }
        var rangeJSON = JSON.stringify(rangeObj);
        // Retrieve user profile for calorieGoal.
        var userObj = {
            userId: ud.payload.userId,
            jwtToken: tok
        }
        var userJSON = JSON.stringify(userObj);
        // Bar chart label arrays.
        var dates = ["", "", "", "", "", "", ""];
        var caloriesPerDay = [0, 0, 0, 0, 0, 0, 0];

        // Reset variables.
        Graph.mealVars.name = ud.payload.firstName;
        Graph.mealVars.numMeals = 0;
        Graph.mealVars.total = 0;
        Graph.mealVars.calories = 0;
        Graph.mealVars.calorieGoal = 0;
        Graph.mealVars.fat = 0;
        Graph.mealVars.sodium = 0;
        Graph.mealVars.carbs = 0;
        Graph.mealVars.protein = 0;

        try
        {
            // Do all the API calls.
            const responseSMU = await fetch(bp.buildPath("api/searchmealuser"), {method:"POST", body:mealJSON, headers:{"Content-Type": "application/json"}});
            const responseSMT = await fetch(bp.buildPath("api/searchmealtime"), {method:"POST", body:rangeJSON, headers:{"Content-Type": "application/json"}});
            const responseUser = await fetch(bp.buildPath("api/viewprofile"), {method:"POST", body:userJSON, headers:{"Content-Type": "application/json"}});
            var responseSMUObj = JSON.parse(await responseSMU.text());
            var responseSMTObj = JSON.parse(await responseSMT.text());
            var responseUserObj = JSON.parse(await responseUser.text());

            // Error.
            if (responseSMUObj.error !== "" || responseSMTObj.error !== "" || responseUserObj.error !== "")
            {
                if (responseSMUObj.error !== "")
                {
                    setStatisticsError(responseSMUObj.error);
                    return false;
                }

                if (responseSMTObj.error !== "")
                {
                    setStatisticsError(responseSMTObj.error);
                    return false;
                }

                if (responseUserObj.error !== "")
                {
                    setStatisticsError(responseUserObj.error);
                    return false;
                }
            }

            // Store responses.
            meals = responseSMUObj.results;
            range = responseSMTObj.results;
            Graph.mealVars.calorieGoal = parseFloat(responseUserObj.calorieGoal);
        }
        catch(e)
        {
            setStatisticsError(e.toString());
            return false;
        }

        // Total all the statistics.

        // Retrieve all the macronutrients for the pie chart.
        if (meals != null)
        {
            meals.forEach(element => {
                Graph.mealVars.calories += parseFloat(element.Calories);
                Graph.mealVars.fat += parseFloat(element.TotalFat);
                Graph.mealVars.sodium += parseFloat(element.Sodium);
                Graph.mealVars.carbs += parseFloat(element.TotalCarbs);
                Graph.mealVars.protein += parseFloat(element.Protein);
                Graph.mealVars.total += (parseFloat(element.TotalFat) + parseFloat(element.TotalCarbs) + parseFloat(element.Protein) + (parseFloat(element.Sodium) / 1000)); // Sodium divided by 1000 to get grams.
                Graph.mealVars.numMeals += 1;
            });

            if (Graph.mealVars.numMeals === 0)
                setStatisticsError("No meals to display!");
        }

        // Retrieve the calories for each day throughout the week.
        var today = new Date();
        if (range != null)
        {
            range.forEach(element => {
                var day = parseInt(element.Date.substring(8,10));
                var month = parseInt(element.Date.substring(5,7));
                var year = parseInt(element.Date.substring(0,4));
                var mealDate = new Date(year, month-1, day);
                var differenceInTime = today.getTime() - mealDate.getTime();
                var differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
                caloriesPerDay[differenceInDays] = element.totalCalCount;
            });
        }

        // Retreieve the labels for each day throughout the week.
        var i;
        for (i = 0; i < 7; i++)
        {
            var yesterday = new Date(today.getTime());
            yesterday.setDate(today.getDate() - i);
            var dayBefore = yesterday.getDate();
            var monthBefore = yesterday.getMonth() + 1;
            dates[i] = monthBefore + "/" + dayBefore
        }

        // Compile pie chart properties.
        Graph.mealVars.pieProperties = {
            exportEnabled: true,
            animationEnabled: true,
            title: {
                text: "Current Nutrition Breakdown"
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
                    { y: parseFloat(((Graph.mealVars.total <= 0) ? 0 : (Graph.mealVars.carbs / Graph.mealVars.total) * 100).toFixed(3)), label: "Carbohydrates" },
                    { y: parseFloat(((Graph.mealVars.total <= 0) ? 0 : (Graph.mealVars.fat / Graph.mealVars.total) * 100).toFixed(3)), label: "Fat" },
                    { y: parseFloat(((Graph.mealVars.total <= 0) ? 0 : ((Graph.mealVars.sodium / 1000) / Graph.mealVars.total) * 100).toFixed(3)), label: "Sodium" },
                    { y: parseFloat(((Graph.mealVars.total <= 0) ? 0 : (Graph.mealVars.protein / Graph.mealVars.total) * 100).toFixed(3)), label: "Protein" }
                ]
            }]
        };

        // Compile bar chart properties.
        Graph.mealVars.barProperties = {
            animationEnabled: true,
            title: {
                text: "Calories For The Past Week"
            },
            data: [{				
                    type: "column",
                    dataPoints: [
                        { label: dates[0],  y: caloriesPerDay[0], color: (caloriesPerDay[0] > Graph.mealVars.calorieGoal) ? "red" : "green" },
                        { label: dates[1], y: caloriesPerDay[1], color: (caloriesPerDay[1] > Graph.mealVars.calorieGoal) ? "red" : "green" },
                        { label: dates[2], y: caloriesPerDay[2], color: (caloriesPerDay[2] > Graph.mealVars.calorieGoal) ? "red" : "green" },
                        { label: dates[3],  y: caloriesPerDay[3], color: (caloriesPerDay[3] > Graph.mealVars.calorieGoal) ? "red" : "green" },
                        { label: dates[4],  y: caloriesPerDay[4], color: (caloriesPerDay[4] > Graph.mealVars.calorieGoal) ? "red" : "green" },
                        { label: dates[5],  y: caloriesPerDay[5], color: (caloriesPerDay[5] > Graph.mealVars.calorieGoal) ? "red" : "green" },
                        { label: dates[6],  y: caloriesPerDay[6], color: (caloriesPerDay[6] > Graph.mealVars.calorieGoal) ? "red" : "green" }
                    ]
            }]
        };

        // Re-loads the page when number of means change. Kinda scuffed but works.
        setMeals(Graph.mealVars.numMeals);
    }

    function Load()
    {
        useEffect(() => {
            LoadStatistics();
        }, [])
    }

    Load();

    const DisplayPieStatistics = () =>
    (
        <div className="statistics">
            <div className="statistics-container">
                <div className="statistics-content">{Graph.mealVars.name}'s Statistics</div>
                <div className="statistics-error">{statisticsError}</div>
                <div className="statistics-grid">
                    <div>
                        <div className="statistics-header">Totals</div>
                        <div><strong>Meals:</strong> <strong>{Graph.mealVars.numMeals}</strong></div>
                        <div><strong>Calories:</strong> <strong>{Graph.mealVars.calories}</strong><strong>g</strong></div>
                        <div><strong>Carbohydrates:</strong> <strong>{Graph.mealVars.carbs}</strong><strong>g</strong></div>
                        <div><strong>Protein:</strong> <strong>{Graph.mealVars.protein}</strong><strong>g</strong></div>
                        <div><strong>Sodium:</strong> <strong>{Graph.mealVars.sodium}</strong><strong>mg</strong></div>
                        <div><strong>Fat:</strong> <strong>{Graph.mealVars.fat}</strong><strong>g</strong></div>
                        <div className="statistics-header">Averages Per Meal</div>
                        <div><strong>Calories:</strong> <strong>{parseFloat(((Graph.mealVars.numMeals === 0) ? 0 : Graph.mealVars.calories / Graph.mealVars.numMeals).toFixed(3))}</strong></div>
                        <div><strong>Carbohydrates:</strong> <strong>{parseFloat(((Graph.mealVars.numMeals === 0) ? 0 : Graph.mealVars.carbs / Graph.mealVars.numMeals).toFixed(3))}</strong><strong>g</strong></div>
                        <div><strong>Protein:</strong> <strong>{parseFloat(((Graph.mealVars.numMeals === 0) ? 0 : Graph.mealVars.protein / Graph.mealVars.numMeals).toFixed(3))}</strong><strong>g</strong></div>
                        <div><strong>Sodium:</strong> <strong>{parseFloat(((Graph.mealVars.numMeals === 0) ? 0 : Graph.mealVars.sodium / Graph.mealVars.numMeals).toFixed(3))}</strong><strong>mg</strong></div>
                        <div><strong>Fat:</strong> <strong>{parseFloat(((Graph.mealVars.numMeals === 0) ? 0 : Graph.mealVars.fat / Graph.mealVars.numMeals).toFixed(3))}</strong><strong>g</strong></div>
                    </div>
                    <div className="statistics-graph">
                        <CanvasJSReact.CanvasJSChart options={Graph.mealVars.pieProperties} />
                    </div>
                </div>
            </div>
        </div>
    )

    const DisplayBarStatistics = () =>
    (
        <div className="statistics-container graph-padding">
            <div className="statistics-bar-text">Calorie goal: <strong>{Graph.mealVars.calorieGoal}</strong> | <strong className="statistics-green">Green:</strong> Below Calorie Goal | <strong className="statistics-red">Red:</strong> Above Calorie Goal</div>
            <CanvasJSReact.CanvasJSChart options={Graph.mealVars.barProperties} />
        </div>
    )

    return (
        <div className="App">
            <Navbar/>
            <DisplayPieStatistics/>
            <DisplayBarStatistics/>
        </div>
    );
}

export default Statistics;