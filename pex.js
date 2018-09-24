const Immutable = require("immutable");
const assert = require("assert");
const { merge } = require("immutable");
const { toJS } = require("immutable");
const noNested = require("./noNested");
const concatValues = require("./concatValues")

function transformErrors(error) {
  console.log("inside the transformErrors");

  // error going through transformation
  error = error.toJS();

 
  //MAIN FUNCTION CALL:
  Object.keys(error).map(key => {
    if (key === "url" || key === "urls") {
        error[key] = noNested(error[key]);
    } else {
      error[key] = concatValues(error[key]);
      if (typeof error[key] === "object") {
        error[key] = Object.keys(error[key]).reduce((acc, curr) => {
          return acc.concat(curr + ".");
        });
        error[key].concat(".");
      }
    }
  });
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
