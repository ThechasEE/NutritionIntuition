import {Link} from "react-router-dom";

//given the necessary data to display (called externally)
const DailyMealList = ({data: meals, title, range}) => {
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;

    const bp = require("./bp.js");
    //collect data for components
    var requestObj = {
        userId: userId,
        range: range,
        jwtToken: tok
    };

    try{
        //this should get the user's date object
        const response = fetch(bp.buildPath("api/searchmealtime"), {
            method:"POST",
            body: JSON.stringify(requestObj),
            headers:{"Content-Type": "application/json"}
        });
        var responseObj = JSON.parse(response.text);

        meals = responseObj;
    }catch(e) {
        console.log("error");
        meals = null;
    }

    return(
        <div className="meal-list">
            <h2>{title}</h2>
            {meals.map((meal) => (
                <div className="meal-preview" key={meal.id}>
                    {/*template string ` ` allows variables (JS) using $*/}
                    <Link to={`/meals/${meal.id}`}>
                        <h2>{meal.date}</h2>
                        <img src={"https://media.tenor.com/images/851291ba1b6c8094b74169b70691c72f/tenor.gif"} width={200} height={200}></img>
                        <h3>Total calories: {meal.totalCalCount}</h3>
                        <p>Total Fat: {meal.totalFatCount}g</p>
                        <p>Total Sodium: {meal.totalSodiumCount}g</p>
                        <p>Total Carbs: {meal.totalCarbCount}g</p>
                        <p>Total Protein: {meal.totalProteinCount}g</p>
                        {/* now we cycle through the meals this day*/}
                        <br></br>
                        <h2>Meals Eaten:</h2>
                        {meal.Meals.map((mealConsumed) => (
                            <div className= {"mealsConsumed-norm mealsConsumed-preview"} >
                                <h4>{mealConsumed.name}</h4>
                                <p>{mealConsumed.calories} calories</p>
                            </div>
                            ))}
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default DailyMealList;