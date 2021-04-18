import {useEffect, useState} from "react";
import {Link, useHistory} from 'react-router-dom';
import bp from "./bp";

const MealManagementComponent = () => {
    //token
    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");
    //var _ud = localStorage.getItem('user_data');
    //var ud = JSON.parse(_ud);

    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    const firstName = ud.payload.firstName;
    const lastName = ud.payload.lastName;
    /* end token */

    //define values for meal; setters and getters
    const [mealDateId, setMealDateId] = useState('');
    const [date, setDate] = useState('');
    const [totalCalCount, setTotalCalCount] = useState('');
    const [totalFat, setTotalFat] = useState('');
    const [totalSodium, setTotalSodium] = useState('');
    const [totalCarbs, setTotalCarbs] = useState('');
    const [totalProtein, setTotalProtein] = useState('');
    const [dateRange, setDateRange] = useState(1);
    const [meals, setMeals] = useState('');
    const [mealTimeId, setMealTimeId] = useState('');
    const [mealTimeObj, setMealTimeObj] = useState('');

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [todayMealExists, setTodayMealExists] = useState(false);

    const history = useHistory();

    const searchMealTimeById = () => {
        //prevents page inputs from being refreshed
        //e.preventDefault();
        //create our first meal that will help construct today's
        //meal date.
        const firstMeal = {
            mealId: mealTimeId,
            jwtToken: tok
        };
        setIsPending(true);

        fetch(bp.buildPath("api/viewmealtime"), {
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
                    setMealTimeObj(data);
                }
                else{
                    setMealTimeObj(data);
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
                if (data.id === -1) {
                    setTodayMealExists(false)
                    setMealTimeId(data.id)
                    return data.id

                } else {
                    //date already exists,
                    setTodayMealExists(true)
                    setMealTimeId(data.id)
                    return data.id
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
            console.log("Addmealday, load today: " + mealTimeId)
        }, [todayMealExists])
    }

    function LoadTodaysMeal(){
        useEffect(() => {
            searchMealTimeById(mealTimeId);
            console.log(mealTimeObj)
        }, [mealTimeObj])
    }

    const TestReturnThingy = () => {
        if(todayMealExists) {
            return (
                <div>
                    <h3>Total calories: {mealTimeObj && mealTimeObj.totalCal}</h3>
                    <p>Total Fat: {mealTimeObj.totalFat}g</p>
                    <p>Total Sodium: {mealTimeObj.totalCarbs}g</p>
                    <p>Total Carbs: {mealTimeObj.totalProtein}g</p>
                    <p>Total Protein: {mealTimeObj.totalSodium}g</p>
                </div>);
        }else{
            return(
            <h3>No meals added so far today.</h3>
            );
        }
    }

    //LoadToday();





    return (
        <div className="create">
            <h1>Hello, {firstName}</h1>
            {LoadToday()}
            {LoadTodaysMeal()}
            <h2>{mealTimeObj.date}</h2>
            <p>Welcome back!</p>
            {TestReturnThingy()}


            <br/>
            <div className="links">
                <Link to={{
                        pathname: '/addMeal/' + todayMealExists,
                        state: {
                            todayMealExists: todayMealExists,
                        },
                    }}
                      style={{
                          color: "white",
                          backgroundColor: '#13ae1d',
                          borderRadius: '12px'
                      }}
                    >Add new Meal</Link>
            </div>
        </div>
    );
}

export default MealManagementComponent;