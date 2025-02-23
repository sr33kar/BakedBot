# BakedBot
### Shopping App

The **Shopping App** is a React-based application designed to enhance the online shopping experience. It allows users to browse a list of products, select or deselect items, and view personalized recommendations. Key features include:

- **Product Browsing**: Displays a list of products with detailed information such as name, description, and price.
- **Product Selection**: Users can click on a product to select or deselect it. Selected products are visually highlighted for easy identification.
- **Smart Recommendations**:
  - Recommendations are powered by **sales data** and a **RAG (Retrieval-Augmented Generation)** model.
  - The RAG model enhances product descriptions and suggests relevant products to users while they shop, providing a personalized and engaging experience.
- **Loading State**: Shows a loading indicator while recommendations are being fetched, ensuring a smooth user experience.
- **Checkbox Integration**: Each product includes a checkbox that toggles when the product is clicked, making it easy to track selected items.

The app fetches data from a local API and leverages advanced AI techniques to deliver intelligent and context-aware recommendations. It’s ideal for showcasing React fundamentals, API integration, and the use of AI models to enhance user interactions.

## Project Structure
```
BakedBot/
│── backend/               # Express.js backend
│── shopping-app-frontend/ # React frontend
│── README.md              # Project documentation
```

## Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (version 16 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

### 1. Clone the Repository
```sh
git clone https://github.com/sr33kar/BakedBot.git
cd BakedBot
```

### 2. Set Up Backend
Navigate to the backend folder and install dependencies:
```sh
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend` folder and add the following:
```
GROQ_API_KEY=your_api_key_here
```
##### How to Get a GROQ API Key:
1. Visit [Groq API](https://groq.com/) and sign up.
2. Navigate to the API section and generate a new API key.
3. Copy the key and paste it into the `.env` file.

#### Customizing the Recommendation Model

The app uses a **Groq API** to generate recommendations. You can customize the model used for recommendations by modifying the `model` parameter in the following code snippet:

```javascript
const response = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant", // Change this to your preferred model
  messages: [
    { role: "system", content: "You are an AI that explains product recommendations based on user preferences and sales data." },
    { role: "user", content: `Recommend ${rec.name} to someone interested in ${product.name}, considering its recent sales trends. Keep it 2 lines and about the relation.` }
  ]
});
```
Run the backend server:
```sh
npm start
```
The backend should now be running on `http://localhost:3000` (or the port specified in `server.js`).

### 3. Set Up Frontend
Navigate to the frontend folder and install dependencies:
```sh
cd ../shopping-app-frontend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `shopping-app-frontend` folder and add:
```
REACT_APP_BACKEND_URL=http://localhost:3000
PORT=your_desired_port
```
> The `PORT` value can be set to any available port number.

Run the frontend application:
```sh
npm start
```
The frontend should now be running on `http://localhost:4000` (or the port specified in the `.env` file).

## Running the Full Application
After starting both backend and frontend, open your browser and go to:
```
http://localhost:4000
```
> Ensure the backend is running before starting the frontend.

## Troubleshooting
- If a port is already in use, change the `PORT` value in the respective `.env` file.
- Check `.env` files for correct API key and URLs.
- Ensure all dependencies are installed using `npm install` in both folders.

## License
This project is licensed under [MIT License](LICENSE).

---
Happy coding! 🚀
