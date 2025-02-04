# sentmatic-be

## flow

- user updates their balanceDoc;
  - decreases value by cost (300)
  - increment currentUploadIntentNumber by 1
  - add uploadIntentId to uploadIntentIds
- user creates an uploadIntentDoc
  - id of `${uid}_${currentUploadIntentNumber}`
- user uploads a file
  - id of `${uid}_${currentUploadIntentNumber}` (max size 50*1024*1024)
- file upload causes an order to be created
  - watch for file upload to complete
  - create orderDoc with admin
