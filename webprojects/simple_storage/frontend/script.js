const url = "http://localhost:3000/users";
let nameInput = document.getElementById("name");
let lastNameInput = document.getElementById("last_name");
let saveButton = document.getElementById("saveButton");
let name = ""; let lastName = ""; id = 0;
const goodJob = document.createElement("div"); goodJob.classList.add("good-job");
/* Good job button */
goodJob.innerHTML = `<h2>¡Buen trabajo!</h2> <p>¡Datos guardados correctamente!</p>`;
goodJob.appendChild(document.createElement("button")).innerText = "Cerrar";
goodJob.querySelector("button").addEventListener("click", ()=> {
    document.body.removeChild(goodJob);
});
/* Bad job button */
const badJob = document.createElement("div"); badJob.classList.add("bad-job");
badJob.innerHTML = `<h2>Error</h2> <p>Por favor, complete todos los campos.</p>`;
badJob.appendChild(document.createElement("button")).innerText = "Cerrar";
badJob.querySelector("button").addEventListener("click", ()=> {
    document.body.removeChild(badJob);
});

function StoreIntable(id, name, last_name){
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${id}</td> <td>${name}</td> <td>${last_name}</td> <td><button>Eliminar</button></td>`;
    const button = tr.querySelector("button")
    button.addEventListener("click", async e=> {
        tr.remove();
        try {
            fetch(url+"/"+button.parentElement.parentElement.firstChild.textContent, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json' // Indicate the data type of the body
                }
            })
        } catch (error) {
            console.error(`Error: ${error}`)
        }
    });
    return tr;
}
saveButton.addEventListener("click", ()=> {
    name = nameInput.value;
    lastName = lastNameInput.value;
    if(name !== "" && lastName !==""){
        id++;
        lastNameInput.classList.add("nice"); lastNameInput.classList.remove("bad");
        nameInput.classList.add("nice"); nameInput.classList.remove("bad");
        document.body.appendChild(goodJob);
    } else {
        nameInput.classList.add("bad"); lastNameInput.classList.remove("nice");
        lastNameInput.classList.add("bad"); nameInput.classList.remove("nice");
        document.body.appendChild(badJob);
    }   
});
document.getElementById("saveButton").addEventListener("click", async ()=>{
    if (name === "" || lastName === "") return;
    const userData = {
        name: name,
        lastName: lastName
    };
  try {
    const response = await fetch(url, {
      method: 'POST', // Specify the method as POST
      headers: {
        'Content-Type': 'application/json' // Indicate the data type of the body
      },
      body: JSON.stringify(userData) // Convert the JavaScript object to a JSON string
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
})
async function getUsers() {
    try {
        const data = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = data.json()
        return result;
    } catch (error) {
        console.error(`Error: ${error}`)
    }

}
document.addEventListener("DOMContentLoaded", async e=>{
    const data = await getUsers()
    if (data !== null){
        for (el of data){
            const table = document.querySelector("table tbody");
            table.appendChild(StoreIntable(el.id, el.name, el.lastName))
        }
    }
})
