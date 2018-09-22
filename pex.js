const Immutable = require("immutable");
const assert = require("assert");
const { merge } = require("immutable");
const { toJS } = require("immutable");

function transformErrors(error) {
  console.log("inside the transformErrors");

  // error going through transformation
  error = error.toJS();
  function concatValues(value, result = {}, final_list = "") {
    //checking to see if the value is string
    if (typeof value === "string") return value;

    //checking to see if the value is array, and return a single string
    if (Array.isArray(value)) {

      // a single String, returns itself
      if (value.length === 1 && typeof value[0] === "string") return value[0];

      //if not a single string, recursively get the string through concatValues function:
      value.forEach(el => {
        if (typeof concatValues(el) !== 'string'){
          result = {...result, ...concatValues(el)};
        } else{
          result[concatValues(el)] = true;
        }
      });
      Object.keys(result).forEach(el => {
        final_list = final_list.concat(el + ".");
      });
      return final_list;
    }

    //else if, checking the value is object
    else if (typeof value === "object" && !Array.isArray(value)) {
      console.log("WHAT IS VALUE", value);
      for (key in value) {
        //going through each element value of the object, and flatten it.
        console.log("here is the key of th object", key);
        console.log("here is the value", value[key]);
  
        //each key should then holds a value of type string;
        result = {...result, ...flatten(value[key])};
      }
      
      console.log('HERE IS RESULT', result)
      // value = merge(result);
      //returning object with key of type string, and values of "true";
      return result;

      //Merge Function:
      //Input type: object
      //Return type: object
      // function merge(objList, result = {}) {
      //   Object.keys(objList).forEach(el => {
      //     console.log("INSIDE THE MERGE, here's the el", el);
      //     result[objList[el]] = true;
      //     console.log("TRACKING RESULT", result);
      //   });
      //   return result;
      // }

      // Flatten function:
      // Return type: String
      function flatten(obj, visited = {}) {
        //if the element to be flattened is not an object:
        //if the element is a String
        if (typeof obj === "string") {
          visited[obj] = true;
          console.log("IT IS A STRING", visited);
          return visited;
        }
        //if the elent is an Array
        for (let key in obj) {
          console.log("in flatten foor LOOPPPPPP", obj[key]);
          // visited = visited.concat(flatten(obj[key], ""));
          //here, visited
          visited = {...visited, ...flatten(obj[key])}
          console.log("PLEASE WORK", visited);
        }
        return visited;
      }
    }
  }
  Object.keys(error).map(key => {
      error[key] = concatValues(error[key]);
      if(typeof error[key] === 'object'){
        error[key] = Object.keys(error[key]).reduce( (acc, curr) => {
            // final_list = final_list.concat(el + ". ");
            console.log("here is the final step, error[key]", error[key]);
            // return error[key][acc].concat(error[key][curr]);
          });
      }
    })
  return Immutable.Map(error);
}
it("should tranform errors", () => {
  // example error object returned from API converted to Immutable.Map
  const errors = Immutable.fromJS({
    name: ["This field is required"],
    age: ["This field is required", "Only numeric characters are allowed"],
    urls: [
      {},
      {},
      {
        site: {
          code: ["This site code is invalid"],
          id: ["Unsupported id"]
        }
      }
    ],
    url: {
      site: {
        code: ["This site code is invalid"],
        id: ["Unsupported id"]
      }
    },
    tags: [
      // {},
      {
        non_field_errors: ["Only alphanumeric characters are allowed"],
        another_error: ["Only alphanumeric characters are allowed"],
        third_error: ["Third error"]
      },
      // {},
      {
        non_field_errors: [
          "Minumum length of 10 characters is required",
          "Only alphanumeric characters are allowed"
        ]
      }
    ],
    tag: {
      nested: {
        non_field_errors: ["Only alphanumeric characters are allowed"]
      }
    }
  });

  // in this specific case,
  // errors for `url` and `urls` keys should be nested
  // see expected object below
  const result = transformErrors(errors);
  console.log("here is the result", result);

  assert.deepEqual(result.toJS(), {
    name: "This field is required.",
    age: "This field is required. Only numeric characters are allowed.",
    urls: [
      {},
      {},
      {
        site: {
          code: "This site code is invalid.",
          id: "Unsupported id."
        }
      }
    ],
    url: {
      site: {
        code: "This site code is invalid.",
        id: "Unsupported id."
      }
    },
    tags:
      "Only alphanumeric characters are allowed. Third error. " +
      "Minumum length of 10 characters is required.",
    tag: "Only alphanumeric characters are allowed."
  });
});
