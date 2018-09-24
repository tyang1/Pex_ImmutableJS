 //CONCATVALUE FUNCTION (TO FLATTEN THE ERROR ENTRIES OF ALL KEYS; USED FOR ALL KEYS EXCEPT FOR 'URLS' AND 'URL')
 const concatValues = function(value, result = {}, final_list = "") {
    //checking to see if the value is string
    if (typeof value === "string") return value;
    //checking to see if the value is array, and return a single string
    if (Array.isArray(value)) {
      // a single String, returns itself
      if (value.length === 1 && typeof value[0] === "string")
        return value[0] + ".";
      //if not a single string, recursively get the string through concatValues function:
      value.forEach(el => {
        if (typeof concatValues(el) !== "string") {
          result = { ...result, ...concatValues(el) };
        } else {
          result[concatValues(el)] = true;
        }
      });
      Object.keys(result).forEach(el => {
        final_list = final_list.concat(" " + el + ".");
        final_list = final_list.trim();
      });
      return final_list;
    }

    //else if, checking the value is object
    else if (typeof value === "object" && !Array.isArray(value)) {
      for (key in value) {
        //going through each element value of the object, and flatten it.
        //each key should then holds a value of type string;
        result = { ...result, ...flatten(value[key]) };
      }
      //returning object with key of type string, and values of "true";
      return result;

      // FLATTEN FUNCTION:
      // Return type: String
      function flatten(obj, visited = {}) {
        //if the element is a String
        if (typeof obj === "string") {
          visited[obj] = true;
          return visited;
        }
        //if the elent is an Array:
        for (let key in obj) {
          visited = { ...visited, ...flatten(obj[key]) };
        }
        return visited;
      }
    }
  }

module.exports = concatValues;