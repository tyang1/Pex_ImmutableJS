 //noNESTED FUNCTION TO TAKE CARE OF THE SPCIFIC CASE OF KEYS 'URLS' AND "URL":
  //
  const noNested = function(value, arr = [], result = {}) {
    if(value === undefined) return result;
    if (value.length === 1 && typeof value[0] === "string") {
        value = value[0] + ".";
        return value;
    }
    else if (Array.isArray(value)){
        value.forEach( el => {
            el = noNested(el, result);
        })
        return value;
    }
    //if the value is object:
    else if (typeof value !== "string" && !Array.isArray(value)) {
      Object.keys(value).forEach(el => {
        // noNested(value[el]);
        result[el] = noNested(value[el]);
      });
      return result;
    };
  }

 module.exports = noNested;