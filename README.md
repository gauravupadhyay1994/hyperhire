# Crypto Price Tracker API

This project is a NestJS-based API for tracking Ethereum and Polygon prices, setting price alerts, and sending email notifications using SendGrid. The project uses PostgreSQL as the database and Moralis for retrieving token prices.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [License](#license)

## Features

- Track Ethereum and Polygon prices via Moralis API.
- Set price alerts and receive notifications via email using SendGrid.
- RESTful API with documentation available via Swagger.

## Prerequisites

Before running the project, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/gauravupadhyay1994/hyperhire.git
   cd hyperhire
   ```

2. Create a `.env` file in the root of the project (or modify the existing one). The `.env` file should contain the following variables:

   ```env
   EMAIL=""
   PASSWORD=""
   ```

## Running the Project

1. Make sure Docker is running on your machine.
2. Build and run the application using Docker Compose:

   ```bash
   docker-compose up --build
   ```

   This command will:

   - Build the Docker image for the NestJS application.

3. The API will be available at `http://localhost:3000`.

4. Swagger will be available at `http://localhost:3000/api`.

5. PostgreSQL will be running on `localhost:5432`. You can connect to it using the credentials in your `.env` file.

### Stopping the Application

To stop the application and remove the containers, run:

```bash
docker-compose down
```
