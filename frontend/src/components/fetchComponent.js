//needs to start with use
import {useEffect, useState} from "react";

const FetchData = (url, obj) => {
    const[data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error,setError] = useState(null);

    useEffect(() => {
        //use this to stop the fetch if needed.
        const abortCont = new AbortController();
        setTimeout(()=> {
            fetch(url, { signal :abortCont.signal })
                .then(res => {
                    if(!res.ok){
                        throw Error('could not fetch the data from that resource');
                        //is thrown to our catch below
                    }
                    //resolution of the promise
                    return res.json();
                })
                .then(data => {
                    //console.log(data);
                    setData(data);
                    setError(null);
                    setIsPending(false);
                })
                .catch((err) => {
                    //check for our abort check
                    if(err.name === 'AbortError'){
                        console.log("fetch aborted");
                    }else {
                        setIsPending(false);
                        setError(err.message);
                    }
                })
        }, 10);

        //abort whatever fetch is it associated with.
        return () => abortCont.abort();

    }, [url]); //whenever the url changes, we will rerun this function.
    return { data, isPending, error}
}

export default FetchData;