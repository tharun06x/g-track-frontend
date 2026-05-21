The G-Track Smart Gas Monitoring System is an IoT-based solution designed to monitor gas
cylinder weight in real time and detect low-gas conditions automatically, eliminating the need for
manual checking. The system uses load cell sensors with ESP32 to collect data and transmits
it to a centralized platform, where it is securely stored in a PostgreSQL database for efficient
data management, real-time tracking, and historical analysis. The system also provides a webbased
interface that allows users to receive timely alerts and place refill booking requests, which
are managed by distributors for faster and more efficient service delivery. In addition to realtime
monitoring, G-Track incorporates a Linear Regression model to analyze gas consumption
patterns and predict the estimated number of days remaining before gas depletion, helping users
plan refills in advance. Furthermore, a K-Means clustering algorithm is used to classify users into
light, normal, and heavy usage categories based on consumption behavior. This enables better
understanding of usage patterns, such as lower consumption for students and higher usage in
family households, supporting improved resource planning. By integrating real-time monitoring,
secure data storage, predictive analytics, user classification, and an efficient booking mechanism,
G-Track enhances user convenience and ensures reliable and intelligent gas management.

Frontend Technologies Used

The frontend of the G-Track Gas Monitoring System was developed using HTML5, CSS, and JavaScript to create an interactive, responsive, and user-friendly web application for real-time gas monitoring and management.

HTML5

HTML5 was used to build the structure and layout of the application. It helped create webpages such as login forms, dashboards, refill booking pages, reports, notifications, and profile management sections. HTML5 provided a clean and organized interface for displaying gas cylinder status, alerts, refill requests, and prediction results.

CSS

CSS was used to design and style the frontend interface. It improved the appearance of dashboards, forms, alerts, and reports by adding colors, layouts, fonts, spacing, and responsive design elements. CSS also helped make the application mobile-friendly and easy to navigate across different devices.

JavaScript

JavaScript was used to make the application interactive and dynamic. It enabled real-time updates of gas cylinder levels, low-gas alerts, refill notifications, and dashboard information without refreshing the webpage. JavaScript also handled frontend validations, user interactions, API communication, and dynamic data visualization.

Frontend Features
Real-time gas level monitoring
Low-gas alert notifications
User login and registration
Refill booking system
Dashboard for users, distributors, and administrators
Gas usage reports and analytics
Responsive and user-friendly interface
Real-time communication with backend APIs
