import { formatDate, formatPrice } from "../../lib/utils.js";
import { Order } from "../../types/entityTypes";

const getInfoTemplate = (data: {
  message: string;
  image?: string;
  title?: string;
}) => {
  const { message, image, title = "Information" } = data;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    /* Reset styles for email clients */
    body, p, h1, h2, h3, h4, h5, h6, table, td, th {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    }
    
    body {
      background-color: #f8f9fa;
      color: #333333;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: white;
    }
    
    .content-wrapper {
      padding: 0 30px;
    }
    
    .order-info {
      padding: 30px 0;
      text-align: center;
      border-bottom: 1px solid #eeeeee;
    }
    
    .order-status {
      display: inline-block;
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 6px 15px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .order-info h2 {
      color: #333333;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .order-info p {
      color: #666666;
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .order-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    
    .order-meta-item {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 12px 18px;
      margin: 5px;
      min-width: 100px;
      text-align: center;
    }
    
    .order-meta-item strong {
      display: block;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .order-meta-item span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .button {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin-top: 20px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
      box-shadow: 0 4px 10px rgba(37, 117, 252, 0.2);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 117, 252, 0.3);
    }
    
    .delivery-info {
      display: flex;
      margin: 25px 0;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .delivery-status {
      flex: 1;
      padding: 15px;
    }
    
    .delivery-timeline {
      display: flex;
      margin-top: 15px;
      position: relative;
    }
    
    .delivery-timeline:before {
      content: '';
      position: absolute;
      top: 15px;
      left: 30px;
      right: 30px;
      height: 3px;
      background-color: #e0e0e0;
      z-index: 1;
    }
    
    .timeline-step {
      flex: 1;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    
    .step-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 8px;
    }
    
    .step-active .step-icon {
      background-color: #2575fc;
    }
    
    .step-complete .step-icon {
      background-color: #4CAF50;
    }
    
    .step-label {
      font-size: 12px;
      color: #666;
      display: block;
    }
    
    .step-active .step-label {
      color: #2575fc;
      font-weight: 600;
    }
    
    .step-complete .step-label {
      color: #4CAF50;
      font-weight: 600;
    }
    
    .order-details {
      padding: 30px 0;
    }
    
    .section-title {
      color: #333333;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
      font-weight: 600;
      position: relative;
    }
    
    .section-title:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%);
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    
    .items-table th {
      background-color: #f8f9fa;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      border-bottom: 1px solid #eeeeee;
      color: #666;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .items-table .item-image {
      width: 60px;
    }
    
    .items-table .item-image img {
      max-width: 50px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .product-name {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    
    .product-variant {
      font-size: 13px;
      color: #777;
    }
    
    .product-price {
      font-weight: 600;
      color: #333;
    }
    
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .summary-table td {
      padding: 12px 15px;
    }
    
    .summary-table .total-row {
      font-weight: bold;
      border-top: 2px solid #eeeeee;
      background-color: #eff6ff;
    }
    
    .summary-table .total-row td {
      padding: 15px;
      font-size: 16px;
      color: #2575fc;
    }
    
    .address-section {
      padding: 30px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .address-box {
      flex: 1;
      min-width: 200px;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .address-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
      display: flex;
      align-items: center;
    }
    
    .address-icon {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      background-color: #2575fc;
      color: white;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    
    .address-box p {
      margin-bottom: 4px;
      color: #666;
      font-size: 14px;
    }
    
    .payment-info {
      padding: 0 0 30px 0;
    }
    
    .payment-method {
      display: flex;
      align-items: center;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .payment-icon {
      width: 40px;
      height: 25px;
      background-color: #eee;
      border-radius: 4px;
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .recommendations {
      padding: 30px 0;
      border-top: 1px solid #eee;
    }
    
    .products-grid {
      display: flex;
      gap: 15px;
      overflow-x: auto;
      padding-bottom: 15px;
    }
    
    .product-card {
      min-width: 140px;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
    }
    
    .product-card img {
      width: 100%;
      height: 100px;
      object-fit: cover;
    }
    
    .product-card-info {
      padding: 10px;
    }
    
    .product-card-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-card-price {
      font-size: 14px;
      font-weight: 600;
      color: #2575fc;
    }
    
    .help-section {
      background-color: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .help-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .help-item {
      flex: 1;
      min-width: 150px;
      padding: 15px 10px;
      text-align: center;
      background-color: white;
      border-radius: 6px;
      text-decoration: none;
      color: #555;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .help-icon {
      display: block;
      width: 30px;
      height: 30px;
      background-color: #e3f2fd;
      border-radius: 50%;
      margin: 0 auto 8px;
      text-align: center;
      line-height: 30px;
      color: #2575fc;
    }
    
    .footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 30px;
      color: #777;
      font-size: 13px;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-links {
      margin: 15px 0;
    }
    
    .footer-links a {
      color: #666;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 500;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: #eee;
      border-radius: 50%;
      margin: 0 5px;
      color: #555;
      line-height: 36px;
      text-align: center;
      text-decoration: none;
    }
    
    .download-app {
      margin: 20px 0;
    }
    
    .app-button {
      display: inline-block;
      margin: 0 5px;
      background-color: #333;
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      text-align: left;
      min-width: 120px;
    }
    
    .app-button small {
      display: block;
      font-size: 10px;
      opacity: 0.8;
    }
    
    .app-button strong {
      font-size: 14px;
    }
    
    /* Promotions */
    .promo-banner {
      background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
      color: white;
    }
    
    .promo-code {
      display: inline-block;
      background-color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 600;
      color: #333;
      margin: 10px 0;
      letter-spacing: 1px;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 480px) {
      .content-wrapper {
        padding: 0 15px;
      }
      
      .order-meta {
        flex-direction: column;
      }
      
      .order-meta-item {
        width: 100%;
        margin: 5px 0;
      }
      
      .items-table th, .items-table td {
        padding: 10px 5px;
        font-size: 13px;
      }
      
      .items-table .item-image {
        width: 40px;
      }
      
      .items-table .item-image img {
        max-width: 35px;
      }
      
      .address-section {
        flex-direction: column;
      }
      
      .timeline-step .step-label {
        font-size: 10px;
      }
      
      .help-item {
        min-width: calc(50% - 10px);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://via.placeholder.com/180x50" alt="Company Logo" class="logo">
      <h1>Order Confirmation</h1>
    </div>
    
    <div class="content-wrapper">
      <div class="order-info">
        <span class="order-status">Order Confirmed</span>
        <h2>Thank You for Your Purchase!</h2>
        <p>Your order has been confirmed and is now being processed.</p>
        
        <div class="order-meta">
          <div class="order-meta-item">
            <strong>Order ID</strong>
            <span>ORD-12345678</span>
          </div>
          <div class="order-meta-item">
            <strong>Order Date</strong>
            <span>May 4, 2025</span>
          </div>
          <div class="order-meta-item">
            <strong>Payment</strong>
            <span>Completed</span>
          </div>
        </div>
        
        <a href="#" class="button">Track Your Order</a>
      </div>
      
      <div class="delivery-info">
        <div class="delivery-status">
          <h3 class="section-title">Estimated Delivery</h3>
          <p><strong>May 8 - May 10, 2025</strong></p>
          
          <div class="delivery-timeline">
            <div class="timeline-step step-complete">
              <div class="step-icon">✓</div>
              <span class="step-label">Confirmed</span>
            </div>
            <div class="timeline-step step-active">
              <div class="step-icon">●</div>
              <span class="step-label">Processing</span>
            </div>
            <div class="timeline-step">
              <div class="step-icon">●</div>
              <span class="step-label">Shipped</span>
            </div>
            <div class="timeline-step">
              <div class="step-icon">●</div>
              <span class="step-label">Delivered</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-details">
        <h3 class="section-title">Order Details</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-image"></th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 1"></td>
              <td>
                <span class="product-name">Premium Wireless Headphones</span>
                <span class="product-variant">Color: Black | Model: XY-200</span>
              </td>
              <td>1</td>
              <td class="product-price">$129.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 2"></td>
              <td>
                <span class="product-name">Smartphone Fast Charger</span>
                <span class="product-variant">20W | Type-C | White</span>
              </td>
              <td>2</td>
              <td class="product-price">$24.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 3"></td>
              <td>
                <span class="product-name">Protective Phone Case</span>
                <span class="product-variant">iPhone 14 Pro | Clear</span>
              </td>
              <td>1</td>
              <td class="product-price">$19.99</td>
            </tr>
          </tbody>
        </table>
        
        <table class="summary-table">
          <tr>
            <td style="width: 70%; text-align: right;">Subtotal:</td>
            <td style="width: 30%; text-align: right;">$199.96</td>
          </tr>
          <tr>
            <td style="text-align: right;">Shipping:</td>
            <td style="text-align: right;">$5.99</td>
          </tr>
          <tr>
            <td style="text-align: right;">Tax:</td>
            <td style="text-align: right;">$16.00</td>
          </tr>
          <tr class="total-row">
            <td style="text-align: right;">Total:</td>
            <td style="text-align: right;">$221.95</td>
          </tr>
        </table>
      </div>
      
      <div class="address-section">
        <div class="address-box">
          <div class="address-title">
            <span class="address-icon">✓</span>
            Shipping Address
          </div>
          <p><strong>John Doe</strong></p>
          <p>123 Main Street</p>
          <p>Apt 4B</p>
          <p>New York, NY 10001</p>
          <p>United States</p>
        </div>
        
        <div class="address-box">
          <div class="address-title">
            <span class="address-icon">✓</span>
            Billing Address
          </div>
          <p><strong>John Doe</strong></p>
          <p>123 Main Street</p>
          <p>Apt 4B</p>
          <p>New York, NY 10001</p>
          <p>United States</p>
        </div>
      </div>
      
      <div class="payment-info">
        <h3 class="section-title">Payment Information</h3>
        <div class="payment-method">
          <div class="payment-icon">
            <span>VISA</span>
          </div>
          <div>
            <div><strong>Visa</strong> ending in ****1234</div>
            <div style="font-size: 13px; color: #666;">Expiry: 09/27</div>
          </div>
        </div>
      </div>
      
      <div class="promo-banner">
        <h3>THANK YOU FOR YOUR PURCHASE!</h3>
        <p>Enjoy 15% off your next order with code:</p>
        <div class="promo-code">WELCOME15</div>
        <p>Valid for 30 days. Minimum purchase $50.</p>
      </div>
      
      <div class="recommendations">
        <h3 class="section-title">You May Also Like</h3>
        <div class="products-grid">
          <a href="#" class="product-card">
            <img src="https://via.placeholder.com/140x100" alt="Product">
            <div class="product-card-info">
              <div class="product-card-name">Bluetooth Earbuds Pro</div>
              <div class="product-card-price">$89.99</div>
            </div>
          </a>
          <a href="#" class="product-card">
            <img src="https://via.placeholder.com/140x100" alt="Product">
            <div class="product-card-info">
              <div class="product-card-name">Wireless Charging Pad</div>
              <div class="product-card-price">$34.99</div>
            </div>
          </a>
          <a href="#" class="product-card">
            <img src="https://via.placeholder.com/140x100" alt="Product">
            <div class="product-card-info">
              <div class="product-card-name">HD Webcam 1080p</div>
              <div class="product-card-price">$59.99</div>
            </div>
          </a>
        </div>
      </div>
      
      <div class="help-section">
        <h3 class="section-title">Need Help?</h3>
        <div class="help-grid">
          <a href="#" class="help-item">
            <span class="help-icon">?</span>
            Return Policy
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">↺</span>
            Exchange Item
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">📦</span>
            Track Order
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✉</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">f</a>
        <a href="#" class="social-link">t</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">ig</a>
      </div>
      
      <div class="download-app">
        <a href="#" class="app-button">
          <small>Download on the</small>
          <strong>App Store</strong>
        </a>
        <a href="#" class="app-button">
          <small>Get it on</small>
          <strong>Google Play</strong>
        </a>
      </div>
      
      <p>If you have any questions about your order, please contact our customer service team at <a href="mailto:support@example.com">support@example.com</a> or call us at <strong>(555) 123-4567</strong>.</p>
      
      <div class="footer-links">
        <a href="#">My Account</a>
        <a href="#">FAQs</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Unsubscribe</a>
      </div>
      
      <p>&copy; 2025 Your Company. All rights reserved.</p>
      <p>123 E-Commerce St, Suite 100, San Francisco, CA 94103</p>
    </div>
  </div>
</body>
</html>
`;
};

const getOrderCancelledTemplate = (data: {
  message: string;
  image?: string;
  title?: string;
}) => {
  const { message, image, title = "Order Confirmation" } = data;
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancellation</title>
  <style>
    /* Reset styles for email clients */
    body, p, h1, h2, h3, h4, h5, h6, table, td, th {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    }
    
    body {
      background-color: #f8f9fa;
      color: #333333;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: white;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: white;
    }
    
    .content-wrapper {
      padding: 0 30px;
    }
    
    .order-info {
      padding: 30px 0;
      text-align: center;
      border-bottom: 1px solid #eeeeee;
    }
    
    .order-status {
      display: inline-block;
      background-color: #ffebee;
      color: #d32f2f;
      padding: 6px 15px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .order-info h2 {
      color: #333333;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .order-info p {
      color: #666666;
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .order-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    
    .order-meta-item {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 12px 18px;
      margin: 5px;
      min-width: 100px;
      text-align: center;
    }
    
    .order-meta-item strong {
      display: block;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .order-meta-item span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .button {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin-top: 20px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
      box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(255, 107, 107, 0.3);
    }
    
    .order-details {
      padding: 30px 0;
    }
    
    .section-title {
      color: #333333;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
      font-weight: 600;
      position: relative;
    }
    
    .section-title:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%);
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    
    .items-table th {
      background-color: #f8f9fa;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      border-bottom: 1px solid #eeeeee;
      color: #666;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .items-table .item-image {
      width: 60px;
    }
    
    .items-table .item-image img {
      max-width: 50px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .product-name {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    
    .product-variant {
      font-size: 13px;
      color: #777;
    }
    
    .product-price {
      font-weight: 600;
      color: #333;
    }
    
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .summary-table td {
      padding: 12px 15px;
    }
    
    .summary-table .total-row {
      font-weight: bold;
      border-top: 2px solid #eeeeee;
      background-color: #ffebee;
    }
    
    .summary-table .total-row td {
      padding: 15px;
      font-size: 16px;
      color: #d32f2f;
    }
    
    .refund-info {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #ff6b6b;
    }
    
    .refund-info h4 {
      color: #d32f2f;
      margin-bottom: 10px;
    }
    
    .help-section {
      background-color: #fff5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .help-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .help-item {
      flex: 1;
      min-width: 150px;
      padding: 15px 10px;
      text-align: center;
      background-color: white;
      border-radius: 6px;
      text-decoration: none;
      color: #555;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .help-icon {
      display: block;
      width: 30px;
      height: 30px;
      background-color: #ffebee;
      border-radius: 50%;
      margin: 0 auto 8px;
      text-align: center;
      line-height: 30px;
      color: #d32f2f;
    }
    
    .footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 30px;
      color: #777;
      font-size: 13px;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-links {
      margin: 15px 0;
    }
    
    .footer-links a {
      color: #666;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 500;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: #eee;
      border-radius: 50%;
      margin: 0 5px;
      color: #555;
      line-height: 36px;
      text-align: center;
      text-decoration: none;
    }
    
    .download-app {
      margin: 20px 0;
    }
    
    .app-button {
      display: inline-block;
      margin: 0 5px;
      background-color: #333;
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      text-align: left;
      min-width: 120px;
    }
    
    .app-button small {
      display: block;
      font-size: 10px;
      opacity: 0.8;
    }
    
    .app-button strong {
      font-size: 14px;
    }
    
    /* Promotions */
    .promo-banner {
      background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
      color: white;
    }
    
    .promo-code {
      display: inline-block;
      background-color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 600;
      color: #333;
      margin: 10px 0;
      letter-spacing: 1px;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 480px) {
      .content-wrapper {
        padding: 0 15px;
      }
      
      .order-meta {
        flex-direction: column;
      }
      
      .order-meta-item {
        width: 100%;
        margin: 5px 0;
      }
      
      .items-table th, .items-table td {
        padding: 10px 5px;
        font-size: 13px;
      }
      
      .items-table .item-image {
        width: 40px;
      }
      
      .items-table .item-image img {
        max-width: 35px;
      }
      
      .help-item {
        min-width: calc(50% - 10px);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://via.placeholder.com/180x50" alt="Company Logo" class="logo">
      <h1 style="font-size:40px">Order Cancelled</h1>
    </div>
    
    <div class="content-wrapper">
      <div class="order-info">
        <span class="order-status">Order Cancelled</span>
        <h2>Your Order Has Been Cancelled</h2>
        <p>We've processed your cancellation request for the following order.</p>
        
        <div class="order-meta">
          <div class="order-meta-item">
            <strong>Order ID</strong>
            <span>ORD-12345678</span>
          </div>
          <div class="order-meta-item">
            <strong>Order Date</strong>
            <span>May 4, 2025</span>
          </div>
          <div class="order-meta-item">
            <strong>Cancelled On</strong>
            <span>May 5, 2025</span>
          </div>
        </div>
        
        <a href="#" class="button">View Order Details</a>
      </div>
      
      <div class="refund-info">
        <h4>Refund Information</h4>
        <p>A refund of <strong>$221.95</strong> has been initiated to your original payment method. Please allow 5-10 business days for the refund to appear in your account.</p>
      </div>
      
      <div class="order-details">
        <h3 class="section-title">Cancelled Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-image"></th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 1"></td>
              <td>
                <span class="product-name">Premium Wireless Headphones</span>
                <span class="product-variant">Color: Black | Model: XY-200</span>
              </td>
              <td>1</td>
              <td class="product-price">$129.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 2"></td>
              <td>
                <span class="product-name">Smartphone Fast Charger</span>
                <span class="product-variant">20W | Type-C | White</span>
              </td>
              <td>2</td>
              <td class="product-price">$24.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 3"></td>
              <td>
                <span class="product-name">Protective Phone Case</span>
                <span class="product-variant">iPhone 14 Pro | Clear</span>
              </td>
              <td>1</td>
              <td class="product-price">$19.99</td>
            </tr>
          </tbody>
        </table>
        
        <table class="summary-table">
          <tr>
            <td style="width: 70%; text-align: start;">Subtotal:</td>
            <td style="width: 30%; text-align: right;">$199.96</td>
          </tr>
          <tr>
            <td style="text-align: start;">Shipping:</td>
            <td style="text-align: right;">$5.99</td>
          </tr>
          <tr>
            <td style="text-align: start;">Tax:</td>
            <td style="text-align: right;">$16.00</td>
          </tr>
          <tr class="total-row">
            <td style="text-align: start;">Refund Total:</td>
            <td style="text-align: right;">$221.95</td>
          </tr>
        </table>
      </div>
      
      <div class="promo-banner">
        <h3>WE'RE SORRY TO SEE YOU GO!</h3>
        <p>We'd love to have you back. Enjoy 20% off your next order with code:</p>
        <div class="promo-code">COMEBACK20</div>
        <p>Valid for 60 days. Minimum purchase $50.</p>
      </div>
      
      <div class="help-section">
        <h3 class="section-title">Need Help?</h3>
        <div class="help-grid">
          <a href="#" class="help-item">
            <span class="help-icon">?</span>
            Cancellation Policy
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">↺</span>
            Reorder Items
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">$</span>
            Refund Status
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✉</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">f</a>
        <a href="#" class="social-link">t</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">ig</a>
      </div>
      
      <div class="download-app">
        <a href="#" class="app-button">
          <small>Download on the</small>
          <strong>App Store</strong>
        </a>
        <a href="#" class="app-button">
          <small>Get it on</small>
          <strong>Google Play</strong>
        </a>
      </div>
      
      <p>If you have any questions about your cancellation, please contact our customer service team at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a> or call us at <strong>(555) 123-4567</strong>.</p>
      
      <div class="footer-links">
        <a href="#">My Account</a>
        <a href="#">FAQs</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Unsubscribe</a>
      </div>
      
      <p>&copy; 2025 Your Company. All rights reserved.</p>
      <p>123 E-Commerce St, Suite 100, San Francisco, CA 94103</p>
    </div>
  </div>
</body>
</html>
    `;
};

const getOrdderConfirmTemplate = (data: Order) => {
  return `
    
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    /* Reset styles for email clients */
    body, p, h1, h2, h3, h4, h5, h6, table, td, th {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    }
    
    body {
      background-color: #f8f9fa;
      color: #333333;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: white;
    }
    
    .content-wrapper {
      padding: 0 30px;
    }
    
    .order-info {
      padding: 30px 0;
      text-align: center;
      border-bottom: 1px solid #eeeeee;
    }
    
    .order-status {
      display: inline-block;
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 6px 15px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .order-info h2 {
      color: #333333;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .order-info p {
      color: #666666;
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .order-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    
    .order-meta-item {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 12px 18px;
      margin: 5px;
      min-width: 100px;
      text-align: center;
    }
    
    .order-meta-item strong {
      display: block;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .order-meta-item span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .button {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin-top: 20px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
      box-shadow: 0 4px 10px rgba(37, 117, 252, 0.2);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(37, 117, 252, 0.3);
    }
    
    .delivery-info {
      display: flex;
      margin: 25px 0;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .delivery-status {
      flex: 1;
      padding: 15px;
    }
    
    .delivery-timeline {
      display: flex;
      margin-top: 15px;
      position: relative;
    }
    
    .delivery-timeline:before {
      content: '';
      position: absolute;
      top: 15px;
      left: 30px;
      right: 30px;
      height: 3px;
      background-color: #e0e0e0;
      z-index: 1;
    }
    
    .timeline-step {
      flex: 1;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    
    .step-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 8px;
    }
    
    .step-active .step-icon {
      background-color: #2575fc;
    }
    
    .step-complete .step-icon {
      background-color: #4CAF50;
    }
    
    .step-label {
      font-size: 12px;
      color: #666;
      display: block;
    }
    
    .step-active .step-label {
      color: #2575fc;
      font-weight: 600;
    }
    
    .step-complete .step-label {
      color: #4CAF50;
      font-weight: 600;
    }
    
    .order-details {
      padding: 30px 0;
    }
    
    .section-title {
      color: #333333;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
      font-weight: 600;
      position: relative;
    }
    
    .section-title:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%);
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    
    .items-table th {
      background-color: #f8f9fa;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      border-bottom: 1px solid #eeeeee;
      color: #666;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .items-table .item-image {
      width: 60px;
    }
    
    .items-table .item-image img {
      max-width: 50px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .product-name {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    
    .product-variant {
      font-size: 13px;
      color: #777;
    }
    
    .product-price {
      font-weight: 600;
      color: #333;
    }
    
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .summary-table td {
      padding: 12px 15px;
    }
    
    .summary-table .total-row {
      font-weight: bold;
      border-top: 2px solid #eeeeee;
      background-color: #eff6ff;
    }
    
    .summary-table .total-row td {
      padding: 15px;
      font-size: 16px;
      color: #2575fc;
    }
    
    .address-section {
      padding: 30px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .address-box {
      flex: 1;
      min-width: 200px;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .address-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
      display: flex;
      align-items: center;
    }
    
    .address-icon {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      background-color: #2575fc;
      color: white;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    
    .address-box p {
      margin-bottom: 4px;
      color: #666;
      font-size: 14px;
    }
    
    .payment-info {
      padding: 0 0 30px 0;
    }
    
    .payment-method {
      display: flex;
      align-items: center;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .payment-icon {
      width: 40px;
      height: 25px;
      background-color: #eee;
      border-radius: 4px;
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .recommendations {
      padding: 30px 0;
      border-top: 1px solid #eee;
    }
    
    .products-grid {
      display: flex;
      gap: 15px;
      overflow-x: auto;
      padding-bottom: 15px;
    }
    
    .product-card {
      min-width: 140px;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
    }
    
    .product-card img {
      width: 100%;
      height: 100px;
      object-fit: cover;
    }
    
    .product-card-info {
      padding: 10px;
    }
    
    .product-card-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-card-price {
      font-size: 14px;
      font-weight: 600;
      color: #2575fc;
    }
    
    .help-section {
      background-color: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .help-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .help-item {
      flex: 1;
      min-width: 150px;
      padding: 15px 10px;
      text-align: center;
      background-color: white;
      border-radius: 6px;
      text-decoration: none;
      color: #555;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .help-icon {
      display: block;
      width: 30px;
      height: 30px;
      background-color: #e3f2fd;
      border-radius: 50%;
      margin: 0 auto 8px;
      text-align: center;
      line-height: 30px;
      color: #2575fc;
    }
    
    .footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 30px;
      color: #777;
      font-size: 13px;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-links {
      margin: 15px 0;
    }
    
    .footer-links a {
      color: #666;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 500;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: #eee;
      border-radius: 50%;
      margin: 0 5px;
      color: #555;
      line-height: 36px;
      text-align: center;
      text-decoration: none;
    }
    
    .download-app {
      margin: 20px 0;
    }
    
    .app-button {
      display: inline-block;
      margin: 0 5px;
      background-color: #333;
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      text-align: left;
      min-width: 120px;
    }
    
    .app-button small {
      display: block;
      font-size: 10px;
      opacity: 0.8;
    }
    
    .app-button strong {
      font-size: 14px;
    }
    
    /* Promotions */
    .promo-banner {
      background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
      color: white;
    }
    
    .promo-code {
      display: inline-block;
      background-color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 600;
      color: #333;
      margin: 10px 0;
      letter-spacing: 1px;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 480px) {
      .content-wrapper {
        padding: 0 15px;
      }
      
      .order-meta {
        flex-direction: column;
      }
      
      .order-meta-item {
        width: 100%;
        margin: 5px 0;
      }
      
      .items-table th, .items-table td {
        padding: 10px 5px;
        font-size: 13px;
      }
      
      .items-table .item-image {
        width: 40px;
      }
      
      .items-table .item-image img {
        max-width: 35px;
      }
      
      .address-section {
        flex-direction: column;
      }
      
      .timeline-step .step-label {
        font-size: 10px;
      }
      
      .help-item {
        min-width: calc(50% - 10px);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dpudz7cci/image/upload/v1743888257/g7wjckwmdx67y6fd9edp.png" alt="Electrohub Logo" class="logo">
      <h1 style="font-size:40px " >Order Placed</h1>
    </div>
    
    <div class="content-wrapper">
      <div class="order-info">
        <span class="order-status">Order Confirmed</span>
        <h2>Thank You for Your Purchase!</h2>
        <p>Your order has been confirmed and is now being processed.</p>
        
        <div class="order-meta">
          <div class="order-meta-item">
            <strong>Order ID</strong>
            <span>ORD-${data.id}</span>
          </div>
          <div class="order-meta-item">
            <strong>Order Date</strong>
            <span>${formatDate(data.createdAt)}</span>
          </div>
          <div class="order-meta-item">
            <strong>Payment</strong>
            <span>Completed</span>
          </div>
        </div>
        
        <a href="${process.env.FRONTEND_URL}/user/orders/${
    data.orderItems[0].id
  }" class="button">Track Your Order</a>
      </div>
      <div class="order-details">
        <h3 class="section-title">Order Details</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-image"></th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
          ${data.orderItems.map((orderItem) => {
            return ` 
            <tr>
              <td class="item-image">
              <img src="${orderItem.product.images[0].url}" alt="${
              orderItem.product.name
            }"></td>
              <td>
                <span class="product-name">${orderItem.product.name}</span>
                <span class="product-variant">${
                  orderItem.product.description
                }</span>
              </td>
              <td>${orderItem.quantity}</td>
              <td class="product-price">₹${formatPrice(
                orderItem.product.price * 1 -
                  (orderItem.product.offerPercentage / 100) *
                    orderItem.product.price
              )}</td>
            </tr>`;
          })}
          </tbody>
        </table>
        
        <table class="summary-table">
          <tr>
            <td style="width: 70%; text-align: start;">Subtotal:</td>
            <td style="width: 30%; text-align: right;">₹${formatPrice(
              data.total
            )}</td>
          </tr>
          <tr>
            <td style="text-align: start;">Shipping:</td>
            <td style="text-align: right;">Free</td>
          </tr>
          <tr class="total-row">
            <td style="text-align: start;">Total:</td>
            <td style="text-align: right;">₹${formatPrice(data.total)}</td>
          </tr>
        </table>
      </div>
      
      <div class="address-section">
        <div class="address-box">
          <div class="address-title">
            <span class="address-icon">✓</span>
            Shipping Address
          </div>
          <p><strong>${data.user.name}</strong></p>
          <p>${data.user.address}</p>
        </div>
      </div>
      
      <div class="promo-banner">
        <h3>THANK YOU FOR YOUR PURCHASE!</h3>
        <p>Enjoy 15% off your next order with code:</p>
        <div class="promo-code">WELCOME15</div>
        <p>Valid for 30 days. Minimum purchase $50.</p>
      </div>
      
      <div class="help-section">
        <h3 class="section-title">Need Help?</h3>
        <div class="help-grid">
          <a href="#" class="help-item">
            <span class="help-icon">?</span>
            Return Policy
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">↺</span>
            Exchange Item
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">📦</span>
            Track Order
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✉</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">f</a>
        <a href="#" class="social-link">t</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">ig</a>
      </div>
      
      <div class="download-app">
        <a href="#" class="app-button">
          <small>Download on the</small>
          <strong>App Store</strong>
        </a>
        <a href="#" class="app-button">
          <small>Get it on</small>
          <strong>Google Play</strong>
        </a>
      </div>
      
      <p>If you have any questions about your order, please contact our customer service team at <a href="mailto:support@example.com">support@example.com</a> or call us at <strong>(555) 123-4567</strong>.</p>
      
      <div class="footer-links">
        <a href="#">My Account</a>
        <a href="#">FAQs</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Unsubscribe</a>
      </div>
      
      <p>&copy; 2025 Your Company. All rights reserved.</p>
      <p>123 E-Commerce St, Suite 100, San Francisco, CA 94103</p>
    </div>
  </div>
</body>
</html>
`;
};

const getOrderDeliveredTemplate = (data: {
  message: string;
  image: string;
  title?: string;
}) => {
  const { message, image, title = "Order Delivered" } = data;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered</title>
  <style>
    /* Reset styles for email clients */
    body, p, h1, h2, h3, h4, h5, h6, table, td, th {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    }
    
    body {
      background-color: #f8f9fa;
      color: #333333;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #00BCD4 0%, #3F51B5 100%);
      color: white;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: white;
    }
    
    .content-wrapper {
      padding: 0 30px;
    }
    
    .order-info {
      padding: 30px 0;
      text-align: center;
      border-bottom: 1px solid #eeeeee;
    }
    
    .order-status {
      display: inline-block;
      background-color: #e1f5fe;
      color: #0277bd;
      padding: 6px 15px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .order-info h2 {
      color: #333333;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .order-info p {
      color: #666666;
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .order-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    
    .order-meta-item {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 12px 18px;
      margin: 5px;
      min-width: 100px;
      text-align: center;
    }
    
    .order-meta-item strong {
      display: block;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .order-meta-item span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .button {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #00BCD4 0%, #3F51B5 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin-top: 20px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
      box-shadow: 0 4px 10px rgba(0, 188, 212, 0.2);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 188, 212, 0.3);
    }
    
    .delivery-info {
      display: flex;
      margin: 25px 0;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .delivery-status {
      flex: 1;
      padding: 15px;
    }
    
    .delivery-timeline {
      display: flex;
      margin-top: 15px;
      position: relative;
    }
    
    .delivery-timeline:before {
      content: '';
      position: absolute;
      top: 15px;
      left: 30px;
      right: 30px;
      height: 3px;
      background-color: #e0e0e0;
      z-index: 1;
    }
    
    .timeline-step {
      flex: 1;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    
    .step-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 8px;
    }
    
    .step-active .step-icon {
      background-color: #00BCD4;
    }
    
    .step-complete .step-icon {
      background-color: #00BCD4;
    }
    
    .step-label {
      font-size: 12px;
      color: #666;
      display: block;
    }
    
    .step-active .step-label {
      color: #00BCD4;
      font-weight: 600;
    }
    
    .step-complete .step-label {
      color: #00BCD4;
      font-weight: 600;
    }
    
    .delivery-confirmation {
      background-color: #e1f5fe;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      border-left: 4px solid #00BCD4;
    }
    
    .delivery-date {
      font-size: 18px;
      font-weight: 600;
      color: #0277bd;
      margin: 10px 0;
    }
    
    .order-details {
      padding: 30px 0;
    }
    
    .section-title {
      color: #333333;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
      font-weight: 600;
      position: relative;
    }
    
    .section-title:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #00BCD4 0%, #3F51B5 100%);
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    
    .items-table th {
      background-color: #f8f9fa;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      border-bottom: 1px solid #eeeeee;
      color: #666;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .items-table .item-image {
      width: 60px;
    }
    
    .items-table .item-image img {
      max-width: 50px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .product-name {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    
    .product-variant {
      font-size: 13px;
      color: #777;
    }
    
    .product-price {
      font-weight: 600;
      color: #333;
    }
    
    .review-section {
      background-color: #e8eaf6;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    
    .star-rating {
      margin: 15px 0;
    }
    
    .star {
      display: inline-block;
      width: 30px;
      height: 30px;
      background-color: #fff;
      border-radius: 50%;
      margin: 0 3px;
      color: #3F51B5;
      line-height: 30px;
      font-size: 16px;
      text-decoration: none;
    }
    
    .help-section {
      background-color: #e1f5fe;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .help-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .help-item {
      flex: 1;
      min-width: 150px;
      padding: 15px 10px;
      text-align: center;
      background-color: white;
      border-radius: 6px;
      text-decoration: none;
      color: #555;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .help-icon {
      display: block;
      width: 30px;
      height: 30px;
      background-color: #e1f5fe;
      border-radius: 50%;
      margin: 0 auto 8px;
      text-align: center;
      line-height: 30px;
      color: #00BCD4;
    }
    
    .footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 30px;
      color: #777;
      font-size: 13px;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-links {
      margin: 15px 0;
    }
    
    .footer-links a {
      color: #666;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 500;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: #eee;
      border-radius: 50%;
      margin: 0 5px;
      color: #555;
      line-height: 36px;
      text-align: center;
      text-decoration: none;
    }
    
    .download-app {
      margin: 20px 0;
    }
    
    .app-button {
      display: inline-block;
      margin: 0 5px;
      background-color: #333;
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      text-align: left;
      min-width: 120px;
    }
    
    .app-button small {
      display: block;
      font-size: 10px;
      opacity: 0.8;
    }
    
    .app-button strong {
      font-size: 14px;
    }
    
    /* Promotions */
    .promo-banner {
      background: linear-gradient(45deg, #3F51B5 0%, #00BCD4 100%);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
      color: white;
    }
    
    .promo-code {
      display: inline-block;
      background-color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 600;
      color: #333;
      margin: 10px 0;
      letter-spacing: 1px;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 480px) {
      .content-wrapper {
        padding: 0 15px;
      }
      
      .order-meta {
        flex-direction: column;
      }
      
      .order-meta-item {
        width: 100%;
        margin: 5px 0;
      }
      
      .items-table th, .items-table td {
        padding: 10px 5px;
        font-size: 13px;
      }
      
      .items-table .item-image {
        width: 40px;
      }
      
      .items-table .item-image img {
        max-width: 35px;
      }
      
      .timeline-step .step-label {
        font-size: 10px;
      }
      
      .help-item {
        min-width: calc(50% - 10px);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://via.placeholder.com/180x50" alt="Company Logo" class="logo">
      <h1 style="font-size:40px">${message}!</h1>
    </div>
    
    <div class="content-wrapper">
      <div class="order-info">
        <span class="order-status">Order Delivered</span>
        <h2>Your Package Has Arrived!</h2>
        <p>Great news! Your order has been successfully delivered.</p>
        
        <div class="order-meta">
          <div class="order-meta-item">
            <strong>Order ID</strong>
            <span>ORD-12345678</span>
          </div>
          <div class="order-meta-item">
            <strong>Order Date</strong>
            <span>May 4, 2025</span>
          </div>
          <div class="order-meta-item">
            <strong>Delivery Date</strong>
            <span>May 9, 2025</span>
          </div>
        </div>
        
        <a href="#" class="button">View Order Details</a>
      </div>
      
      <div class="delivery-confirmation">
        <h4>Delivery Confirmation</h4>
        <p>Your package was delivered on:</p>
        <div class="delivery-date">May 9, 2025 at 2:45 PM</div>
        <p>Signed by: <strong>J. Doe</strong></p>
      </div>
      
      <div class="delivery-info">
        <div class="delivery-status">
          <h4>Delivery Status</h4>
          <div class="delivery-timeline">
            <div class="timeline-step step-complete">
              <div class="step-icon">✓</div>
              <span class="step-label">Order Placed</span>
            </div>
            <div class="timeline-step step-complete">
              <div class="step-icon">✓</div>
              <span class="step-label">Processing</span>
            </div>
            <div class="timeline-step step-complete">
              <div class="step-icon">✓</div>
              <span class="step-label">Shipped</span>
            </div>
            <div class="timeline-step step-active">
              <div class="step-icon">✓</div>
              <span class="step-label">Delivered</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-details">
        <h3 class="section-title">Items Delivered</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-image"></th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 1"></td>
              <td>
                <span class="product-name">Premium Wireless Headphones</span>
                <span class="product-variant">Color: Black | Model: XY-200</span>
              </td>
              <td>1</td>
              <td class="product-price">$129.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 2"></td>
              <td>
                <span class="product-name">Smartphone Fast Charger</span>
                <span class="product-variant">20W | Type-C | White</span>
              </td>
              <td>2</td>
              <td class="product-price">$24.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 3"></td>
              <td>
                <span class="product-name">Protective Phone Case</span>
                <span class="product-variant">iPhone 14 Pro | Clear</span>
              </td>
              <td>1</td>
              <td class="product-price">$19.99</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="review-section">
        <h3>How Was Your Experience?</h3>
        <p>We'd love to hear your feedback on your recent purchase.</p>
        <div class="star-rating">
          <a href="#" class="star">★</a>
          <a href="#" class="star">★</a>
          <a href="#" class="star">★</a>
          <a href="#" class="star">★</a>
          <a href="#" class="star">★</a>
        </div>
        <a href="#" class="button">Write a Review</a>
      </div>
      
      <div class="promo-banner">
        <h3>THANK YOU FOR SHOPPING WITH US!</h3>
        <p>Enjoy 15% off your next order with code:</p>
        <div class="promo-code">THANKS15</div>
        <p>Valid for 30 days. Minimum purchase $50.</p>
      </div>
      
      <div class="help-section">
        <h3 class="section-title">Need Help?</h3>
        <div class="help-grid">
          <a href="#" class="help-item">
            <span class="help-icon">?</span>
            Return Policy
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">↺</span>
            Exchange Item
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">⚠</span>
            Report Issue
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✉</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">f</a>
        <a href="#" class="social-link">t</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">ig</a>
      </div>
      
      <div class="download-app">
        <a href="#" class="app-button">
          <small>Download on the</small>
          <strong>App Store</strong>
        </a>
        <a href="#" class="app-button">
          <small>Get it on</small>
          <strong>Google Play</strong>
        </a>
      </div>
      
      <p>If you have any questions about your delivery, please contact our customer service team at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a> or call us at <strong>(555) 123-4567</strong>.</p>
      
      <div class="footer-links">
        <a href="#">My Account</a>
        <a href="#">FAQs</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Unsubscribe</a>
      </div>
      
      <p>&copy; 2025 Your Company. All rights reserved.</p>
      <p>123 E-Commerce St, Suite 100, San Francisco, CA 94103</p>
    </div>
  </div>
</body>
</html>`;
};

const getOrderProcessingTemplate = (data: {
  message: string;
  image: string;
  title?: string;
}) => {
  const { message, image, title = "Order Processing" } = data;
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Processing</title>
  <style>
    /* Reset styles for email clients */
    body, p, h1, h2, h3, h4, h5, h6, table, td, th {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    }
    
    body {
      background-color: #f8f9fa;
      color: #333333;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
      color: white;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: white;
    }
    
    .content-wrapper {
      padding: 0 30px;
    }
    
    .order-info {
      padding: 30px 0;
      text-align: center;
      border-bottom: 1px solid #eeeeee;
    }
    
    .order-status {
      display: inline-block;
      background-color: #fff3e0;
      color: #e65100;
      padding: 6px 15px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .order-info h2 {
      color: #333333;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .order-info p {
      color: #666666;
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .order-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    
    .order-meta-item {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 12px 18px;
      margin: 5px;
      min-width: 100px;
      text-align: center;
    }
    
    .order-meta-item strong {
      display: block;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .order-meta-item span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .button {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin-top: 20px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
      box-shadow: 0 4px 10px rgba(255, 152, 0, 0.2);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(255, 152, 0, 0.3);
    }
    
    .delivery-info {
      display: flex;
      margin: 25px 0;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .delivery-status {
      flex: 1;
      padding: 15px;
    }
    
    .delivery-timeline {
      display: flex;
      margin-top: 15px;
      position: relative;
    }
    
    .delivery-timeline:before {
      content: '';
      position: absolute;
      top: 15px;
      left: 30px;
      right: 30px;
      height: 3px;
      background-color: #e0e0e0;
      z-index: 1;
    }
    
    .timeline-step {
      flex: 1;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    
    .step-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 8px;
    }
    
    .step-active .step-icon {
      background-color: #FF9800;
    }
    
    .step-complete .step-icon {
      background-color: #FF9800;
    }
    
    .step-label {
      font-size: 12px;
      color: #666;
      display: block;
    }
    
    .step-active .step-label {
      color: #FF9800;
      font-weight: 600;
    }
    
    .step-complete .step-label {
      color: #FF9800;
      font-weight: 600;
    }
    
    .processing-info {
      background-color: #fff3e0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      border-left: 4px solid #FF9800;
    }
    
    .estimated-date {
      font-size: 18px;
      font-weight: 600;
      color: #e65100;
      margin: 10px 0;
    }
    
    .order-details {
      padding: 30px 0;
    }
    
    .section-title {
      color: #333333;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
      font-weight: 600;
      position: relative;
    }
    
    .section-title:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #FF9800 0%, #FF5722 100%);
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    
    .items-table th {
      background-color: #f8f9fa;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      border-bottom: 1px solid #eeeeee;
      color: #666;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .items-table .item-image {
      width: 60px;
    }
    
    .items-table .item-image img {
      max-width: 50px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .product-name {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    
    .product-variant {
      font-size: 13px;
      color: #777;
    }
    
    .product-price {
      font-weight: 600;
      color: #333;
    }
    
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .summary-table td {
      padding: 12px 15px;
    }
    
    .summary-table .total-row {
      font-weight: bold;
      border-top: 2px solid #eeeeee;
      background-color: #fff3e0;
    }
    
    .summary-table .total-row td {
      padding: 15px;
      font-size: 16px;
      color: #e65100;
    }
    
    .address-section {
      padding: 30px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .address-box {
      flex: 1;
      min-width: 200px;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .address-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
      display: flex;
      align-items: center;
    }
    
    .address-icon {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      background-color: #FF9800;
      color: white;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    
    .address-box p {
      margin-bottom: 4px;
      color: #666;
      font-size: 14px;
    }
    
    .help-section {
      background-color: #fff3e0;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .help-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .help-item {
      flex: 1;
      min-width: 150px;
      padding: 15px 10px;
      text-align: center;
      background-color: white;
      border-radius: 6px;
      text-decoration: none;
      color: #555;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .help-icon {
      display: block;
      width: 30px;
      height: 30px;
      background-color: #fff3e0;
      border-radius: 50%;
      margin: 0 auto 8px;
      text-align: center;
      line-height: 30px;
      color: #FF9800;
    }
    
    .footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 30px;
      color: #777;
      font-size: 13px;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-links {
      margin: 15px 0;
    }
    
    .footer-links a {
      color: #666;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 500;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: #eee;
      border-radius: 50%;
      margin: 0 5px;
      color: #555;
      line-height: 36px;
      text-align: center;
      text-decoration: none;
    }
    
    .download-app {
      margin: 20px 0;
    }
    
    .app-button {
      display: inline-block;
      margin: 0 5px;
      background-color: #333;
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      text-align: left;
      min-width: 120px;
    }
    
    .app-button small {
      display: block;
      font-size: 10px;
      opacity: 0.8;
    }
    
    .app-button strong {
      font-size: 14px;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 480px) {
      .content-wrapper {
        padding: 0 15px;
      }
      
      .order-meta {
        flex-direction: column;
      }
      
      .order-meta-item {
        width: 100%;
        margin: 5px 0;
      }
      
      .items-table th, .items-table td {
        padding: 10px 5px;
        font-size: 13px;
      }
      
      .items-table .item-image {
        width: 40px;
      }
      
      .items-table .item-image img {
        max-width: 35px;
      }
      
      .timeline-step .step-label {
        font-size: 10px;
      }
      
      .help-item {
        min-width: calc(50% - 10px);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://via.placeholder.com/180x50" alt="Company Logo" class="logo">
      <h1 style="font-size:40px">Your Order Is Being Processed</h1>
    </div>
    
    <div class="content-wrapper">
      <div class="order-info">
        <span class="order-status">Order Processing</span>
        <h2>We're Preparing Your Order!</h2>
        <p>Thank you for your purchase. We're currently processing your order and will ship it soon.</p>
        
        <div class="order-meta">
          <div class="order-meta-item">
            <strong>Order ID</strong>
            <span>ORD-12345678</span>
          </div>
          <div class="order-meta-item">
            <strong>Order Date</strong>
            <span>May 4, 2025</span>
          </div>
          <div class="order-meta-item">
            <strong>Payment</strong>
            <span>Completed</span>
          </div>
        </div>
        
        <a href="#" class="button">View Order Details</a>
      </div>
      
      <div class="processing-info">
        <h4>Processing Information</h4>
        <p>We're currently preparing your items for shipment.</p>
        <div class="estimated-date">Estimated shipping date: May 6, 2025</div>
        <p>You'll receive another email when your order ships.</p>
      </div>
      
      <div class="delivery-info">
        <div class="delivery-status">
          <h4>Order Status</h4>
          <div class="delivery-timeline">
            <div class="timeline-step step-complete">
              <div class="step-icon">✓</div>
              <span class="step-label">Order Placed</span>
            </div>
            <div class="timeline-step step-active">
              <div class="step-icon">✓</div>
              <span class="step-label">Processing</span>
            </div>
            <div class="timeline-step">
              <div class="step-icon">3</div>
              <span class="step-label">Shipped</span>
            </div>
            <div class="timeline-step">
              <div class="step-icon">4</div>
              <span class="step-label">Delivered</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-details">
        <h3 class="section-title">Order Details</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-image"></th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 1"></td>
              <td>
                <span class="product-name">Premium Wireless Headphones</span>
                <span class="product-variant">Color: Black | Model: XY-200</span>
              </td>
              <td>1</td>
              <td class="product-price">$129.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 2"></td>
              <td>
                <span class="product-name">Smartphone Fast Charger</span>
                <span class="product-variant">20W | Type-C | White</span>
              </td>
              <td>2</td>
              <td class="product-price">$24.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 3"></td>
              <td>
                <span class="product-name">Protective Phone Case</span>
                <span class="product-variant">iPhone 14 Pro | Clear</span>
              </td>
              <td>1</td>
              <td class="product-price">$19.99</td>
            </tr>
          </tbody>
        </table>
        
        <table class="summary-table">
          <tr>
            <td style="width: 70%; text-align: start;">Subtotal:</td>
            <td style="width: 30%; text-align: right;">$199.96</td>
          </tr>
          <tr>
            <td style="text-align: start;">Shipping:</td>
            <td style="text-align: right;">$5.99</td>
          </tr>
          <tr>
            <td style="text-align: start;">Tax:</td>
            <td style="text-align: right;">$16.00</td>
          </tr>
          <tr class="total-row">
            <td style="text-align: start;">Total:</td>
            <td style="text-align: right;">$221.95</td>
          </tr>
        </table>
      </div>
      
      <div class="address-section">
        <div class="address-box">
          <div class="address-title">
            <span class="address-icon">✓</span>
            Shipping Address
          </div>
          <p><strong>John Doe</strong></p>
          <p>123 Main Street</p>
          <p>Apt 4B</p>
          <p>New York, NY 10001</p>
          <p>United States</p>
        </div>
        
        <div class="address-box">
          <div class="address-title">
            <span class="address-icon">✓</span>
            Billing Address
          </div>
          <p><strong>John Doe</strong></p>
          <p>123 Main Street</p>
          <p>Apt 4B</p>
          <p>New York, NY 10001</p>
          <p>United States</p>
        </div>
      </div>
      
      <div class="help-section">
        <h3 class="section-title">Need Help?</h3>
        <div class="help-grid">
          <a href="#" class="help-item">
            <span class="help-icon">?</span>
            Order Status
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✎</span>
            Modify Order
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✕</span>
            Cancel Order
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✉</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">f</a>
        <a href="#" class="social-link">t</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">ig</a>
      </div>
      
      <div class="download-app">
        <a href="#" class="app-button">
          <small>Download on the</small>
          <strong>App Store</strong>
        </a>
        <a href="#" class="app-button">
          <small>Get it on</small>
          <strong>Google Play</strong>
        </a>
      </div>
      
      <p>If you have any questions about your order, please contact our customer service team at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a> or call us at <strong>(555) 123-4567</strong>.</p>
      
      <div class="footer-links">
        <a href="#">My Account</a>
        <a href="#">FAQs</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Unsubscribe</a>
      </div>
      
      <p>&copy; 2025 Your Company. All rights reserved.</p>
      <p>123 E-Commerce St, Suite 100, San Francisco, CA 94103</p>
    </div>
  </div>
</body>
</html>`;
};

const getOrderShippedTemplate = (data: {
  message: string;
  image: string;
  title?: string;
}) => {
  const { message, image, title = "Order Shipped" } = data;
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
  <style>
    /* Reset styles for email clients */
    body, p, h1, h2, h3, h4, h5, h6, table, td, th {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    }
    
    body {
      background-color: #f8f9fa;
      color: #333333;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      color: white;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: white;
    }
    
    .content-wrapper {
      padding: 0 30px;
    }
    
    .order-info {
      padding: 30px 0;
      text-align: center;
      border-bottom: 1px solid #eeeeee;
    }
    
    .order-status {
      display: inline-block;
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 6px 15px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .order-info h2 {
      color: #333333;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .order-info p {
      color: #666666;
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .order-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    
    .order-meta-item {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 12px 18px;
      margin: 5px;
      min-width: 100px;
      text-align: center;
    }
    
    .order-meta-item strong {
      display: block;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .order-meta-item span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .button {
      display: inline-block;
      padding: 12px 28px;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin-top: 20px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
      box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(76, 175, 80, 0.3);
    }
    
    .delivery-info {
      display: flex;
      margin: 25px 0;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .delivery-status {
      flex: 1;
      padding: 15px;
    }
    
    .delivery-timeline {
      display: flex;
      margin-top: 15px;
      position: relative;
    }
    
    .delivery-timeline:before {
      content: '';
      position: absolute;
      top: 15px;
      left: 30px;
      right: 30px;
      height: 3px;
      background-color: #e0e0e0;
      z-index: 1;
    }
    
    .timeline-step {
      flex: 1;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    
    .step-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 8px;
    }
    
    .step-active .step-icon {
      background-color: #4CAF50;
    }
    
    .step-complete .step-icon {
      background-color: #4CAF50;
    }
    
    .step-label {
      font-size: 12px;
      color: #666;
      display: block;
    }
    
    .step-active .step-label {
      color: #4CAF50;
      font-weight: 600;
    }
    
    .step-complete .step-label {
      color: #4CAF50;
      font-weight: 600;
    }
    
    .tracking-info {
      background-color: #f1f8e9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      border-left: 4px solid #8BC34A;
    }
    
    .tracking-number {
      font-size: 18px;
      font-weight: 600;
      color: #2e7d32;
      padding: 10px 20px;
      background-color: white;
      border-radius: 4px;
      display: inline-block;
      margin: 10px 0;
      letter-spacing: 1px;
      border: 1px dashed #8BC34A;
    }
    
    .order-details {
      padding: 30px 0;
    }
    
    .section-title {
      color: #333333;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
      font-weight: 600;
      position: relative;
    }
    
    .section-title:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    
    .items-table th {
      background-color: #f8f9fa;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      border-bottom: 1px solid #eeeeee;
      color: #666;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .items-table .item-image {
      width: 60px;
    }
    
    .items-table .item-image img {
      max-width: 50px;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .product-name {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    
    .product-variant {
      font-size: 13px;
      color: #777;
    }
    
    .product-price {
      font-weight: 600;
      color: #333;
    }
    
    .address-section {
      padding: 30px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .address-box {
      flex: 1;
      min-width: 200px;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .address-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
      display: flex;
      align-items: center;
    }
    
    .address-icon {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      background-color: #4CAF50;
      color: white;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    
    .address-box p {
      margin-bottom: 4px;
      color: #666;
      font-size: 14px;
    }
    
    .help-section {
      background-color: #f1f8e9;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .help-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .help-item {
      flex: 1;
      min-width: 150px;
      padding: 15px 10px;
      text-align: center;
      background-color: white;
      border-radius: 6px;
      text-decoration: none;
      color: #555;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .help-icon {
      display: block;
      width: 30px;
      height: 30px;
      background-color: #e8f5e9;
      border-radius: 50%;
      margin: 0 auto 8px;
      text-align: center;
      line-height: 30px;
      color: #4CAF50;
    }
    
    .footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 30px;
      color: #777;
      font-size: 13px;
      border-top: 1px solid #eeeeee;
    }
    
    .footer-links {
      margin: 15px 0;
    }
    
    .footer-links a {
      color: #666;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 500;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: #eee;
      border-radius: 50%;
      margin: 0 5px;
      color: #555;
      line-height: 36px;
      text-align: center;
      text-decoration: none;
    }
    
    .download-app {
      margin: 20px 0;
    }
    
    .app-button {
      display: inline-block;
      margin: 0 5px;
      background-color: #333;
      color: white;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      text-align: left;
      min-width: 120px;
    }
    
    .app-button small {
      display: block;
      font-size: 10px;
      opacity: 0.8;
    }
    
    .app-button strong {
      font-size: 14px;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 480px) {
      .content-wrapper {
        padding: 0 15px;
      }
      
      .order-meta {
        flex-direction: column;
      }
      
      .order-meta-item {
        width: 100%;
        margin: 5px 0;
      }
      
      .items-table th, .items-table td {
        padding: 10px 5px;
        font-size: 13px;
      }
      
      .items-table .item-image {
        width: 40px;
      }
      
      .items-table .item-image img {
        max-width: 35px;
      }
      
      .timeline-step .step-label {
        font-size: 10px;
      }
      
      .help-item {
        min-width: calc(50% - 10px);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://via.placeholder.com/180x50" alt="Company Logo" class="logo">
      <h1 style="font-size:40px">Your Order Has Shipped!</h1>
    </div>
    
    <div class="content-wrapper">
      <div class="order-info">
        <span class="order-status">Order Shipped</span>
        <h2>Your Package Is On The Way!</h2>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div class="order-meta">
          <div class="order-meta-item">
            <strong>Order ID</strong>
            <span>ORD-12345678</span>
          </div>
          <div class="order-meta-item">
            <strong>Order Date</strong>
            <span>May 4, 2025</span>
          </div>
          <div class="order-meta-item">
            <strong>Shipped Date</strong>
            <span>May 6, 2025</span>
          </div>
        </div>
        
        <a href="#" class="button">Track Your Package</a>
      </div>
      
      <div class="tracking-info">
        <h4>Tracking Information</h4>
        <p>Your order has been shipped via <strong>FedEx Express</strong>.</p>
        <div class="tracking-number">FX4832957106</div>
        <p>Estimated delivery: <strong>May 9, 2025</strong></p>
      </div>
      
      <div class="delivery-info">
        <div class="delivery-status">
          <h4>Delivery Status</h4>
          <div class="delivery-timeline">
            <div class="timeline-step step-complete">
              <div class="step-icon">✓</div>
              <span class="step-label">Order Placed</span>
            </div>
            <div class="timeline-step step-complete">
              <div class="step-icon">✓</div>
              <span class="step-label">Processing</span>
            </div>
            <div class="timeline-step step-active">
              <div class="step-icon">✓</div>
              <span class="step-label">Shipped</span>
            </div>
            <div class="timeline-step">
              <div class="step-icon">4</div>
              <span class="step-label">Delivered</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-details">
        <h3 class="section-title">Items Shipped</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-image"></th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 1"></td>
              <td>
                <span class="product-name">Premium Wireless Headphones</span>
                <span class="product-variant">Color: Black | Model: XY-200</span>
              </td>
              <td>1</td>
              <td class="product-price">$129.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 2"></td>
              <td>
                <span class="product-name">Smartphone Fast Charger</span>
                <span class="product-variant">20W | Type-C | White</span>
              </td>
              <td>2</td>
              <td class="product-price">$24.99</td>
            </tr>
            <tr>
              <td class="item-image"><img src="https://via.placeholder.com/50" alt="Product 3"></td>
              <td>
                <span class="product-name">Protective Phone Case</span>
                <span class="product-variant">iPhone 14 Pro | Clear</span>
              </td>
              <td>1</td>
              <td class="product-price">$19.99</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="address-section">
        <div class="address-box">
          <div class="address-title">
            <span class="address-icon">✓</span>
            Shipping Address
          </div>
          <p><strong>John Doe</strong></p>
          <p>123 Main Street</p>
          <p>Apt 4B</p>
          <p>New York, NY 10001</p>
          <p>United States</p>
        </div>
        
        <div class="address-box">
          <div class="address-title">
            <span class="address-icon">✓</span>
            Shipping Method
          </div>
          <p><strong>FedEx Express</strong></p>
          <p>Delivery in 2-3 business days</p>
          <p>Signature required upon delivery</p>
        </div>
      </div>
      
      <div class="help-section">
        <h3 class="section-title">Need Help?</h3>
        <div class="help-grid">
          <a href="#" class="help-item">
            <span class="help-icon">?</span>
            Delivery FAQ
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">↺</span>
            Return Policy
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">📦</span>
            Track Package
          </a>
          <a href="#" class="help-item">
            <span class="help-icon">✉</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">f</a>
        <a href="#" class="social-link">t</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">ig</a>
      </div>
      
      <div class="download-app">
        <a href="#" class="app-button">
          <small>Download on the</small>
          <strong>App Store</strong>
        </a>
        <a href="#" class="app-button">
          <small>Get it on</small>
          <strong>Google Play</strong>
        </a>
      </div>
      
      <p>If you have any questions about your shipment, please contact our customer service team at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a> or call us at <strong>(555) 123-4567</strong>.</p>
      
      <div class="footer-links">
        <a href="#">My Account</a>
        <a href="#">FAQs</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Unsubscribe</a>
      </div>
      
      <p>&copy; 2025 Your Company. All rights reserved.</p>
      <p>123 E-Commerce St, Suite 100, San Francisco, CA 94103</p>
    </div>
  </div>
</body>
</html>`;
};

export {
  getInfoTemplate,
  getOrderCancelledTemplate,
  getOrdderConfirmTemplate,
  getOrderDeliveredTemplate,
  getOrderProcessingTemplate,
  getOrderShippedTemplate,
};
