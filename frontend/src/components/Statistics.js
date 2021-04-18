import Navbar from "./navbar";
import React, { useState, useEffect } from "react";
import "./Statistics.css";
import CanvasJSReact from '../canvasjs.react.js';

class Graph extends React.Component
{
    static mealVars = {
        numMeals: 0,
        name: "",
        properties: null,
        total: 0,
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

    if (ud == null)
    {
        window.location.href = "/login";
        return false;
    }

    // Reset variables.

    const loadStatistics = async event =>
    {
        var meals;
        var mealObj = {
            userId: ud.payload.userId,
            jwtToken: tok
        };
        var mealJSON = JSON.stringify(mealObj);

        Graph.mealVars.numMeals = 0;
        Graph.mealVars.carbs = 0;
        Graph.mealVars.total = 0;
        Graph.mealVars.calories = 0;
        Graph.mealVars.fat = 0;
        Graph.mealVars.protein = 0;
        Graph.mealVars.sodium = 0;
        Graph.mealVars.name = ud.payload.firstName;

        try
        {
            // Do all the API calls.
            const response = await fetch(bp.buildPath("api/searchmealuser"), {method:"POST", body:mealJSON, headers:{"Content-Type": "application/json"}});
            var responseObj = JSON.parse(await response.text());

            // Error.
            if (responseObj.error !== "")
            {
                setStatisticsError(responseObj.error);
                return false;
            }

            // Store meals.
            meals = responseObj.results;
        }
        catch(e)
        {
            setStatisticsError(e.toString());
            return false;
        }

        // Total all the statistics.

        if (meals != null)
        {
            meals.forEach(element => {
                Graph.mealVars.calories += parseInt(element.Calories);
                Graph.mealVars.fat += parseInt(element.TotalFat);
                Graph.mealVars.sodium += parseInt(element.Sodium);
                Graph.mealVars.carbs += parseInt(element.TotalCarbs);
                Graph.mealVars.protein += parseInt(element.Protein);
                Graph.mealVars.total += (parseInt(element.TotalFat) + parseInt(element.TotalCarbs) + parseInt(element.Protein) + (parseInt(element.Sodium) / 1000)); // Sodium divided by 1000 to get grams.
                Graph.mealVars.numMeals += 1;
            });

            if (Graph.mealVars.numMeals === 0)
                setStatisticsError("No meals to display!");
        }

        Graph.mealVars.properties = {
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
                    { y: (Graph.mealVars.total <= 0) ? 0 : (Graph.mealVars.carbs / Graph.mealVars.total) * 100, label: "Carbohydrates" },
                    { y: (Graph.mealVars.total <= 0) ? 0 : (Graph.mealVars.fat / Graph.mealVars.total) * 100, label: "Fat" },
                    { y: (Graph.mealVars.total <= 0) ? 0 : ((Graph.mealVars.sodium / 1000) / Graph.mealVars.total) * 100, label: "Sodium" },
                    { y: (Graph.mealVars.total <= 0) ? 0 : (Graph.mealVars.protein / Graph.mealVars.total) * 100, label: "Protein" }
                ]
            }]
        };

        setMeals(Graph.mealVars.numMeals);
    }

    function Load()
    {
        useEffect(() => {
            loadStatistics();
        }, [meals])
    }

    Load();

    const DisplayStatistics = () =>
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
                        <div><strong>Calories:</strong> <strong>{(Graph.mealVars.numMeals == 0) ? 0 : Graph.mealVars.calories / Graph.mealVars.numMeals}</strong></div>
                        <div><strong>Carbohydrates:</strong> <strong>{(Graph.mealVars.numMeals == 0) ? 0 : Graph.mealVars.carbs / Graph.mealVars.numMeals}</strong><strong>g</strong></div>
                        <div><strong>Protein:</strong> <strong>{(Graph.mealVars.numMeals == 0) ? 0 : Graph.mealVars.protein / Graph.mealVars.numMeals}</strong><strong>g</strong></div>
                        <div><strong>Sodium:</strong> <strong>{(Graph.mealVars.numMeals == 0) ? 0 : Graph.mealVars.sodium / Graph.mealVars.numMeals}</strong><strong>mg</strong></div>
                        <div><strong>Fat:</strong> <strong>{(Graph.mealVars.numMeals == 0) ? 0 : Graph.mealVars.fat / Graph.mealVars.numMeals}</strong><strong>g</strong></div>
                    </div>
                    <div className="statistics-graph">
                        <CanvasJSReact.CanvasJSChart options={Graph.mealVars.properties} />
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="App">
            <Navbar/>
            <DisplayStatistics/>
        </div>
    );
}

export default Statistics;