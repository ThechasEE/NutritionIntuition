//needs to start with use
import {useEffect, useState} from "react";

const DataFetcher = (url) => {
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
                    //reset our error to null
                    setError(null);
                    //data is set, so it is no longer pending
                    setIsPending(false);
                })
                .catch((err) => {
                    //check for our abort check
                    if(err.name === 'AbortError'){
                        console.log("fetch aborted");
                    }else {
                        //must be another kind of error
                        setIsPending(false);
                        setError(err.message);
                    }
                })
        }, 10);

        //abort whatever fetch it is associated with.
        return () => abortCont.abort();

    }, [url]); //whenever the url changes, we will rerun this function.
    //return the results
    return { data, isPending, error}
}

export default DataFetcher;