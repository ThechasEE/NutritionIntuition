import {useState} from "react";
import {useHistory, useParams} from 'react-router-dom';
import bp from "./bp";
import {Link} from "react-router-dom";

const CreateMeal = () => {
    const { todayMealExists } = useParams();
    console.log(todayMealExists);
    //token
    const storage = require('../tokenStorage.js');
    const jwt = require("jsonwebtoken");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});
    const userId = ud.payload.userId;
    console.log(userId);
    const firstName = ud.payload.firstName;
    const lastName = ud.payload.lastName;
    /* end token */

    //define values for meal; setters and getters
    const [name, setName] = useState('');
    //const [userId, setUserId] = useState(userId);
    const [calories, setCalories] = useState('');
    const [servingSize, setServingSize] = useState('');
    const [totalFat, setTotalFat] = useState('');
    const [sodium, setSodium] = useState('');
    const [totalCarbs, setTotalCarbs] = useState('');
    const [protein, setProtein] = useState('');

    const [isPending, setIsPending] = useState(false);

    //variables
    const [mealId, setMealId] = useState('');
    const [mealtimeId, setmealtimeId] = useState('');
    const [amountConsumed, setamountConsumed] = useState('');
    const [meal, setMeal] = useState('');
    const [mealsArray, setMealsArray] = useState('');
    const [searchedMealName, setSearchedMealName] = useState('');
    const [mealtimeToken, setMealtimeToken] = useState('');
    const history = useHistory();
    const [error,setError] = useState(null);




    //done create day if first meal of the day.
    const createMealDay = (e) => {
        //prevents page inputs from being refreshed
        e.preventDefault();
        //create our first meal that will help construct today's
        //meal date.
        var firstMeal = {
            userId: userId,
            info: [
                {
                    mealId: mealId,
                    //change to increment amount consumed
                    amountConsumed: amountConsumed + 1
                }
            ],
            jwtToken: tok
        };
        setIsPending(true);
        try {
            const response = fetch(bp.buildPath("api/addmeal"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(firstMeal)
            })
            //store result from server
            const responseObj = JSON.parse(response.text());
            if(responseObj.error != ""){
                //output to user
            }
            setMealtimeToken(responseObj.accessToken);
        }catch(e){
            //TODO have functionality to display the error to the user similar
            //to login
        }


        //history.push('/dashboard')

    }

    //done
    const searchMealByName = (e) => {
        //prevents page inputs from being refreshed
        e.preventDefault();
        //get a meal from id (send)
        var search = {
            userId: userId,
            search: searchedMealName,
            jwtToken: tok
        };

        try {
            const response = fetch(bp.buildPath("api/viewMeal"), {
                method: 'POST',
                //we are sending json data
                headers: {"Content-Type": "application/json"},
                //actual data we are sending with this request
                body: JSON.stringify(search)
            })
            //get return value from server
            const responseObj = JSON.parse(response.text());
            //gets the best result.
            if(responseObj[0] != null){
                setMeal(responseObj[0]);
            }else{
                setMeal(null);
            }

            if(responseObj[0] != null) {
                setMealId(responseObj[0].mealId)
            }else{
                setMealId(null)
            }

        }catch (e){
            //TODO error checking?
            console.log("fail.");
        }


    }

    // //TODO get the meal via ID.
    // const fetchMealFromId = (e) => {
    //     //prevents page inputs from being refreshed
    //     e.preventDefault();
    //     //get a meal from id (send)
    //     var search = {
    //         mealId: mealId,
    //         jwtToken: tok
    //     };
    //
    //     try {
    //         const response = fetch(bp.buildPath("api/viewMeal"), {
    //             method: 'POST',
    //             //we are sending json data
    //             headers: {"Content-Type": "application/json"},
    //             //actual data we are sending with this request
    //             body: JSON.stringify(search)
    //         })
    //         var responseObj = JSON.parse(response.text());
    //         meal = responseObj;
    //
    //     }catch (e){
    //         return null;
    //     }
    //
    //
    // }

    const createANewMeal = (e) => {
        //prevents page inputs from being refreshed
        e.preventDefault();
        //create a meal
        var meal = {
            userId: userId,
            name: name,
            calories: calories,
            servingSize: servingSize,
            totalFat: totalFat,
            sodium: sodium,
            totalCarbs: totalCarbs,
            protein: protein,
            jwtToken: tok
        };
        //const meal = {userId, name, calories, servingSize, totalFat, sodium, totalCarbs, protein, tok};

        setIsPending(true);

        fetch(bp.buildPath("api/addmeal"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(meal)
        }).then(res => {
            if(!res.ok){
                throw Error('could not fetch the data from that resource');
                //is thrown to our catch below
            }
            //resolution of the promise
            return res.json();
        })
            .then(data => {
                console.log(data);
                setSearchedMealName(name);

                setIsPending(false);
                setError(null);
            })
            .catch((err) => {
                //check for our abort check
                setIsPending(false);
                setError(err.message);

            })
    }

    const addMeal = (e) => {
        //prevents page inputs from being refreshed
        e.preventDefault();
        //check if the meal exists, or create a new meal
        //search for name, will update the mealId
        searchedMealName();
        if(mealId != null){
            //TODO check if mealDate exists for today
            //meal exists in db
            //todo call the addMealToDate method
            //TODO now create the new date or append
        }else {
            //create meal in DB
            //this will create a new meal, and search its own name in the db and
            //as a result will store its token we can append to the day
            createANewMeal();



            // //prevents page inputs from being refreshed
            // e.preventDefault();
            // //create a meal
            // var meal = {
            //     userId: userId,
            //     name: name,
            //     calories: calories,
            //     servingSize: servingSize,
            //     totalFat: totalFat,
            //     sodium: sodium,
            //     totalCarbs: totalCarbs,
            //     protein: protein,
            //     jwtToken: tok
            // };
            // //const meal = {userId, name, calories, servingSize, totalFat, sodium, totalCarbs, protein, tok};
            //
            // setIsPending(true);
            //
            // fetch(bp.buildPath("api/addmeal"), {
            //     method: 'POST',
            //     //we are sending json data
            //     headers: {"Content-Type": "application/json"},
            //     //actual data we are sending with this request
            //     body: JSON.stringify(meal)
            // }).then(res => {
            //     if (!res.ok) {
            //         throw Error('could not fetch the data from that resource');
            //         //is thrown to our catch below
            //     }
            //     //resolution of the promise
            //     return res.json();
            // })
            //     .then(data => {
            //         console.log(data);
            //         //we do this to initlize the id for our date
            //         setSearchedMealName(name);
            //
            //         setIsPending(false);
            //         setError(null);
            //
            //         //TODO now create the new date or append
            //     })
            //     .catch((err) => {
            //         //check for our abort check
            //         setIsPending(false);
            //         setError(err.message);
            //
            //     })
            // .then(() => {
            //     //add error checking for duplicate meal
            //     setIsPending(false);
            //     setSearchedMealName(name);
            //     //handle creating a day if it doesn't exist
            //     if(todayMealExists){
            //         //add the meal to the current day
            //     }else{
            //         //create a day
            //
            //     }
            //     history.push('/dashboard')
            // })

            //history.push('/dashboard')
        }

    }
    return (
        <div className="create">
            <h2>Add an existing meal by searching below:</h2>
            <form onSubmit={ addMeal }>
                <input
                    type="text"
                    required
                    value={name}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setName(e.target.value)}
                />

            </form>
            <h3>Or</h3>
            <h2>Add a new Meal</h2>
            <form onSubmit={ addMeal }>
                <label>Meal Name:</label>
                <input
                    type="text"
                    required
                    value={name}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setName(e.target.value)}
                />
                <label>Calories:</label>
                <input
                    type="text"
                    required
                    value={calories}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setCalories(e.target.value)}
                />
                <label>Serving Size:</label>
                <input
                    type="text"
                    required
                    value={servingSize}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setServingSize(e.target.value)}
                />
                <label>Total Fat (g):</label>
                <input
                    type="text"
                    required
                    value={totalFat}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setTotalFat(e.target.value)}
                />
                <label>Sodium (mg):</label>
                <input
                    type="text"
                    required
                    value={sodium}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setSodium(e.target.value)}
                />
                <label>Total Carbs (g): </label>
                <input
                    type="text"
                    required
                    value={totalCarbs}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setTotalCarbs(e.target.value)}
                />
                <label>Protein Amount (g):</label>
                <input
                    type="text"
                    required
                    value={protein}
                    //allows us to get the html data and save it in our title
                    onChange={(e) => setProtein(e.target.value)}
                />
                { !isPending && <button>Add Meal</button>}
                { isPending && <button disabled>Adding meal...</button>}
                <p>{userId}</p>
                <p>{name}</p>
                <p>{calories}</p>
                <p>{servingSize}</p>
                <p>{totalFat}</p>
                <p>{sodium}</p>
                <p>{totalCarbs}</p>
                <p>{protein}</p>
                <p>{tok}</p>
            </form>
        </div>
    );
}

export default CreateMeal;