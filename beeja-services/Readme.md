Beeja

Welcome! Beeja is an open-source employee & contract management platform which forms one-stop solution for a small scale business. This is an highly interactive self-customised  platform which  can be applied to any region in the world.

You can manage your employees, finances, clients, contracts & expenses in this end-to-end ecosystem.


Installation

You will need following installed on your system

Java 17
Docker
Suitable location on your drive to store files

Getting Started

Beeja uses Java 17 and Spring Boot version 3.1 with its dependent cloud version. This is multi-module application using Gradle
Create a fork from https://github.com/tac-consulting/tac.beeja.git and clone the repo.
It comes with init-beeja-db.js and a docker compose.yaml. These will help you to setup initial application and you can take it from there. You can edit this info anytime you want to.

Building from Source

$ ./gradlew build - all of the jars required to be run.


Running the application


Once your compose is up and running, you will start seeing Beeja containers created and running successfully.
http://localhost:3000 - Open web application - You can use username (email given in the init script) and password as ‘password’.
http://localhost:8761 - Service Registry (Eureka): This should give you all the modules registered to the application and subsequent link to their individual module actuators.
We are using Feign Client to communicate between services


Open API
We have open api embedded inside and can be accessed on http://localhost:8080/swagger-ui


Code Quality
We have embedded check style which will enforce you to follow these practices.

Some Jargon/terminology
Roles - Super admin - Basically an account manager, used to create employees, inventory, expenses
……………………….
Features  - Enable disable features in the product



Modules
——————————————————————————————————————————-

Account
Accounts module holds data related to organisation and it’s users. When you run the script mongo-init.js, you will be given a one organisation and a user who is super admin. You will be able to manage features, organisation settings, roles in the product.

Employee
Employee module holds details of employees. It has some key information like job, address, contact, KYC & Bank account details. Contact, KYC & Bank Accounts are stored as an encrypted data in the db so you won’t be able to see them.




Finance  
Finance module has information about your clients, payroll, invoice, contracts & inventory of your organisation. There are quite a handful of other settings in this module which comes with features specific to the country. You can manage handful of these features once you set your organisation.


 




