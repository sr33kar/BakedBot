const express = require("express");
const { Groq } =  require("groq-sdk");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = 3000;

var cors = require('cors')

app.use(cors()) // Use this after the variable declaration

// Load JSON datasets
const products = JSON.parse(fs.readFileSync("products.json"));
const ingredients = JSON.parse(fs.readFileSync("ingredients.json"));
const sales = JSON.parse(fs.readFileSync("sales.json"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Compute Jaccard Similarity
const computeSimilarity = (product1, product2) => {
  const set1 = new Set([...product1.effects, ...product1.ingredients]);
  const set2 = new Set([...product2.effects, ...product2.ingredients]);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

// Compute Sales Score
const computeSalesScore = (productId) => {
  const productSales = sales.find(s => s.product_id === productId);
  if (!productSales) return 0;

  const totalSales = productSales.daily_sales.reduce((sum, record) => sum + record.units_sold, 0);
  const trend = productSales.daily_sales[3].units_sold - productSales.daily_sales[0].units_sold;
  return totalSales + trend; // Higher value = more popular
};

// Get Recommendations (No ChromaDB)
app.get("/recommendations/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Compute Similarity & Sales Score for all products
  let recommendations = products
    .filter(p => p.id !== productId)
    .map(p => ({
      ...p,
      similarity: computeSimilarity(product, p),
      salesScore: computeSalesScore(p.id)
    }));

  // Sort by Combined Score (Similarity + Sales Popularity)
  recommendations.sort((a, b) => (b.similarity + b.salesScore) - (a.similarity + a.salesScore));

  // Get Top 3 Recommendations
  recommendations = recommendations.slice(0, 3);

  // Generate AI-Augmented Recommendations
  const enhancedRecommendations = await Promise.all(recommendations.map(async (rec) => {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an AI that explains product recommendations based on user preferences and sales data." },
        { role: "user", content: `Recommend ${rec.name} to someone interested in ${product.name}, considering its recent sales trends. Keep it short to 1 line and no formating or text styles.` }
      ]
    });

    return {
      ...rec,
      enhanced_description: response.choices[0].message.content
    };
  }));

  res.json({ recommendations: enhancedRecommendations });
});

// Get Product Details with AI-Enhanced Description
app.get("/product/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Retrieve ingredient descriptions
  const ingredientMap = {};
  ingredients.forEach((ing) => {
    ingredientMap[ing.name] = ing.properties;
  });

  const enrichedDescription =
    product.description +
    " This product contains: " +
    product.ingredients.map((ing) => `${ing} - ${ingredientMap[ing] || "No details available"}`).join(", ");

  // Fetch sales data
  const productSales = sales.find((s) => s.product_id === productId);

  // Generate AI-Augmented Description
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an AI that enhances product descriptions based on sales trends and customer interest." },
      { role: "user", content: `Rewrite this product description: ${enrichedDescription}. Highlight why it's a popular choice.` }
    ]
  });

  res.json({
    ...product,
    enrichedDescription: response.choices[0].message.content,
    sales: productSales || {}
  });
});

// Get All Products
// Get All Products with AI-Enhanced Descriptions
app.get("/products", async (req, res) => {
  try {
    // Retrieve ingredient descriptions
    const ingredientMap = {};
    ingredients.forEach((ing) => {
      ingredientMap[ing.name] = ing.properties;
    });

    // Enhance descriptions for all products
    const enhancedProducts = await Promise.all(products.map(async (product) => {
      const enrichedDescription =
        product.description +
        " This product contains: " +
        product.ingredients.map((ing) => `${ing} - ${ingredientMap[ing] || "No details available"}`).join(", ");

      // Generate AI-Augmented Description
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are an AI that enhances product descriptions based on sales trends and customer interest." },
          { role: "user", content: `Rewrite this product description: ${enrichedDescription}. Highlight why it's a popular choice. Keep it short to 1 line and no formating or text styles.` }
        ]
      });

      return {
        ...product,
        enhanced_description: response.choices[0].message.content
      };
    }));

    res.json(enhancedProducts);
  } catch (error) {
    console.error("Error enhancing product descriptions:", error);
    res.status(500).json({ message: "Failed to enhance product descriptions" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
