import {Link} from "react-router-dom";
import DailyMealList from "./DailyMealList";

const MealHistory = ({meals: meals, title}) => {
    const jwt = require("jsonwebtoken");
    const storage = require("../tokenStorage.js");
    const tok = storage.retrieveToken();
    const ud = jwt.decode(tok, {complete:true});

    const [mealsRange, setMealsRange] = useState('');

    if(ud != null) {
        const userId = ud.payload.userId;
        const bp = require("./bp.js");
        //create object to get user's date range
        var obj = {
            userId: userId,
            jwtToken: tok
        };
        var json = JSON.stringify(obj);

        try{
            //this should get the user's date object
            const response = fetch(bp.buildPath("api/searchmealuser"), {
                method:"POST",
                body:json,headers:{"Content-Type": "application/json"}
            });
            var responseObj = JSON.parse(response.text);

            meals = responseObj;
        }catch(e){
            console.log("error");
            meals = null;
        }
        //console.log(responseObj);
    }else{
        //redirect to login
    }

    return(
        //loop the past 7 days
        <DailyMealList meals={meals[i]} title="Meals Test"/>
);
}

export default MealHistory;