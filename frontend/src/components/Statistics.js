import Navbar from "./navbar";
import React, { useState, useEffect } from "react";
import "./Statistics.css";
import CanvasJSReact from '../canvasjs.react.js';

class Graph extends React.Component
{
    static dayVars = {
        numMeals: 0,
        properties: null,
        total: 0,
        calories: 0,
        fat: 0,
        sodium: 0,
        carbs: 0,
        protein: 0
    }

    static weekVars = {
        numMeals: 0,
        properties: null,
        total: 0,
        calories: 0,
        fat: 0,
        sodium: 0,
        carbs: 0,
        protein: 0
    }

    static yearVars = {
        numMeals: 0,
        properties: null,
        total: 0,
        calories: 0,
        fat: 0,
        sodium: 0,
        carbs: 0,
        protein: 0
    }
}

const Dashboard = () =>
{
    const bp = require("./bp.js");
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const [statisticsError, setStatisticsError] = useState("");

    if (ud == null)
    {
        window.location.href = "/login";
        return false;
    }

    // Reset variables.

    Graph.dayVars.numMeals = 0;
    Graph.dayVars.carbs = 0;
    Graph.dayVars.total = 1;
    Graph.dayVars.calories = 0;
    Graph.dayVars.fat = 0;
    Graph.dayVars.protein = 0;
    Graph.dayVars.sodium = 0;

    Graph.weekVars.numMeals = 0;
    Graph.weekVars.carbs = 0;
    Graph.weekVars.total = 1;
    Graph.weekVars.calories = 0;
    Graph.weekVars.fat = 0;
    Graph.weekVars.protein = 0;
    Graph.weekVars.sodium = 0;

    Graph.yearVars.numMeals = 0;
    Graph.yearVars.carbs = 0;
    Graph.yearVars.total = 1;
    Graph.yearVars.calories = 0;
    Graph.yearVars.fat = 0;
    Graph.yearVars.protein = 0;
    Graph.yearVars.sodium = 0;

    const loadStatistics = async event =>
    {
        var dayMeals;
        var weekMeals;
        var yearMeals;

        var dayObj = {
            userId: ud.userId,
            range: 1,
            jwtToken: tok
        };
        var dayJSON = JSON.stringify(dayObj);

        var weekObj = {
            userId: ud.userId,
            range: 7,
            jwtToken: tok
        };
        var weekJSON = JSON.stringify(weekObj);

        var yearObj = {
            userId: ud.userId,
            range: 365,
            jwtToken: tok
        };
        var yearJSON = JSON.stringify(yearObj);

        try
        {
            // Do all the API calls.
            const dayResponse = await fetch(bp.buildPath("api/searchmealtime"), {method:"POST", body:dayJSON, headers:{"Content-Type": "application/json"}});
            const weekResponse = await fetch(bp.buildPath("api/searchmealtime"), {method:"POST", body:weekJSON, headers:{"Content-Type": "application/json"}});
            const yearResponse = await fetch(bp.buildPath("api/searchmealtime"), {method:"POST", body:yearJSON, headers:{"Content-Type": "application/json"}});
            var dayResponseObj = JSON.parse(await dayResponse.text());
            var weekResponseObj = JSON.parse(await weekResponse.text());
            var yearResponseObj = JSON.parse(await yearResponse.text());

            // Error.
            if (dayResponseObj.error !== "" || weekResponseObj.error !== "" || yearResponseObj !== "")
            {
                if (dayResponseObj.error !== "")
                    setStatisticsError(dayResponseObj.error);
                if (weekResponseObj.error !== "")
                    setStatisticsError(weekResponseObj.error);
                if (yearResponseObj.error !== "")
                    setStatisticsError(yearResponseObj.error);
                return false;
            }

            // Store meals.
            dayMeals = dayResponseObj.results;
            weekMeals = weekResponseObj.results;
            yearMeals = yearResponseObj.results;
        }
        catch(e)
        {
            return false;
        }

        // Total all the statistics.

        if (dayMeals != null)
        {
            dayMeals.forEach(element => {
                Graph.dayVars.calories += element.totalCal;
                Graph.dayVars.fat += element.totalFat;
                Graph.dayVars.sodium += element.totalSodium;
                Graph.dayVars.carbs += element.totalCarbs;
                Graph.dayVars.protein += element.totalProtein;
                Graph.dayVars.total += (element.totalFat + element.totalCarbs + element.totalProtein + element.totalSodium);
                Graph.dayVars.numMeals += 1;
            });
        }

        if (weekMeals != null)
        {
            weekMeals.forEach(element => {
                Graph.weekVars.calories += element.totalCal;
                Graph.weekVars.fat += element.totalFat;
                Graph.weekVars.sodium += element.totalSodium;
                Graph.weekVars.carbs += element.totalCarbs;
                Graph.weekVars.protein += element.totalProtein;
                Graph.weekVars.total += (element.totalFat + element.totalCarbs + element.totalProtein + element.totalSodium);
                Graph.weekVars.numMeals += 1;
            });
        }

        if (yearMeals != null)
        {
            yearMeals.forEach(element => {
                Graph.yearVars.calories += element.totalCal;
                Graph.yearVars.fat += element.totalFat;
                Graph.yearVars.sodium += element.totalSodium;
                Graph.yearVars.carbs += element.totalCarbs;
                Graph.yearVars.protein += element.totalProtein;
                Graph.yearVars.total += (element.totalFat + element.totalCarbs + element.totalProtein + element.totalSodium);
                Graph.yearVars.numMeals += 1;
            });

            if (Graph.yearVars.numMeals === 0)
                setStatisticsError("No meals to display in the last year!");
        }
    }

    function Load()
    {
        useEffect(() => {
            loadStatistics();
        }, [])
    }

    Load();

    Graph.dayVars.properties = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: "Daily Breakdown"
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
                { y: Graph.dayVars.carbs / Graph.dayVars.total, label: "Carbohydrates" },
                { y: Graph.dayVars.fat / Graph.dayVars.total, label: "Fat" },
                { y: Graph.dayVars.sodium / Graph.dayVars.total, label: "Sodium" },
                { y: Graph.dayVars.protein / Graph.dayVars.total, label: "Protein" }
            ]
        }]
    };

    Graph.weekVars.properties = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: "Weekly Breakdown"
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
                { y: Graph.weekVars.carbs / Graph.weekVars.total, label: "Carbohydrates" },
                { y: Graph.weekVars.fat / Graph.weekVars.total, label: "Fat" },
                { y: Graph.weekVars.sodium / Graph.weekVars.total, label: "Sodium" },
                { y: Graph.weekVars.protein / Graph.weekVars.total, label: "Protein" }
            ]
        }]
    };

    Graph.yearVars.properties = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: "Yearly Breakdown"
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
                { y: Graph.yearVars.carbs / Graph.yearVars.total, label: "Carbohydrates" },
                { y: Graph.yearVars.fat / Graph.yearVars.total, label: "Fat" },
                { y: Graph.yearVars.sodium / Graph.yearVars.total, label: "Sodium" },
                { y: Graph.yearVars.protein / Graph.yearVars.total, label: "Protein" }
            ]
        }]
    };

    return (
        <div className="App">
            {<Navbar/>}
            <div className="statistics">
                <div className="statistics-container">
                    <div className="statistics-error">{statisticsError}</div>
                    <div className="statistics-grid">
                        <div className="statistics-graph">
                            <CanvasJSReact.CanvasJSChart options={Graph.dayVars.properties} />
                            <div className="statistics-header">Totals</div>
                            <div><strong>Meals:</strong> <strong>{Graph.dayVars.numMeals}</strong></div>
                            <div><strong>Calories:</strong> <strong>{Graph.dayVars.calories}</strong></div>
                            <div><strong>Carbohydrates:</strong> <strong>{Graph.dayVars.carbs}</strong></div>
                            <div><strong>Protein:</strong> <strong>{Graph.dayVars.protein}</strong></div>
                            <div><strong>Sodium:</strong> <strong>{Graph.dayVars.sodium}</strong></div>
                            <div><strong>Fat:</strong> <strong>{Graph.dayVars.fat}</strong></div>
                            <div className="statistics-header">Averages Per Meal</div>
                            <div><strong>Calories:</strong> <strong>{(Graph.dayVars.numMeals == 0) ? 0 : Graph.dayVars.calories / Graph.dayVars.numMeals}</strong></div>
                            <div><strong>Carbohydrates:</strong> <strong>{(Graph.dayVars.numMeals == 0) ? 0 : Graph.dayVars.carbs / Graph.dayVars.numMeals}</strong></div>
                            <div><strong>Protein:</strong> <strong>{(Graph.dayVars.numMeals == 0) ? 0 : Graph.dayVars.protein / Graph.dayVars.numMeals}</strong></div>
                            <div><strong>Sodium:</strong> <strong>{(Graph.dayVars.numMeals == 0) ? 0 : Graph.dayVars.sodium / Graph.dayVars.numMeals}</strong></div>
                            <div><strong>Fat:</strong> <strong>{(Graph.dayVars.numMeals == 0) ? 0 : Graph.dayVars.fat / Graph.dayVars.numMeals}</strong></div>
                        </div>
                        <div className="statistics-graph">
                            <CanvasJSReact.CanvasJSChart options={Graph.weekVars.properties} />
                            <div className="statistics-header">Totals</div>
                            <div><strong>Meals:</strong> <strong>{Graph.weekVars.numMeals}</strong></div>
                            <div><strong>Calories:</strong> <strong>{Graph.weekVars.calories}</strong></div>
                            <div><strong>Carbohydrates:</strong> <strong>{Graph.weekVars.carbs}</strong></div>
                            <div><strong>Protein:</strong> <strong>{Graph.weekVars.protein}</strong></div>
                            <div><strong>Sodium:</strong> <strong>{Graph.weekVars.sodium}</strong></div>
                            <div><strong>Fat:</strong> <strong>{Graph.weekVars.fat}</strong></div>
                            <div className="statistics-header">Averages Per Meal</div>
                            <div><strong>Calories:</strong> <strong>{(Graph.weekVars.numMeals == 0) ? 0 : Graph.weekVars.calories / Graph.weekVars.numMeals}</strong></div>
                            <div><strong>Carbohydrates:</strong> <strong>{(Graph.weekVars.numMeals == 0) ? 0 : Graph.weekVars.carbs / Graph.weekVars.numMeals}</strong></div>
                            <div><strong>Protein:</strong> <strong>{(Graph.weekVars.numMeals == 0) ? 0 : Graph.weekVars.protein / Graph.weekVars.numMeals}</strong></div>
                            <div><strong>Sodium:</strong> <strong>{(Graph.weekVars.numMeals == 0) ? 0 : Graph.weekVars.sodium / Graph.weekVars.numMeals}</strong></div>
                            <div><strong>Fat:</strong> <strong>{(Graph.weekVars.numMeals == 0) ? 0 : Graph.weekVars.fat / Graph.weekVars.numMeals}</strong></div>
                        </div>
                        <div className="statistics-graph">
                            <CanvasJSReact.CanvasJSChart options={Graph.yearVars.properties} />
                            <div className="statistics-header">Totals</div>
                            <div><strong>Meals:</strong> <strong>{Graph.yearVars.numMeals}</strong></div>
                            <div><strong>Calories:</strong> <strong>{Graph.yearVars.calories}</strong></div>
                            <div><strong>Carbohydrates:</strong> <strong>{Graph.yearVars.carbs}</strong></div>
                            <div><strong>Protein:</strong> <strong>{Graph.yearVars.protein}</strong></div>
                            <div><strong>Sodium:</strong> <strong>{Graph.yearVars.sodium}</strong></div>
                            <div><strong>Fat:</strong> <strong>{Graph.yearVars.fat}</strong></div>
                            <div className="statistics-header">Averages Per Meal</div>
                            <div><strong>Calories:</strong> <strong>{(Graph.yearVars.numMeals == 0) ? 0 : Graph.yearVars.calories / Graph.yearVars.numMeals}</strong></div>
                            <div><strong>Carbohydrates:</strong> <strong>{(Graph.yearVars.numMeals == 0) ? 0 : Graph.yearVars.carbs / Graph.yearVars.numMeals}</strong></div>
                            <div><strong>Protein:</strong> <strong>{(Graph.yearVars.numMeals == 0) ? 0 : Graph.yearVars.protein / Graph.yearVars.numMeals}</strong></div>
                            <div><strong>Sodium:</strong> <strong>{(Graph.yearVars.numMeals == 0) ? 0 : Graph.yearVars.sodium / Graph.yearVars.numMeals}</strong></div>
                            <div><strong>Fat:</strong> <strong>{(Graph.yearVars.numMeals == 0) ? 0 : Graph.yearVars.fat / Graph.yearVars.numMeals}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;