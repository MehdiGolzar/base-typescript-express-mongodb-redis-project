const primaryTypes = ["string", "number", "boolean", "undefined"];

// Function to modify response data
export function responseDataModifier(data: any) {
  // FOR PRIMARY TYPES
  if (primaryTypes.includes(typeof data)) {
    return data;
  }

  // FOR ARRAY TYPES
  if (Array.isArray(data)) {
    data = data.map((item) => responseDataModifier(item));
  } else { // FOR OBJECT TYPES
    for (let key in data) {
      // FOR PRIMARY TYPES
      if (primaryTypes.includes(typeof data[key])) {
        if (key === "_id") {
          data = renameId(data);
        } else if (key === "password") {
          data = removePassword(data);
        }
      }
      // FOR ARRAY TYPES
      else if (Array.isArray(data[key])) {
        data[key] = responseDataModifier(data[key]);
      }
      // FOR OBJECT TYPES
      else if (typeof data[key] === "object") {
        data[key] = responseDataModifier(data[key]);
      }
    }
  }

  return data;
}
// Function to rename _id to id
function renameId(data: any) {
  data.id = data._id;
  delete data._id;
  return data;
}

// Function to remove password
function removePassword(data: any) {
  delete data.password;
  return data;
}
