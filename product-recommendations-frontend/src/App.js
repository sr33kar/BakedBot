import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [products, setProducts] = useState([]); // All products
  const [selectedProducts, setSelectedProducts] = useState({}); // Selected product checkboxes
  const [recommendations, setRecommendations] = useState({}); // Store recommendations per product

  // Fetch all products from backend
  useEffect(() => {
    axios.get("http://localhost:3000/products") // Backend should return all products
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Handle product checkbox selection
  const handleProductSelect = async (productId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));

    // Fetch recommendations when a product is selected
    if (!selectedProducts[productId]) {
      try {
        const res = await axios.get(`http://localhost:3000/recommendations/${productId}`);
        setRecommendations((prev) => ({
          ...prev,
          [productId]: res.data.recommendations,
        }));
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    } else {
      // If unselected, remove recommendations
      setRecommendations((prev) => {
        const newRecs = { ...prev };
        delete newRecs[productId];
        return newRecs;
      });
    }
  };

  return (
    <div className="container">
      <h1>Product Recommendations</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <label>
              <input
                type="checkbox"
                checked={!!selectedProducts[product.id]}
                onChange={() => handleProductSelect(product.id)}
              />
              {product.name}
            </label>

            {/* Show Recommendations if product is selected */}
            {selectedProducts[product.id] && recommendations[product.id] && (
              <ul>
                {recommendations[product.id].map((rec) => (
                  <li key={rec.id}>
                    <label>
                      <input type="checkbox" />
                      {rec.name} - {rec.enhanced_description}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
