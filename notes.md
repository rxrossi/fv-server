# Server
## Auth
+ [ ] make a user
+ [ ] test if routes requires tokens
At this point, all routes should require token (login)
I would go and implement login feature on client
+ [ ] implement multi tenant
It seems easy to modify the models, take care with doc refs, the models does not need to be imported, just use mongoose.mt('tenantId.Model')
the tenantId could come from the token that will be sent by the client on the reader
The decoded version of the token, accessible via request.auth.credentials

## Payment route
+ [ ] get
+ [ ] post
+ [ ] put
+ [ ] delete

# Professionals
+ [ ] Should list total profit 
+ [x] put
+ [x] Delete
+ [ ] change delete to soft delete

# Clients
+ [ ] change delete to soft delete

# Products
+ [X] put
+ [X] Delete (soft)

# Purchases
+ [X] put
+ [X] Delete

# Sales
+ [X] put
+ [X] Delete
+ [ ] Sales don't really calculate the cost of credit card
