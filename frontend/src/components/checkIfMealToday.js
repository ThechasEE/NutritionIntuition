import bp from "./bp";
import {useHistory} from "react-router-dom";

export function checkIfMealToday(){
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


    const [isPending, setIsPending] = useState(false);

    const history = useHistory();

    const searchMealTimeFetch = async => {
        //prevents page inputs from being refreshed
        //create a meal
        const date = {
            userId: userId,
            dateRange: 1,
            tok: tok
        }

        setIsPending(true);

        //TODO change to get most research and not search
        const response = fetch(bp.buildPath("api/searchmealtime"), {
            method: 'POST',
            //we are sending json data
            headers: {"Content-Type": "application/json"},
            //actual data we are sending with this request
            body: JSON.stringify(date)
        }).then(() => {
            //add error checking for duplicate meal
            setIsPending(false);
            //history.go(-1);
            //history.push('/')
        })
        //get values
        //returns an array of dates
        if(response.text != null) {
            const responseObj = JSON.parse(response.text);
            //TODO change this to store an array for multiuse
            setMealDateId(responseObj.mealtimeId[0]);
        }
    }

    // const viewMealTimeFetch = async (e) => {
    //     //prevents page inputs from being refreshed
    //     e.preventDefault();
    //     //create a meal
    //     const date = {userId, dateRange, tok};
    //
    //     setIsPending(true);
    //
    //     const response = fetch(bp.buildPath("api/viewmealtime"), {
    //         method: 'POST',
    //         //we are sending json data
    //         headers: {"Content-Type": "application/json"},
    //         //actual data we are sending with this request
    //         body: JSON.stringify(date)
    //     }).then(() => {
    //         //add error checking for duplicate meal
    //         setIsPending(false);
    //         //history.go(-1);
    //         //history.push('/')
    //     })
    //     //get values
    //     var responseObj = JSON.parse(await response.text);
    //     //TODO have this set the specific date
    //     //TODO we want to append this to our meal list
    //     setMealDateId(responseObj.mealtimeId);
    //
    // }
    let todayMeal;
    let todayMealExists;
    //first time load of today's stats
    function LoadToday(){
        useEffect(() => {
            todayMeal = searchMealTimeFetch();
        }, [])
        if(todayMeal != null) {
            todayMealExists = true;
            return (
                <div className="create">
                    <h2>Today's Stats</h2>
                    {}
                    <label>Today's Calories so Far:</label>
                    <p>{mealDateId}</p>
                </div>
            )
        }else{
            todayMealExists = false;
            return (
                <div className="create">
                    <h2>No data for today, lets add in a meal!</h2>

                </div>
            )
        }
    }
}