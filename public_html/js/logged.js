let loggedUser;

async function checkLogged(){
    try{
        let response = await fetch('/logged');
        loggedUser = await response.json();
    } catch (error){
        console.error("Auth check failed", error);
    }
}
