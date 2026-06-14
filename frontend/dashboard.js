const token = localStorage.getItem("token");

let selectedTask = "summarize";

function setTask(task){
selectedTask = task;

```
document.getElementById("selectedTask").textContent =
    task.charAt(0).toUpperCase() + task.slice(1);
```

}

document.getElementById("uploadBtn").addEventListener("click", async () => {


const file = document.getElementById("fileInput").files[0];

if(!file){
    alert("Please select a file");
    return;
}

const formData = new FormData();
formData.append("file", file);

try{

    const response = await fetch(
        "http://localhost:5000/api/upload",
        {
            method:"POST",
            headers:{
                Authorization:`Bearer ${token}`
            },
            body:formData
        }
    );

    const data = await response.json();

    alert(data.message);

}catch(error){

    console.error(error);
    alert("Upload failed");

}
```

});

document.getElementById("runBtn").addEventListener("click", async () => {

```
const message =
    document.getElementById("messageInput").value;

const output =
    document.getElementById("output");

output.innerHTML = "Thinking...";

try{

    const response = await fetch(
        "http://localhost:5000/api/ai/chat",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                Authorization:`Bearer ${token}`
            },
            body:JSON.stringify({
                message,
                task:selectedTask
            })
        }
    );

    const data = await response.json();

    output.innerHTML =
        data.answer || "No response";

}catch(error){

    console.error(error);

    output.innerHTML =
        "Something went wrong.";

}


});
