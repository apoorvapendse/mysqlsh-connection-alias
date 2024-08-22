// work in progress.... rn just basic checking
export function validateURL(uri: string) {
    const delim = /[:\/]+|\/\//; //regex object
    const data = uri.split(delim);
    if(data.length !== 5)
    {
        return {
            success:false,
            message:'URI parsing failed, please recheck if you have entered the correct URI'
        }
    }
    else
    {
        return {
            success:true
        }
    
    }



}
