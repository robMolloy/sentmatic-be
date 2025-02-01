# sentmatic-be

## flow

- user updates their balanceDoc; decreases balance by 1 and add uploadIntentId to uploadIntentIds
- user creates an uploadIntentDoc
- user uploads a file with same id as uploadIntentId (max size 50*1024*1024)
- file upload causes an order to be created
