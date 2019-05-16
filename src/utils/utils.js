import md5 from "md5";

export const keyFromName = name => name.replace(/ /g, "").toLowerCase();
export const idFromName = name => md5(keyFromName(name));


export const respond = (body, statusCode = 200) => {
    return {
      statusCode: statusCode,
      body: JSON.stringify(body)
    };
  };
