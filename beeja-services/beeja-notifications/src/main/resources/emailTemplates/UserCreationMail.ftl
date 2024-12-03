<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${companyName}!</title>
    <style>
        body {
font-family: Arial, sans-serif;
margin: 0;
padding: 0;
background-color: #f8f9fa;
}
.container {
max-width: 600px;
margin: 20px auto;
padding: 20px;
background-color: #ffffff;
border-radius: 10px;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
h1 {
color: #343a40;
text-align: center;
margin-bottom: 20px;
}
p {
color: #495057;
margin-bottom: 10px;
}
ul {
list-style: none;
padding: 0;
margin-bottom: 20px;
}
li {
margin-bottom: 10px;
color: #6c757d;
}
.cta-button {
display: inline-block;
padding: 10px 20px;
background-color: #007bff;
color: #ffffff;
text-decoration: none;
border-radius: 5px;
transition: background-color 0.3s ease;
}
.cta-button:hover {
background-color: #0056b3;
}
.centered {
text-align: center;
}
</style>
</head>
<body>
<div class="container">
    <h1>Welcome to ${companyName}, ${employeeName}!</h1>
    <p>We're thrilled to have you join the team!</p>
    <p>Your account has been created at Beeja, and you can now access it using the following credentials:</p>
    <ul>
         <li><strong>Email:</strong> <span style="color: #28a745">${newEmployeeEmail}</span></li>
        <li><strong>Password:</strong> <span style="color: #28a745">${newEmployeePassword}</span></li>
        <li><strong>Employee Id:</strong> <span style="color: #007bff">${newEmployeeId}</span></li>
    </ul>
    <div class="centered">
        <a class="cta-button" href="https://beeja.techatcore.com/auth/login/google" style="color: white">Sign in with Google</a>
    </div>
    <p>To get started, please visit: <a href="https://beeja.techatcore.com/">Beeja</a></p>
    <p>If you have any questions, please don't hesitate to contact the HR team.</p>
    <p>We look forward to a successful journey together!</p>
    <br>
    <p style="color: #6c757d;">Sincerely,</p>
    <p style="color: #6c757d;">The HR Team - ${companyName}</p>
</div>
</body>
</html>
