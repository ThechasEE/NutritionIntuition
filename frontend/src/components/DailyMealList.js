import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import bp from "./bp";

//given the necessary data to display (called externally)
const DailyMealList = ({data: title, range}) => {
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    const [isPending, setIsPending] = useState(false);
    const [localRange, setLocalRange] = useState(range);
    const bp = require("./bp.js");

    const[meals, setMeals] = useState('');
    const [error,setError] = useState(null);

    const searchMealById = (mealId) => {
        let mealReturn;
        console.log("creating day");
        //prevents page inputs from being refreshed
        //e.preventDefault();
        //create our first meal that will help construct today's
        //meal date.
        const firstMeal = {
            mealId: mealId,
            jwtToken: tok
        };
        setIsPending(true);

        fetch(bp.buildPath("api/viewmeal"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(firstMeal)
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
                    mealReturn = data;
                }
                else{
                    mealReturn = null;
                    console.log("no meal history.")
                }//store the meal data

                setIsPending(false);
                setError(null);
            })
            .catch((err) => {
                //check for our abort check
                setIsPending(false);
                setError(err.message);
                console.log("no meal history.")

            })

    }

    //implement search by id
    const getMealHistory = () => {

        //collect data for components
        var requestObj = {
            userId: userId,
            range: range,
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

    LoadMealHistory();
    //initial call to default value of 7

    return(
        <div className="meal-list">
            {/*Todo add a form to update date*/}

            {meals && meals.map((meal) => (
                <div className="meal-preview" key={meal.id}>
                    {/*template string ` ` allows variables (JS) using $*/}
                    <Link to={`/meals/${meal.id}`}>
                        <h2>{meal.Date.substring(0,10)}</h2>
                        <h3>Total calories: {meal.totalCalCount}</h3>
                        <p>Total Fat: {meal.totalFatCount}g</p>
                        <p>Total Sodium: {meal.totalSodiumCount}g</p>
                        <p>Total Carbs: {meal.totalCarbCount}g</p>
                        <p>Total Protein: {meal.totalProteinCount}g</p>
                        {console.log(meal)}
                        {/* now we cycle through the meals this day*/}
                        <br></br>
                        <h2>Food consumed:</h2>
                        {meal.Meals.map((mealConsumed) => (
                            //search db for this meal id.
                            <div className= {"mealsConsumed-norm mealsConsumed-preview"} >
                                {console.log(mealConsumed)}
                                <h4>{mealConsumed.Name}</h4>
                                <p>{mealConsumed.Calories} calories</p>
                                <p>{mealConsumed.Protein}g Protein</p>
                                <p>{mealConsumed.TotalFat}g Fat</p>
                                <p>{mealConsumed.TotalCarbs}g Carbs</p>
                            </div>
                            ))}
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default DailyMealList;