const cleanPhone = (phone: string): string => {
    let preffix: string = "+254";
    let result: string = "";
    phone = phone.replace(/\s/g, "");
  
    if (phone.charAt(0) == "0") {
      phone.slice(1);
      result = preffix + phone.slice(1);
    } else if (phone.charAt(0) == "7") {
      result = preffix + phone;
    } else if (phone.charAt(0) == "2") {
      result = "+" + phone;
    } else if (phone.charAt(0) == "+") {
      result = phone;
    } else if (phone.charAt(0) == "1") {
      result = preffix + phone;
    }
    return result;
  };
  
  export default cleanPhone;
  