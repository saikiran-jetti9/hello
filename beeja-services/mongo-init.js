db = db.getSiblingDB("accounts_sbox");
db.createCollection("roles");

db.createCollection("organizations");
db.organizations.insertMany([
  {
   
    "name": "tech.at.core",
    "email": "ki-asasAAra_n@ta.cs",
    "subscriptionId": "1234567890",
    "emailDomain": "tac3@example.com",
    "contactMail": "contacttac@example.com",
    "website": "https://duckduckgo.com",
    "preferences": {
      "dateFormat": "DD_DOT_MM_DOT_YYYY",
      "timeZone": "EASTERN_STANDARD_TIME",
      "fontName": "NUNITO",
      "fontSize": 14,
      "theme": "LIGHT",
      "currencyType": "EURO"
    },
    "address": {
      "addressOne": "",
      "country": "India",
      "state": "",
      "pinCode": "333333"
    },
    "filingAddress": "Test",
    "accounts": {
      "pfNumber": "",
      "tanNumber": "",
      "panNumber": "FBFPQ0110p",
      "esiNumber": "11111111111111111",
      "linNumber": "",
      "gstNumber": "22AAAAA0000A1Z5"
    },
    "logoFileId": "6638a00fd305585559235d87",
    "loanLimit": {
      "monitorLoan": 31,
      "isMonitorLoanEnabled": true,
      "personalLoan": 1222,
      "isPersonalLoanEnabled": true,
      "salaryMultiplier": 3,
      "isSalaryMultiplierEnabled": false
    }
  }
]);

