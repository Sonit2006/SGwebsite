function fetchSchoolData() {
    // Get the values from the input fields
    const schoolName = "WashingtonHighSchool, 61571"
    const zipCode = "61761"

    // Replace CORS_SERVER_URL with the URL where your CORS Anywhere server is running
    const corsServerUrl = 'http://localhost:8080';

    // Create a URL for the CORS Anywhere request
    const apiUrl = `${corsServerUrl}/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${schoolName}&location=${zipCode}&key=AIzaSyAkSZ-aDdjGSXNtoy0EZMLzMTdgO-f7VBs`;

    // Send an HTTP request to the CORS Anywhere server
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK' && data.results.length > 0) {
          // School exists
          console.log('School exists:', data.results[0].name);
        } else {
          // School does not exist
          console.log('School does not exist.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }