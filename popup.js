function sendScrapeMsg() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // Finds tabs that are active in the current window
   console.log(tabs)
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrapeamazon' }, (data) => {
      console.log(data)
      const select = document.getElementById('subscription_plan_id');
      const option = Array.from(select.children).find(option => option.innerText.includes(data.plan))
      select.value = option.value
      const renewalInput = document.getElementById('subscription_renewal_date')
      const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      renewalInput.value = new Date(new Date(data.endDate) - tzoffset).toISOString().split('T')[0]
    }); // Sends a message (object) to the first tab (tabs[0])
  });
}

// get service name from the website
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
        sendScrapeMsg()
})

  })}

// a button to add subs after the user filled the form
function addSubs() {
  const button = document.getElementById('send-data');
  const resource = "Amazon Prime"; // to be amended
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
