# Multi tenant backend for rxmanager

## Setting it up

### MongoDB
```shell
export MONGODB_URI="mongodb://host/dbname"
```

### JWT_SECRET
```shell
export JWT_SECRET="someRandomString"
```

### PORT
```shell
export PORT="5001"
```

### Installing dependencies
```shell
npm install
```

### Running it
```shell
npm start
```

### Running tests

```shell
npm run test:unit
```

or

```shell
npm run test:integration
```

## Endpoints

### NOTE
Most of the routes are not documented, this project, while fully working, is not receiving updates anymore.

For understanding the routes, check src/__tests__/integration, each route has its own testing file and is easy to understand

### Users

#### Create User
On success returns a json with the created user

#### URL
/users

#### Method
`POST`

#### Required
```json
{
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
}
```

#### Success Response
**Code**: 201

**Content**: 
```json
{
  "statusCode": 201,
  "body": {
    "_id": "string",
    "email": "string",
  }
}
```

#### Error Response
**Code**: 422

**Conten**t:
```json
{
  "statusCode": 422,
  "errors": {
    "email": "NOT_UNIQUE",
    "password": "UNMATCHED_PW",
    "confirmPassword": "UNMATCHED_PW",
  }
}
```
OR
```json
{
  "statusCode": 422,
  "errors": {
    "email": "BLANK",
    "password": "BLANK",
    "confirmPassword": "BLANK",
  }
}
```