const query = {name: "tech.at.core"};
const org = db.organizations.findOne(query);
db.roles.insertMany([{

                      "name": "Super Admin",
                      "description": "Admin",
                      "permissions": [
                        "REX",
                        "UEX",
                        "DEX",
                        "RDEV",
                        "DLON",
                        "DALDOC",
                        "DHIN",
                        "DDM",
                        "CDM",
                        "CDEV",
                        "ULON",
                        "UEMP",
                        "RORG",
                        "CHIN",
                        "GALON",
                        "CLON",
                        "RDM",
                        "CEMP",
                        "RALDOC",
                        "UDM",
                        "UHIN",
                        "CDMPS",
                        "CALDOC",
                        "UDEV",
                        "UORG",
                        "RLOG",
                        "GALEMP",
                        "CEM",
                        "SCLON",
                        "URAP",
                        "UALEMP",
                        "RDMH",
                        "DDEV",
                        "IEMM",
                        "RCEMP",
                        "CEX",
                        "REMP",
                        "UEM",
                        "RHIN",
                        "CBPS",
                        "RLON",
                        "URORG",
                        "DRORG",
                        "CRORG",
                        "CAPT",
                        "GAAPT",
                        "GENAPT",
                        "RRSM",
                        "UENTAP",
                        "UAPL",
                        "TINT",
                        "DINT",
                        "CORG",
                        "RALORG",
                        "DORG",
                        "UALORG\"",
                        "GACLT",
                        "RALFTG",
                        "UALFTG",
                        "URAP",
                        "UKYC",
                        "UALKYC",
                        "RKYC",
                        "RALKYC",
                        "GAPT",
                        "RPT",
                        "CCRT",
                        "CCLT",
                        "UCLT",
                        "ACLT",
                        "CPT",
                        "UPT",
                        "APT",
                        "GPRSC",
                        "GPRSRC",
                        "UCRT",
                        "ACRT",
                        "RCRT",
                        "GACRT",
                        "GCPRJT",
                        "ARCT",
                        "GCART",
                        "GRC",
                        "RC",
                        "RR",
                        "RU",
                        "RUA",
                        "UPPS"
                      ],
                      "_class": "com.beeja.api.accounts.model.Organization.Role",
                      "organizationId": ""+org._id
                    },
                    {

                      "name": "Employee",
                      "description": "Employee",
                      "permissions": [
                        "REX",
                        "RKYC",
                        "CPT",
                        "UKYC",
                        "UORG",
                        "CALDOC",
                        "DALDOC",
                        "UEX",
                        "REMP",
                        "IEM",
                        "RORG",
                        "UALKYC",
                        "CCLT",
                        "CEX",
                        "TINT",
                        "RALKYC",
                        "RALDOC",
                        "GPRSRC",
                        "GCPRJT",
                        "GCART",
                        "LH",
                        "GMLH",
                        "GWLH",
                        "GDLH"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    },
                    {

                      "name": "Accounts Manager",
                      "description": "Manages accounts operations",
                      "permissions": [
                        "RPAY",
                        "REMP",
                        "UF",
                        "UEMP",
                        "UPAY",
                        "CHIN",
                        "DHIN",
                        "CPAY",
                        "URAP",
                        "RHIN",
                        "UHIN"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    },
                    {

                      "name": "Super Admin - TECHATCORE Gmbh",
                      "description": "Default Role",
                      "permissions": [
                        "REX",
                        "UEX",
                        "URAP",
                        "DDM",
                        "CDM",
                        "IEM",
                        "UEMP",
                        "DEX",
                        "CEX",
                        "RDM",
                        "CEMP",
                        "REM",
                        "UDM",
                        "CLON",
                        "RLON",
                        "DLON",
                        "ULON",
                        "SCLON",
                        "GALON",
                        "CHIN",
                        "RHIN",
                        "DHIN",
                        "UHIN",
                        "CDMPS",
                        "RDMH",
                        "DDEV",
                        "RDEV",
                        "UDEV",
                        "CDEV",
                        "URORG"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    },
                    {

                      "name": "Super Admin - TECHATCORE PRIVATE LIMITED",
                      "description": "Default Role",
                      "permissions": [
                        "REX",
                        "UEX",
                        "URAP",
                        "DDM",
                        "CDM",
                        "IEM",
                        "UEMP",
                        "DEX",
                        "CEX",
                        "RDM",
                        "CEMP",
                        "REM",
                        "UDM",
                        "CLON",
                        "RLON",
                        "DLON",
                        "ULON",
                        "SCLON",
                        "GALON",
                        "CHIN",
                        "RHIN",
                        "DHIN",
                        "UHIN",
                        "CDMPS",
                        "RDMH",
                        "DDEV",
                        "RDEV",
                        "UDEV",
                        "CDEV",
                        "URORG"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    },
                    {

                      "name": "Super Admin - TECHATCORE pvt Ltd",
                      "description": "Default Role",
                      "permissions": [
                        "REX",
                        "UEX",
                        "URAP",
                        "DDM",
                        "CDM",
                        "IEM",
                        "UEMP",
                        "DEX",
                        "CEX",
                        "RDM",
                        "CEMP",
                        "REM",
                        "UDM",
                        "CLON",
                        "RLON",
                        "DLON",
                        "ULON",
                        "SCLON",
                        "GALON",
                        "CHIN",
                        "RHIN",
                        "DHIN",
                        "UHIN",
                        "CDMPS",
                        "RDMH",
                        "DDEV",
                        "RDEV",
                        "UDEV",
                        "CDEV",
                        "URORG"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    },
                    {

                      "name": "Super Admin - tech.at.core.test",
                      "description": "Default Role",
                      "permissions": [
                        "REX",
                        "UEX",
                        "URAP",
                        "DDM",
                        "CDM",
                        "IEM",
                        "UEMP",
                        "DEX",
                        "CEX",
                        "RDM",
                        "CEMP",
                        "REM",
                        "UDM",
                        "CLON",
                        "RLON",
                        "DLON",
                        "ULON",
                        "SCLON",
                        "GALON",
                        "CHIN",
                        "RHIN",
                        "DHIN",
                        "UHIN",
                        "CDMPS",
                        "RDMH",
                        "DDEV",
                        "RDEV",
                        "UDEV",
                        "CDEV",
                        "URORG"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    },
                    {

                      "name": "Super Admin - TECHATCORE PRIVATE LIMITED",
                      "description": "Default Role",
                      "permissions": [
                        "REX",
                        "UEX",
                        "URAP",
                        "DDM",
                        "CDM",
                        "IEM",
                        "UEMP",
                        "DEX",
                        "CEX",
                        "RDM",
                        "CEMP",
                        "REM",
                        "UDM",
                        "CLON",
                        "RLON",
                        "DLON",
                        "ULON",
                        "SCLON",
                        "GALON",
                        "CHIN",
                        "RHIN",
                        "DHIN",
                        "UHIN",
                        "CDMPS",
                        "RDMH",
                        "DDEV",
                        "RDEV",
                        "UDEV",
                        "CDEV",
                        "URORG"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    },
                    {

                      "name": "Super Admin - TECHATCOREPRIVATELIMITED",
                      "description": "Default Role",
                      "permissions": [
                        "REX",
                        "UEX",
                        "URAP",
                        "DDM",
                        "CDM",
                        "IEM",
                        "UEMP",
                        "DEX",
                        "CEX",
                        "RDM",
                        "CEMP",
                        "REM",
                        "UDM",
                        "CLON",
                        "RLON",
                        "DLON",
                        "ULON",
                        "SCLON",
                        "GALON",
                        "CHIN",
                        "RHIN",
                        "DHIN",
                        "UHIN",
                        "CDMPS",
                        "RDMH",
                        "DDEV",
                        "RDEV",
                        "UDEV",
                        "CDEV",
                        "URORG"
                      ],
                      "organizationId": ""+org._id,
                      "_class": "com.beeja.api.accounts.model.Organization.Role"
                    }]);

const _super_admin_role = db.roles.findOne({name: "Super Admin"});
const _employee_role = db.roles.findOne({name: "Employee"});

db.createCollection("users");
db.users.insertMany([
  {

    "firstName": "Hari",
    "lastName": "V",
    "email": "vydya.harindra@gmail.com",
    "roles": [
            {
              "$ref": "roles", "$id": _super_admin_role._id
            },
            {
              "$ref": "roles", "$id": _employee_role._id
            }
    ],
    "employeeId": "TACVHR",
    "organizations": { $ref: 'organizations', $id: org._id},
    "password": "$2a$10$f29MeC42B.syEbcbp8YYIuwn4CYviaL9sDjgrJGN7OwWVT2Lt5WiK",
    "isActive": true,
    "createdBy": "kranthi3460@gmail.com",
    "_class": "com.beeja.api.accounts.model.User"
  }]);

db.createCollection("featureToggle");
db.featureToggle.insertMany([{
  "organizationId": ""+org._id,
  "featureToggles": [
    "DOCUMENT_MANAGEMENT",
    "BULK_PAY_SLIPS",
    "ORGANIZATION_SETTINGS",
    "EXPENSE_MANAGEMENT",
    "EMPLOYEE_MANAGEMENT",
    "ORGANIZATION_SETTINGS_ROLES_AND_PERMISSIONS",
    "LOAN_MANAGEMENT",
    "ORGANIZATION_SETTINGS_PROFILE",
    "ORGANIZATION_SETTINGS_FONT_NAME",
    "INVENTORY_MANAGEMENT",
    "ORGANIZATION_SETTINGS_FONT_SIZE",
    "ORGANIZATION_SETTINGS_DATE_CURRENCY",
    "KYC_MANAGEMENT",
    "ORGANIZATION_SETTINGS_THEMES"
  ]
}]);


db = db.getSiblingDB("employees_sbox");
db.createCollection("employees");
db.employees.insertMany([{ "employeeId": "TAC1000", "organizationId": ""+org._id }, { "employeeId": "TACVHR", "organizationId": ""+org._id }]);
db = db.getSiblingDB("expenses_sbox");
db.createCollection("expenses");
db = db.getSiblingDB("files_sbox");
db.createCollection("files");
db = db.getSiblingDB("finance_sbox");
db.createCollection("invoice");
db.createCollection("projects");
db.createCollection("clients");







