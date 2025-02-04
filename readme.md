# sentmatic-be

## payment flow

- user creates a paymentIntent
- user fulfills paymentIntent
- user creates a paymentIntentDoc
  - id of `${uid}_${paymentIntentDocId}`
  - uid == uid
  - paymentIntentDocId == paymentIntentDocId
  - accountDebitted == false
- paymentIntentDoc creation causes balanceDoc to be updated by admin
  - look up paymentIntentDoc
    - if paymentIntentDoc.accountDebitted == true break
  - look up paymentIntent
    - if paymentIntent.status != success break
    - if paymentIntent.currency != gbp break
    - if paymentIntent.amount <= 0 break
  - update balanceDoc by paymentIntent.amount
  - update paymentIntentDoc.accountDebitted == true

## create file flow

- user updates their balanceDoc;
  - decreases value by cost (300)
  - increment currentUploadIntentNumber by 1
  - add uploadIntentId to uploadIntentIds
- user creates an uploadIntentDoc
  - id == `${uid}_${currentUploadIntentNumber}`
- user uploads a file
  - id == `${uid}_${currentUploadIntentNumber}` (max size 50*1024*1024)
- file upload causes an order to be created
  - watch for file upload to complete
  - create orderDoc with admin
