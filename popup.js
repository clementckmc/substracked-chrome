// get service name from the website
function getTitle() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
        resolve(tabs[0].title);
      })
        } catch(e) {
        reject(e);
      }
    })
  }

function getResource(title) {
  const titleLower = title.toLowerCase();
  return new Promise((resolve, reject) => {
    try {
      fetch("http://www.substracked.com//api/v1/resources")
      .then(response => response.json())
      .then((data) => {
        const preResources = data.filter(service => service.user_id === null);
        console.log(preResources);
        let resource = preResources.find(service => titleLower.includes(service.name.toLowerCase()));
        if (title.includes("Amazon")) {
          resource = preResources.find(service => service.name === "Amazon Prime");
        }
        resolve(resource);
      })
    } catch(e) {
      reject(e);
    }
  })
}

function fetchData(resource) {
  const select = document.getElementById('subscription_plan_id');
  fetch("http://www.substracked.com//api/v1/resources")
  .then(response => response.json())
  .then((dataResources) => {
    let targetResourceID = dataResources.find(dataResource => dataResource.name === resource).id;
    fetch("http://www.substracked.com//api/v1/plans")
      .then(response => response.json())
      .then((dataPlans) => {
        select.innerHTML = "";
        let targetPlans = dataPlans.filter(dataPlan => dataPlan.resource_id === targetResourceID);
        let selectOptions;
        if (targetPlans[0].name === "") {
          selectOptions += `<option value="${targetPlans[0].id}">N/A</option>`
        } else {
          targetPlans.forEach((plan) => {
            selectOptions += `<option value="${plan.id}">${plan.name} - ¥ ${plan.price}</option>`;
          });
        }
        select.insertAdjacentHTML("beforeend", selectOptions);
})

  })}

// a button to add subs after the user filled the form
async function addSubs() {
  let title = await getTitle();
  console.log(title);
  let resource = await getResource(title);
  console.log(resource);
  const button = document.getElementById('send-data');
  // const resource = "Amazon Prime"; // to be amended
  fetchData(resource);
  button.addEventListener('click', (e) => {
    const url = 'http://www.substracked.com//api/v1/subscriptions';
    const plan = document.getElementById('subscription_plan_id').value;
    const start_date = document.getElementById("subscription_start_date").value;
    const renewal_date = document.getElementById("subscription_renewal_date").value;
    const region = document.getElementById("subscription_region").value;
    const notes = document.getElementById("subscription_notes").value;
    fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({"subscription": {
        "plan_id": plan,
        "start_date": start_date,
        "renewal_date": renewal_date,
        "region": region,
        "notes": notes
        }
      })
    })
    alert(`${resource} subscription added!`);
  })
}
addSubs();
