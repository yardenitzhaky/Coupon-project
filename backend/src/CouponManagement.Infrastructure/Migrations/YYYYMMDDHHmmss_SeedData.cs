using Microsoft.EntityFrameworkCore.Migrations;

namespace CouponManagement.Infrastructure.Data.Migrations
{
    public partial class SeedData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert default admin user
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Username", "Password", "Role", "IsActive" },
                values: new object[] { 
                    "admin", 
                    BCrypt.Net.BCrypt.HashPassword("admin123"), // In production, use proper password hashing
                    "Admin", 
                    true 
                });

            // Insert sample coupon
            migrationBuilder.InsertData(
                table: "Coupons",
                columns: new[] { 
                    "Code", 
                    "Description", 
                    "DiscountType", 
                    "DiscountValue",
                    "CreatedById",
                    "AllowMultipleDiscounts",
                    "IsActive"
                },
                values: new object[] { 
                    "WELCOME2024",
                    "Welcome discount for new customers",
                    "Percentage",
                    10.00m,
                    1, // References the admin user we just created
                    false,
                    true
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "Coupons", keyColumn: "Code", keyValue: "WELCOME2024");
            migrationBuilder.DeleteData(table: "Users", keyColumn: "Username", keyValue: "admin");
        }
    }
}