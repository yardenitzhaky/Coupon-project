# CouponGuard - Coupon Management System

## 🎯 Overview

CouponGuard is a full-stack coupon management system built with React, .NET , and MySQL.
## ✨ Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Secure password hashing with BCrypt

- **Coupon Management**
  - Create and manage discount coupons
  - Support for percentage and fixed amount discounts
  - Multi-coupon validation
  - Usage tracking and limits
  - Expiry date management

- **Advanced Validation**
  - Multiple discount combinations
  - Order amount validation
  - Usage limit enforcement

- **Reporting**
  - Detailed coupon usage reports
  - Date range filtering
  - Export to Excel functionality
  - Statistical analysis

- **Modern UI/UX**
  - Responsive design using Tailwind CSS
  - Smooth animations with Framer Motion
  - Professional UI components with PrimeReact
  - Interactive data tables and charts

## 🛠 Tech Stack

### Frontend
- React 
- PrimeReact
- Tailwind CSS
- Framer Motion
- Axios
- JWT Decode

### Backend
- .NET 
- MicroSoft Entity Framework Core
- MySQL
- BCrypt.NET

## 🚀 Getting Started

## 💾 Database Structure

### Users Table
- Stores admin/user authentication details
- Fields:
  - `Id`: Auto-incrementing primary key
  - `Username`: Unique identifier (max 50 chars)
  - `Password`: BCrypt hashed passwords
  - `CreatedAt`: Timestamp of account creation
  - `LastLogin`: Optional last login timestamp
  - `IsActive`: Boolean for account status

### Coupons Table
- Main table for coupon management
- Fields:
  - `Id`: Auto-incrementing primary key
  - `Code`: Unique coupon code (max 50 chars)
  - `Description`: Coupon details
  - `DiscountType`: Integer (0=Percentage, 1=Fixed Amount)
  - `DiscountValue`: Decimal(10,2) for discount amount
  - `CreatedById`: Links to Users table
  - `CreatedAt`: Creation timestamp
  - `ExpiryDate`: Optional expiration date
  - `AllowMultipleDiscounts`: Boolean for stacking
  - `MaxUsageCount`: Optional usage limit
  - `CurrentUsageCount`: Usage tracking
  - `IsActive`: Boolean for coupon status

### CouponUsageHistory Table
- Tracks all coupon usage
- Fields:
  - `Id`: Auto-incrementing primary key
  - `CouponId`: Links to Coupons table
  - `UsedAt`: Usage timestamp
  - `OrderAmount`: Original order amount
  - `DiscountAmount`: Applied discount amount

### Quick Start Guide
Clone the repository:
```bash
git clone https://github.com/yourusername/couponguard.git
```


### Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
```sql
-- Create the database
CREATE DATABASE coupon_management;

-- Create User table
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLogin DATETIME NULL,
    IsActive BOOL DEFAULT TRUE
);

-- Create Coupons table
CREATE TABLE Coupons (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT NOT NULL,
    DiscountType VARCHAR(20) NOT NULL,
    DiscountValue DECIMAL(10,2) NOT NULL,
    CreatedById INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpiryDate DATETIME NULL,
    AllowMultipleDiscounts BOOL DEFAULT FALSE,
    MaxUsageCount INT NULL,
    CurrentUsageCount INT DEFAULT 0,
    IsActive BOOL DEFAULT TRUE,
    FOREIGN KEY (CreatedById) REFERENCES Users(Id)
);

-- Create CouponUsageHistory table
CREATE TABLE CouponUsageHistory (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CouponId INT NOT NULL,
    UsedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    OrderAmount DECIMAL(10,2) NOT NULL,
    DiscountAmount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (CouponId) REFERENCES Coupons(Id)
);
```

### Backend Setup
```bash
# Navigate to backend directory
cd CouponManagement.API

# Restore packages
dotnet restore

# Update database
dotnet ef database update

# Run the application
dotnet run
```

### Environment Configuration
1. Update the connection string in `appsettings.json`
2. Configure JWT settings in `appsettings.json`
3. Update the API base URL in frontend's `vite.config.js`


## 🔒 Security Features

- JWT Authentication
- Password Hashing
- CORS Configuration
- Input Validation

## 👤 Author

Yarden Itzhaky
