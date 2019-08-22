document.addEventListener("DOMContentLoaded",() => {
    const socket = io("/");

    document.querySelector("#targetTable").innerHTML += `<tr><th scope='row'>Default</th><td>${"somthing"}</td> <td>Column content</td> <td>Column content</td> <td>Column content</td> <td>Column content</td> </tr>`

});