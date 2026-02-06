

async function viewUsers(){
    try{
        const response = await fetch('/users');
        console.log("response status: ", response.status);

        if (response.ok) {
            const users = await response.json();
            //window.alert("response ok ", users);

            userList = document.getElementById('userList');
            userList.innerHTML = '';

            users.forEach(user => {
                const userDiv = document.createElement('div');

                userDiv.innerHTML = `
                    <p>${user.name}, role: ${user.role}, email: ${user.email}, id: ${user._id}
            `   ;

                const deleteBtn = document.createElement('button');
                deleteBtn.onclick = () => deleteUser(user._id);
                userDiv.appendChild(deleteBtn);

                userList.appendChild(userDiv);
            });
        } else{
        
        }
        } catch (error){
            console.error('Network error during review retrieval:', error); 
            alert("Network error. Please try again. ");
            alert(error);
        }   
}

async function deleteUser(userId){
    if (!confirm("Are you sure you want to delete this review?")) return;

    try{
        const response = await fetch(`/deleteuser/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            viewUsers();
        } else{
            const result = await response.json();
            alert("Failed to delete user: " + (result.error || "Unknown error"));
        }
    } catch (error){
        console.error('Error during delete: ', error);
        alert('Error. Please try again');
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    await viewUsers();
});