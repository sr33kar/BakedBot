import React, { useState, useEffect } from "react";
import "./styles.css";

const API_URL = "http://localhost:3000/products";
const RECOMMENDATION_API = "http://localhost:3000/recommendations";

const ShoppingApp = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState({}); // New state to track selected products

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const fetchRecommendations = (productId) => {
    setIsLoading(true);
    fetch(`${RECOMMENDATION_API}/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data.recommendations);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching recommendations:", err);
        setIsLoading(false);
      });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    fetchRecommendations(product.id);
  };

  // Toggle checkbox for a product
  const toggleProductSelection = (productId) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = !prevSelected[productId];
      if (selectedProduct && selectedProduct.id === productId && !isSelected) {
        setSelectedProduct(null); // Clear the selected product
        setRecommendations([]); // Clear the recommendations
      }

      return {
        ...prevSelected,
        [productId]: isSelected, // Update the selection state
      };
    });
  };

  return (
    <div className="container">
      <h1>Shopping App</h1>
      <div className="products">
        {products.map((product) => (
          <div
            key={product.id}
            className={`product-card ${selectedProducts[product.id] ? "selected" : ""}`}
            onClick={() => {
              toggleProductSelection(product.id);
              if (!selectedProducts[product.id]) {
                handleSelectProduct(product); // Fetch recommendations if the product is being selected
              }
            }}
          >
            <input
              type="checkbox"
              checked={!!selectedProducts[product.id]}
              onChange={() => toggleProductSelection(product.id)} // Handle checkbox change
              onClick={(e) => e.stopPropagation()}
            />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      {selectedProduct && (
        <div className="recommendations">
          <h2>Recommended Products for {selectedProduct.name}</h2>
          {isLoading ? (
            <p>Loading recommendations...</p>
          ) : recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-card">
                <h3>{rec.name}</h3>
                <p>{rec.enhanced_description}</p>
                <p><strong>Price:</strong> ${rec.price.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p>No recommendations available.</p>
          )}
        </div>
      )}
      <button>Buy</button>
    </div>
  );
};

export default ShoppingApp;