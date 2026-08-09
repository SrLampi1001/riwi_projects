# Historia usuario 3 m3 – Kepler 22b Forum

A simple forum webpage project built with a RESTful API using **JSON Server** to create and persist posts. This webpage is an assigment made in Riwi.

This forum is set inside a context related with a previous work, called **Kepler 22b**, a world where sunlight shines on only one side of the planet all year round. The bright side is extremely hot and radiant, while the opposite side remains in eternal cold and darkness. (see the WebPage for kepler22b [here](https://srlampi1001.github.io/kepler_page/))

The inhabitants of Kepler 22b have evolved into diverse forms and cultures, adapting to survive in both extreme environments. This forum allows users to share stories, knowledge, survival techniques, and cultural insights from this fascinating world.

---

## Kepler 22b

Kepler 22b is divided into two extreme hemispheres and a terminator line:

### The Bright Side (Sinteryum Kingdom)

* Constant sunlight
* High temperatures
* Radiant landscapes and solar-adapted ecosystems
* Civilizations adapted to heat and intense light

### The Dark Side (Dartumbria Kingdom)

* Permanent night
* Freezing temperatures
* Bioluminescent lifeforms
* Societies adapted to cold and darkness

### Midnight Twilight zone

* Terminator line where the sunlight transitions into the eternal night
* Template tempetures in the center
* Species motherland
* Peaceful and trading culture


The forum is the place where you can share your opinions on this cultures! Being criticizing the absurd biology of the terrible beasts from datumbira or saying how peacefull the midnight twilight zone is.  

---

## 🛠 Technologies Used

* HTML
* CSS
* JavaScript
* JSON Server (for RESTful API)
* Git & GitHub

---

## Installation

Follow these steps to run the project locally.
- This project can't be hosted, as no express or backend language is being used, to run it, it's necessary to do it locally

### Clone the Repository
In the terminal and run:
```bash
git clone https://github.com/SrLampi1001/historia_usuario_3_m3.git
```
Navigate into the project folder:
```bash
cd historia_usuario_3_m3/
```
---
### Install JSON Server
If you don’t have JSON Server installed, install it locally:
```bash
npm i json-server
```
Alternatively, you can install it globally:

```bash
npm i -g json-server
```
---

### Start the REST API

make sure you are inside the historia_usuario_3_m3/ folder, and run the following command:
```bash
json-server --watch db/db.json --port 3000
```
Alternatively, you can run the command:
```bash
npx json-server db/db.json
```
The API will be available at:

```
http://localhost:3000
```

endpoints:

```
http://localhost:3000/posts     #posts endpoint
http://localhost:3000/users     #users endpoint
```

---

### Run the Project

Open the `index.html` file in your browser using any live server. (else, neither the posting nor the session will work)  

If you're using VS Code, you can use the **Live Server** extension.

---
## Folder Structure
     HISTORIA_USUARIO_4_M3/
     ├── js/        #currently empty
     ├── index.html
     ├── forum.html
     ├── styles.css
     ├── forum.css
     └── README.md
     
## API Endpoints

| Method | Endpoint   | Description            |
| ------ | ---------- | ---------------------- |
| GET    | /posts     | Retrieve all posts     |
| GET    | /posts/:id | Retrieve a single post |
| POST   | /posts     | Create a new post      |
| PUT    | /posts/:id | Update a post          |
| DELETE | /posts/:id | Delete a post          |

---

## Features

* Create an account
* Create new forum posts
* View all posts
* Edit your existing posts
* Delete your posts
* Data persistence using JSON Server and Local Storage

---

## Future Improvements

* Comments on posts
* Categories based on planet hemisphere
* Dark/Bright side theme toggle
* Deployment to a hosting platform

---

## 📄 License

This project is for educational purposes.
