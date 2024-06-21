# Markir RESTful API

The RESTful Marking API provides services to detect and predict the availability of parking spaces and save the data in a database in real-time. This API operates on Google Cloud Platform (GCP) and interacts with Cloud SQL Database to store and retrieve parking data.

## Features

- **Parking Spot Detection:** Crops images of parking lots and predicts whether parking slots are occupied or not.
- **Real-Time Data Delivery:** Sends data every 5 seconds to Cloud SQL Database.
- **Integration with Mobile Applications:** Provides endpoints to be accessed by mobile applications to update data in real-time.

## Clone and Run this API

Make sure that you have an environment below:
- **Node.js** and **npm** (Node Package Manager) should be installed on your system. You can download and install Node.js and npm from the official Node.js website.
- **MySQL** should be installed and running on your system.

## Step 1: Clone the Repository
To clone the repository, open a terminal or command prompt and run the following command:

```bash
git clone <URL_REPOSITORY>
```

Replace <REPOSITORY_URL> with the URL of the GitHub repository

## Step 2: Install Dependencies
After cloning the repository, navigate to the project directory:

```bash
cd repository-folder-name
```

Install all required dependencies by running:

```bash
npm install
```

## Step 3: Configure Database and Environment Variables
Ensure MySQL is running and create the necessary database. Configure the config/database.js and adjust it with your MySQL settings.

Edit the config/database.js file and replace host, user, password, database with the appropriate values based on your localhost.

If you want to deploy it, set the config in ./src/configs/database.js from local into cloud SQL.
We use a CI/CD Pipeline Github Actions, so configure your own database in the cloudrun.yml file

## Step 4: Run the Application
To start the server, use the following command in the terminal:

```bash
npm start
```

This will run the server on the port specified in the index.js file. By default, the application will run on port 5000.

## Step 5: Access the Application
Open your browser and access the application via:

[http://localhost:5000/](http://localhost:5000/)

You can now interact with the API according to the routes defined in the application

### API Routes that are accessible to send and get the data from the SQL
- **Webcam**: Crop your parking slot manually to predict it the slot if it's occupied or not`/webcam`.
- **Add Slot**: Send a cropped image first into the database that later be predict it`/parking_slot/add`.
- **Predict Image**: Predict the slots on interval of 5 seconds into the database.
- **Get Layout Data**: Get a data `/layout` to from the database to the mobile teams to adapt the row and column.
- **Get Status Data**: Get a request `/status` for a total slot status knowing that how many slot are occupied and not.
  
This guide provides a detailed walkthrough to set up and run the application as well as understand the available features.
