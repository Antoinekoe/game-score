# GameScore

[![GameScore](screenshot-git.png)]()

A web application for reviewing video games. Users can search for games using the IGDB API, add them to their personal collection, rate them, and write reviews. The app provides filtering options and a clean interface for tracking your gaming experiences. This is also fully responsive.

## ✨ Features

- **Game Search:** Search for games using the IGDB API integration.
- **Game Reviews:** Add personal ratings and comments for each game.
- **Filtering System:** Sort games by date added or rating.
- **Duplicate Prevention:** Prevents adding the same game multiple times.
- **Edit & Delete:** Modify or remove your game reviews.
- **Responsive Design:** Works on desktop and mobile devices.
- **PostgreSQL Database:** Persistent storage for all game data.

## 🛠️ Technologies Used

- **Backend:**
  - Node.js
  - Express
  - PostgreSQL
- **Frontend:**
  - EJS (templates)
  - HTML/CSS
  - JavaScript
- **External APIs:**
  - IGDB API (for game data)
- **Database:**
  - PostgreSQL
- **Other:**
  - Git for version control

## 🚀 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Antoinekoe/game-score
   cd gamescore
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up your PostgreSQL database:**

   - Create a database named `gamescore`.
   - Create a table named `noted_games` with the following structure:
     ```sql
     CREATE TABLE noted_games (
      id SERIAL PRIMARY KEY,
     game_name VARCHAR(100) NOT NULL,
     note INTEGER CONSTRAINT check_limit CHECK (note >= 0 AND note <=5),
     description VARCHAR(255),
     date_publication DATE,
     img VARCHAR(255),
     date_entry text
     );
     ```

4. **Configure your PostgreSQL password:**

   - In `index.js`, replace the value of `password` in the `pg.Client` config with your own PostgreSQL password:
     ```js
     password: "YOUR_PASSWORD_HERE";
     ```

5. **Set up IGDB API (Optional):**

   - The app uses a proxy server at `http://localhost:5000/api` for IGDB API calls
   - If you want to use your own IGDB API credentials, update the headers in `index.js`:
     ```js
     headers: {
       "Client-ID": "YOUR_CLIENT_ID",
       Authorization: "Bearer YOUR_ACCESS_TOKEN",
     }
     ```

6. **Start the server:**

   ```bash
   nodemon index.js
   ```

   The app will be available at `http://localhost:3000`.

7. **Start the proxy (optional):**

   ```bash
   nodemon proxy.js
   ```

   The proxy will be available at `http://localhost:5000/api`.

## 🗂️ Project Structure

```
GameScore/
├── public/               # Static files (CSS, images, etc.)
│   ├── img/              # Folder for favicon (optional)
│   └── style/            # CSS stylesheets
├── views/                # EJS templates
│   ├── partials/         # Reusable template components
│   ├── addGame.ejs       # Add new game form
│   ├── contact.ejs       # Contact page
│   ├── editGame.ejs      # Edit game review form
│   └── index.ejs         # Main page with game list
├── index.js              # Main server file
├── proxy.js              # IGDB API proxy server (if needed)
├── queries.sql           # Database queries and setup
├── package.json          # npm config file
├── package-lock.json     # npm lock file
├── LICENSE               # License file
├── screenshot-git.png    # Project screenshot
└── README.md             # This file
```

## 🎮 How to Use

1. **View Games:** The home page displays all your added games with ratings and comments.
2. **Search Games:** Use the search bar to find games from the IGDB database.
3. **Add Games:** Click on a search result to add it to your collection with a rating and review.
4. **Filter Games:** Use the filter buttons to sort games by different criteria.
5. **Edit Reviews:** Click the edit button to modify your ratings and comments.
6. **Delete Games:** Remove games from your collection using the delete button.

## 🤝 How to Contribute

Contributions are welcome!

1. **Fork the repository.**
2. **Create a branch for your feature or fix:**
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b bugfix/bug-fix
   ```
3. **Make your changes and commit with a clear message.**
4. **Push your branch to your fork:**
   ```bash
   git push origin feature/my-new-feature
   ```
5. **Create a pull request to the `main` branch of the original repository.**

## 🔧 Potential Improvements (TODO)

- Add user authentication and user-specific game collections.
- Implement game categories and tags.
- Add game completion status tracking.
- Create a wishlist feature for games to play.
- Add social features (share reviews, follow other users).
- Implement game recommendations based on ratings.
- Add export functionality for game collections.
- Improve the IGDB API integration with more game details.
- Add image upload for custom game covers.
- Implement a rating system with more granular options.

## 🔑 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
