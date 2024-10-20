Project Overview
This project is an e-commerce platform that allows users to sign up, log in, sell products, buy products, and view sales data using Chart.js.

Key Features
User Authentication: Users can sign up and log in using email or phone number.
Product Listing: Users can list their products for sale.
Product Purchase: Users can purchase products listed by other users.
Sales Analytics: The platform provides a dashboard with sales data visualized using Chart.js.
Technology Stack
Backend: Node.js, Express.js, MySQL
Frontend: html, ejs, css
Authentication: Twilio for SMS OTP, Nodemailer for email OTP
Database: MySQL


preview

login
![Screenshot 2024-10-20 104726](https://github.com/user-attachments/assets/6efad232-abf7-4ae5-854b-deac248ca6b2)
verification
![Screenshot 2024-10-20 104926](https://github.com/user-attachments/assets/be975c48-84ff-412d-8a60-302a87ea37e1)
sign up
![Screenshot 2024-10-20 105058](https://github.com/user-attachments/assets/206ab2a3-c535-436a-88eb-32042735d424)
profile
![Screenshot 2024-10-20 105215](https://github.com/user-attachments/assets/a428d189-36f6-4e9a-9673-39d9eca860c2)
home
![Screenshot 2024-10-20 105236](https://github.com/user-attachments/assets/c4d53fc2-e128-45a7-bb6a-ac0aa0406aa7)
product pre view
![Screenshot 2024-10-20 105602](https://github.com/user-attachments/assets/90f08dde-1adb-4a0d-858e-67d0ba00b96f)
order products
![Screenshot 2024-10-20 105634](https://github.com/user-attachments/assets/be5b23a3-3cdf-4847-9da3-a41620ecd1c7)







setting up
Clone the Repository:
Open your terminal and use the git clone command to clone the project repository from GitHub:

Bash
git clone https://github.com/GuruduttRPai/Marketify

Navigate to the Project Directory:
Use the cd command to change directories and navigate to the project directory you just cloned:
Bash
cd Marketify

Install Dependencies:
Run the following command to install all the necessary dependencies required by the project:
Bash
npm install

Configure Environment Variables:
The project relies on environment variables to store configuration settings. Create a file named .env in the project's root directory.
This file should not be committed to your version control system (e.g., Git). Inside the .env file, define the following environment variables with your specific values:

PORT= # (Your desired port number where the application will run)
SQL_HOST= # (Your MySQL database server hostname or IP address)
SQL_USER= # (Your MySQL database username)
SQL_PASSWORD= # (Your MySQL database password)
SQL_DATABASE= # (The name of the MySQL database to use)
IMG_DIR= # (The directory where uploaded images will be stored)
EMAIL_ID= # (The email address used for sending emails, such as OTPs or notifications)
EMAIL_PASS= # (The password associated with the email account)
TWILIO_SID= # (Your Twilio account SID)
TWILIO_AUTH= # (Your Twilio authentication token)
TWILIO_PHONE_NO= # (The Twilio phone number used to send SMS messages)
Important Note: Replace the placeholders with your actual configuration values.


Start the Server:
Once you've completed the setup steps, you can start the application server by running the following command:
Bash
npm start

This will start the server and make the application accessible in your browser, usually at http://localhost:<PORT>, where <PORT> is the port number you specified in the .env file.
